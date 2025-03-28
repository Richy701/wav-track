import React, { useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AICoach } from '@/components/ai-coach/AICoach'
import { FadeIn } from '@/components/ui/fade-in'
import { Brain, Clock, Target, TrendingUp, Play, Pause, RotateCcw, Quote, ArrowLeft, BarChart, Coffee, Settings, Menu, Plus, Moon, Check, Edit, Trash, RefreshCw, Radio, Music, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { ThemeToggle } from '@/components/theme-toggle'
import { useToast } from "@/components/ui/use-toast"
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { Track } from '@/types/track'
import { User } from '@supabase/supabase-js'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Footer from '@/components/Footer'
import confetti from 'canvas-confetti'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useAICoach } from '@/hooks/use-ai-coach'

// Update the Goal type to match Supabase schema exactly
type Goal = {
  id: string
  user_id: string
  goal_text: string
  expected_duration_minutes: number
  status: 'pending' | 'active' | 'completed' | 'paused'
  created_at: string
  ended_at?: string | null
  notes?: string | null
  productivity_score?: number | null
  tags?: string[]
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
    "relative overflow-hidden rounded-xl",
    "bg-gradient-to-b from-white/80 to-white/60 dark:from-background/20 dark:to-background/5",
    "border border-zinc-200/80 dark:border-border/20",
    "shadow-sm dark:shadow-none",
    "transition-all duration-300"
  ),
  padding: "p-5 sm:p-6",
  innerCard: "relative z-10",
  highPriority: "border-l-4 border-l-rose-500/50 dark:border-l-rose-400/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.15)] dark:hover:shadow-[0_0_15px_rgba(244,63,94,0.1)]",
  mediumPriority: "border-l-4 border-l-amber-500/50 dark:border-l-amber-400/20 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] dark:hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]",
  success: "border-l-4 border-l-emerald-500/50 dark:border-l-emerald-400/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]",
  focus: cn(
    "border-l-4 border-l-emerald-500/50 dark:border-l-emerald-400/20",
    "hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
  ),
  hover: "hover:scale-[1.01] transform transition-all duration-200 ease-in-out",
  gradient: "bg-gradient-to-br from-white/90 via-white/80 to-white/70 dark:from-background/20 dark:via-background/15 dark:to-background/10",
  highlight: "after:absolute after:inset-0 after:bg-gradient-to-br after:from-primary/5 after:via-transparent after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity"
}

// Update button styles with enhanced gradients and effects
const buttonStyles = {
  gradient: cn(
    "relative w-full bg-emerald-600 hover:bg-emerald-700",
    "text-white font-medium",
    "shadow-md hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]",
    "transition-all duration-200",
    "border border-emerald-500/20 dark:border-emerald-400/10",
    "hover:border-emerald-500/40 dark:hover:border-emerald-400/20",
    "rounded-md"
  ),
  outlineGradient: cn(
    "relative w-full bg-white hover:bg-emerald-50 dark:bg-background dark:hover:bg-emerald-900/20",
    "text-emerald-700 dark:text-emerald-400 font-medium",
    "border border-emerald-300 dark:border-emerald-800",
    "shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]",
    "transition-all duration-200",
    "hover:border-emerald-400 dark:hover:border-emerald-700",
    "rounded-md"
  )
}

// Update text styles with better contrast
const textStyles = {
  pageTitle: "text-xl sm:text-2xl font-semibold tracking-tight bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent",
  cardTitle: "text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-foreground/90",
  cardSubtitle: "text-sm sm:text-base text-zinc-600 dark:text-muted-foreground/80",
  sectionTitle: "text-xs sm:text-sm font-medium text-zinc-600 dark:text-muted-foreground/80",
  bodyText: "text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-muted-foreground/80",
  timerText: "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent",
  quoteText: "text-sm sm:text-base italic leading-relaxed text-zinc-600 dark:text-muted-foreground/80",
  attributionText: "text-xs text-zinc-500 dark:text-muted-foreground/70 mt-2",
  statusText: "text-xs font-medium",
  dateText: "text-xs text-zinc-500 dark:text-muted-foreground/70"
}

