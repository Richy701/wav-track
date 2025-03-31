import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { 
  MusicNote, 
  Fire, 
  Clock, 
  Target, 
  Medal, 
  Star, 
  Trophy 
} from '@phosphor-icons/react'
import { useAchievements } from '@/hooks/useAchievements'

const categoryStyles = {
  production: {
    gradient: 'from-violet-500 to-purple-600',
    progressBg: 'bg-violet-500/10 dark:bg-violet-500/20',
    shadow: 'shadow-violet-500/10',
    hover: 'hover:shadow-violet-500/20',
    border: 'border-violet-500/20',
    text: 'text-violet-600 dark:text-violet-400',
    icon: <MusicNote className="h-5 w-5" weight="fill" />
  },
  streak: {
    gradient: 'from-orange-500 to-amber-600',
    progressBg: 'bg-orange-500/10 dark:bg-orange-500/20',
    shadow: 'shadow-orange-500/10',
    hover: 'hover:shadow-orange-500/20',
    border: 'border-orange-500/20',
    text: 'text-orange-600 dark:text-orange-400',
    icon: <Fire className="h-5 w-5" weight="fill" />
  },
  time: {
    gradient: 'from-blue-500 to-indigo-600',
    progressBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    shadow: 'shadow-blue-500/10',
    hover: 'hover:shadow-blue-500/20',
    border: 'border-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    icon: <Clock className="h-5 w-5" weight="fill" />
  },
  goals: {
    gradient: 'from-emerald-500 to-teal-600',
    progressBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    shadow: 'shadow-emerald-500/10',
    hover: 'hover:shadow-emerald-500/20',
    border: 'border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: <Target className="h-5 w-5" weight="fill" />
  }
} as const

const tierStyles = {
  bronze: {
    gradient: 'from-amber-500 to-orange-500',
    progressBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    shadow: 'shadow-amber-500/10',
    hover: 'hover:shadow-amber-500/20',
    border: 'border-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    icon: <Medal className="h-5 w-5" weight="fill" />
  },
  silver: {
    gradient: 'from-gray-400 to-gray-600',
    progressBg: 'bg-gray-500/10 dark:bg-gray-500/20',
    shadow: 'shadow-gray-500/10',
    hover: 'hover:shadow-gray-500/20',
    border: 'border-gray-500/20',
    text: 'text-gray-600 dark:text-gray-400',
    icon: <Star className="h-5 w-5" weight="fill" />
  },
  gold: {
    gradient: 'from-yellow-400 to-yellow-600',
    progressBg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    shadow: 'shadow-yellow-500/10',
    hover: 'hover:shadow-yellow-500/20',
    border: 'border-yellow-500/20',
    text: 'text-yellow-600 dark:text-yellow-400',
    icon: <Trophy className="h-5 w-5" weight="fill" />
  },
  platinum: {
    gradient: 'from-purple-400 to-purple-600',
    progressBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    shadow: 'shadow-purple-500/10',
    hover: 'hover:shadow-purple-500/20',
    border: 'border-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    icon: <Star className="h-5 w-5" weight="fill" />
  }
} as const

type Category = keyof typeof categoryStyles
type Tier = keyof typeof tierStyles

interface ProgressStats {
  category: {
    [key in Category]: {
      unlocked: number
      total: number
      percentage: number
    }
  }
  tier: {
    [key in Tier]: {
      unlocked: number
      total: number
      percentage: number
    }
  }
  total: {
    unlocked: number
    total: number
    percentage: number
  }
}

