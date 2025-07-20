import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AICoach } from '@/components/ai-coach/AICoach'
import { FadeIn } from '@/components/ui/fade-in'
import { Brain, Clock, Target, TrendingUp, Play, Pause, RotateCcw, Quote, ArrowLeft, BarChart, Coffee, Settings, Menu, Plus, Moon, Check, Edit, Trash, RefreshCw, Radio, Music, X, SkipForward, MoreVertical, Flame, Trophy, Timer, Calendar, Lightbulb, Bell, Sparkles, Mic, Drum, Wand, Music2, Waves } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from "@/components/ui/use-toast"
import { supabase } from '@/lib/supabase'
import type { Database } from '@/integrations/supabase/types'
import type { User as UserType } from '@supabase/supabase-js'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from '@/components/Header'
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
import { useAIAssistant } from '@/lib/ai-assistant'
import { AISuggestions } from '@/components/ai-suggestions'
import { PaginatedGoals } from '@/components/sessions/PaginatedGoals'
import { BaseLayout } from '@/components/layout'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StreakNotification } from '@/components/streak/StreakNotification'

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
      staggerChildren: 0.15,
      when: "beforeChildren",
      duration: 0.5,
      ease: "easeOut"
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
      mass: 1,
      duration: 0.5
    }
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 0 20px rgba(16,185,129,0.2)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
      duration: 0.3
    }
  }
}

const buttonHoverVariants = {
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
      duration: 0.3
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.2
    }
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
  suggestions: {
    type: 'tip' | 'goal' | 'reminder' | 'insight'
    content: string
    priority: 'high' | 'medium' | 'low'
    category: string
    context: string
    tags: string[]
  }[]
  className?: string
}