// Update the AI Coach section to use the suggestions
const AICoachCard = ({ suggestions }) => (
  <motion.div
    variants={cardVariants}
    whileHover="hover"
    className="rounded-xl bg-gradient-to-br from-purple-500/10 via-[#111111]/50 to-[#111111]/50 border border-purple-500/20 p-6 backdrop-blur-xl hover:border-purple-500/30 transition-all duration-300"
  >
    <div className="flex items-center space-x-2 mb-4">
      <Brain className="w-5 h-5 text-purple-400" />
      <h3 className="text-lg font-medium">AI Coach</h3>
    </div>
    <div className="space-y-4">
      {suggestions.map((suggestion, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "p-3 rounded-lg",
            suggestion.priority === 'high' && "bg-purple-500/10 border border-purple-500/20",
            suggestion.priority === 'medium' && "bg-purple-400/10 border border-purple-400/20",
            suggestion.priority === 'low' && "bg-purple-300/10 border border-purple-300/20"
          )}
        >
          <p className="text-sm text-white/70">{suggestion.content}</p>
        </motion.div>
      ))}
    </div>
  </motion.div>
)

// Update the Timer Card with settings and break theme
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
  formatTime 
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
}) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    whileHover="hover"
    className={cn(
      "rounded-xl bg-gradient-to-br backdrop-blur-xl p-8 transition-all duration-300",
      isWorking
        ? "from-[#111111]/50 via-[#111111]/50 to-[#111111]/50 border-[#10B981]/20 hover:border-[#10B981]/30"
        : "from-[#111111]/50 via-[#111111]/50 to-[#111111]/50 border-indigo-500/20 hover:border-indigo-500/30"
    )}
    style={{
      borderWidth: '1px',
      borderStyle: 'solid'
    }}
  >
    {/* Mode Toggle */}
    <div className="flex justify-between items-center mb-8">
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          onClick={() => handleModeChange(true)}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
            isWorking 
              ? "bg-emerald-600 text-white hover:bg-emerald-700" 
              : "text-white/50 hover:text-white hover:bg-white/5"
          )}
        >
          Work
        </Button>
        <Button
          variant="ghost"
          onClick={() => handleModeChange(false)}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
            !isWorking 
              ? "bg-indigo-600 text-white hover:bg-indigo-700" 
              : "text-white/50 hover:text-white hover:bg-white/5"
          )}
        >
          Break
        </Button>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full hover:bg-white/5",
              isWorking ? "text-emerald-500" : "text-indigo-500"
            )}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className={cn(
            "w-80 bg-[#111111] border",
            isWorking ? "border-emerald-500/20" : "border-indigo-500/20"
          )}
        >
          <div className="space-y-4">
            <h4 className="font-medium text-sm mb-4">Timer Settings</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/70">Work Duration</label>
                <span className="text-sm text-white/50">{workDuration} min</span>
              </div>
              <Slider
                value={[workDuration]}
                onValueChange={([value]) => onWorkDurationChange(value)}
                min={5}
                max={60}
                step={5}
                className={cn(
                  "[&_[role=slider]]:bg-emerald-600",
                  "[&_[role=slider]]:border-emerald-600",
                  "[&_[role=slider]]:hover:bg-emerald-500"
                )}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/70">Break Duration</label>
                <span className="text-sm text-white/50">{breakDuration} min</span>
              </div>
              <Slider
                value={[breakDuration]}
                onValueChange={([value]) => onBreakDurationChange(value)}
                min={5}
                max={30}
                step={5}
                className={cn(
                  "[&_[role=slider]]:bg-indigo-600",
                  "[&_[role=slider]]:border-indigo-600",
                  "[&_[role=slider]]:hover:bg-indigo-500"
                )}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
    
    {/* Timer Display */}
    <motion.div
      className="flex justify-center mb-8"
      animate={{
        scale: isPlaying ? [1, 1.02, 1] : 1,
        transition: {
          duration: 1,
          repeat: isPlaying ? Infinity : 0,
          repeatType: "reverse"
        }
      }}
    >
      <div 
        className={cn(
          "text-[96px] font-bold tracking-tighter",
          isWorking 
            ? "text-emerald-500" 
            : "text-indigo-500"
        )}
      >
        {formatTime(timeLeft)}
      </div>
    </motion.div>
    
    {/* Timer Controls */}
    <div className="flex justify-center space-x-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePlayPause}
        className={cn(
          "w-14 h-14 rounded-full text-white flex items-center justify-center transition-colors",
          isWorking
            ? "bg-emerald-600 hover:bg-emerald-700"
            : "bg-indigo-600 hover:bg-indigo-700"
        )}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6 ml-0.5" />
        )}
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleReset}
        className={cn(
          "w-14 h-14 rounded-full border text-white flex items-center justify-center transition-colors",
          isWorking
            ? "border-emerald-600/20 hover:bg-emerald-600/10 hover:border-emerald-600/30"
            : "border-indigo-600/20 hover:bg-indigo-600/10 hover:border-indigo-600/30"
        )}
      >
        <RotateCcw className="w-6 h-6" />
      </motion.button>
    </div>
  </motion.div>
)

