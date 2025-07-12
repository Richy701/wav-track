import { useAchievements } from '@/hooks/useAchievements'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import { MusicalNoteIcon, FireIcon, ClockIcon, FlagIcon } from '@heroicons/react/24/solid'
import { Spinner } from '@/components/ui/spinner'

const categoryStyles = {
  production: {
    gradient: 'from-violet-500 to-purple-600',
    icon: <MusicalNoteIcon className="h-5 w-5 text-violet-600 dark:text-white" />
  },
  streak: {
    gradient: 'from-orange-500 to-amber-600',
    icon: <FireIcon className="h-5 w-5 text-orange-600 dark:text-white" />
  },
  time: {
    gradient: 'from-blue-500 to-indigo-600',
    icon: <ClockIcon className="h-5 w-5 text-blue-600 dark:text-white" />
  },
  goals: {
    gradient: 'from-orange-100 to-orange-200',
    icon: <FlagIcon className="h-5 w-5 text-orange-600 dark:text-white" />
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

  // Icon color classes for light/dark mode
  const iconColor = {
    production: "text-violet-600 dark:text-white",
    streak: "text-orange-600 dark:text-white",
    time: "text-blue-600 dark:text-white",
    goals: "text-orange-700 dark:text-white"
  }[nextAchievement.category] || "text-zinc-700 dark:text-white"

  // Icon selection
  const icon = {
    production: <MusicalNoteIcon className={`h-5 w-5 ${iconColor}`} />,
    streak: <FireIcon className={`h-5 w-5 ${iconColor}`} />,
    time: <ClockIcon className={`h-5 w-5 ${iconColor}`} />,
    goals: <FlagIcon className={`h-5 w-5 ${iconColor}`} />
  }[nextAchievement.category] || <FlagIcon className={`h-5 w-5 ${iconColor}`} />

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
              "w-full p-6 rounded-2xl",
              "bg-gradient-to-br from-orange-100 to-orange-200 dark:from-amber-500 dark:to-orange-500",
              "border border-orange-200 dark:border-white/10",
              "shadow-lg shadow-orange-100/50 dark:shadow-black/20"
            )}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-sm">
                {icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-700 dark:text-white mb-1">Next Achievement</h3>
                <p className="text-orange-800 dark:text-white/80 text-sm font-medium">{nextAchievement.name}</p>
                <p className="text-zinc-600 dark:text-white/60 text-xs mt-1">{nextAchievement.description}</p>
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