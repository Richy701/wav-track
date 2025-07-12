import { Card } from '@/components/ui/card'
import { Achievement } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircleIcon, TrophyIcon, StarIcon, ClockIcon, FlagIcon, FireIcon, MusicalNoteIcon } from '@heroicons/react/24/solid'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy,
  Star,
  Clock,
  Target,
  Fire,
  MusicNote,
  Medal,
  Waveform,
  Waves,
  MusicNoteSimple,
  Lightning,
  Flame,
  Crown,
  Timer,
  Hourglass,
  Brain,
  Flag,
  CheckCircle,
  Rocket
} from '@phosphor-icons/react'

interface AchievementCardProps {
  achievement: Achievement
  className?: string
  isLoading?: boolean
}

const tierColors = {
  bronze: {
    bg: 'bg-amber-100 dark:bg-amber-500/20',
    border: 'border-amber-200 dark:border-amber-500/30',
    text: 'text-amber-800 dark:text-amber-300'
  },
  silver: {
    bg: 'bg-emerald-100 dark:bg-emerald-500/30',
    border: 'border-emerald-200 dark:border-emerald-500/30',
    text: 'text-emerald-800 dark:text-emerald-300'
  },
  gold: {
    bg: 'bg-yellow-100 dark:bg-yellow-500/20',
    border: 'border-yellow-200 dark:border-yellow-500/30',
    text: 'text-yellow-800 dark:text-yellow-300'
  },
  platinum: {
    bg: 'bg-purple-100 dark:bg-purple-500/20',
    border: 'border-purple-200 dark:border-purple-500/30',
    text: 'text-purple-800 dark:text-purple-300'
  }
}

const tierIcons = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
}

const categoryStyles = {
  streak: {
    bg: 'bg-orange-100 dark:bg-orange-500/20',
    border: 'border-orange-200 dark:border-orange-500/30',
    text: 'text-orange-800 dark:text-orange-300'
  },
  production: {
    bg: 'bg-violet-100 dark:bg-violet-500/20',
    border: 'border-violet-200 dark:border-violet-500/30',
    text: 'text-violet-800 dark:text-violet-300'
  },
  time: {
    bg: 'bg-blue-100 dark:bg-blue-500/20',
    border: 'border-blue-200 dark:border-blue-500/30',
    text: 'text-blue-800 dark:text-blue-300'
  },
  goals: {
    bg: 'bg-emerald-100 dark:bg-emerald-500/20',
    border: 'border-emerald-200 dark:border-emerald-500/30',
    text: 'text-emerald-800 dark:text-emerald-300'
  }
}

const tierBadges = {
  bronze: {
    icon: <TrophyIcon className="h-4 w-4" />,
    bg: 'bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/30'
  },
  silver: {
    icon: <StarIcon className="h-4 w-4" />,
    bg: 'bg-zinc-500/15',
    text: 'text-zinc-700 dark:text-zinc-400',
    border: 'border-zinc-500/30'
  },
  gold: {
    icon: <TrophyIcon className="h-4 w-4" />,
    bg: 'bg-yellow-500/15',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-500/30'
  },
  platinum: {
    icon: <StarIcon className="h-4 w-4" />,
    bg: 'bg-purple-500/15',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-500/30'
  }
}