// Update the SessionCard component with enhanced button functionality
const SessionCard = ({ session, onPlay, onPause, onComplete, onEdit, onDelete }) => (
  <motion.div
    variants={cardVariants}
    whileHover="hover"
    className="rounded-xl bg-gradient-to-br from-[#10B981]/10 via-[#111111]/50 to-[#111111]/50 border border-[#10B981]/20 p-6 backdrop-blur-xl hover:border-[#10B981]/30 transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Target className="w-5 h-5 text-[#10B981]" />
        <h3 className="text-lg font-medium">{session.title}</h3>
      </div>
      <div className="flex items-center space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEdit(session.id)}
          className="text-xs text-[#10B981]/70 hover:text-[#10B981] hover:bg-[#10B981]/10 px-2 py-1 rounded-md transition-colors"
        >
          <Edit className="w-3 h-3 mr-1 inline-block" />
          Edit
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(session.id)}
          className="text-xs text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 px-2 py-1 rounded-md transition-colors"
        >
          <Trash className="w-3 h-3 mr-1 inline-block" />
          Delete
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onComplete(session.id)}
          className="text-xs text-[#10B981]/70 hover:text-[#10B981] hover:bg-[#10B981]/10 px-2 py-1 rounded-md transition-colors"
        >
          <Check className="w-3 h-3 mr-1 inline-block" />
          Complete
        </motion.button>
      </div>
    </div>
    
    <div className="flex items-center space-x-2 mb-2">
      <span className={cn(
        "text-xs px-2 py-0.5 rounded-full",
        session.status === 'completed' 
          ? "bg-[#10B981]/20 text-[#10B981]" 
          : "bg-orange-500/20 text-orange-400"
      )}>
        {session.status === 'completed' ? 'Completed' : 'In Progress'}
      </span>
      <span className="text-xs text-white/50">
        {new Date(session.created_at).toLocaleDateString()}
      </span>
    </div>

    <p className="text-sm text-white/70 mb-4">
      {session.project.description || 'No description available'}
    </p>

    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#10B981]/70" />
          <span className="text-xs text-white/50">{session.duration} min</span>
        </div>
        <div className="flex items-center space-x-2">
          <Music className="w-4 h-4 text-[#10B981]/70" />
          <span className="text-xs text-white/50">{session.project.bpm} BPM</span>
        </div>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => session.status === 'completed' ? onPause(session.id) : onPlay(session.id)}
        className="w-8 h-8 rounded-full border border-[#10B981]/20 text-white hover:bg-[#10B981]/10 hover:border-[#10B981]/30 transition-colors flex items-center justify-center"
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
const EditGoalModal = ({ isOpen, onClose, goal, onSave, onDelete }) => {
  const [title, setTitle] = React.useState(goal?.goal_text || '')
  const [description, setDescription] = React.useState(goal?.notes || '')
  const [duration, setDuration] = React.useState(goal?.expected_duration_minutes || '')

  React.useEffect(() => {
    if (goal) {
      setTitle(goal.goal_text)
      setDescription(goal.notes)
      setDuration(goal.expected_duration_minutes)
    }
  }, [goal])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...goal,
      goal_text: title,
      notes: description,
      expected_duration_minutes: parseInt(duration) || 0
    })
    onClose()
  }

  const handleDelete = () => {
    onDelete(goal)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-[#111111] rounded-xl p-6 w-full max-w-md border border-[#10B981]/20"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Edit Session Goal</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#10B981]/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#10B981]/40"
              placeholder="Enter goal title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#10B981]/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#10B981]/40"
              rows={3}
              placeholder="Enter goal description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#10B981]/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#10B981]/40"
              placeholder="Enter duration in minutes"
            />
          </div>
          <div className="flex justify-between items-center mt-6">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete Goal
            </Button>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-[#10B981]/20 text-white/70 hover:bg-[#10B981]/10 hover:border-[#10B981]/30"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#10B981] hover:bg-[#059669] text-black"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Add this component for the delete confirmation modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-[#111111] rounded-xl p-6 w-full max-w-md border border-rose-500/20"
      >
        <h2 className="text-xl font-semibold mb-4 text-rose-500">Delete Session Goal</h2>
        <p className="text-sm text-white/70 mb-6">
          Are you sure you want to delete this session goal? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-rose-500/20 text-white/70 hover:bg-rose-500/10 hover:border-rose-500/30"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="bg-rose-500 hover:bg-rose-600 text-white"
          >
            Delete
          </Button>
        </div>
      </motion.div>
    </div>
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
  const [selectedGoal, setSelectedGoal] = React.useState<Goal | null>(null)
  const [goalToDelete, setGoalToDelete] = React.useState<Goal | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = React.useState(false)
  const [activeGoal, setActiveGoal] = React.useState<Goal | null>(null)
  const [user, setUser] = React.useState<User | null>(null)

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
  const { data: sessionGoals } = useQuery({
    queryKey: ['session-goals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const { data, error } = await supabase
        .from('session_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    }
  })

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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="rounded-full hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent">
                WavTrack
              </h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">
                Sessions
              </Button>
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">
                Profile
              </Button>
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">
                Settings
              </Button>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/5 hover:bg-white/10"
              >
                R
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-24">
        <div className="flex items-center space-x-3 mb-8">
          <Clock className="w-5 h-5 text-[#10B981]" />
          <h1 className="text-xl font-semibold text-[#10B981]">Production Sessions</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer Card */}
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
            />

            {/* Session Goal and Progress Card */}
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
              className="grid grid-cols-2 gap-6"
            >
              {/* Session Goal */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="rounded-xl bg-gradient-to-br from-orange-500/10 via-[#111111]/50 to-[#111111]/50 border border-orange-500/20 p-6 backdrop-blur-xl hover:border-orange-500/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-orange-400" />
                    <h3 className="text-lg font-medium">Session Goal</h3>
                  </div>
                  {!activeGoal && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-orange-400/70 hover:text-orange-400 hover:bg-orange-500/10"
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
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                        {activeGoal.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                      <span className="text-xs text-white/50">
                        {new Date(activeGoal.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mb-4">
                      {activeGoal.goal_text || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-orange-400/70" />
                        <span className="text-xs text-white/50">{activeGoal.expected_duration_minutes} min</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-orange-400/70 hover:text-orange-400 hover:bg-orange-500/10"
                          onClick={() => {
                            setSelectedGoal(activeGoal)
                            setIsEditModalOpen(true)
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10"
                          onClick={() => {
                            setGoalToDelete(activeGoal)
                            setIsDeleteModalOpen(true)
                          }}
                        >
                          <Trash className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10"
                          onClick={() => {
                            completeGoalMutation.mutate(activeGoal.id)
                          }}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Complete
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Target className="w-8 h-8 text-orange-400/50 mb-3" />
                    <p className="text-sm text-white/50 mb-2">No active session goal</p>
                    <p className="text-xs text-white/30">Add a goal to track your progress</p>
                  </div>
                )}
              </motion.div>

              {/* Progress Stats */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="rounded-xl bg-gradient-to-br from-[#10B981]/10 via-[#111111]/50 to-[#111111]/50 border border-[#10B981]/20 p-6 backdrop-blur-xl hover:border-[#10B981]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <BarChart className="w-5 h-5 text-[#10B981]" />
                    <h3 className="text-lg font-medium">Your Progress</h3>
                  </div>
                  <form onSubmit={(e) => e.preventDefault()}>
                    <Select 
                      value={selectedTimeRange} 
                      onValueChange={setSelectedTimeRange}
                    >
                      <SelectTrigger className="w-[120px] h-8 text-xs bg-transparent border-[#10B981]/20 hover:border-[#10B981]/30 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-[#10B981]/20">
                        <SelectItem value="Today">Today</SelectItem>
                        <SelectItem value="This Week">This Week</SelectItem>
                        <SelectItem value="This Month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </form>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Music className="w-4 h-4 text-[#10B981]" />
                      <span className="text-sm text-white/70">Beats Created</span>
                    </div>
                    <p className="text-2xl font-bold">{beatsCount ?? 0}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-[#10B981]" />
                      <span className="text-sm text-white/70">Total Goals</span>
                    </div>
                    <p className="text-2xl font-bold">{sessionStats?.totalGoals || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-[#10B981]" />
                      <span className="text-sm text-white/70">Completed</span>
                    </div>
                    <p className="text-2xl font-bold">{sessionStats?.completedGoals || 0}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Completion Rate</span>
                      <span className="text-sm text-white/50">{sessionStats?.completionRate || 0}%</span>
                    </div>
                    <div className="h-2 bg-[#10B981]/10 rounded-full">
                      <div 
                        className="h-full bg-[#10B981] rounded-full transition-all duration-500" 
                        style={{ width: `${sessionStats?.completionRate || 0}%` }} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-sm text-white/70">Current Streak</span>
                      <p className="text-lg font-medium">{sessionStats?.currentStreak || 0} days</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-white/70">Best Streak</span>
                      <p className="text-lg font-medium">{sessionStats?.bestStreak || 0} days</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-sm text-white/70">Average Session Time</span>
                    <p className="text-lg font-medium">{sessionStats?.averageSessionTime || 0} minutes</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-sm text-white/70">Most Productive Day</span>
                    <p className="text-lg font-medium">
                      {sessionStats?.mostProductiveDay ? new Date(sessionStats.mostProductiveDay).toLocaleDateString() : 'No data yet'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
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
              <AICoachCard suggestions={suggestions} />

              {/* Production Tips */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="rounded-xl bg-gradient-to-br from-yellow-500/10 via-[#111111]/50 to-[#111111]/50 border border-yellow-500/20 p-6 backdrop-blur-xl hover:border-yellow-500/30 transition-colors"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Quote className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-medium">Production Tips</h3>
                </div>
                <p className="text-sm text-white/70 mb-4">
                  Personalized tips to enhance your production workflow.
                </p>
                <p className="text-sm text-white/70 mb-4">
                  Explore different tempos outside your usual range for fresh creative ideas.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-white/50">Key:</span>
                    <span className="text-xs text-white/70">C</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-white/50">Energy:</span>
                    <span className="text-xs text-white/70">50%</span>
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
                className="rounded-xl bg-gradient-to-br from-blue-500/10 via-[#111111]/50 to-[#111111]/50 border border-blue-500/20 p-6 backdrop-blur-xl hover:border-blue-500/30 transition-colors"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-medium">Workflow Analytics</h3>
                </div>
                <p className="text-sm text-white/70 mb-4">
                  Insights about your production workflow and habits.
                </p>
                <p className="text-sm text-white/70 mb-4">
                  You're putting in significant hours. Remember to balance work with rest.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-white/70">0 sessions/day</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-white/70">33% completion</span>
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
                className="rounded-xl bg-gradient-to-br from-green-500/10 via-[#111111]/50 to-[#111111]/50 border border-green-500/20 p-6 backdrop-blur-xl hover:border-green-500/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-medium">Recent Goals</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-green-500/20 text-white/70 hover:bg-green-500/10 hover:border-green-500/30 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Reset Goals
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                        In Progress
                      </span>
                      <span className="text-xs text-white/50">37 minutes ago</span>
                    </div>
                    <p className="text-sm text-white/70">
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
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedGoal(null)
        }}
        goal={selectedGoal}
        onSave={(updatedGoal) => {
          // Implement the actual update mutation
          toast({
            title: "Goal Updated",
            description: "Your session goal has been updated successfully",
            duration: 3000,
          })
        }}
        onDelete={(goal) => {
          setGoalToDelete(goal)
          setIsDeleteModalOpen(true)
        }}
      />

      {/* Add the DeleteConfirmationModal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setGoalToDelete(null)
        }}
        onConfirm={() => {
          // Implement the actual delete mutation
          toast({
            title: "Goal Deleted",
            description: "Your session goal has been deleted successfully",
            duration: 3000,
          })
        }}
        title={goalToDelete?.goal_text || ''}
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