export function AchievementProgress() {
  const { achievements, loading } = useAchievements()

  // Calculate progress statistics
  const stats: ProgressStats = React.useMemo(() => {
    const categoryStats = Object.keys(categoryStyles).reduce((acc, category) => {
      const categoryAchievements = achievements.filter(a => a.category === category)
      const unlocked = categoryAchievements.filter(a => a.unlocked_at).length
      const total = categoryAchievements.length
      
      return {
        ...acc,
        [category]: {
          unlocked,
          total,
          percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0
        }
      }
    }, {} as ProgressStats['category'])

    const tierStats = Object.keys(tierStyles).reduce((acc, tier) => {
      const tierAchievements = achievements.filter(a => a.tier === tier)
      const unlocked = tierAchievements.filter(a => a.unlocked_at).length
      const total = tierAchievements.length
      
      return {
        ...acc,
        [tier]: {
          unlocked,
          total,
          percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0
        }
      }
    }, {} as ProgressStats['tier'])

    const totalUnlocked = achievements.filter(a => a.unlocked_at).length
    const totalAchievements = achievements.length

    return {
      category: categoryStats,
      tier: tierStats,
      total: {
        unlocked: totalUnlocked,
        total: totalAchievements,
        percentage: totalAchievements > 0 ? Math.round((totalUnlocked / totalAchievements) * 100) : 0
      }
    }
  }, [achievements])

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-6 rounded-2xl bg-background border border-border shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Achievement Progress
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                Updating...
              </span>
            ) : (
              <>
                <span className="font-medium tabular-nums">{stats.total.unlocked}</span> of{" "}
                <span className="font-medium tabular-nums">{stats.total.total}</span> achievements unlocked
              </>
            )}
          </p>
        </div>
        <Badge variant="secondary" className={cn(
          "px-3 py-1.5 text-sm",
          "bg-purple-600/20 text-purple-600 dark:bg-purple-400/10 dark:text-purple-100",
          "border border-purple-500/20"
        )}>
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              Updating...
            </span>
          ) : (
            `${stats.total.percentage}% Complete`
          )}
        </Badge>
      </div>

      {/* Main Progress Bar */}
      <div className="relative h-2 rounded-full bg-muted dark:bg-muted/50 mb-6 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${stats.total.percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-violet-600",
            loading && "animate-pulse"
          )}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        {/* Categories */}
        <div className="p-4 rounded-xl bg-muted/50 dark:bg-muted/20 border border-border">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Categories</h3>
          <div className="space-y-5">
            {(Object.entries(categoryStyles) as [Category, typeof categoryStyles[Category]][]).map(([category, style]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <div className={cn(
                      "p-1.5 rounded-lg",
                      "bg-gradient-to-br",
                      style.gradient,
                      "text-white",
                      "transition-transform duration-200",
                      "hover:scale-110"
                    )}>
                      {style.icon}
                    </div>
                    <span className="capitalize">{category}</span>
                  </div>
                  <span className={cn(
                    "font-semibold tabular-nums text-sm",
                    style.text
                  )}>
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner className="h-3 w-3" />
                        Updating...
                      </span>
                    ) : (
                      `${stats.category[category].unlocked}/${stats.category[category].total}`
                    )}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted dark:bg-muted/50 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.category[category].percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn(
                      "h-full bg-gradient-to-r",
                      style.gradient,
                      "transition-all duration-500",
                      loading && "animate-pulse"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tiers */}
        <div className="p-4 rounded-xl bg-muted/50 dark:bg-muted/20 border border-border">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Tiers</h3>
          <div className="space-y-5">
            {(Object.entries(tierStyles) as [Tier, typeof tierStyles[Tier]][]).map(([tier, style]) => (
              <div key={tier}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <div className={cn(
                      "p-1.5 rounded-lg",
                      "bg-gradient-to-br",
                      style.gradient,
                      "text-white",
                      "transition-transform duration-200",
                      "hover:scale-110"
                    )}>
                      {style.icon}
                    </div>
                    <span className="capitalize">{tier}</span>
                  </div>
                  <span className={cn(
                    "font-semibold tabular-nums text-sm",
                    style.text
                  )}>
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner className="h-3 w-3" />
                        Updating...
                      </span>
                    ) : (
                      `${stats.tier[tier].unlocked}/${stats.tier[tier].total}`
                    )}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted dark:bg-muted/50 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.tier[tier].percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn(
                      "h-full bg-gradient-to-r",
                      style.gradient,
                      "transition-all duration-500",
                      loading && "animate-pulse"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
} 