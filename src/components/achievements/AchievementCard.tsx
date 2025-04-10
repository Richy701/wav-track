import { Card } from '@/components/ui/card'
import { Achievement } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Trophy, Star, Clock, Target, Fire, MusicNote } from '@phosphor-icons/react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'

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
        className={cn('group h-full', className)}
      >
        <Card className={cn(
          'relative overflow-hidden h-full',
          'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
          'border border-border/50',
          isUnlocked 
            ? 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-md' 
            : 'bg-muted/30',
          'flex flex-col justify-between'
        )}>
          {/* Gradient overlay */}
          <div
            className={cn(
              'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300',
              'bg-gradient-to-tr',
              isUnlocked ? 'from-primary to-primary/50' : 'from-muted to-muted/50'
            )}
          />

          <div className="p-5 flex flex-col h-full">
            {/* Top section with icon and title */}
            <div className="flex items-start gap-4">
              {/* Achievement Icon */}
              <motion.div 
                className={cn(
                  'relative',
                  isUnlocked && 'animate-bounce'
                )}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  isUnlocked 
                    ? 'bg-gradient-to-br from-primary to-primary/80 shadow-inner shadow-primary/30' 
                    : 'bg-muted/50',
                  'text-white shadow-sm',
                  'transition-transform duration-300',
                  'group-hover:scale-110'
                )}>
                  {achievement.icon}
                </div>
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
                    'font-semibold truncate text-lg',
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
              </div>
            </div>

            {/* Bottom section with progress or unlock date */}
            <div className="mt-6">
              {isUnlocked ? (
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={cn(
                      "bg-white text-black text-xs font-semibold px-3 py-1 rounded-full shadow-sm",
                      "animate-pulse"
                    )}
                  >
                    Unlocked
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(achievement.unlockedAt), 'MMM yyyy')}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-medium tabular-nums">
                      {progress}/{total}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        'h-full transition-all duration-500',
                        isUnlocked 
                          ? `bg-gradient-to-r ${tierColor.gradient}` 
                          : 'bg-muted-foreground',
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
                      <span>{Math.round(percentage)}%</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
} 