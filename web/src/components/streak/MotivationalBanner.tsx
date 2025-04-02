import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  Fire, 
  Star, 
  Trophy, 
  Target, 
  Lightning, 
  Heart, 
  MusicNote,
  Sparkle
} from '@phosphor-icons/react'

interface MotivationalMessage {
  type: 'milestone' | 'quote' | 'goal'
  text: string
  icon: React.ReactNode
  gradient: string
  emoji?: string
}

const motivationalMessages: MotivationalMessage[] = [
  {
    type: 'milestone',
    text: "You're on fire! Keep that creative energy flowing.",
    icon: <Fire className="h-4 w-4" weight="fill" />,
    gradient: 'from-orange-800/90 to-red-800/90 dark:from-orange-900/90 dark:to-red-900/90',
    emoji: '🔥'
  },
  {
    type: 'quote',
    text: "Started from the bottom, now we're here. Keep pushing!",
    icon: <Star className="h-4 w-4" weight="fill" />,
    gradient: 'from-purple-800/90 to-pink-800/90 dark:from-purple-900/90 dark:to-pink-900/90',
    emoji: '⭐'
  },
  {
    type: 'goal',
    text: "Every beat counts. You're building something special.",
    icon: <Target className="h-4 w-4" weight="fill" />,
    gradient: 'from-indigo-800/90 to-blue-800/90 dark:from-indigo-900/90 dark:to-blue-900/90',
    emoji: '🎯'
  },
  {
    type: 'quote',
    text: "I'm out here grinding like I'm on a treadmill.",
    icon: <Lightning className="h-4 w-4" weight="fill" />,
    gradient: 'from-yellow-800/90 to-amber-800/90 dark:from-yellow-900/90 dark:to-amber-900/90',
    emoji: '⚡'
  },
  {
    type: 'milestone',
    text: "Your dedication is inspiring. Keep the momentum going!",
    icon: <Trophy className="h-4 w-4" weight="fill" />,
    gradient: 'from-green-800/90 to-emerald-800/90 dark:from-green-900/90 dark:to-emerald-900/90',
    emoji: '🏆'
  },
  {
    type: 'quote',
    text: "I'm trying to do better than good enough.",
    icon: <Heart className="h-4 w-4" weight="fill" />,
    gradient: 'from-rose-800/90 to-pink-800/90 dark:from-rose-900/90 dark:to-pink-900/90',
    emoji: '❤️'
  },
  {
    type: 'quote',
    text: "I'm a movement by myself, but I'm a force when we're together.",
    icon: <MusicNote className="h-4 w-4" weight="fill" />,
    gradient: 'from-violet-800/90 to-purple-800/90 dark:from-violet-900/90 dark:to-purple-900/90',
    emoji: '🎵'
  },
  {
    type: 'goal',
    text: "Small steps, big dreams. Keep pushing forward.",
    icon: <Target className="h-4 w-4" weight="fill" />,
    gradient: 'from-cyan-800/90 to-blue-800/90 dark:from-cyan-900/90 dark:to-blue-900/90',
    emoji: '🎯'
  }
]

interface MotivationalBannerProps {
  currentStreak: number
  bestStreak: number
  daysUntilNextMilestone: number
}

export function MotivationalBanner({ 
  currentStreak, 
  bestStreak, 
  daysUntilNextMilestone 
}: MotivationalBannerProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const currentMessage = motivationalMessages[currentMessageIndex]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % motivationalMessages.length)
    }, 5000) // Change message every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Customize message based on streak
  const getStreakMessage = () => {
    if (currentStreak === bestStreak && currentStreak > 0) {
      return {
        text: `New personal best! ${currentStreak} days strong!`,
        icon: <Sparkle className="h-5 w-5" weight="fill" />,
        gradient: 'from-yellow-500/20 to-amber-500/20 dark:from-yellow-500/30 dark:to-amber-500/30',
        emoji: '✨'
      }
    }
    if (daysUntilNextMilestone <= 3) {
      return {
        text: `Just ${daysUntilNextMilestone} more days until your next milestone!`,
        icon: <Target className="h-5 w-5" weight="fill" />,
        gradient: 'from-blue-500/20 to-indigo-500/20 dark:from-blue-500/30 dark:to-indigo-500/30',
        emoji: '🎯'
      }
    }
    return null
  }

  const streakMessage = getStreakMessage()
  const message = streakMessage || currentMessage

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        "mb-8 p-4 rounded-2xl",
        "bg-gradient-to-r",
        message.gradient,
        "border border-border/50",
        "shadow-md",
        "backdrop-blur-sm",
        "transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.02]",
        "group"
      )}
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-xl pr-2 group-hover:scale-110 transition-transform duration-300"
        >
          {message.emoji}
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessageIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-base font-medium leading-tight text-white"
          >
            {message.text}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  )
} 