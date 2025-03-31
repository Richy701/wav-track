import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Trophy, Star } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface StreakNotificationProps {
  currentStreak: number
  bestStreak: number
  daysUntilNextMilestone?: number
  className?: string
}

const streakMilestones = [
  { days: 7, title: 'Weekly Warrior', icon: Star },
  { days: 14, title: 'Fortnight Fighter', icon: Trophy },
  { days: 30, title: 'Monthly Master', icon: Flame },
]

export function StreakNotification({
  currentStreak,
  bestStreak,
  daysUntilNextMilestone,
  className
}: StreakNotificationProps) {
  const nextMilestone = streakMilestones.find(m => m.days > currentStreak)
  const Icon = nextMilestone?.icon || Flame

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "relative overflow-hidden rounded-2xl p-6",
          "bg-gradient-to-br from-purple-500/10 to-violet-600/10 dark:from-purple-900/20 dark:to-violet-900/20",
          "border border-purple-500/20 dark:border-purple-500/20",
          "shadow-lg shadow-purple-500/10 dark:shadow-purple-500/5",
          "backdrop-blur-sm",
          className
        )}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-600/5 dark:from-purple-900/10 dark:to-violet-900/10"
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Animated outer glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-violet-600/30 blur-[20px] rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              {/* Icon container */}
              <div className="relative p-3 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg ring-1 ring-white/10">
                <Icon className="h-6 w-6 text-white" weight="fill" />
              </div>
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                {currentStreak} Day Streak! 🔥
              </h3>
              <p className="text-sm text-purple-200/80 dark:text-purple-300/80">
                Best streak: {bestStreak} days
              </p>
            </div>
          </div>

          {nextMilestone && daysUntilNextMilestone && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-200/80 dark:text-purple-300/80">
                  {daysUntilNextMilestone} days until {nextMilestone.title}
                </span>
                <span className="text-sm font-medium text-purple-300 dark:text-purple-200">
                  {Math.round((currentStreak / nextMilestone.days) * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-purple-500/20 dark:bg-purple-500/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-400 to-violet-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStreak / nextMilestone.days) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {/* Motivational message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-sm text-purple-200/80 dark:text-purple-300/80"
          >
            {currentStreak >= 7
              ? "You're on fire! Keep that creative energy flowing! 🔥"
              : "Keep the momentum going! Every day counts! 💪"}
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
} 