import { useAchievements } from '@/hooks/useAchievements'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import { MusicNote, Fire, Clock, Target } from '@phosphor-icons/react'
import { Spinner } from '@/components/ui/spinner'

const categoryStyles = {
  production: {
    gradient: 'from-violet-500 to-purple-600',
    icon: <MusicNote className="h-5 w-5" weight="fill" />
  },
  streak: {
    gradient: 'from-orange-500 to-amber-600',
    icon: <Fire className="h-5 w-5" weight="fill" />
  },
  time: {
    gradient: 'from-blue-500 to-indigo-600',
    icon: <Clock className="h-5 w-5" weight="fill" />
  },
  goals: {
    gradient: 'from-emerald-500 to-teal-600',
    icon: <Target className="h-5 w-5" weight="fill" />
  }
} as const

export function NextAchievementCard() {
  const { achievements, loading } = useAchievements()

  // Find the next closest achievement to completion
  const nextAchievement = achievements
    .filter(a => !a.unlocked_at) // Filter out unlocked achievements
    .map(a => ({
      ...a,
      progressPercentage: (a.progress || 0) / (a.total || a.requirement),
      remaining: (a.total || a.requirement) - (a.progress || 0)
    }))
    .sort((a, b) => {
      // First sort by progress percentage (highest first)
      const progressDiff = b.progressPercentage - a.progressPercentage
      if (progressDiff !== 0) return progressDiff
      // Then by remaining amount (lowest first)
      return a.remaining - b.remaining
    })[0]

  if (loading) {
    return (
      <div className="w-full p-6 rounded-2xl bg-card border shadow-sm">
        <div className="flex items-center justify-center h-32">
          <Spinner />
        </div>
      </div>
    )
  }

  if (!nextAchievement) {
    return (
      <div className="w-full p-6 rounded-2xl bg-card border shadow-sm">
        <div className="text-center text-muted-foreground">
          No achievements available
        </div>
      </div>
    )
  }

  const categoryStyle = categoryStyles[nextAchievement.category as keyof typeof categoryStyles]
  const progress = Math.max(0, nextAchievement.progress || 0)
  const total = nextAchievement.total || nextAchievement.requirement
  const percentage = Math.min((progress / total) * 100, 100)
  const remainingPercentage = Math.round(100 - percentage)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "w-full p-6 rounded-2xl shadow-sm",
              "bg-gradient-to-br",
              categoryStyle.gradient,
              "border border-white/10 dark:border-white/5",
              "hover:scale-[1.01] transition-all duration-200",
              "cursor-pointer"
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-xl",
                "bg-white/10 dark:bg-white/5",
                "backdrop-blur-sm"
              )}>
                {categoryStyle.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white">
                  {nextAchievement.name}
                </h3>
                <p className="text-sm text-white/80 mt-1">
                  {nextAchievement.description}
                </p>
                <div className="mt-4">
                  <Progress 
                    value={percentage} 
                    className="h-2 bg-white/10"
                  />
                  <p className="text-xs text-white/70 mt-2">
                    {progress}/{total}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>You're {remainingPercentage}% away from unlocking this achievement!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 