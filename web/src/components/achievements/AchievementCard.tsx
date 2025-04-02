import { Card } from '@/components/ui/card'
import { Achievement } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Trophy, Star, Clock, Target, Fire, MusicNote } from '@phosphor-icons/react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Spinner } from '@/components/ui/spinner'

interface AchievementCardProps {
  achievement: Achievement
  className?: string
  isLoading?: boolean
}

const tierColors = {
  bronze: {
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    border: 'border-amber-500/20',
    text: 'text-amber-600 dark:text-amber-300',
    glow: 'shadow-amber-500/20'
  },
  silver: {
    gradient: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-500/20 dark:bg-emerald-500/30',
    border: 'border-emerald-500/30',
    text: 'text-emerald-600 dark:text-emerald-300',
    glow: 'shadow-emerald-500/30'
  },
  gold: {
    gradient: 'from-yellow-400 to-yellow-600',
    bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    border: 'border-yellow-500/20',
    text: 'text-yellow-600 dark:text-yellow-300',
    glow: 'shadow-yellow-500/20'
  },
  platinum: {
    gradient: 'from-purple-400 to-purple-600',
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    border: 'border-purple-500/20',
    text: 'text-purple-600 dark:text-purple-300',
    glow: 'shadow-purple-500/20'
  }
}

const tierIcons = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
}

const categoryStyles = {
  production: {
    gradient: 'from-violet-500 to-purple-600',
    progressBg: 'bg-violet-500/10 dark:bg-violet-500/20',
    shadow: 'shadow-violet-500/10',
    hover: 'hover:shadow-violet-500/20',
    border: 'border-violet-500/20',
    text: 'text-violet-600 dark:text-violet-400',
    icon: <MusicNote className="h-full w-full" weight="fill" />
  },
  streak: {
    gradient: 'from-orange-500 to-amber-600',
    progressBg: 'bg-orange-500/10 dark:bg-orange-500/20',
    shadow: 'shadow-orange-500/10',
    hover: 'hover:shadow-orange-500/20',
    border: 'border-orange-500/20',
    text: 'text-orange-600 dark:text-orange-400',
    icon: <Fire className="h-full w-full" weight="fill" />
  },
  time: {
    gradient: 'from-blue-500 to-indigo-600',
    progressBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    shadow: 'shadow-blue-500/10',
    hover: 'hover:shadow-blue-500/20',
    border: 'border-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    icon: <Clock className="h-full w-full" weight="fill" />
  },
  goals: {
    gradient: 'from-emerald-500 to-teal-600',
    progressBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    shadow: 'shadow-emerald-500/10',
    hover: 'hover:shadow-emerald-500/20',
    border: 'border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: <Target className="h-full w-full" weight="fill" />
  }
}

const tierBadges = {
  bronze: {
    icon: <Trophy className="h-4 w-4" weight="fill" />,
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20'
  },
  silver: {
    icon: <Star className="h-4 w-4" weight="fill" />,
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-600 dark:text-zinc-400',
    border: 'border-zinc-500/20'
  },
  gold: {
    icon: <Trophy className="h-4 w-4" weight="fill" />,
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-500/20'
  },
  platinum: {
    icon: <Star className="h-4 w-4" weight="fill" />,
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20'
  }
}

export function AchievementCard({ achievement, className, isLoading }: AchievementCardProps) {
  const isUnlocked = !!achievement.unlockedAt
  const progress = Math.max(0, achievement.progress || 0)
  const total = achievement.total || achievement.requirement
  const percentage = Math.min((progress / total) * 100, 100)
  const tierColor = tierColors[achievement.tier as keyof typeof tierColors]
  const categoryStyle = categoryStyles[achievement.category]
  const tierBadge = tierBadges[achievement.tier]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          className={cn(
            'p-4 relative overflow-hidden group',
            'transition-all duration-300',
            'hover:shadow-lg hover:scale-[1.02]',
            isUnlocked ? tierColor.bg : 'bg-card/50',
            isUnlocked ? tierColor.border : 'border-muted',
            isUnlocked ? tierColor.glow : '',
            'backdrop-blur-sm',
            className
          )}
        >
          {/* Animated background gradient */}
          {isUnlocked && (
            <motion.div
              className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5',
                tierColor.gradient
              )}
              animate={{
                opacity: [0, 0.1, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}

          {/* Pulsing border glow */}
          {isUnlocked && (
            <motion.div
              className={cn(
                'absolute inset-0 rounded-lg',
                tierColor.glow
              )}
              animate={{
                boxShadow: [
                  `0 0 0 0 ${tierColor.glow.replace('shadow-', 'rgba(').replace('/20', ', 0.2)')}`,
                  `0 0 0 4px ${tierColor.glow.replace('shadow-', 'rgba(').replace('/20', ', 0.1)')}`,
                  `0 0 0 0 ${tierColor.glow.replace('shadow-', 'rgba(').replace('/20', ', 0.2)')}`,
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}

          <div className="relative flex items-start gap-4">
            {/* Achievement Icon */}
            <motion.div 
              className={cn(
                'text-2xl relative',
                isUnlocked && 'animate-bounce'
              )}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {achievement.icon}
              {isUnlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute -top-1 -right-1"
                >
                  <CheckCircle className="w-4 h-4 text-green-500" weight="fill" />
                </motion.div>
              )}
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={cn(
                  'font-medium truncate',
                  isUnlocked ? tierColor.text : 'text-foreground'
                )}>
                  {achievement.name}
                </h3>
                {isUnlocked && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm"
                  >
                    {tierIcons[achievement.tier as keyof typeof tierIcons]}
                  </motion.span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>

              {/* Progress Bar */}
              <div className="mt-2">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      'h-full transition-all duration-500',
                      isUnlocked ? tierColor.gradient : 'bg-muted-foreground',
                      isLoading && "animate-pulse"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  {isLoading ? (
                    <span className="inline-flex items-center gap-1">
                      <Spinner className="h-3 w-3" />
                      Updating...
                    </span>
                  ) : (
                    <>
                      <span>{progress}/{total}</span>
                      <span>{Math.round(percentage)}%</span>
                    </>
                  )}
                </div>
              </div>

              {/* Unlock Date */}
              {isUnlocked && achievement.unlockedAt && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={cn(
                    "mt-2 text-xs font-medium",
                    tierColor.text
                  )}
                >
                  Unlocked {format(new Date(achievement.unlockedAt), 'MMM d, yyyy')}
                </motion.div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
} 