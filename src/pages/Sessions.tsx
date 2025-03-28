import React, { useEffect, useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AICoach } from '@/components/ai-coach/AICoach'
import { FadeIn } from '@/components/ui/fade-in'
import { Brain, Clock, Target, TrendingUp, Play, Pause, RotateCcw, Quote, ArrowLeft, BarChart, Coffee, Settings, Menu, Plus, Moon, Check, Edit, Trash, RefreshCw, Radio, Music, X, SkipForward, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from "@/components/ui/use-toast"
import { supabase } from '@/lib/supabase'
import type { Database } from '@/integrations/supabase/types'
import type { User as UserType } from '@supabase/supabase-js'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Footer from '@/components/Footer'
import confetti from 'canvas-confetti'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useAICoach } from '@/hooks/use-ai-coach'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, User as UserIcon } from "lucide-react"
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

type DatabaseGoal = {
  id: string
  user_id: string
  goal_text: string
  description: string | null
  expected_duration_minutes: number
  status: 'pending' | 'completed'
  created_at: string
  updated_at: string | null
}

type Goal = DatabaseGoal & {
  title: string
  priority: 'high' | 'medium' | 'low'
}

const mapDatabaseGoalToGoal = (dbGoal: DatabaseGoal): Goal => ({
  ...dbGoal,
  title: dbGoal.goal_text,
  priority: getPriorityFromDuration(dbGoal.expected_duration_minutes),
})

const getPriorityFromDuration = (duration: number): 'high' | 'medium' | 'low' => {
  if (duration > 45) return 'high'
  if (duration > 25) return 'medium'
  return 'low'
}

interface EditGoalModalProps {
  goal?: Goal
  isOpen: boolean
  onClose: () => void
  onSave: (goal: { title: string; description: string; priority: 'high' | 'medium' | 'low' }) => void
}

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
}

const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 1
    }
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 0 20px rgba(16,185,129,0.2)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
}

const buttonHoverVariants = {
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.98
  }
}

// Update card styles with enhanced gradients and effects
const cardStyles = {
  base: cn(
    "relative overflow-hidden rounded-2xl",
    "bg-gradient-to-br from-white/90 via-white/95 to-white/90",
    "dark:from-background/80 dark:via-background/95 dark:to-background/90",
    "border border-zinc-200/80 dark:border-zinc-800/80",
    "shadow-md dark:shadow-none",
    "transition-all duration-300 ease-in-out",
    "hover:scale-[1.01]"
  ),
  padding: "p-6 sm:p-7",
  innerCard: "relative z-10",
  highPriority: "border-l-4 border-l-rose-500/50 dark:border-l-rose-400/20",
  mediumPriority: "border-l-4 border-l-amber-500/50 dark:border-l-amber-400/20",
  success: "border-l-4 border-l-emerald-500/50 dark:border-l-emerald-400/20",
  focus: cn(
    "border-l-4 border-l-emerald-500/50 dark:border-l-emerald-400/20"
  ),
  hover: "hover:scale-[1.01] transform transition-all duration-200 ease-in-out",
  gradient: cn(
    "bg-gradient-to-br",
    "from-white/90 via-white/95 to-white/90",
    "dark:from-background/80 dark:via-background/95 dark:to-background/90"
  ),
  highlight: "after:absolute after:inset-0 after:bg-gradient-to-br after:from-primary/5 after:via-transparent after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity"
}

// Update text styles with better contrast
const textStyles = {
  pageTitle: "text-xl sm:text-2xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-50",
  cardTitle: "text-lg sm:text-xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-50",
  cardSubtitle: "text-sm sm:text-base text-zinc-600 dark:text-zinc-400",
  sectionTitle: "text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400",
  bodyText: "text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-400",
  timerText: "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-emerald-600 dark:text-emerald-400",
  quoteText: "text-sm sm:text-base italic leading-relaxed text-zinc-600 dark:text-zinc-400",
  attributionText: "text-xs text-zinc-500 dark:text-zinc-500",
  statusText: "text-xs font-medium",
  dateText: "text-xs text-zinc-500 dark:text-zinc-500"
}

// Update button styles with enhanced gradients and effects
const buttonStyles = {
  gradient: cn(
    "relative w-full bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600",
    "text-white font-medium",
    "shadow-md hover:shadow-lg dark:shadow-emerald-500/10",
    "transition-all duration-200",
    "border border-emerald-500/20 dark:border-emerald-400/10",
    "hover:border-emerald-500/40 dark:hover:border-emerald-400/20",
    "rounded-xl"
  ),
  outlineGradient: cn(
    "relative w-full bg-white hover:bg-emerald-50 dark:bg-background dark:hover:bg-emerald-900/20",
    "text-emerald-700 dark:text-emerald-400 font-medium",
    "border border-emerald-300 dark:border-emerald-800",
    "shadow-sm hover:shadow-md dark:shadow-emerald-500/5",
    "transition-all duration-200",
    "hover:border-emerald-400 dark:hover:border-emerald-700",
    "rounded-xl"
  )
}