// Update the AI Coach section to use the suggestions
const AICoachCard = ({ suggestions, className }: AICoachCardProps) => (
  <motion.div
    variants={cardVariants}
    whileHover="hover"
    className={cn(
      "rounded-2xl bg-gradient-to-br",
      "from-[#4169E1]/10 via-white/95 to-[#4169E1]/5",
      "dark:from-[#4169E1]/20 dark:via-background/95 dark:to-[#4169E1]/10",
      "border border-[#4169E1]/20 dark:border-[#4169E1]/20",
      "backdrop-blur-xl",
      "hover:border-[#4169E1]/30 dark:hover:border-[#4169E1]/30",
      "transition-all duration-300 ease-in-out",
      "shadow-sm hover:shadow-md dark:shadow-none",
      "hover:scale-[1.01]",
      "flex flex-col p-6",
      className
    )}
  >
    <div className="flex items-center space-x-2 mb-4">
      <Brain className="w-5 h-5 text-[#4169E1] dark:text-[#4169E1]" />
      <h3 className="text-lg font-medium text-[#4169E1] dark:text-[#4169E1]">AI Coach</h3>
    </div>
    <div className="flex-1 space-y-3">
      {!suggestions || suggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Brain className="w-8 h-8 text-[#4169E1]/50 mb-3" />
            <p className="text-sm text-[#4169E1] dark:text-[#4169E1]">
              Generating personalized suggestions...
            </p>
          </motion.div>
        </div>
      ) : (
        suggestions.map((suggestion, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "p-3 rounded-xl",
            "border",
              suggestion.priority === 'high' && "bg-[#4169E1]/10 dark:bg-[#4169E1]/20 border-[#4169E1]/20 dark:border-[#4169E1]/30",
              suggestion.priority === 'medium' && "bg-[#4169E1]/5 dark:bg-[#4169E1]/15 border-[#4169E1]/15 dark:border-[#4169E1]/25",
              suggestion.priority === 'low' && "bg-[#4169E1]/5 dark:bg-[#4169E1]/10 border-[#4169E1]/10 dark:border-[#4169E1]/20"
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
                {suggestion.type === 'tip' && <Lightbulb className="w-4 h-4 text-[#4169E1]" />}
                {suggestion.type === 'goal' && <Target className="w-4 h-4 text-[#4169E1]" />}
                {suggestion.type === 'reminder' && <Bell className="w-4 h-4 text-[#4169E1]" />}
                {suggestion.type === 'insight' && <Sparkles className="w-4 h-4 text-[#4169E1]" />}
                <span className="text-xs font-medium text-[#4169E1] dark:text-[#4169E1]">
                {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
              </span>
            </div>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                  suggestion.priority === 'high' && 'border-rose-500/20 text-rose-600 dark:border-rose-500/30 dark:text-rose-400',
                  suggestion.priority === 'medium' && 'border-amber-500/20 text-amber-600 dark:border-amber-500/30 dark:text-amber-400',
                  suggestion.priority === 'low' && 'border-emerald-500/20 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400'
              )}
            >
              {suggestion.priority}
            </Badge>
          </div>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">{suggestion.content}</p>
          <div className="flex flex-wrap gap-1">
            {suggestion.tags.map((tag, tagIndex) => (
              <Badge
                key={tagIndex}
                variant="secondary"
                  className={cn(
                    "text-xs",
                    tag.toLowerCase().includes('production') && "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
                    tag.toLowerCase().includes('mixing') && "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
                    tag.toLowerCase().includes('recording') && "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
                    tag.toLowerCase().includes('mastering') && "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
                    tag.toLowerCase().includes('arrangement') && "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
                    tag.toLowerCase().includes('composition') && "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
                    tag.toLowerCase().includes('sound') && "bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400",
                    tag.toLowerCase().includes('effect') && "bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400",
                    tag.toLowerCase().includes('vocal') && "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
                    tag.toLowerCase().includes('instrument') && "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
                    // Default color if no specific match
                    !tag.toLowerCase().match(/(production|mixing|recording|mastering|arrangement|composition|sound|effect|vocal|instrument)/) && 
                    "bg-slate-100 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400"
                  )}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </motion.div>
        ))
      )}
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
  const [currentSession, setCurrentSession] = useState(1)
  const [isAmbientSoundPlaying, setIsAmbientSoundPlaying] = useState(false)
  const ambientSoundRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  // Calculate progress for the circular timer
  const CIRCLE_RADIUS = 120
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS
  const progress = ((isWorking ? workDuration * 60 : breakDuration * 60) - timeLeft) / (isWorking ? workDuration * 60 : breakDuration * 60) * CIRCLE_CIRCUMFERENCE

  // Motivational tips based on mode
  const motivationalTips = {
    work: [
      { text: "Started from the bottom now we here", artist: "Drake - Started From The Bottom" },
      { text: "I'm out here grinding like I'm working at the studio", artist: "Drake - Energy" },
      { text: "I'm just feeling like the throne is for the taking, watch me take it", artist: "Drake - Forever" },
      { text: "I'm trying to do better than good enough", artist: "Drake - Best I Ever Had" },
      { text: "I'm the one that's living lavish, I'm the one that's getting passive", artist: "Drake - Money In The Grave" },
      { text: "I'm just trying to stay alive and take care of my people", artist: "Drake - God's Plan" },
      { text: "I'm just trying to be the best version of myself", artist: "Drake - Over" },
      { text: "I'm just trying to make the most of my time", artist: "Drake - Time Flies" },
      { text: "I'm just trying to be great", artist: "Drake - The Motto" },
      { text: "I'm just trying to be better than I was yesterday", artist: "Drake - 0 To 100" },
      { text: "I'm just trying to make it to the top", artist: "Drake - Make Me Proud" },
      { text: "Last name walking, first name never", artist: "Drake - All Me" },
      { text: "I'm upset, fifty thousand on my head, it's disrespect", artist: "Drake - I'm Upset" },
      { text: "I'm working on myself and I'm healing", artist: "Drake - Fair Trade" },
      { text: "I'm in the trenches, relaxing", artist: "Drake - Jimmy Cooks" },
      { text: "They say they miss the old Drake, girl don't tempt me", artist: "Drake - Views" },
      { text: "I'm outside, yeah, I'm outside and I'm still alive", artist: "Drake - Survival" },
      { text: "I'm about to hit the top, no debating", artist: "Drake - Nonstop" },
      { text: "I'm just getting started, let me tell you how it goes", artist: "Drake - Rich Flex" },
      { text: "I made a career off reminiscing", artist: "Drake - Race My Mind" },
      { text: "Life is good", artist: "Future & Drake - Life Is Good" },
      { text: "Focused on the future", artist: "Future - Mask Off" },
      { text: "Chase your dreams, never give up", artist: "Future - Never Stop" },
      { text: "Keep grinding, keep shining", artist: "Future - Turn On The Lights" },
      { text: "Stay dedicated to the vision", artist: "Future - Use Me" },
      { text: "I'm living life like a boss", artist: "Future - I'm Da One" },
      { text: "Every day I'm getting better", artist: "Future - 712PM" },
      { text: "I've been winning so long", artist: "Future - Holy Ghost" },
      { text: "I'm working harder than ever", artist: "Future - Ridin Strikers" },
      { text: "I'm way too charged up", artist: "Future - Unicorn Purp" },
      { text: "I'm on a roll, can't stop now", artist: "Future & Drake - Way 2 Sexy" },
      { text: "I'm leveling up for real", artist: "Future - I'm Dat N****" },
      { text: "Ain't no way around it, gotta face it", artist: "Future - Keep It Burning" },
      { text: "They ain't believe in me, I believed in me", artist: "Future - Massaging Me" },
      { text: "I'm mad, but I ain't stressin'", artist: "Kendrick Lamar - Count Me Out" },
      { text: "The sky is the limit, I gotta stay focused", artist: "Kendrick Lamar - PRIDE." },
      { text: "I transform like this is Optimus Prime", artist: "Kendrick Lamar - N95" },
      { text: "Look inside of my soul and you can find gold", artist: "Kendrick Lamar - ADHD" },
      { text: "If I gotta slap a critic, I'ma make it look sexy", artist: "Kendrick Lamar - ELEMENT." },
      { text: "I got loyalty, got royalty inside my DNA", artist: "Kendrick Lamar - DNA." },
      { text: "I'm so ahead of my time", artist: "Kendrick Lamar - i" },
      { text: "Every day I wake up and breathe, I'm moving different", artist: "Kendrick Lamar - Mother I Sober" },
      { text: "The hard work is paying off, I'm seeing progress", artist: "Kendrick Lamar - Savior" },
      { text: "I know what I'm worth", artist: "Kendrick Lamar - Silent Hill" },
      { text: "I'm cut from a different cloth, BOOM BOOM BOOM", artist: "Westside Gunn - Dr. Birds" },
      { text: "They sleep until they see the vision", artist: "Westside Gunn - George Bondo" },
      { text: "I'm painting pictures with the pen game", artist: "Westside Gunn - 327" },
      { text: "Every move calculated, DOOT DOOT DOOT", artist: "Westside Gunn - Broadway Joes" },
      { text: "I'm a living legend in the making", artist: "Westside Gunn - Versace" },
      { text: "I'm writing history right now", artist: "Westside Gunn - Michael Irvin" },
      { text: "The art is priceless, AYO", artist: "Westside Gunn - $500 Ounces" },
      { text: "I'm cut from a different cloth, SKRRRRT", artist: "Westside Gunn - Liz Loves Luger" },
      { text: "Every bar is a masterpiece", artist: "Westside Gunn - Banana Yacht" },
      { text: "I'm on a different frequency", artist: "Westside Gunn - French Toast" },
      { text: "I'm on my way, I'm on my way to get better", artist: "SZA - Good Days" },
      { text: "I just keep elevating, no losses, just upgrading", artist: "SZA - Kill Bill" },
      { text: "I'm so done with settling for less", artist: "SZA - SOS" },
      { text: "I got my own light, don't need no battery pack", artist: "SZA - Conceited" },
      { text: "I'm working on me, focusing on my growth", artist: "SZA - Garden (Say It Like Dat)" },
      { text: "I shine so bright, no need for sparkles", artist: "SZA - Ghost in the Machine" },
      { text: "I'm doing better than ever", artist: "SZA - Nobody Gets Me" },
      { text: "I don't need permission to go get it", artist: "SZA - Smoking on my Ex Pack" },
      { text: "I'm in control, doing it my way", artist: "SZA - Ctrl" },
      { text: "Watch me while I bloom", artist: "SZA - Drew Barrymore" },
      { text: "Push myself to the limit, yeah, every day I'm winning", artist: "Lil Uzi Vert - Just Wanna Rock" },
      { text: "They said I couldn't do it, now look at me now", artist: "Lil Uzi Vert - 20 Min" },
      { text: "Stack my paper fast, got no time to rest", artist: "Lil Uzi Vert - Money Longer" },
      { text: "I'm working hard, yeah, right now", artist: "Lil Uzi Vert - Sauce It Up" },
      { text: "All this work, no vacation", artist: "Lil Uzi Vert - Paradise" },
      { text: "I don't really stop, I keep going", artist: "Lil Uzi Vert - Chrome Heart Tags" },
      { text: "Level up, level up, I'm never going down", artist: "Lil Uzi Vert - Myron" },
      { text: "I'm too advanced, I'm way too ahead", artist: "Lil Uzi Vert - For Fun" },
      { text: "Every day I'm leveling up", artist: "Lil Uzi Vert - Endless Fashion" },
      { text: "I'm working on a mission", artist: "Lil Uzi Vert - X" },
      { text: "Work hard, stay focused, my vision tunneled", artist: "Tyler, The Creator - CORSO" },
      { text: "I'm going forward, can't go backwards", artist: "Tyler, The Creator - LUMBERJACK" },
      { text: "Find your wings, now it's time to fly", artist: "Tyler, The Creator - November" },
      { text: "I'm working on building my empire", artist: "Tyler, The Creator - MASSA" },
      { text: "Stay focused, don't let nothing stop your mission", artist: "Tyler, The Creator - SAFARI" },
      { text: "Create, never imitate", artist: "Tyler, The Creator - Manifesto" },
      { text: "Every move is calculated, watch me innovate", artist: "Tyler, The Creator - RUNITUP" },
      { text: "I'm on a mission, can't stop won't stop", artist: "Tyler, The Creator - WHO DAT BOY" },
      { text: "They didn't believe in the vision, I made them see it", artist: "Tyler, The Creator - RISE!" },
      { text: "Keep creating, keep elevating", artist: "Tyler, The Creator - NEW MAGIC WAND" },
      { text: "I'm in my prime, yeah (What?), I'm at the top (Yeah!)", artist: "Playboi Carti - Sky" },
      { text: "They can't stop me, yeah, I'm on a roll (Yeah!)", artist: "Playboi Carti - New Tank" },
      { text: "I've been grinding, yeah, all day (What?)", artist: "Playboi Carti - Magnolia" },
      { text: "Never gonna stop until I'm done (Yeah!)", artist: "Playboi Carti - Stop Breathing" },
      { text: "I'm on top, I got this locked (Slatt!)", artist: "Playboi Carti - ILoveUIHateU" },
      { text: "Push these boundaries, yeah, no limits (What?)", artist: "Playboi Carti - Control" },
      { text: "Working hard, yeah, that's my lifestyle (Yeah!)", artist: "Playboi Carti - Long Time" },
      { text: "Can't nobody stop my grind (Slatt!)", artist: "Playboi Carti - Over" },
      { text: "Level up every day, watch me rise (What?)", artist: "Playboi Carti - M3tamorphosis" },
      { text: "Stay focused on the mission (Yeah!)", artist: "Playboi Carti - Slay3r" },
      { text: "Work it to the maximum, yeah (It's lit!)", artist: "Travis Scott - SICKO MODE" },
      { text: "Focus on the vision, never switch (Straight up!)", artist: "Travis Scott - HYAENA" },
      { text: "Ain't no stoppin' on this mission (La Flame!)", artist: "Travis Scott - FE!N" },
      { text: "Level up, watch me elevate (Yeah!)", artist: "Travis Scott - MODERN JAM" },
      { text: "Keep pushing forward, never look back (It's lit!)", artist: "Travis Scott - STARGAZING" },
      { text: "Stay focused on the grind (Straight up!)", artist: "Travis Scott - 5% TINT" },
      { text: "Working hard until it's done right (La Flame!)", artist: "Travis Scott - MAFIA" },
      { text: "Every move calculated, watch me work (Yeah!)", artist: "Travis Scott - CIRCUS MAXIMUS" },
      { text: "Can't stop until we reach the top (It's lit!)", artist: "Travis Scott - goosebumps" },
      { text: "Keep pushing boundaries, break the mold (Straight up!)", artist: "Travis Scott - BUTTERFLY EFFECT" },
      { text: "I'm living in the future so the present is my past", artist: "Kanye West - Monster" },
      { text: "You should be honored by my lateness, that I would even show up to this fake thing", artist: "Kanye West - Stronger" },
      { text: "Reach for the stars, so if you fall you land on a cloud", artist: "Kanye West - Homecoming" },
      { text: "My presence is a present, kiss my ring", artist: "Kanye West - Monster" },
      { text: "I'm doing pretty good as far as geniuses go", artist: "Kanye West - Barry Bonds" },
      { text: "I am the number one human being in music", artist: "Kanye West - Power" },
      { text: "I'd rather be a dick than a swallower", artist: "Kanye West - New Slaves" },
      { text: "I'm living in that 21st century, doing something mean to it", artist: "Kanye West - Power" },
      { text: "No one man should have all that power", artist: "Kanye West - Power" },
      { text: "This the real world, homie, school finished", artist: "Kanye West - Gorgeous" },
      { text: "Time is the most valuable currency", artist: "Dave - Twenty To One" },
      { text: "I got vision, that's something you can't buy", artist: "Dave - Starlight" },
      { text: "Success is not a destination, it's a journey", artist: "Dave - Survivor's Guilt" },
      { text: "They say success is the best revenge", artist: "Dave - Purple Heart" },
      { text: "I'm working twice as hard as I did last year", artist: "Dave - Professor X" },
      { text: "Every L is a lesson, that's how I'm seeing it", artist: "Dave - Heart Attack" },
      { text: "I've been grinding, no days off", artist: "Dave - Clash" },
      { text: "My work rate's been crazy, I've been working like a slave", artist: "Dave - Funky Friday" },
      { text: "I've got a bigger purpose than the surface", artist: "Dave - Environment" },
      { text: "Success is inevitable, failure's impossible", artist: "Dave - Psycho" }
    ],
    break: [
      { text: "Sometimes I need that time to myself", artist: "Drake - Take Care" },
      { text: "I'm just trying to keep my mind at ease", artist: "Drake - Keep The Family Close" },
      { text: "I'm just trying to stay focused", artist: "Drake - Focus" },
      { text: "I'm just trying to stay grounded", artist: "Drake - Weston Road Flows" },
      { text: "I'm just trying to stay humble", artist: "Drake - Humble" },
      { text: "I'm just trying to stay patient", artist: "Drake - Patient" },
      { text: "I'm just trying to stay grateful", artist: "Drake - Grateful" },
      { text: "I'm just trying to stay blessed", artist: "Drake - Blessings" },
      { text: "I'm just trying to stay focused on the bigger picture", artist: "Drake - Big Picture" },
      { text: "I'm just trying to stay focused on what matters", artist: "Drake - What Matters" },
      { text: "Time heals all, and heels hurt to walk in", artist: "Drake - Fancy" },
      { text: "Know yourself, know your worth", artist: "Drake - Know Yourself" },
      { text: "Tables turn, bridges burn, you live and learn", artist: "Drake - Pound Cake" },
      { text: "I'm just seeing my world through a window pane", artist: "Drake - Deep Pockets" },
      { text: "I'm on a roll like Cottonelle", artist: "Drake - All Me" },
      { text: "I'm honest, I make mistakes, I'd be the second to admit it", artist: "Drake - The Resistance" },
      { text: "I'm tired of being patient, I want it all now", artist: "Drake - The Motion" },
      { text: "Life is always worth living twice", artist: "Drake - Champagne Poetry" },
      { text: "I'm trying to do better than alright", artist: "Drake - TSU" },
      { text: "Gotta handle my business like a grown man", artist: "Drake - Pipe Down" },
      { text: "Take some time to reflect", artist: "Future - Perkys Calling" },
      { text: "Find your inner peace", artist: "Future - Peacoat" },
      { text: "Sometimes silence is the best medicine", artist: "Future - Purple Reign" },
      { text: "Take a moment to breathe", artist: "Future - Throw Away" },
      { text: "Time for self reflection", artist: "Future - My Collection" },
      { text: "Taking my time, that's the way it's supposed to be", artist: "Future - Love You Better" },
      { text: "Sometimes you gotta take a step back", artist: "Future - The Percocet & Stripper Joint" },
      { text: "Need some time to clear my mind", artist: "Future - Solo" },
      { text: "Reflecting on my journey", artist: "Future - Accepting My Flaws" },
      { text: "Peace of mind is priceless", artist: "Future - Outer Space Bih" },
      { text: "Sometimes silence is better than words", artist: "Future - Deeper Than The Ocean" },
      { text: "Taking time to get my mind right", artist: "Future - All Bad" },
      { text: "Gotta stay balanced", artist: "Future - Overdose" },
      { text: "I love myself", artist: "Kendrick Lamar - i" },
      { text: "Be patient, be patient", artist: "Kendrick Lamar - Mirror" },
      { text: "I need some water, something came over me", artist: "Kendrick Lamar - FEEL." },
      { text: "I'm the biggest hypocrite of 2015", artist: "Kendrick Lamar - The Blacker The Berry" },
      { text: "All my life I has to fight", artist: "Kendrick Lamar - Alright" },
      { text: "Sometimes I need to be alone", artist: "Kendrick Lamar - u" },
      { text: "Sit down, be humble", artist: "Kendrick Lamar - HUMBLE." },
      { text: "I'm so grateful for the blessings", artist: "Kendrick Lamar - Count Me Out" },
      { text: "Take time to heal", artist: "Kendrick Lamar - United In Grief" },
      { text: "I choose me, I'm sorry", artist: "Kendrick Lamar - Mirror" },
      { text: "Sometimes you gotta reflect on the journey", artist: "Westside Gunn - Richies" },
      { text: "Peace to the gods, peace to the earth", artist: "Westside Gunn - Peace Fly God" },
      { text: "Take time to appreciate the art", artist: "Westside Gunn - Fly God Jr" },
      { text: "Wisdom is better than silver and gold", artist: "Westside Gunn - Stefflon Don" },
      { text: "Sometimes silence speaks volumes", artist: "Westside Gunn - Kelly's Korner" },
      { text: "Meditate on the moves", artist: "Westside Gunn - Mariota" },
      { text: "Find your inner peace", artist: "Westside Gunn - BIG AL" },
      { text: "Take time to count your blessings", artist: "Westside Gunn - Bubba Chuck" },
      { text: "Reflect on how far we've come", artist: "Westside Gunn - RIP Eddie Kingston" },
      { text: "Sometimes you gotta step back and observe", artist: "Westside Gunn - The Fly Who Couldn't Fly Straight" },
      { text: "Take time, heal yourself", artist: "SZA - Special" },
      { text: "It's okay to put yourself first", artist: "SZA - Love Galore" },
      { text: "Sometimes you gotta sit with your thoughts", artist: "SZA - Open Arms" },
      { text: "Take a moment to appreciate your journey", artist: "SZA - Far" },
      { text: "Self-love is the best love", artist: "SZA - Broken Clocks" },
      { text: "Find peace in solitude", artist: "SZA - Gone Girl" },
      { text: "Take a deep breath, reset your mind", artist: "SZA - Blind" },
      { text: "It's okay to take your time", artist: "SZA - Normal Girl" },
      { text: "Give yourself grace", artist: "SZA - Supermodel" },
      { text: "Remember how far you've come", artist: "SZA - I Hate U" },
      { text: "Take your time, yeah, that's the wave", artist: "Lil Uzi Vert - The Way Life Goes" },
      { text: "Slow it down, take it easy", artist: "Lil Uzi Vert - Neon Guts" },
      { text: "Sometimes we need a moment just to breathe", artist: "Lil Uzi Vert - Dark Queen" },
      { text: "Clear your mind, let your soul free", artist: "Lil Uzi Vert - XO Tour Llif3" },
      { text: "Take a break, reset your mind state", artist: "Lil Uzi Vert - Venetia" },
      { text: "Find your peace, that's what matters", artist: "Lil Uzi Vert - That Way" },
      { text: "Sometimes silence is the answer", artist: "Lil Uzi Vert - Baby Pluto" },
      { text: "Take time to find yourself", artist: "Lil Uzi Vert - P2" },
      { text: "Reflect on how far you've come", artist: "Lil Uzi Vert - Bigger Than Life" },
      { text: "Stay balanced, keep your mind right", artist: "Lil Uzi Vert - Celebration Station" },
      { text: "Take time to find your garden", artist: "Tyler, The Creator - Garden Shed" },
      { text: "Sometimes you gotta take a step back to see clear", artist: "Tyler, The Creator - GONE, GONE / THANK YOU" },
      { text: "Find your peace, that's what matters most", artist: "Tyler, The Creator - ARE WE STILL FRIENDS?" },
      { text: "Take a moment to appreciate where you are", artist: "Tyler, The Creator - See You Again" },
      { text: "Self-reflection leads to growth", artist: "Tyler, The Creator - WILSHIRE" },
      { text: "Sometimes silence helps you hear yourself better", artist: "Tyler, The Creator - Boredom" },
      { text: "Take care of your garden, watch it grow", artist: "Tyler, The Creator - Where This Flower Blooms" },
      { text: "Find what makes your soul smile", artist: "Tyler, The Creator - 911" },
      { text: "Sometimes you need to pause and breathe", artist: "Tyler, The Creator - Running Out of Time" },
      { text: "Take time to appreciate your journey", artist: "Tyler, The Creator - Sweet / I THOUGHT YOU WANTED TO DANCE" },
      { text: "Take your time, yeah, let it breathe (What?)", artist: "Playboi Carti - Place" },
      { text: "Find your peace, yeah, that's the wave (Yeah!)", artist: "Playboi Carti - Feel Like Dyin" },
      { text: "Sometimes we need to slow it down (Slatt!)", artist: "Playboi Carti - Not PLaying" },
      { text: "Take a moment, clear your mind (What?)", artist: "Playboi Carti - F33l Lik3 Dyin" },
      { text: "Let your soul free, yeah, that's the vibe (Yeah!)", artist: "Playboi Carti - Teen X" },
      { text: "Find your zone, stay in your lane (What?)", artist: "Playboi Carti - King Vamp" },
      { text: "Take time to recharge (Slatt!)", artist: "Playboi Carti - On That Time" },
      { text: "Reflect on the journey (Yeah!)", artist: "Playboi Carti - Die4Guy" },
      { text: "Find your balance, keep it real (What?)", artist: "Playboi Carti - Meh" },
      { text: "Take a break, reset your mind state (Yeah!)", artist: "Playboi Carti - Vamp Anthem" },
      { text: "Take time to find your peace (La Flame!)", artist: "Travis Scott - ASTROTHUNDER" },
      { text: "Sometimes you gotta slow it down (Yeah!)", artist: "Travis Scott - STOP TRYING TO BE GOD" },
      { text: "Find your zone, let it flow (It's lit!)", artist: "Travis Scott - SKITZO" },
      { text: "Take a moment to reflect (Straight up!)", artist: "Travis Scott - COFFEE BEAN" },
      { text: "Clear your mind, let it breathe (La Flame!)", artist: "Travis Scott - SDMN" },
      { text: "Find your balance in the chaos (Yeah!)", artist: "Travis Scott - R.I.P. SCREW" },
      { text: "Take time to recharge your energy (It's lit!)", artist: "Travis Scott - YOSEMITE" },
      { text: "Let your mind wander free (Straight up!)", artist: "Travis Scott - LOST FOREVER" },
      { text: "Sometimes silence speaks volumes (La Flame!)", artist: "Travis Scott - MARIA I'M DRUNK" },
      { text: "Take a break, reset your state (Yeah!)", artist: "Travis Scott - IMPOSSIBLE" },
      { text: "Listen to the kids, bro", artist: "Kanye West - Father Stretch My Hands Pt. 1" },
      { text: "Everything I'm not made me everything I am", artist: "Kanye West - Everything I Am" },
      { text: "I'm just trying to say the way school need teachers, the way Kathie Lee needed Regis, that's the way I need Jesus", artist: "Kanye West - Jesus Walks" },
      { text: "We're all self-conscious, I'm just the first to admit it", artist: "Kanye West - All Falls Down" },
      { text: "I know I got to be right now, cause I can't get much wronger", artist: "Kanye West - Can't Tell Me Nothing" },
      { text: "The plan was to drink until the pain over, but what's worse, the pain or the hangover?", artist: "Kanye West - Dark Fantasy" },
      { text: "I'm not out of control, I'm just not in their control", artist: "Kanye West - Saint Pablo" },
      { text: "I've been trying to right my wrongs", artist: "Kanye West - Real Friends" },
      { text: "I guess every superhero need his theme music", artist: "Kanye West - Power" },
      { text: "You're not perfect but you're not your mistakes", artist: "Kanye West - Only One" },
      { text: "Take time to know yourself, that's the most important thing", artist: "Dave - Black" },
      { text: "Sometimes the hardest person to forgive is yourself", artist: "Dave - Drama" },
      { text: "Mental health is wealth, I need peace of mind", artist: "Dave - Both Sides of a Smile" },
      { text: "Sometimes silence teaches you more than noise", artist: "Dave - How I Met My Ex" },
      { text: "Take time to process everything you're going through", artist: "Dave - Psychodrama" },
      { text: "Self-love is the foundation", artist: "Dave - Law of Attraction" },
      { text: "Sometimes you need a moment just to breathe", artist: "Dave - Hangman" },
      { text: "Your peace of mind is worth more than anything", artist: "Dave - Therapy" },
      { text: "Take time to heal, that's real strength", artist: "Dave - Lesley" },
      { text: "Sometimes the best thing you can do is reflect", artist: "Dave - Three Rivers" }
    ]
  }

  // Get random motivational tip
  const currentTip = useMemo(() => {
    const tips = isWorking ? motivationalTips.work : motivationalTips.break
    return tips[Math.floor(Math.random() * tips.length)]
  }, [isWorking])

  // Handle ambient sound
  useEffect(() => {
    if (isAmbientSoundPlaying && ambientSoundRef.current) {
      ambientSoundRef.current.play()
    } else if (ambientSoundRef.current) {
      ambientSoundRef.current.pause()
    }
  }, [isAmbientSoundPlaying])

  // Handle session completion
  useEffect(() => {
    if (timeLeft === 0 && !isWorking) {
      // Break completed, increment session counter
      setCurrentSession(prev => {
        const newSession = prev + 1
        if (newSession > 4) {
          // All sessions completed
          toast({
            title: "🎉 All Sessions Complete!",
            description: "Great job! You've completed all 4 sessions. Take a longer break!",
            duration: 5000,
          })
          return 1 // Reset to first session
        }
        return newSession
      })
    }
  }, [timeLeft, isWorking, toast])

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
      <div className="flex flex-col space-y-4">
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
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
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
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                !isWorking
                  ? "bg-white dark:bg-background text-violet-700 dark:text-violet-300 shadow-sm"
                  : "text-violet-600/70 dark:text-violet-400/70 hover:text-violet-700 dark:hover:text-violet-300"
              )}
            >
              Break
            </button>
          </div>
          <div className="flex items-center gap-2">
            {/* Session Counter with Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "px-2 py-0.5 rounded-lg text-xs font-medium cursor-help",
                    isWorking
                      ? "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : "bg-violet-100/50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
                  )}>
                    <div className="flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      <span>Session {currentSession} of 4</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  className="max-w-[280px] p-4 text-sm bg-gradient-to-b from-card to-card/95 backdrop-blur-sm border-border shadow-xl"
                  side="bottom"
                  align="end"
                >
                  <div className="space-y-2">
                    <p className="font-medium text-foreground/90">Pomodoro Timer</p>
                    <div className="text-muted-foreground space-y-1.5">
                      <p>Complete 4 focused work sessions with breaks in between.</p>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                          <span>Work: {workDuration}m</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
                          <span>Break: {breakDuration}m</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50" />
                          <span>4 sessions</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                          <span>Long break after</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
        </div>

        {/* Timer Display with Circular Progress - More Compact */}
        <div className="relative flex flex-col items-center space-y-3">
          <div className="relative">
            {/* Circular Progress Ring - Reduced size */}
            <svg className="w-64 h-64 -rotate-90">
              <circle
                className="text-gray-200/10 dark:text-gray-700/20"
                strokeWidth="2"
                stroke="currentColor"
                fill="transparent"
                r={CIRCLE_RADIUS * 0.8} // Reduced radius
                cx="128"
                cy="128"
              />
              <motion.circle
                className={cn(
                  "transition-colors duration-300",
                  isWorking
                    ? "text-emerald-500/40 dark:text-emerald-400/40"
                    : "text-violet-500/40 dark:text-violet-400/40"
                )}
                strokeWidth="2"
                strokeDasharray={CIRCLE_CIRCUMFERENCE * 0.8}
                strokeDashoffset={CIRCLE_CIRCUMFERENCE * 0.8 - progress * 0.8}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={CIRCLE_RADIUS * 0.8} // Reduced radius
                cx="128"
                cy="128"
                initial={{ strokeDashoffset: CIRCLE_CIRCUMFERENCE * 0.8 }}
                animate={{ strokeDashoffset: CIRCLE_CIRCUMFERENCE * 0.8 - progress * 0.8 }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            {/* Timer Display - Adjusted size */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                "text-5xl font-bold tracking-tighter transition-colors",
                isWorking
                  ? "text-emerald-400 dark:text-emerald-300"
                  : "text-violet-400 dark:text-violet-300"
              )}>
                {formatTime(timeLeft)}
              </span>
              <span className={cn(
                "text-sm font-medium mt-1",
                isWorking
                  ? "text-emerald-400/70 dark:text-emerald-400/70"
                  : "text-violet-400/70 dark:text-violet-400/70"
              )}>
                {isWorking ? "Focus Time" : "Break Time"}
              </span>
            </div>
          </div>

          {/* Motivational Tip - More Compact */}
          <div className="text-center max-w-xs h-[60px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTip.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.4,
                  ease: "easeOut"
                }}
                className={cn(
                  "space-y-1 absolute",
                  isWorking
                    ? "text-emerald-600/90 dark:text-emerald-400/90"
                    : "text-violet-600/90 dark:text-violet-400/90"
                )}
              >
                <p className="text-sm font-medium leading-relaxed tracking-tight">
                  "{currentTip.text}"
                </p>
                <p className="text-xs font-medium tracking-wide opacity-70">
                  {currentTip.artist}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Controls - More Compact */}
        <div className="flex items-center justify-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAmbientSoundPlaying(!isAmbientSoundPlaying)}
            className={cn(
              "w-9 h-9 rounded-xl transition-all duration-200",
              isWorking
                ? "border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-300"
                : "border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-700 dark:hover:text-violet-300"
            )}
          >
            <Music className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            className={cn(
              "w-9 h-9 rounded-xl transition-all duration-200",
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
              "w-11 h-11 rounded-xl transition-all duration-200",
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

        {/* Local Time - More Compact */}
        <div className="flex items-center justify-center">
          <Clock className={cn(
            "w-3 h-3 mr-1",
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

        {/* Hidden Audio Element for Ambient Sound */}
        <audio
          ref={ambientSoundRef}
          src="/ambient-sound.mp3"
          loop
          className="hidden"
        />
      </div>
    </motion.div>
  )
}

// Update the SessionCard component props interface
const SessionCard = ({ session, onPlay, onPause, onComplete, onEdit, onDelete, activeGoal, deleteGoalMutation }) => (
  <motion.div
    variants={cardVariants}
    whileHover={{ scale: 1.005 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className={cn(
      "group relative rounded-2xl",
      "bg-[#141414] hover:bg-[#181818]",
      "border border-neutral-800/50 hover:border-neutral-700",
      "p-6",
      "shadow-inner shadow-black/10",
      "hover:shadow-xl hover:shadow-neutral-900/20",
      "transition-all duration-300 ease-in-out",
      "after:absolute after:inset-0 after:rounded-2xl",
      "after:ring-1 after:ring-inset after:ring-white/5",
      "after:transition-all after:duration-300",
      "hover:after:ring-white/10"
    )}
  >
    {/* Title and Status Section */}
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-medium text-neutral-100 leading-tight group-hover:text-white transition-colors duration-300">
          {session.title}
        </h3>
        <span className={cn(
          "text-xs px-3 py-1 rounded-full font-medium transition-all duration-300",
          session.status === 'completed' 
            ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300"
            : "bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 group-hover:text-orange-300"
        )}>
          {session.status === 'completed' ? 'Completed' : 'In Progress'}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors duration-300">
        {session.project.description || 'No description available'}
      </p>

      {/* Meta Info and Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-neutral-800 mt-4 group-hover:border-neutral-700/50 transition-colors duration-300">
        {/* Meta Information */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-neutral-500 group-hover:text-neutral-400 transition-colors duration-300">
            {new Date(session.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-400 transition-colors duration-300" />
              <span className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300">
                {session.duration} min
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-400 transition-colors duration-300" />
              <span className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300">
                {session.project.bpm} BPM
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
            onClick={() => onComplete(session.id)}
            className={cn(
              "p-2 rounded-lg",
              "bg-emerald-500/10 text-emerald-400/90",
              "hover:bg-emerald-500/20 hover:text-emerald-300",
              "group-hover:bg-emerald-500/15 group-hover:text-emerald-300",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500/30",
              "transform transition-all duration-200"
            )}
          >
            <Check className="w-4 h-4" />
        </motion.button>
          
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(session.id)}
            className={cn(
              "p-2 rounded-lg",
              "bg-orange-500/10 text-orange-400/90",
              "hover:bg-orange-500/20 hover:text-orange-300",
              "group-hover:bg-orange-500/15 group-hover:text-orange-300",
              "focus:outline-none focus:ring-2 focus:ring-orange-500/30",
              "transform transition-all duration-200"
            )}
          >
            <Edit className="w-4 h-4" />
        </motion.button>
          
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(session.id)}
            className={cn(
              "p-2 rounded-lg",
              "bg-rose-500/10 text-rose-400/90",
              "hover:bg-rose-500/20 hover:text-rose-300",
              "group-hover:bg-rose-500/15 group-hover:text-rose-300",
              "focus:outline-none focus:ring-2 focus:ring-rose-500/30",
              "transform transition-all duration-200"
            )}
          >
            <Trash className="w-4 h-4" />
        </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => session.status === 'completed' ? onPause(session.id) : onPlay(session.id)}
            className={cn(
              "p-2 rounded-lg",
              "bg-neutral-800 text-neutral-400",
              "hover:bg-neutral-700 hover:text-neutral-300",
              "group-hover:bg-neutral-700/80 group-hover:text-neutral-300",
              "focus:outline-none focus:ring-2 focus:ring-neutral-500/30",
              "transform transition-all duration-200"
            )}
      >
        {session.status === 'completed' ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </motion.button>
        </div>
      </div>
    </div>
  </motion.div>
)

// Update the EditGoalModal component
const EditGoalModal = ({ goal, isOpen, onClose, onSave }: EditGoalModalProps) => {
  const [title, setTitle] = useState(goal?.goal_text || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [duration, setDuration] = useState(goal?.expected_duration_minutes?.toString() || '25');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (goal) {
      setTitle(goal.goal_text);
      setDescription(goal.description || '');
      setDuration(goal.expected_duration_minutes?.toString() || '25');
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const priority = getPriorityFromDuration(Number(duration));
    onSave({ title, description, priority });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 mx-4 space-y-4 bg-[#121212] rounded-xl border border-orange-500/20">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Edit Goal</h2>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-neutral-400 hover:text-white"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#1A1A1A] text-white border border-orange-500/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              placeholder="What do you want to achieve?"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24 px-3 py-2 text-sm bg-[#1A1A1A] text-white border border-orange-500/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
              placeholder="Add more details about your goal..."
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="120"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#1A1A1A] text-white border border-orange-500/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
  const [duration, setDuration] = React.useState('25')
  const [isSaving, setIsSaving] = React.useState(false)
  const [isAIOpen, setIsAIOpen] = React.useState(false)
  const { toast } = useToast()
  const [user, setUser] = React.useState<UserType | null>(null)
  const formRef = React.useRef<HTMLFormElement>(null)

  // Get user on component mount
  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create goals",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setIsSaving(true)
    try {
      // Call the onSave prop with the goal data
      onSave({
        title: title.trim(),
        description: description.trim(),
        duration: Number(duration)
      });

      // Reset form
      formRef.current?.reset();
      setTitle('');
      setDescription('');
      setDuration('25');
      onClose();
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
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 'Create a melodic hook for the chorus' or 'Mix the drum patterns'"
                className="w-full bg-gradient-to-br from-white/80 to-white/60 dark:from-zinc-800/80 dark:to-zinc-900/60 border border-orange-200/50 dark:border-orange-500/20 rounded-2xl px-4 py-3 text-base font-medium text-neutral-900 dark:text-neutral-100 placeholder:text-sm placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:focus:ring-orange-500/40 focus:border-orange-500/30 dark:focus:border-orange-500/40 transition-all shadow-sm dark:shadow-inner-sm pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-orange-600/70 dark:text-orange-400/70 hover:text-orange-600 dark:hover:text-orange-400"
                    >
                      <Brain className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0 bg-[#121212] border-neutral-800">
                    <div className="shadow-inner shadow-black/20 rounded-2xl p-4 space-y-2">
                      <h3 className="text-sm text-muted-foreground mb-2 px-1">AI Suggestions</h3>
                      
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full rounded-xl p-2.5 transition-all duration-200 group relative",
                          title === "Record and layer vocal harmonies"
                            ? "bg-[#2C1F1D] ring-1 ring-orange-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                            : "hover:bg-[#2C1F1D]/70"
                        )}
                        onClick={() => {
                          setTitle("Record and layer vocal harmonies");
                          setDescription("Create rich vocal textures by recording multiple harmony parts, focusing on thirds and fifths. Experiment with different vocal placements and stereo positioning.");
                          setDuration("45");
                          setIsAIOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Mic className="w-5 h-5 text-orange-400 shrink-0" />
                          <p className="font-medium text-neutral-100">Record Vocal Harmonies</p>
                        </div>
                      </Button>

                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full rounded-xl p-2.5 transition-all duration-200 group relative",
                          title === "Mix and process drum patterns"
                            ? "bg-[#2C1F1D] ring-1 ring-orange-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                            : "hover:bg-[#2C1F1D]/70"
                        )}
                        onClick={() => {
                          setTitle("Mix and process drum patterns");
                          setDescription("Apply EQ, compression, and spatial effects to individual drum tracks. Focus on kick-snare balance, hi-hat dynamics, and overall groove cohesion.");
                          setDuration("30");
                          setIsAIOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Music2 className="w-5 h-5 text-orange-400 shrink-0" />
                          <p className="font-medium text-neutral-100">Mix Drum Patterns</p>
                        </div>
                      </Button>

                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full rounded-xl p-2.5 transition-all duration-200 group relative",
                          title === "Design synth bass sound"
                            ? "bg-[#2C1F1D] ring-1 ring-orange-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                            : "hover:bg-[#2C1F1D]/70"
                        )}
                        onClick={() => {
                          setTitle("Design synth bass sound");
                          setDescription("Create a distinctive bass sound using subtractive synthesis, focusing on filter modulation and envelope shaping. Write a compelling bassline that complements the chord progression.");
                          setDuration("35");
                          setIsAIOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Waves className="w-5 h-5 text-orange-400 shrink-0" />
                          <p className="font-medium text-neutral-100">Design Synth Bass</p>
                        </div>
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="relative">
              <textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add some details about your goal (optional)"
                rows={3}
                className="w-full bg-gradient-to-br from-white/80 to-white/60 dark:from-zinc-800/80 dark:to-zinc-900/60 border border-orange-200/50 dark:border-orange-500/20 rounded-2xl px-4 py-3 text-base font-medium text-neutral-900 dark:text-neutral-100 placeholder:text-sm placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:focus:ring-orange-500/40 focus:border-orange-500/30 dark:focus:border-orange-500/40 transition-all resize-none shadow-sm dark:shadow-inner-sm"
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-orange-600/50 dark:text-orange-400/50" />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Duration</span>
                    </div>
                    <span className="text-sm font-medium px-2 py-0.5 rounded-lg bg-orange-100/50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                      {duration} min
                    </span>
                  </div>
                  <div className="px-1">
                    <Slider
                      value={[Number(duration)]}
                      min={5}
                      max={60}
                      step={5}
                      onValueChange={(value) => setDuration(value[0].toString())}
                      className={cn(
                        "relative flex items-center select-none touch-none w-full transition-colors",
                        "[&_[role=slider]]:h-4 [&_[role=slider]]:w-4",
                        "[&_[role=slider]]:transition-all",
                        "[&_[role=slider]]:bg-orange-500 [&_[role=slider]]:border-orange-500",
                        "dark:[&_[role=slider]]:bg-orange-400 dark:[&_[role=slider]]:border-orange-400",
                        "[&_[role=slider]]:hover:scale-110",
                        "[&_[role=slider]]:focus:scale-110",
                        "[&_[role=slider]]:outline-none",
                        "[&_[role=slider]]:rounded-full",
                        "[&_[role=slider]]:border-2",
                        "[&_[role=slider]]:shadow-sm",
                        "[&_[role=slider]]:transition-transform",
                        "[&_[role=slider]]:duration-200"
                      )}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">5 min</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">60 min</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-150 shadow-md hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:focus:ring-orange-500/40"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Create Goal'
                )}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const pageAnimation: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.5,
      ease: "easeIn"
    }
  }
}

const Sessions: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [user, setUser] = useState<UserType | null>(null)
  const { toast } = useToast()
  const [isWorking, setIsWorking] = useLocalStorage<boolean>('timer-is-working', true)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
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
  const [durationValue, setDurationValue] = useState(25)
  const [isSaving, setIsSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  
  // Update AI suggestions state and handlers
  const { suggestions: coachSuggestions, refreshSuggestions, isLoading: isLoadingAICoach } = useAICoach()
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiSuggestions, setAISuggestions] = useState<Array<{
    title: string;
    description: string;
    duration: number;
    priority?: 'high' | 'medium' | 'low';
    content?: string;
  }>>([])

  const handleSuggestionSelect = (suggestion: { title: string; description: string; duration: number }) => {
    setTitle(suggestion.title)
    setDescription(suggestion.description)
    setDurationValue(suggestion.duration)
    setShowSuggestions(false)
  }

  const generateSuggestions = async () => {
    setIsLoadingAI(true)
    try {
      // Use some default suggestions in case the API call fails
      const fallbackSuggestions = [
        {
          title: "Create a melodic hook for the chorus",
          description: "Focus on crafting a memorable and catchy melody that captures the emotional core of the song",
          duration: 30
        },
        {
          title: "Mix the drum patterns",
          description: "Balance levels and add dynamic processing to create a solid rhythmic foundation",
          duration: 45
        },
        {
          title: "Record vocal harmonies",
          description: "Layer multiple vocal tracks to create rich harmonic textures",
          duration: 25
        }
      ]

      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: title || description || "Generate music production goals",
          context: "music production session goals"
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions')
      }

      const data = await response.json()
      
      // If we got valid data, use it; otherwise use fallback
      if (Array.isArray(data) && data.length > 0) {
        setAISuggestions(data)
      } else {
        setAISuggestions(fallbackSuggestions)
        toast({
          title: "Using Fallback Suggestions",
          description: "Could not get AI suggestions, showing default options instead.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error('Error generating suggestions:', error)
      // Use fallback suggestions on error
      setAISuggestions([
        {
          title: "Create a melodic hook for the chorus",
          description: "Focus on crafting a memorable and catchy melody that captures the emotional core of the song",
          duration: 30
        },
        {
          title: "Mix the drum patterns",
          description: "Balance levels and add dynamic processing to create a solid rhythmic foundation",
          duration: 45
        },
        {
          title: "Record vocal harmonies",
          description: "Layer multiple vocal tracks to create rich harmonic textures",
          duration: 25
        }
      ])
      toast({
        title: "Using Fallback Suggestions",
        description: "Could not get AI suggestions, showing default options instead.",
        variant: "default",
      })
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create goals",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

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

    setIsSaving(true)
    try {
      // Create the goal
      const { data, error } = await supabase
        .from('session_goals')
        .insert({
          user_id: user.id,
          goal_text: title.trim(),
          expected_duration_minutes: durationValue,
          status: 'pending' as const,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Set the active goal
      if (data) {
        setActiveGoal(mapDatabaseGoalToGoal(data));
      }

      // Invalidate queries to refresh the goals list
      queryClient.invalidateQueries(['goals', user.id]);
      queryClient.invalidateQueries(['session-stats']);

      // Reset form
      setTitle('');
      setDescription('');
      setDurationValue(25);

      toast({
        title: "Goal Created",
        description: "Your session goal has been created successfully",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error creating goal:', error);
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

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    // Update timeLeft whenever workDuration or breakDuration changes
    if (!isPlaying) {
      setTimeLeft(isWorking ? workDuration * 60 : breakDuration * 60)
    }

    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setIsPlaying(false)
            if (isWorking) {
              // Work session completed
              const newTime = breakDuration * 60
              setIsWorking(false)
              new Audio('/notification.mp3').play().catch(() => {})
              toast({
                title: "Work Session Complete! 🎉",
                description: "Time for a break!",
                duration: 4000,
              })
              return newTime
            } else {
              // Break completed
              const newTime = workDuration * 60
              setIsWorking(true)
              new Audio('/notification.mp3').play().catch(() => {})
              toast({
                title: "Break Complete! 💪",
                description: "Ready to get back to work?",
                duration: 4000,
              })
              return newTime
            }
          } else {
            return prevTime - 1
          }
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, isWorking, workDuration, breakDuration, toast, setTimeLeft, setIsPlaying, setIsWorking]) // Added missing dependencies

  // Handle mode changes with proper reset
  const handleModeChange = useCallback((working: boolean) => {
    setIsPlaying(false)
    setIsWorking(working)
    const newDuration = working ? workDuration : breakDuration
    setTimeLeft(newDuration * 60)
  }, [workDuration, breakDuration])

  // Handle duration changes
  const handleWorkDurationChange = useCallback((duration: number) => {
    setWorkDuration(duration)
    if (isWorking && !isPlaying) {
      setTimeLeft(duration * 60)
    }
  }, [isWorking, isPlaying, setWorkDuration])

  const handleBreakDurationChange = useCallback((duration: number) => {
    setBreakDuration(duration)
    if (!isWorking && !isPlaying) {
      setTimeLeft(duration * 60)
    }
  }, [isWorking, isPlaying, setBreakDuration])

  // Handle reset with proper duration
  const handleReset = useCallback(() => {
    setIsPlaying(false)
    const currentDuration = isWorking ? workDuration : breakDuration
    setTimeLeft(currentDuration * 60)
  }, [isWorking, workDuration, breakDuration])

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)
  }, [isPlaying])

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
  const { data: goals = [] } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No authenticated user')

      const { data, error } = await supabase
        .from('session_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(mapDatabaseGoalToGoal)
    },
    enabled: !!user?.id,
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

      // Fetch beat activities for most productive day calculation
      const { data: beatActivities, error: beatError } = await supabase
        .from('beat_activities')
        .select('date, count')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (beatError) throw beatError

      // Calculate most productive day based on beat count
      const beatsByDay = beatActivities?.reduce((acc, activity) => {
        const date = activity.date
        acc[date] = (acc[date] || 0) + activity.count
        return acc
      }, {})

      const mostProductiveDay = beatsByDay && Object.entries(beatsByDay)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0]

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

      return {
        totalGoals,
        completedGoals,
        completionRate,
        currentStreak,
        bestStreak,
        averageSessionTime,
        mostProductiveDay: mostProductiveDay || null
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

  // Add goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      duration: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('session_goals')
        .insert({
          user_id: user.id,
          goal_text: data.title.trim(),
          description: data.description.trim() || null,
          expected_duration_minutes: data.duration ? Number(data.duration) : 25,
          status: 'pending' as const,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      if (!user?.id) return;
      queryClient.invalidateQueries({ queryKey: ['goals', user.id] });
      queryClient.invalidateQueries({ queryKey: ['session-stats'] });
      toast({
        title: "Goal Created",
        description: "Your session goal has been created successfully",
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  // Get user on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  // Sync isPlaying with localStorage
  useEffect(() => {
    const savedIsPlaying = localStorage.getItem('timer-is-playing')
    if (savedIsPlaying !== null) {
      setIsPlaying(JSON.parse(savedIsPlaying))
    }
  }, [])

  // Save isPlaying to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('timer-is-playing', JSON.stringify(isPlaying))
  }, [isPlaying])

  // Add this near the other mutations
  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('session_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      if (!user?.id) return;
      queryClient.invalidateQueries({ queryKey: ['goals', user.id] });
      setActiveGoal(null);
      toast({
        title: "Goal Deleted",
        description: "Your goal has been deleted successfully",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageAnimation}
    >
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-emerald-500 -mt-4" />
              <h1 className="text-2xl font-semibold">Production Sessions</h1>
            </div>
            
            <TimerCard
              isWorking={isWorking}
              timeLeft={timeLeft}
              isPlaying={isPlaying}
              handlePlayPause={handlePlayPause}
              handleReset={handleReset}
              handleModeChange={handleModeChange}
              workDuration={workDuration}
              breakDuration={breakDuration}
              onWorkDurationChange={handleWorkDurationChange}
              onBreakDurationChange={handleBreakDurationChange}
              formatTime={formatTime}
              className="p-4 sm:p-5"
            />

            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {/* Active Goal Card */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={cn(
                  "rounded-xl bg-gradient-to-br",
                  "from-orange-50 via-white/95 to-white/90",
                  "dark:from-orange-500/10 dark:via-background/95 dark:to-background/90",
                  "border border-orange-200/80 dark:border-orange-500/20",
                  "p-6 sm:p-8",
                  "hover:border-orange-300/80 dark:hover:border-orange-500/30",
                  "transition-all duration-300 ease-in-out",
                  "shadow-md dark:shadow-none",
                  "ring-1 ring-orange-200/50 dark:ring-orange-500/10",
                  "flex flex-col h-full"
                )}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                      Session Goal
                    </h3>
                  </div>
                </div>
                
                {activeGoal ? (
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-orange-500/70 animate-pulse" />
                        <span className="text-xs font-medium text-orange-500/70">
                          {activeGoal.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-500">
                        {new Date(activeGoal.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100 leading-tight">
                        {activeGoal.goal_text}
                      </h3>
                      
                      {activeGoal.description && (
                        <div className="space-y-3">
                          <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100 leading-tight">
                            {activeGoal.goal_text}
                          </h3>
                          
                          {activeGoal.description && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                              {activeGoal.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-orange-400/70" />
                              <span className="text-xs text-neutral-500">
                                {activeGoal.expected_duration_minutes} min
                              </span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                                onClick={() => {
                                  if (activeGoal) {
                                    setSelectedGoal(activeGoal);
                                    setIsEditModalOpen(true);
                                  }
                                }}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                onClick={() => {
                                  if (activeGoal) {
                                    deleteGoalMutation.mutate(activeGoal.id);
                                  }
                                }}
                              >
                                <Trash className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                onClick={async () => {
                                  if (!activeGoal?.id || !user?.id) return;
                                  
                                  try {
                                    const { error } = await supabase
                                      .from('session_goals')
                                      .update({ 
                                        status: 'completed'
                                      })
                                      .eq('id', activeGoal.id);

                                    if (error) throw error;

                                    queryClient.invalidateQueries(['goals', user.id]);
                                    setActiveGoal(null);

                                    toast({
                                      title: "Goal Completed",
                                      description: "Your goal has been marked as complete",
                                      duration: 3000,
                                    });
                                  } catch (error) {
                                    console.error('Error completing goal:', error);
                                    toast({
                                      title: "Error",
                                      description: "Failed to complete goal",
                                      variant: "destructive",
                                      duration: 3000,
                                    });
                                  }
                                }}
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Complete
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    {isSaving ? (
                      <div className="flex items-center justify-center h-full">
                        <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Session Goal Form */}
                        <div className={cn(
                          "rounded-2xl",
                          "bg-gradient-to-br from-white/90 via-white/95 to-white/90",
                          "dark:from-zinc-800/90 dark:via-zinc-800/95 dark:to-zinc-800/90",
                          "border border-orange-200/50 dark:border-orange-500/20",
                          "p-6",
                          "hover:border-orange-300/50 dark:hover:border-orange-500/30",
                          "transition-[border-color,box-shadow] duration-75",
                          "shadow-sm hover:shadow-md dark:shadow-none"
                        )}>
                          {/* Header with Status */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">New Goal</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                  {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title Input with AI Suggestions */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                What's your goal?
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  name="title"
                                  value={title}
                                  onChange={(e) => setTitle(e.target.value)}
                                  placeholder="e.g. 'Create a melodic hook for the chorus' or 'Mix the drum patterns'"
                                  className={cn(
                                    "w-full",
                                    "bg-gradient-to-br from-white/80 to-white/60",
                                    "dark:from-zinc-800/80 dark:to-zinc-900/60",
                                    "border border-orange-200/50 dark:border-orange-500/20",
                                    "rounded-2xl px-4 py-3",
                                    "text-base font-medium",
                                    "text-neutral-900 dark:text-neutral-100",
                                    "placeholder:text-sm placeholder:text-neutral-500 dark:placeholder:text-neutral-400",
                                    "focus:outline-none focus:ring-2",
                                    "focus:ring-orange-500/30 dark:focus:ring-orange-500/40",
                                    "focus:border-orange-500/30 dark:focus:border-orange-500/40",
                                    "transition-all",
                                    "shadow-sm dark:shadow-inner-sm",
                                    "pr-20"
                                  )}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                          "text-orange-600/70 dark:text-orange-400/70",
                                          "hover:text-orange-600 dark:hover:text-orange-400",
                                          "rounded-xl"
                                        )}
                                      >
                                        <Brain className="w-4 h-4" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-0 bg-[#121212] border-neutral-800">
                                      <div className="shadow-inner shadow-black/20 rounded-2xl p-4 space-y-2">
                                        <h3 className="text-sm text-muted-foreground mb-2 px-1">AI Suggestions</h3>
                                        
                                        <Button
                                          variant="ghost"
                                          className={cn(
                                            "w-full rounded-xl p-2.5 transition-all duration-200 group relative",
                                            title === "Record and layer vocal harmonies"
                                              ? "bg-[#2C1F1D] ring-1 ring-orange-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                                              : "hover:bg-[#2C1F1D]/70"
                                          )}
                                          onClick={() => {
                                            setTitle("Record and layer vocal harmonies");
                                            setDescription("Create rich vocal textures by recording multiple harmony parts, focusing on thirds and fifths. Experiment with different vocal placements and stereo positioning.");
                                            setDurationValue(45);
                                          }}
                                        >
                                          <div className="flex items-center gap-3">
                                            <Mic className="w-5 h-5 text-orange-400 shrink-0" />
                                            <p className="font-medium text-neutral-100">Record Vocal Harmonies</p>
                                          </div>
                                        </Button>

                                        <Button
                                          variant="ghost"
                                          className={cn(
                                            "w-full rounded-xl p-2.5 transition-all duration-200 group relative",
                                            title === "Mix and process drum patterns"
                                              ? "bg-[#2C1F1D] ring-1 ring-orange-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                                              : "hover:bg-[#2C1F1D]/70"
                                          )}
                                          onClick={() => {
                                            setTitle("Mix and process drum patterns");
                                            setDescription("Apply EQ, compression, and spatial effects to individual drum tracks. Focus on kick-snare balance, hi-hat dynamics, and overall groove cohesion.");
                                            setDurationValue(30);
                                          }}
                                        >
                                          <div className="flex items-center gap-3">
                                            <Music2 className="w-5 h-5 text-orange-400 shrink-0" />
                                            <p className="font-medium text-neutral-100">Mix Drum Patterns</p>
                                          </div>
                                        </Button>

                                        <Button
                                          variant="ghost"
                                          className={cn(
                                            "w-full rounded-xl p-2.5 transition-all duration-200 group relative",
                                            title === "Design synth bass sound"
                                              ? "bg-[#2C1F1D] ring-1 ring-orange-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                                              : "hover:bg-[#2C1F1D]/70"
                                          )}
                                          onClick={() => {
                                            setTitle("Design synth bass sound");
                                            setDescription("Create a distinctive bass sound using subtractive synthesis, focusing on filter modulation and envelope shaping. Write a compelling bassline that complements the chord progression.");
                                            setDurationValue(35);
                                          }}
                                        >
                                          <div className="flex items-center gap-3">
                                            <Waves className="w-5 h-5 text-orange-400 shrink-0" />
                                            <p className="font-medium text-neutral-100">Design Synth Bass</p>
                                          </div>
                                        </Button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Details
                              </label>
                              <textarea
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add some details about your goal (optional)"
                                rows={3}
                                className={cn(
                                  "w-full",
                                  "bg-gradient-to-br from-white/80 to-white/60",
                                  "dark:from-zinc-800/80 dark:to-zinc-900/60",
                                  "border border-orange-200/50 dark:border-orange-500/20",
                                  "rounded-2xl px-4 py-3",
                                  "text-base font-medium",
                                  "text-neutral-900 dark:text-neutral-100",
                                  "placeholder:text-sm placeholder:text-neutral-500 dark:placeholder:text-neutral-400",
                                  "focus:outline-none focus:ring-2",
                                  "focus:ring-orange-500/30 dark:focus:ring-orange-500/40",
                                  "focus:border-orange-500/30 dark:focus:border-orange-500/40",
                                  "transition-all resize-none",
                                  "shadow-sm dark:shadow-inner-sm"
                                )}
                              />
                            </div>

                            {/* Duration Slider */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-orange-600/50 dark:text-orange-400/50" />
                                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Duration</span>
                                </div>
                                <span className={cn(
                                  "text-sm font-medium px-2.5 py-1",
                                  "rounded-xl",
                                  "bg-orange-100/50 dark:bg-orange-500/10",
                                  "text-orange-600 dark:text-orange-400",
                                  "border border-orange-200/50 dark:border-orange-500/20"
                                )}>
                                  {durationValue} min
                                </span>
                              </div>
                              <div className="px-1">
                                <Slider
                                  value={[durationValue]}
                                  min={5}
                                  max={60}
                                  step={5}
                                  onValueChange={(value) => setDurationValue(value[0])}
                                  className={cn(
                                    "relative flex items-center select-none touch-none w-full transition-colors",
                                    "[&_[role=slider]]:h-4 [&_[role=slider]]:w-4",
                                    "[&_[role=slider]]:transition-all",
                                    "[&_[role=slider]]:bg-orange-500 [&_[role=slider]]:border-orange-500",
                                    "dark:[&_[role=slider]]:bg-orange-400 dark:[&_[role=slider]]:border-orange-400",
                                    "[&_[role=slider]]:hover:scale-110",
                                    "[&_[role=slider]]:focus:scale-110",
                                    "[&_[role=slider]]:outline-none",
                                    "[&_[role=slider]]:rounded-full",
                                    "[&_[role=slider]]:border-2",
                                    "[&_[role=slider]]:shadow-sm",
                                    "[&_[role=slider]]:transition-transform",
                                    "[&_[role=slider]]:duration-200"
                                  )}
                                />
                                <div className="flex justify-between mt-1">
                                  <span className="text-xs text-neutral-500 dark:text-neutral-400">5 min</span>
                                  <span className="text-xs text-neutral-500 dark:text-neutral-400">60 min</span>
                                </div>
                              </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                              type="submit"
                              disabled={isSaving}
                              className={cn(
                                "w-full",
                                "bg-orange-500 hover:bg-orange-600",
                                "text-white font-semibold",
                                "px-6 py-3",
                                "rounded-xl",
                                "transition-all duration-150",
                                "shadow-md hover:shadow-lg",
                                "active:scale-95",
                                "focus:outline-none focus:ring-2",
                                "focus:ring-orange-500/30 dark:focus:ring-orange-500/40",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                              )}
                            >
                              <div className="flex items-center justify-center gap-2">
                                {isSaving ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Creating Goal...</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4" />
                                    <span>Create Goal</span>
                                  </>
                                )}
                              </div>
                            </Button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Progress Stats Card */}
              <div
                className={cn(
                  "rounded-2xl",
                  "bg-gradient-to-br",
                  "from-purple-100/90 via-white/95 to-purple-50/80",
                  "dark:from-purple-500/20 dark:via-background/95 dark:to-purple-900/10",
                  "border border-purple-200/80 dark:border-purple-500/20",
                  "p-6 sm:p-8",
                  "hover:border-purple-300/80 dark:hover:border-purple-500/30",
                  "transition-all duration-300 ease-in-out",
                  "shadow-sm hover:shadow-md dark:shadow-none",
                  "flex flex-col h-full"
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-1.5">
                    <BarChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-base font-medium tracking-tight text-purple-900 dark:text-purple-100">
                      Your Progress
                    </h3>
                  </div>
                  <div className="relative" onSubmit={(e) => e.preventDefault()}>
                    <div 
                      className="relative"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <Select 
                        value={selectedTimeRange} 
                        onValueChange={(value) => {
                          // Prevent default behavior and update state
                          setTimeout(() => setSelectedTimeRange(value), 0);
                        }}
                      >
                        <SelectTrigger 
                          className={cn(
                            "w-[130px] h-9",
                            "text-xs font-medium",
                            "bg-purple-100/50 dark:bg-purple-500/10",
                            "border-purple-200/50 dark:border-purple-500/20",
                            "text-purple-700 dark:text-purple-200",
                            "hover:bg-purple-100/80 dark:hover:bg-purple-500/20",
                            "hover:border-purple-300/50 dark:hover:border-purple-500/30",
                            "focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-500/30",
                            "focus:border-purple-500/30 dark:focus:border-purple-500/40",
                            "rounded-xl",
                            "transition-all duration-150",
                            "shadow-sm dark:shadow-purple-500/10"
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <Calendar className="w-3.5 h-3.5 mr-2 text-purple-600/70 dark:text-purple-400/70" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent 
                          className={cn(
                            "bg-white/95 dark:bg-zinc-900/95",
                            "border border-purple-200/50 dark:border-purple-500/20",
                            "backdrop-blur-xl",
                            "rounded-xl",
                            "shadow-lg dark:shadow-purple-500/10",
                            "min-w-[130px]"
                          )}
                        >
                          <SelectItem 
                            value="Today"
                            className="text-purple-700 dark:text-purple-200 hover:bg-purple-100/50 dark:hover:bg-purple-500/10 focus:bg-purple-100/50 dark:focus:bg-purple-500/10 rounded-lg"
                          >
                            Today
                          </SelectItem>
                          <SelectItem 
                            value="This Week"
                            className="text-purple-700 dark:text-purple-200 hover:bg-purple-100/50 dark:hover:bg-purple-500/10 focus:bg-purple-100/50 dark:focus:bg-purple-500/10 rounded-lg"
                          >
                            This Week
                          </SelectItem>
                          <SelectItem 
                            value="This Month"
                            className="text-purple-700 dark:text-purple-200 hover:bg-purple-100/50 dark:hover:bg-purple-500/10 focus:bg-purple-100/50 dark:focus:bg-purple-500/10 rounded-lg"
                          >
                            This Month
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col justify-between space-y-6">
                  {/* Key Metrics */}
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Music className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span className="text-[12px] tracking-tight text-purple-700 dark:text-purple-200">Beats</span>
                        </div>
                        <p className="text-sm font-medium tracking-tight text-purple-900 dark:text-purple-50">{beatsCount ?? 0}</p>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span className="text-[12px] tracking-tight text-purple-700 dark:text-purple-200">Goals Completed</span>
                        </div>
                        <p className="text-sm font-medium tracking-tight text-purple-900 dark:text-purple-50">{sessionStats?.completedGoals || 0}</p>
                      </div>
                    </div>

                    {/* Completion Rate */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] tracking-tight text-purple-700 dark:text-purple-200">Completion Rate</span>
                        <span className="text-[12px] tracking-tight text-purple-600/70 dark:text-purple-300/70">{sessionStats?.completionRate || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-purple-100/80 dark:bg-purple-500/10 rounded-full">
                        <div 
                          className="h-full bg-purple-600 dark:bg-purple-400 rounded-full transition-all duration-500" 
                          style={{ width: `${sessionStats?.completionRate || 0}%` }} 
                        />
                      </div>
                    </div>

                    {/* Streaks */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span className="text-[12px] tracking-tight text-purple-700 dark:text-purple-200">Current Streak</span>
                        </div>
                        <p className="text-sm font-medium tracking-tight text-purple-900 dark:text-purple-50">{sessionStats?.currentStreak || 0} days</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span className="text-[12px] tracking-tight text-purple-700 dark:text-purple-200">Best Streak</span>
                        </div>
                        <p className="text-sm font-medium tracking-tight text-purple-900 dark:text-purple-50">{sessionStats?.bestStreak || 0} days</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span className="text-[12px] tracking-tight text-purple-700 dark:text-purple-200">Average Session Time</span>
                      </div>
                      <p className="text-sm font-medium tracking-tight text-purple-900 dark:text-purple-50">{sessionStats?.averageSessionTime || 0} minutes</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span className="text-[12px] tracking-tight text-purple-700 dark:text-purple-200">Most Productive Day</span>
                      </div>
                      <p className="text-base font-semibold tracking-tight text-purple-900 dark:text-purple-50">
                        {sessionStats?.mostProductiveDay && sessionStats.mostProductiveDay !== 'No data yet'
                          ? new Date(sessionStats.mostProductiveDay).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : (
                            <span className="text-purple-600/60 dark:text-purple-400/60 text-sm">
                              Not enough data yet
                            </span>
                          )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Coach Card */}
              <AICoachCard
                suggestions={coachSuggestions}
                className="col-span-1"
              />
            </div>

            {/* Goals List */}
            <div className="mt-5">
              <PaginatedGoals
                goals={goals}
                onEditGoal={handleEditGoal}
                onDeleteGoal={(goal) => {
                  setSelectedGoal(goal);
                  setIsDeleteModalOpen(true);
                }}
                onCompleteGoal={async (goal) => {
                  try {
                    await completeGoalMutation.mutate(goal.id);
                    toast({
                      title: "Goal Completed",
                      description: "Your goal has been marked as complete",
                      duration: 3000,
                    });
                  } catch (error) {
                    console.error('Error completing goal:', error);
                    toast({
                      title: "Error",
                      description: "Failed to complete goal",
                      variant: "destructive",
                      duration: 3000,
                    });
                  }
                }}
              />
            </div>

            {/* Modals */}
            <EditGoalModal
              goal={selectedGoal}
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              onSave={handleSaveGoal}
            />

            <DeleteConfirmationModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              onConfirm={handleDeleteGoal}
            />

            <AddGoalModal
              isOpen={isAddGoalModalOpen}
              onClose={() => setIsAddGoalModalOpen(false)}
              onSave={(goal) => {
                createGoalMutation.mutate({
                  title: goal.title,
                  description: goal.description,
                  duration: goal.duration
                });
              }}
            />
          </div>
        </div>
      </div>
      <Footer />
    </motion.div>
  )
}

export default Sessions 