const achievementIcons = {
  // Production achievements
  first_beat: (isUnlocked: boolean) => (
    <MusicNoteSimple 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-violet-600 dark:text-violet-400" : "text-zinc-400 dark:text-white/60"
      )} 
      weight="fill" 
    />
  ),
  beat_builder: (isUnlocked: boolean) => (
    <Waveform 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-violet-600 dark:text-violet-400" : "text-zinc-400 dark:text-white/60"
      )} 
      weight="fill" 
    />
  ),
  beat_machine: (isUnlocked: boolean) => (
    <Waves 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-violet-600 dark:text-violet-400" : "text-zinc-400 dark:text-white/60"
      )} 
      weight="fill" 
    />
  ),
  legendary_producer: (isUnlocked: boolean) => (
    <Crown 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-violet-600 dark:text-violet-400" : "text-zinc-400 dark:text-white/60"
      )} 
      weight="fill" 
    />
  ),
  // Streak achievements
  daily_grinder: (isUnlocked: boolean) => (
    <Lightning 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-orange-600 dark:text-orange-400" : "text-zinc-400 dark:text-white/60"
      )} 
      weight="fill" 
    />
  ),
  consistency_king: (isUnlocked: boolean) => (
    <Medal 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-orange-600 dark:text-orange-400" : "text-zinc-400 dark:text-white/60"
      )} 
      weight="fill" 
    />
  ),
  on_fire: (isUnlocked: boolean) => (
    <Flame 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-orange-600 dark:text-orange-400" : "text-zinc-400 dark:text-white/60"
      )} 
      weight="fill" 
    />
  ),
  // Time achievements
  studio_rat: (isUnlocked: boolean) => (
    <Timer 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 dark:text-white/60"
      )} 
      weight="fill" 
    />
  ),
  time_lord: (isUnlocked: boolean) => (
    <Hourglass 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 dark:text-white/60"
      )} 
      weight="fill" 
    />
  ),
  focused_af: (isUnlocked: boolean) => (
    <Brain 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 dark:text-white/60"
      )} 
      weight="fill" 
    />
  ),
  // Goal achievements
  goal_getter: (isUnlocked: boolean) => (
    <Target 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-white/60"
      )} 
      weight="fill" 
    />
  ),
  finish_what_you_start: (isUnlocked: boolean) => (
    <CheckCircle 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-white/60"
      )} 
      weight="fill" 
    />
  ),
  big_vision: (isUnlocked: boolean) => (
    <Rocket 
      className={cn(
        "h-8 w-8",
        isUnlocked ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-white/60"
      )} 
      weight="fill" 
    />
  )
}

export function AchievementCard({ achievement, className, isLoading }: AchievementCardProps) {
  const isUnlocked = !!achievement.unlocked_at
  const progress = Math.max(0, achievement.progress || 0)
  const total = achievement.total || achievement.requirement
  const percentage = Math.min((progress / total) * 100, 100)
  const tierColor = tierColors[achievement.tier as keyof typeof tierColors]
  const categoryStyle = categoryStyles[achievement.category as keyof typeof categoryStyles]

  console.log('Achievement:', achievement.id, 'Unlocked:', isUnlocked, 'unlocked_at:', achievement.unlocked_at)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
        // Base layout
        "relative p-6 h-full",
        "rounded-3xl overflow-hidden",
        // Solid background
        "bg-white dark:bg-zinc-900",
        // Border and shadow
        "border border-zinc-200 dark:border-zinc-800",
        "shadow-md",
        // Hover effects
        "hover:border-zinc-300 dark:hover:border-zinc-700",
        "hover:shadow-lg",
        "transition-all duration-300",
        className
      )}
    >
      <div className="relative flex flex-col h-full">
        {/* Icon Container */}
        <div className={cn(
          // Base layout
          "p-4 mb-4 w-fit",
          "rounded-2xl",
          // Category-specific background
          achievement.category === 'production' && "bg-violet-100 text-violet-600 dark:bg-violet-800 dark:text-violet-200",
          achievement.category === 'streak' && "bg-orange-100 text-orange-600 dark:bg-orange-800 dark:text-orange-200",
          achievement.category === 'time' && "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200",
          achievement.category === 'goals' && "bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-200",
          // Border and shadow
          "border border-zinc-200 dark:border-zinc-800",
          "shadow-sm",
          // Animation
          "transform-gpu transition-transform duration-300",
          "hover:scale-110 hover:rotate-3"
        )}>
          <div className="w-8 h-8">
            {(achievementIcons[achievement.id as keyof typeof achievementIcons] || 
              ((isUnlocked: boolean) => <Trophy className={cn("h-8 w-8", isUnlocked ? "text-zinc-600 dark:text-white" : "text-zinc-400 dark:text-white/60")} weight="fill" />)
            )(isUnlocked)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
            {achievement.name}
          </h3>
          <p className="text-sm text-zinc-700 dark:text-white/70 mb-4">
            {achievement.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-auto">
          <div className="flex justify-between text-sm text-zinc-800 dark:text-white/90 mb-2">
            <span>{progress} / {total}</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
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
          <div className="absolute top-4 right-4">
            <div className={cn(
              "p-2 rounded-full",
              achievement.category === 'production' && "bg-violet-100 text-violet-600 dark:bg-violet-800 dark:text-violet-200",
              achievement.category === 'streak' && "bg-orange-100 text-orange-600 dark:bg-orange-800 dark:text-orange-200",
              achievement.category === 'time' && "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200",
              achievement.category === 'goals' && "bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-200",
              "border border-zinc-200 dark:border-zinc-800",
              "shadow-sm"
            )}>
              <Star className="w-4 h-4" weight="fill" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
} 