interface AICoachCardProps {
  suggestions: Array<{ content: string; priority: 'high' | 'medium' | 'low' }>;
  className?: string;
}

// Update the AI Coach section to use the suggestions
const AICoachCard = ({ suggestions, className }: AICoachCardProps) => (
  <motion.div
    variants={cardVariants}
    whileHover="hover"
    className={cn(
      "rounded-2xl bg-gradient-to-br",
      "from-violet-100/80 via-white/95 to-white/90",
      "dark:from-purple-500/10 dark:via-background/95 dark:to-background/90",
      "border border-violet-200/80 dark:border-purple-500/20",
      "backdrop-blur-xl",
      "hover:border-violet-300/80 dark:hover:border-purple-500/30",
      "transition-all duration-300 ease-in-out",
      "shadow-md dark:shadow-none",
      "hover:scale-[1.01]",
      className
    )}
  >
    <div className="flex items-center space-x-2 mb-4">
      <Brain className="w-5 h-5 text-violet-600 dark:text-purple-400" />
      <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-50">AI Coach</h3>
    </div>
    <div className="space-y-4">
      {suggestions.map((suggestion, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "p-3 rounded-xl",
            suggestion.priority === 'high' && "bg-violet-100/80 dark:bg-purple-500/10 border border-violet-200/80 dark:border-purple-500/20",
            suggestion.priority === 'medium' && "bg-violet-50/80 dark:bg-purple-400/10 border border-violet-100/80 dark:border-purple-400/20",
            suggestion.priority === 'low' && "bg-violet-50/50 dark:bg-purple-300/10 border border-violet-100/50 dark:border-purple-300/20"
          )}
        >
          <p className="text-sm text-zinc-700 dark:text-white/70">{suggestion.content}</p>
        </motion.div>
      ))}
    </div>
  </motion.div>
)

