import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, Star, Clock, Target, Fire, Users, 
  MusicNoteSimple, Waveform, Waves, Crown,
  Lightning, Medal, Flame, Timer, Hourglass,
  Brain, CheckCircle, Rocket
} from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { useAchievements } from '@/hooks/useAchievements'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
}

const categoryStyles = {
  production: {
    gradient: 'from-violet-400 to-violet-600',
    icon: (isUnlocked: boolean) => (
      <MusicNoteSimple 
        className={cn(
          "h-8 w-8",
          isUnlocked ? "text-violet-600 dark:text-violet-400" : "text-zinc-400 dark:text-white"
        )} 
        weight="fill" 
      />
    )
  },
  streak: {
    gradient: 'from-orange-400 to-orange-600',
    icon: (isUnlocked: boolean) => (
      <Lightning 
        className={cn(
          "h-8 w-8",
          isUnlocked ? "text-orange-600 dark:text-orange-400" : "text-zinc-400 dark:text-white"
        )} 
        weight="fill" 
      />
    )
  },
  time: {
    gradient: 'from-blue-400 to-blue-600',
    icon: (isUnlocked: boolean) => (
      <Timer 
        className={cn(
          "h-8 w-8",
          isUnlocked ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 dark:text-white"
        )} 
        weight="fill" 
      />
    )
  },
  goals: {
    gradient: 'from-emerald-400 to-emerald-600',
    icon: (isUnlocked: boolean) => (
      <Target 
        className={cn(
          "h-8 w-8",
          isUnlocked ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-white"
        )} 
        weight="fill" 
      />
    )
  }
}

const achievementIcons = {
  // Production achievements
  first_beat: (isUnlocked: boolean) => (
    <MusicNoteSimple 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-violet-600 dark:text-violet-400" : "text-zinc-400 dark:text-white"
      )} 
      weight="fill" 
    />
  ),
  beat_builder: (isUnlocked: boolean) => (
    <Waveform 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-violet-600 dark:text-violet-400" : "text-zinc-400 dark:text-white"
      )} 
      weight="fill" 
    />
  ),
  beat_machine: (isUnlocked: boolean) => (
    <Waves 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-violet-600 dark:text-violet-400" : "text-zinc-400 dark:text-white"
      )} 
      weight="fill" 
    />
  ),
  legendary_producer: (isUnlocked: boolean) => (
    <Crown 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-violet-600 dark:text-violet-400" : "text-zinc-400 dark:text-white"
      )} 
      weight="fill" 
    />
  ),
  // Streak achievements
  daily_grinder: (isUnlocked: boolean) => (
    <Lightning 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-orange-600 dark:text-orange-400" : "text-zinc-400 dark:text-white"
      )} 
      weight="fill" 
    />
  ),
  consistency_king: (isUnlocked: boolean) => (
    <Medal 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-orange-600 dark:text-orange-400" : "text-zinc-400 dark:text-white"
      )} 
      weight="fill" 
    />
  ),
  on_fire: (isUnlocked: boolean) => (
    <Flame 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-orange-600 dark:text-orange-400" : "text-zinc-400 dark:text-white"
      )} 
      weight="fill" 
    />
  ),
  // Time achievements
  studio_rat: (isUnlocked: boolean) => (
    <Timer 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 dark:text-white"
      )} 
      weight="fill" 
    />
  ),
  time_lord: (isUnlocked: boolean) => (
    <Hourglass 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 dark:text-white"
      )} 
      weight="fill" 
    />
  ),
  focused_af: (isUnlocked: boolean) => (
    <Brain 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 dark:text-white"
      )} 
      weight="fill" 
    />
  ),
  // Goal achievements
  goal_getter: (isUnlocked: boolean) => (
    <Target 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-white"
      )} 
      weight="fill" 
    />
  ),
  finish_what_you_start: (isUnlocked: boolean) => (
    <CheckCircle 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-white"
      )} 
      weight="fill" 
    />
  ),
  big_vision: (isUnlocked: boolean) => (
    <Rocket 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-white"
      )} 
      weight="fill" 
    />
  )
}

export function Achievements() {
  const { profile } = useAuth()
  const { achievements, loading } = useAchievements()

  // Get the first 3 achievements to display
  const displayAchievements = achievements.slice(0, 3)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground/90">Achievements</h3>
        <Badge 
          variant="secondary" 
          className="text-xs bg-zinc-100 dark:bg-white/10 backdrop-blur-sm border border-zinc-300 dark:border-white/20 text-zinc-800 dark:text-white"
        >
          {achievements.filter(a => a.unlocked_at).length}/{achievements.length}
        </Badge>
      </div>

      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch"
      >
        {displayAchievements.map(achievement => {
          const isUnlocked = !!achievement.unlocked_at
          const progress = Math.max(0, achievement.progress || 0)
          const total = achievement.total || achievement.requirement
          const percentage = Math.min((progress / total) * 100, 100)
          const categoryStyle = categoryStyles[achievement.category as keyof typeof categoryStyles]

          return (
            <motion.div
              key={achievement.id}
              variants={itemVariants}
              className="group relative h-full"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ 
                  duration: 0.3,
                  scale: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }
                }}
                className={cn(
                  "relative p-4 h-full",
                  "rounded-3xl overflow-hidden",
                  "bg-white dark:bg-zinc-900",
                  "border border-zinc-200 dark:border-zinc-800",
                  "shadow-md"
                )}
              >
                <div className="relative flex flex-col h-full">
                  {/* Icon Container */}
                  <div className={cn(
                    "p-2.5 mb-3 w-fit rounded-2xl",
                    achievement.category === 'production' && "bg-violet-100 text-violet-600 dark:bg-violet-800 dark:text-violet-200",
                    achievement.category === 'streak' && "bg-orange-100 text-orange-600 dark:bg-orange-800 dark:text-orange-200",
                    achievement.category === 'time' && "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200",
                    achievement.category === 'goals' && "bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-200"
                  )}>
                    <div className="w-8 h-8">
                      {(achievementIcons[achievement.id as keyof typeof achievementIcons] || 
                        ((isUnlocked: boolean) => <Trophy className={cn("h-8 w-8", isUnlocked ? "text-zinc-600 dark:text-white" : "text-zinc-400 dark:text-white/60")} weight="fill" />)
                      )(isUnlocked)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-0.5">
                      {achievement.name}
                    </h3>
                    <p className="text-xs text-zinc-700 dark:text-white/70 mb-3 line-clamp-2">
                      {achievement.description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs text-zinc-800 dark:text-zinc-200 mb-1.5">
                      <span>{progress} / {total}</span>
                      <span>{Math.round(percentage)}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          achievement.category === 'production' && "bg-violet-600 dark:bg-violet-400",
                          achievement.category === 'streak' && "bg-orange-600 dark:bg-orange-400",
                          achievement.category === 'time' && "bg-blue-600 dark:bg-blue-400",
                          achievement.category === 'goals' && "bg-emerald-600 dark:bg-emerald-400"
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Unlocked Status */}
                  {isUnlocked && (
                    <div className="absolute top-3 right-3">
                      <div className={cn(
                        "p-1.5 rounded-full",
                        achievement.category === 'production' && "bg-violet-100 text-violet-600 dark:bg-violet-800 dark:text-violet-200",
                        achievement.category === 'streak' && "bg-orange-100 text-orange-600 dark:bg-orange-800 dark:text-orange-200",
                        achievement.category === 'time' && "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200",
                        achievement.category === 'goals' && "bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-200"
                      )}>
                        <Star className="w-3.5 h-3.5 text-zinc-600 dark:text-white" weight="fill" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
} 