// Update the Timer Card with a cleaner, focused design
const TimerCard = ({ 
  isWorking, 
  timeLeft, 
  isPlaying, 
  handlePlayPause, 
  handleReset, 
  handleModeChange,
  workDuration,
  breakDuration,
  onWorkDurationChange,
  onBreakDurationChange,
  formatTime,
  className 
}: {
  isWorking: boolean;
  timeLeft: number;
  isPlaying: boolean;
  handlePlayPause: () => void;
  handleReset: () => void;
  handleModeChange: (working: boolean) => void;
  workDuration: number;
  breakDuration: number;
  onWorkDurationChange: (duration: number) => void;
  onBreakDurationChange: (duration: number) => void;
  formatTime: (seconds: number) => string;
  className?: string;
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <motion.div
      className={cn(
        "rounded-2xl bg-gradient-to-br",
        isWorking
          ? "from-emerald-100/80 via-white to-emerald-50/50 dark:from-emerald-500/10 dark:via-background dark:to-emerald-900/5"
          : "from-violet-100/80 via-white to-violet-50/50 dark:from-violet-500/10 dark:via-background dark:to-violet-900/5",
        "border",
        isWorking
          ? "border-emerald-200/50 dark:border-emerald-800/50"
          : "border-violet-200/50 dark:border-violet-800/50",
        "transition-all duration-300",
        "shadow-sm hover:shadow-md dark:shadow-none",
        isWorking
          ? "hover:border-emerald-300/50 dark:hover:border-emerald-700/50"
          : "hover:border-violet-300/50 dark:hover:border-violet-700/50",
        className
      )}
      variants={cardVariants}
      initial="initial"
      animate="animate"
    >
      <div className="flex flex-col space-y-6">
        {/* Header with Mode Toggle and Settings */}
        <div className="flex items-center justify-between">
          <div className={cn(
            "flex items-center p-1 rounded-xl",
            isWorking
              ? "bg-emerald-100/80 dark:bg-emerald-900/20"
              : "bg-violet-100/80 dark:bg-violet-900/20"
          )}>
            <button
              onClick={() => handleModeChange(true)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isWorking
                  ? "bg-white dark:bg-background text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "text-emerald-600/70 dark:text-emerald-400/70 hover:text-emerald-700 dark:hover:text-emerald-300"
              )}
            >
              Work
            </button>
            <button
              onClick={() => handleModeChange(false)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                !isWorking
                  ? "bg-white dark:bg-background text-violet-700 dark:text-violet-300 shadow-sm"
                  : "text-violet-600/70 dark:text-violet-400/70 hover:text-violet-700 dark:hover:text-violet-300"
              )}
            >
              Break
            </button>
          </div>
          <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-neutral-500 hover:text-neutral-900 dark:text-zinc-400 dark:hover:text-white",
                  isSettingsOpen && "bg-neutral-100 dark:bg-zinc-800"
                )}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-5 bg-white dark:bg-background border border-neutral-200 dark:border-zinc-800 rounded-xl shadow-lg">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-zinc-800 pb-4">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm text-neutral-900 dark:text-zinc-50">Timer Settings</h4>
                    <p className="text-xs text-neutral-500 dark:text-zinc-400">Customize your work and break durations</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSettingsOpen(false)}
                    className="text-neutral-500 hover:text-neutral-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-5">
                  {/* Work Duration */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-neutral-900 dark:text-zinc-50">Work Duration</span>
                        <p className="text-xs text-neutral-500 dark:text-zinc-400">Focus session length</p>
                      </div>
                      <span className={cn(
                        "text-sm font-medium px-2 py-1 rounded-lg",
                        isWorking
                          ? "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : "bg-neutral-100 text-neutral-600 dark:bg-zinc-800 dark:text-zinc-400"
                      )}>
                        {workDuration} min
                      </span>
                    </div>
                    <Slider
                      value={[workDuration]}
                      onValueChange={(value) => onWorkDurationChange(value[0])}
                      min={5}
                      max={60}
                      step={5}
                      className={cn(
                        "relative flex items-center select-none touch-none w-full transition-colors",
                        "[&_[role=slider]]:h-4 [&_[role=slider]]:w-4",
                        "[&_[role=slider]]:transition-all",
                        isWorking
                          ? "[&_[role=slider]]:bg-emerald-600 [&_[role=slider]]:border-emerald-600 dark:[&_[role=slider]]:bg-emerald-400 dark:[&_[role=slider]]:border-emerald-400"
                          : "[&_[role=slider]]:bg-neutral-600 [&_[role=slider]]:border-neutral-600 dark:[&_[role=slider]]:bg-zinc-400 dark:[&_[role=slider]]:border-zinc-400"
                      )}
                    />
                    <div className="flex justify-between text-xs text-neutral-500 dark:text-zinc-400">
                      <span>5 min</span>
                      <span>60 min</span>
                    </div>
                  </div>

                  {/* Break Duration */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-neutral-900 dark:text-zinc-50">Break Duration</span>
                        <p className="text-xs text-neutral-500 dark:text-zinc-400">Rest between sessions</p>
                      </div>
                      <span className={cn(
                        "text-sm font-medium px-2 py-1 rounded-lg",
                        !isWorking
                          ? "bg-violet-100/50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
                          : "bg-neutral-100 text-neutral-600 dark:bg-zinc-800 dark:text-zinc-400"
                      )}>
                        {breakDuration} min
                      </span>
                    </div>
                    <Slider
                      value={[breakDuration]}
                      onValueChange={(value) => onBreakDurationChange(value[0])}
                      min={1}
                      max={15}
                      step={1}
                      className={cn(
                        "relative flex items-center select-none touch-none w-full transition-colors",
                        "[&_[role=slider]]:h-4 [&_[role=slider]]:w-4",
                        "[&_[role=slider]]:transition-all",
                        !isWorking
                          ? "[&_[role=slider]]:bg-violet-600 [&_[role=slider]]:border-violet-600 dark:[&_[role=slider]]:bg-violet-400 dark:[&_[role=slider]]:border-violet-400"
                          : "[&_[role=slider]]:bg-neutral-600 [&_[role=slider]]:border-neutral-600 dark:[&_[role=slider]]:bg-zinc-400 dark:[&_[role=slider]]:border-zinc-400"
                      )}
                    />
                    <div className="flex justify-between text-xs text-neutral-500 dark:text-zinc-400">
                      <span>1 min</span>
                      <span>15 min</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-neutral-900 dark:text-zinc-50">Auto-start Breaks</span>
                      <p className="text-xs text-neutral-500 dark:text-zinc-400">Automatically start break timer</p>
                    </div>
                    <Switch
                      checked={true}
                      className={cn(
                        "data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-400",
                        "data-[state=unchecked]:bg-neutral-200 dark:data-[state=unchecked]:bg-zinc-700"
                      )}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Timer Display */}
        <div className="flex flex-col items-center space-y-2">
          <span className={cn(
            "text-6xl sm:text-7xl font-bold tracking-tighter transition-colors",
            isWorking
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-violet-700 dark:text-violet-300"
          )}>
            {formatTime(timeLeft)}
          </span>
          <span className={cn(
            "text-sm font-medium",
            isWorking
              ? "text-emerald-600/70 dark:text-emerald-400/70"
              : "text-violet-600/70 dark:text-violet-400/70"
          )}>
            {isWorking ? "Focus Time" : "Break Time"}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            className={cn(
              "w-10 h-10 rounded-xl transition-all duration-200",
              isWorking
                ? "border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-300"
                : "border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-700 dark:hover:text-violet-300"
            )}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={handlePlayPause}
            className={cn(
              "w-12 h-12 rounded-xl transition-all duration-200",
              isWorking
                ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600/90 dark:hover:bg-emerald-600"
                : "bg-violet-600 hover:bg-violet-700 dark:bg-violet-600/90 dark:hover:bg-violet-600",
              "text-white"
            )}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
        </div>

        {/* Local Time */}
        <div className="flex items-center justify-center">
          <Clock className={cn(
            "w-3.5 h-3.5 mr-1.5",
            isWorking
              ? "text-emerald-500/50 dark:text-emerald-400/50"
              : "text-violet-500/50 dark:text-violet-400/50"
          )} />
          <span className={cn(
            "text-xs",
            isWorking
              ? "text-emerald-600/50 dark:text-emerald-400/50"
              : "text-violet-600/50 dark:text-violet-400/50"
          )}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// Update the SessionCard component with enhanced button functionality
const SessionCard = ({ session, onPlay, onPause, onComplete, onEdit, onDelete }) => (
  <motion.div
    variants={cardVariants}
    whileHover="hover"
    className={cn(
      "rounded-2xl bg-gradient-to-br",
      "from-emerald-100/80 via-white/95 to-white/90",
      "dark:from-emerald-500/10 dark:via-background/95 dark:to-background/90",
      "border border-emerald-200/80 dark:border-emerald-500/20",
      "p-6 backdrop-blur-xl",
      "hover:border-emerald-300/80 dark:hover:border-emerald-500/30",
      "transition-all duration-300 ease-in-out",
      "shadow-md dark:shadow-none",
      "hover:scale-[1.01]"
    )}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-50">{session.title}</h3>
      </div>
      <div className="flex items-center space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEdit(session.id)}
          className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100/80 dark:text-emerald-400/70 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 px-2 py-1 rounded-lg transition-colors"
        >
          <Edit className="w-3 h-3 mr-1 inline-block" />
          Edit
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(session.id)}
          className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-100/80 dark:text-rose-500/70 dark:hover:text-rose-500 dark:hover:bg-rose-500/10 px-2 py-1 rounded-lg transition-colors"
        >
          <Trash className="w-3 h-3 mr-1 inline-block" />
          Delete
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onComplete(session.id)}
          className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100/80 dark:text-emerald-400/70 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 px-2 py-1 rounded-lg transition-colors"
        >
          <Check className="w-3 h-3 mr-1 inline-block" />
          Complete
        </motion.button>
      </div>
    </div>
    
    <div className="flex items-center space-x-2 mb-2">
      <span className={cn(
        "text-xs px-2 py-0.5 rounded-lg",
        session.status === 'completed' 
          ? "bg-emerald-100/80 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" 
          : "bg-orange-100/80 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
      )}>
        {session.status === 'completed' ? 'Completed' : 'In Progress'}
      </span>
      <span className="text-xs text-zinc-500 dark:text-white/50">
        {new Date(session.created_at).toLocaleDateString()}
      </span>
    </div>

    <p className="text-sm text-zinc-700 dark:text-white/70 mb-4">
      {session.project.description || 'No description available'}
    </p>

    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400/70" />
          <span className="text-xs text-zinc-600 dark:text-white/50">{session.duration} min</span>
        </div>
        <div className="flex items-center space-x-2">
          <Music className="w-4 h-4 text-emerald-600 dark:text-emerald-400/70" />
          <span className="text-xs text-zinc-600 dark:text-white/50">{session.project.bpm} BPM</span>
        </div>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => session.status === 'completed' ? onPause(session.id) : onPlay(session.id)}
        className="w-8 h-8 rounded-full border border-emerald-200/80 dark:border-emerald-500/20 text-emerald-600 dark:text-white hover:bg-emerald-100/80 dark:hover:bg-emerald-500/10 hover:border-emerald-300/80 dark:hover:border-emerald-500/30 transition-colors flex items-center justify-center"
      >
        {session.status === 'completed' ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </motion.button>
    </div>
  </motion.div>
)

// Update the EditGoalModal component
const EditGoalModal = ({ goal, isOpen, onClose, onSave }: EditGoalModalProps) => {
  const [title, setTitle] = useState(goal?.title || '')
  const [description, setDescription] = useState(goal?.description || '')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(goal?.priority || 'medium')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-background border-zinc-200 dark:border-zinc-800 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-50">
            {goal ? 'Edit Goal' : 'Add Goal'}
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            Make changes to your session goal here.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-zinc-900 dark:text-zinc-50">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white dark:bg-background border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-zinc-900 dark:text-zinc-50">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white dark:bg-background border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-900 dark:text-zinc-50">
              Priority
            </Label>
            <Select value={priority} onValueChange={(value: 'high' | 'medium' | 'low') => setPriority(value)}>
              <SelectTrigger className="bg-white dark:bg-background border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-background border-zinc-200 dark:border-zinc-800">
                <SelectItem value="high" className="text-zinc-900 dark:text-zinc-50">High</SelectItem>
                <SelectItem value="medium" className="text-zinc-900 dark:text-zinc-50">Medium</SelectItem>
                <SelectItem value="low" className="text-zinc-900 dark:text-zinc-50">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50">
            Cancel
          </Button>
          <Button onClick={() => onSave({ title, description, priority })} className={buttonStyles.gradient}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }: DeleteConfirmationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-background border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-50">
            Delete Goal
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            Are you sure you want to delete this goal? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Add the AddGoalModal component
const AddGoalModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [duration, setDuration] = React.useState('')
  const [isSaving, setIsSaving] = React.useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (duration && isNaN(Number(duration))) {
      toast({
        title: "Validation Error",
        description: "Duration must be a number",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        goal_text: title.trim(),
        notes: description.trim(),
        expected_duration_minutes: duration ? Number(duration) : 0,
        status: 'pending',
        created_at: new Date().toISOString()
      })

      // Reset form
      setTitle('')
      setDescription('')
      setDuration('')

      // Show success toast
      toast({
        title: "Goal Created",
        description: "Your session goal has been created successfully",
        duration: 3000,
      })

      // Close modal
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-background rounded-xl p-6 w-full max-w-md border border-orange-500/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Add Session Goal</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 transition-colors"
              placeholder="Enter goal title"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 transition-colors"
              rows={3}
              placeholder="Enter goal description"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 transition-colors"
              placeholder="Enter duration in minutes"
              min="0"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-orange-500/20 text-muted-foreground hover:bg-orange-500/10 hover:border-orange-500/30"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Goal'
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const Sessions: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [isWorking, setIsWorking] = useLocalStorage<boolean>('timer-is-working', true)
  const [isPlaying, setIsPlaying] = useLocalStorage<boolean>('timer-is-playing', false)
  const [timeLeft, setTimeLeft] = useLocalStorage<number>('timer-time-left', 25 * 60)
  const [activeProject, setActiveProject] = useLocalStorage<string | null>('active-project', null)
  const [workDuration, setWorkDuration] = useLocalStorage<number>('timer-work-duration', 25)
  const [breakDuration, setBreakDuration] = useLocalStorage<number>('timer-break-duration', 5)
  const [selectedTimeRange, setSelectedTimeRange] = useLocalStorage<string>('selected-time-range', 'This Week')
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>(undefined)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false)
  const [activeGoal, setActiveGoal] = React.useState<Goal | null>(null)
  const [user, setUser] = React.useState<UserType | null>(null)

  // Get user on component mount
  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  // AI Coach integration
  const { suggestions, refreshSuggestions } = useAICoach()

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Timer completed
      setIsPlaying(false)
      if (isWorking) {
        // Work session completed
        setTimeLeft(breakDuration * 60)
        setIsWorking(false)
        // Play notification sound and show toast
        new Audio('/notification.mp3').play().catch(() => {})
        toast({
          title: "Work Session Complete! 🎉",
          description: "Time for a break!",
          duration: 4000,
        })
      } else {
        // Break completed
        setTimeLeft(workDuration * 60)
        setIsWorking(true)
        // Play notification sound and show toast
        new Audio('/notification.mp3').play().catch(() => {})
        toast({
          title: "Break Complete! 💪",
          description: "Ready to get back to work?",
          duration: 4000,
        })
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, timeLeft, isWorking, toast, workDuration, breakDuration])

  // Handle mode changes
  const handleModeChange = useCallback((working: boolean) => {
    setIsPlaying(false)
    setIsWorking(working)
    setTimeLeft(working ? workDuration * 60 : breakDuration * 60)
  }, [workDuration, breakDuration])

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  // Handle reset
  const handleReset = useCallback(() => {
    setIsPlaying(false)
    setTimeLeft(isWorking ? workDuration * 60 : breakDuration * 60)
  }, [isWorking, workDuration, breakDuration])

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Calculate progress percentage for the circular timer
  const CIRCLE_RADIUS = 70
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS
  const progress = ((isWorking ? workDuration * 60 : breakDuration * 60) - timeLeft) / (isWorking ? workDuration * 60 : breakDuration * 60) * CIRCLE_CIRCUMFERENCE

  // Fetch session goals
  const { data: goals = [] } = useQuery<Goal[]>(
    ['goals', user?.id],
    async () => {
      if (!user?.id) throw new Error('No authenticated user')

      const { data, error } = await supabase
        .from('session_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(mapDatabaseGoalToGoal)
    },
    {
      enabled: !!user?.id,
    }
  )

  // Fetch session stats
  const { data: sessionStats } = useQuery({
    queryKey: ['session-stats', selectedTimeRange],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const now = new Date()
      let startDate: Date

      // Calculate start date based on selected time range
      switch (selectedTimeRange) {
        case 'Today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'This Week':
          startDate = new Date(now.setDate(now.getDate() - now.getDay()))
          break
        case 'This Month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        default:
          startDate = new Date(now.setDate(now.getDate() - now.getDay()))
      }

      const { data: goals, error: goalsError } = await supabase
        .from('session_goals')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())

      if (goalsError) throw goalsError

      // Calculate statistics
      const totalGoals = goals?.length || 0
      const completedGoals = goals?.filter(g => g.status === 'completed').length || 0
      const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

      // Calculate streaks
      const dailyActivity = goals?.reduce((acc, goal) => {
        const date = new Date(goal.created_at).toDateString()
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})

      let currentStreak = 0
      let bestStreak = 0
      let tempStreak = 0

      const dates = Object.keys(dailyActivity || {}).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      
      // Calculate current streak
      const today = new Date().toDateString()
      for (let i = 0; i < dates.length; i++) {
        const date = new Date(dates[i])
        const expectedDate = new Date()
        expectedDate.setDate(expectedDate.getDate() - i)
        
        if (date.toDateString() === expectedDate.toDateString()) {
          currentStreak++
        } else {
          break
        }
      }

      // Calculate best streak
      dates.forEach((date, i) => {
        if (i === 0 || new Date(dates[i-1]).getTime() - new Date(date).getTime() === 86400000) {
          tempStreak++
        } else {
          tempStreak = 1
        }
        bestStreak = Math.max(bestStreak, tempStreak)
      })

      // Calculate average session time
      const totalDuration = goals?.reduce((sum, goal) => sum + (goal.expected_duration_minutes || 0), 0) || 0
      const averageSessionTime = totalGoals > 0 ? Math.round(totalDuration / totalGoals) : 0

      // Find most productive day
      const productivityByDay = goals?.reduce((acc, goal) => {
        const date = new Date(goal.created_at).toDateString()
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})

      const mostProductiveDay = Object.entries(productivityByDay || {})
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0]

      return {
        totalGoals,
        completedGoals,
        completionRate,
        currentStreak,
        bestStreak,
        averageSessionTime,
        mostProductiveDay
      }
    }
  })

  // Add completeGoalMutation
  const completeGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('session_goals')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-goals'] })
      queryClient.invalidateQueries({ queryKey: ['session-stats'] })
    }
  })

  // Query for beats count
  const { data: beatsCount } = useQuery({
    queryKey: ['beats', selectedTimeRange],
    queryFn: async () => {
      if (!user) return 0

      const startDate = new Date()
      switch (selectedTimeRange) {
        case 'Today':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'This Week':
          startDate.setDate(startDate.getDate() - 7)
          break
        case 'This Month':
          startDate.setMonth(startDate.getMonth() - 1)
          break
      }

      // Get total beats from beat activities
      const { data: beatActivities } = await supabase
        .from('beat_activities')
        .select('count')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', new Date().toISOString().split('T')[0])

      // Sum up all the counts
      const totalBeats = beatActivities ? beatActivities.reduce((sum, activity) => sum + (activity.count || 0), 0) : 0

      // Update profile stats if needed
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_beats')
        .eq('id', user.id)
        .single()

      if (profile && profile.total_beats !== totalBeats) {
        await supabase
          .from('profiles')
          .update({ total_beats: totalBeats })
          .eq('id', user.id)
      }

      return totalBeats
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: false,
    onError: (error) => {
      console.error('Error fetching beats:', error)
      toast({
        title: "Error",
        description: "Failed to fetch beats count",
        variant: "destructive",
      })
    }
  })

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal)
    setIsEditModalOpen(true)
  }

  const handleSaveGoal = async (goalData: { title: string; description: string; priority: 'high' | 'medium' | 'low' }) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create or update goals.",
        variant: "destructive",
      })
      return
    }

    const expectedDuration = goalData.priority === 'high' ? 60 : goalData.priority === 'medium' ? 45 : 25

    if (selectedGoal) {
      // Update existing goal
      const { data, error } = await supabase
        .from('session_goals')
        .update({
          goal_text: goalData.title,
          description: goalData.description,
          expected_duration_minutes: expectedDuration,
        })
        .eq('id', selectedGoal.id)
        .select()
      
      if (!error && data) {
        queryClient.invalidateQueries(['goals', user.id])
        setIsEditModalOpen(false)
        toast({
          title: "Goal updated",
          description: "Your session goal has been updated successfully.",
        })
      }
    } else {
      // Create new goal
      const newGoal = {
        goal_text: goalData.title,
        description: goalData.description,
        expected_duration_minutes: expectedDuration,
        user_id: user.id,
        status: 'pending' as const,
      }

      const { data, error } = await supabase
        .from('session_goals')
        .insert(newGoal)
        .select()
      
      if (!error && data) {
        queryClient.invalidateQueries(['goals', user.id])
        setIsEditModalOpen(false)
        toast({
          title: "Goal created",
          description: "Your session goal has been created successfully.",
        })
      }
    }
  }

  const handleDeleteGoal = async () => {
    if (selectedGoal) {
      const { error } = await supabase
        .from('session_goals')
        .delete()
        .eq('id', selectedGoal.id)
      
      if (!error) {
        queryClient.invalidateQueries(['goals', user?.id])
        setIsDeleteModalOpen(false)
        toast({
          title: "Goal deleted",
          description: "Your session goal has been deleted successfully.",
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-background text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-background/80 backdrop-blur-xl transition-colors duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="rounded-full text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent">
                WavTrack
              </h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-white/5"
                onClick={() => navigate('/sessions')}
              >
                Sessions
              </Button>
              <Button 
                variant="ghost" 
                className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-white/5"
                onClick={() => navigate('/profile')}
              >
                Profile
              </Button>
              <Button 
                variant="ghost" 
                className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-white/5"
                onClick={() => navigate('/settings')}
              >
                Settings
              </Button>
              <ThemeSwitcher />
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300"
                    >
                      {(user as UserType).email?.[0].toUpperCase() || 'U'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="text-neutral-700 dark:text-neutral-200">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="text-neutral-700 dark:text-neutral-200">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => supabase.auth.signOut()} className="text-neutral-700 dark:text-neutral-200">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-3 sm:px-4 pt-20 max-w-7xl">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-emerald-400">Production Sessions</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-4 sm:gap-5">
          {/* Main Content (Left Column) */}
          <div className="space-y-4 sm:space-y-5">
            {/* Timer Card - Reduced padding */}
            <TimerCard
              isWorking={isWorking}
              timeLeft={timeLeft}
              isPlaying={isPlaying}
              handlePlayPause={handlePlayPause}
              handleReset={handleReset}
              handleModeChange={handleModeChange}
              workDuration={workDuration}
              breakDuration={breakDuration}
              onWorkDurationChange={setWorkDuration}
              onBreakDurationChange={setBreakDuration}
              formatTime={formatTime}
              className="p-4 sm:p-6"
            />

            {/* Session Goal and Progress Grid - Optimized spacing */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
            >
              {/* Session Goal Card - Reduced padding */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={cn(
                  "rounded-xl bg-gradient-to-br",
                  "from-orange-50 via-white/95 to-white/90",
                  "dark:from-orange-500/10 dark:via-background/95 dark:to-background/90",
                  "border border-orange-200/80 dark:border-orange-500/20",
                  "p-4 sm:p-6",
                  "hover:border-orange-300/80 dark:hover:border-orange-500/30",
                  "transition-all duration-300 ease-in-out",
                  "shadow-md dark:shadow-none",
                  "ring-1 ring-orange-200/50 dark:ring-orange-500/10"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Session Goal</h3>
                  </div>
                  {!activeGoal && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-100/80 dark:hover:bg-orange-500/10"
                      onClick={() => setIsAddGoalModalOpen(true)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Goal
                    </Button>
                  )}
                </div>
                
                {activeGoal ? (
                  <>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100/80 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                        {activeGoal.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-white/50">
                        {new Date(activeGoal.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-white/70 mb-4">
                      {activeGoal.goal_text || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-orange-600/70 dark:text-orange-400/70" />
                        <span className="text-xs text-zinc-600 dark:text-neutral-400">{activeGoal.expected_duration_minutes} min</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-100/80 dark:hover:bg-orange-500/10"
                          onClick={() => handleEditGoal(activeGoal)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-100/80 dark:hover:bg-rose-500/10"
                          onClick={() => {
                            setSelectedGoal(activeGoal)
                            setIsDeleteModalOpen(true)
                          }}
                        >
                          <Trash className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-100/80 dark:hover:bg-emerald-500/10"
                          onClick={() => completeGoalMutation.mutate(activeGoal.id)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Complete
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Target className="w-8 h-8 text-orange-400/50" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">No active session goal</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500">Add a goal to track your progress</p>
                  </div>
                )}
              </motion.div>

              {/* Progress Stats Card - Reduced padding */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={cn(
                  "rounded-2xl bg-gradient-to-br",
                  "from-emerald-100/80 via-white/95 to-white/90",
                  "dark:from-emerald-500/10 dark:via-background/95 dark:to-background/90",
                  "border border-emerald-200/80 dark:border-emerald-500/20",
                  "p-4 sm:p-6",
                  "hover:border-emerald-300/80 dark:hover:border-emerald-500/30",
                  "transition-all duration-300 ease-in-out",
                  "shadow-md dark:shadow-none",
                  "ring-1 ring-emerald-200/50 dark:ring-emerald-500/10"
                )}
              >
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div className="flex items-center space-x-2">
                    <BarChart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-lg font-medium text-zinc-800 dark:text-neutral-100">Your Progress</h3>
                  </div>
                  <Select 
                    value={selectedTimeRange} 
                    onValueChange={setSelectedTimeRange}
                  >
                    <SelectTrigger className="w-[120px] h-8 text-xs bg-transparent border-emerald-200/80 dark:border-emerald-500/20 text-zinc-700 dark:text-neutral-300 hover:border-emerald-300/80 dark:hover:border-emerald-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-background border-emerald-200/80 dark:border-emerald-500/20">
                      <SelectItem value="Today" className="text-zinc-700 dark:text-neutral-300">Today</SelectItem>
                      <SelectItem value="This Week" className="text-zinc-700 dark:text-neutral-300">This Week</SelectItem>
                      <SelectItem value="This Month" className="text-zinc-700 dark:text-neutral-300">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <Music className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm text-zinc-600 dark:text-neutral-400">Beats</span>
                    </div>
                    <p className="text-2xl font-semibold tracking-tight text-zinc-800 dark:text-neutral-100">{beatsCount ?? 0}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm text-zinc-600 dark:text-neutral-400">Goals</span>
                    </div>
                    <p className="text-2xl font-semibold tracking-tight text-zinc-800 dark:text-neutral-100">{sessionStats?.totalGoals || 0}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm text-zinc-600 dark:text-neutral-400">Done</span>
                    </div>
                    <p className="text-2xl font-semibold tracking-tight text-zinc-800 dark:text-neutral-100">{sessionStats?.completedGoals || 0}</p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600 dark:text-neutral-400">Completion Rate</span>
                      <span className="text-sm text-zinc-500 dark:text-neutral-500">{sessionStats?.completionRate || 0}%</span>
                    </div>
                    <div className="h-2 bg-emerald-100/80 dark:bg-emerald-500/10 rounded-full">
                      <div 
                        className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full transition-all duration-500" 
                        style={{ width: `${sessionStats?.completionRate || 0}%` }} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-sm text-zinc-600 dark:text-neutral-400">Current Streak</span>
                      <p className="text-lg font-medium text-zinc-800 dark:text-neutral-100">{sessionStats?.currentStreak || 0} days</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-zinc-600 dark:text-neutral-400">Best Streak</span>
                      <p className="text-lg font-medium text-zinc-800 dark:text-neutral-100">{sessionStats?.bestStreak || 0} days</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-sm text-zinc-600 dark:text-neutral-400">Average Session Time</span>
                    <p className="text-lg font-medium text-zinc-800 dark:text-neutral-100">{sessionStats?.averageSessionTime || 0} minutes</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-sm text-zinc-600 dark:text-neutral-400">Most Productive Day</span>
                    <p className="text-lg font-medium text-zinc-800 dark:text-neutral-100">
                      {sessionStats?.mostProductiveDay ? new Date(sessionStats.mostProductiveDay).toLocaleDateString() : 'No data yet'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Sidebar - Optimized spacing */}
          <div className="lg:col-span-1">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="sticky top-24 space-y-4"
            >
              {/* AI Coach */}
              <AICoachCard suggestions={suggestions} className="p-6 backdrop-blur-xl" />

              {/* Production Tips */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={cn(
                  "rounded-xl bg-gradient-to-br",
                  "from-yellow-50 via-white/95 to-white/90",
                  "dark:from-yellow-500/10 dark:via-background/95 dark:to-background/90",
                  "border border-yellow-200/80 dark:border-yellow-500/20",
                  "p-6 backdrop-blur-xl",
                  "hover:border-yellow-300/80 dark:hover:border-yellow-500/30",
                  "transition-all duration-300 ease-in-out",
                  "shadow-md dark:shadow-none"
                )}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Quote className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-zinc-50">Production Tips</h3>
                </div>
                <p className="text-sm text-neutral-700 dark:text-white/70 mb-4">
                  Personalized tips to enhance your production workflow.
                </p>
                <p className="text-sm text-neutral-700 dark:text-white/70 mb-4">
                  Explore different tempos outside your usual range for fresh creative ideas.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-neutral-500 dark:text-white/50">Key:</span>
                    <span className="text-xs text-neutral-700 dark:text-white/70">C</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-neutral-500 dark:text-white/50">Energy:</span>
                    <span className="text-xs text-neutral-700 dark:text-white/70">50%</span>
                  </div>
                </div>
              </motion.div>

              {/* Workflow Analytics */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={cn(
                  "rounded-xl bg-gradient-to-br",
                  "from-blue-50 via-white/95 to-white/90",
                  "dark:from-blue-500/10 dark:via-background/95 dark:to-background/90",
                  "border border-blue-200/80 dark:border-blue-500/20",
                  "p-6 backdrop-blur-xl",
                  "hover:border-blue-300/80 dark:hover:border-blue-500/30",
                  "transition-all duration-300 ease-in-out",
                  "shadow-md dark:shadow-none"
                )}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-zinc-50">Workflow Analytics</h3>
                </div>
                <p className="text-sm text-neutral-700 dark:text-white/70 mb-4">
                  Insights about your production workflow and habits.
                </p>
                <p className="text-sm text-neutral-700 dark:text-white/70 mb-4">
                  You're putting in significant hours. Remember to balance work with rest.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-neutral-700 dark:text-white/70">0 sessions/day</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-neutral-700 dark:text-white/70">33% completion</span>
                  </div>
                </div>
              </motion.div>

              {/* Recent Goals */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={cn(
                  "rounded-xl bg-gradient-to-br",
                  "from-green-50 via-white/95 to-white/90",
                  "dark:from-green-500/10 dark:via-background/95 dark:to-background/90",
                  "border border-green-200/80 dark:border-green-500/20",
                  "p-6 backdrop-blur-xl",
                  "hover:border-green-300/80 dark:hover:border-green-500/30",
                  "transition-all duration-300 ease-in-out",
                  "shadow-md dark:shadow-none"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-zinc-50">Recent Goals</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-green-200/80 dark:border-green-500/20 text-neutral-700 dark:text-white/70 hover:bg-green-100/80 dark:hover:bg-green-500/10 hover:border-green-300/80 dark:hover:border-green-500/30 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Reset Goals
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100/80 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                        In Progress
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-white/50">37 minutes ago</span>
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-white/70">
                      Finish create and add final touches to the arrangement
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Add the EditGoalModal */}
      <EditGoalModal
        goal={selectedGoal}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveGoal}
      />

      {/* Add the DeleteConfirmationModal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteGoal}
      />

      {/* Add the AddGoalModal */}
      <AddGoalModal
        isOpen={isAddGoalModalOpen}
        onClose={() => setIsAddGoalModalOpen(false)}
        onSave={(goal) => {
          // Implement the actual create mutation
          toast({
            title: "Goal Created",
            description: "Your session goal has been created successfully",
            duration: 3000,
          })
        }}
      />
    </div>
  )
}

export default Sessions 