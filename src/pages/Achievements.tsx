import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useAchievements } from '@/hooks/useAchievements'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/spinner'
import { AchievementCard } from '@/components/achievements/AchievementCard'
import { AchievementProgress } from '@/components/achievements/AchievementProgress'
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
  MusicNoteSimple
} from '@phosphor-icons/react'
import { motion, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const achievementIcons = {
  // Production achievements
  first_beat: <MusicNoteSimple className="h-8 w-8 text-white" weight="fill" />,
  beat_builder: <Waveform className="h-8 w-8 text-white" weight="fill" />,
  beat_machine: <Waves className="h-8 w-8 text-white" weight="fill" />,
  legendary_producer: <Medal className="h-8 w-8 text-white" weight="fill" />,
  // Streak achievements
  daily_grinder: <Fire className="h-8 w-8 text-white" weight="fill" />,
  consistency_king: <Star className="h-8 w-8 text-white" weight="fill" />,
  // Time achievements
  studio_rat: <Clock className="h-8 w-8 text-white" weight="fill" />,
  time_lord: <Clock className="h-8 w-8 text-white" weight="fill" />,
  // Goal achievements
  goal_getter: <Target className="h-8 w-8 text-white" weight="fill" />,
  finish_what_you_start: <Trophy className="h-8 w-8 text-white" weight="fill" />,
  big_vision: <Star className="h-8 w-8 text-white" weight="fill" />
}

const tierColors = {
  bronze: {
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    border: 'border-amber-500/20',
    text: 'text-amber-600 dark:text-amber-300'
  },
  silver: {
    gradient: 'from-gray-400 to-gray-600',
    bg: 'bg-gray-500/10 dark:bg-gray-500/20',
    border: 'border-gray-500/20',
    text: 'text-gray-600 dark:text-gray-300'
  },
  gold: {
    gradient: 'from-yellow-400 to-yellow-600',
    bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    border: 'border-yellow-500/20',
    text: 'text-yellow-600 dark:text-yellow-300'
  },
  platinum: {
    gradient: 'from-purple-400 to-purple-600',
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    border: 'border-purple-500/20',
    text: 'text-purple-600 dark:text-purple-300'
  }
}

const tabItems = [
  { 
    id: 'all', 
    label: 'All Achievements', 
    icon: <Trophy className="h-5 w-5 text-purple-500" weight="fill" />,
    colors: {
      hover: 'hover:bg-purple-500/20 dark:hover:bg-purple-500/20',
      active: 'bg-purple-500/20 text-zinc-900 dark:text-purple-100'
    }
  },
  { 
    id: 'streaks', 
    label: 'Streaks', 
    icon: <Fire className="h-5 w-5 text-orange-500" weight="fill" />,
    colors: {
      hover: 'hover:bg-orange-500/20 dark:hover:bg-orange-500/20',
      active: 'bg-orange-500/20 text-zinc-900 dark:text-orange-100'
    }
  },
  { 
    id: 'production', 
    label: 'Production', 
    icon: <Waveform className="h-5 w-5 text-violet-500" weight="fill" />,
    colors: {
      hover: 'hover:bg-violet-500/20 dark:hover:bg-violet-500/20',
      active: 'bg-violet-500/20 text-zinc-900 dark:text-violet-100'
    }
  },
  { 
    id: 'time', 
    label: 'Time', 
    icon: <Clock className="h-5 w-5 text-blue-500" weight="fill" />,
    colors: {
      hover: 'hover:bg-blue-500/20 dark:hover:bg-blue-500/20',
      active: 'bg-blue-500/20 text-zinc-900 dark:text-blue-100'
    }
  },
  { 
    id: 'goals', 
    label: 'Goals', 
    icon: <Target className="h-5 w-5 text-emerald-500" weight="fill" />,
    colors: {
      hover: 'hover:bg-emerald-500/20 dark:hover:bg-emerald-500/20',
      active: 'bg-emerald-500/20 text-zinc-900 dark:text-emerald-100'
    }
  }
]

// Helper function to get icon for achievement
const getAchievementIcon = (achievementId: string) => {
  return achievementIcons[achievementId as keyof typeof achievementIcons] || 
    <Trophy className="h-8 w-8 text-white" weight="fill" />
}

// ProgressRing component (inline for this file)
function ProgressRing({ percent, color, size = 56, thickness = 5, children }) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg width={size} height={size} className="block" style={{ display: 'block' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={thickness}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s' }}
      />
      <foreignObject x={thickness} y={thickness} width={size - thickness * 2} height={size - thickness * 2} style={{ pointerEvents: 'none' }}>
        <div style={{ width: size - thickness * 2, height: size - thickness * 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </div>
      </foreignObject>
    </svg>
  );
}

export default function Achievements() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { achievements, loading, error } = useAchievements()
  const [activeCategory, setActiveCategory] = useState('production')

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Spinner className="h-8 w-8 mb-4" />
        <p className="text-sm text-muted-foreground">Loading achievements...</p>
      </div>
    )
  }

  if (error) {
    console.error('[Debug] Achievements page error:', error)
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-sm text-destructive">Failed to load achievements</p>
        <p className="text-xs text-muted-foreground mt-2">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  // Calculate streak-related stats
  const currentStreak = profile?.current_streak || 0
  const bestStreak = profile?.best_streak || 0
  const daysUntilNextMilestone = Math.ceil((currentStreak + 1) / 10) * 10 - currentStreak

  const nextAchievement = achievements
    .filter(a => !a.unlocked_at)
    .sort((a, b) => {
      const tiers = { bronze: 1, silver: 2, gold: 3, platinum: 4 }
      return (tiers[a.tier as keyof typeof tiers] || 0) - (tiers[b.tier as keyof typeof tiers] || 0)
    })[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/50 to-background flex flex-col">
      <Header />
      <main className="flex-1 container max-w-7xl mx-auto px-4 pt-24 pb-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 mb-8 group"
        >
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center justify-center -mt-5"
          >
            <Trophy 
              className="h-7 w-7 text-primary transition-colors duration-200 group-hover:text-primary/80" 
              weight="fill"
            />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Achievements
          </h1>
        </motion.div>

        {/* Next Achievement Banner with Stats */}
        {(() => {
          const unlockedCount = achievements.filter(a => a.unlocked_at).length;
          const totalCount = achievements.length;
          const completionRate = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
          
          if (!nextAchievement) {
            // Show overall progress when no next achievement
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mb-12"
              >
                <div className={cn(
                  "relative p-6 rounded-3xl overflow-hidden",
                  "bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-purple-500/10",
                  "dark:from-purple-500/20 dark:via-violet-500/20 dark:to-purple-500/20",
                  "border border-purple-200/30 dark:border-purple-500/30",
                  "backdrop-blur-sm"
                )}>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                        <Trophy className="h-6 w-6" weight="fill" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                          All Achievements Complete!
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {unlockedCount} of {totalCount} achievements unlocked
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {completionRate}%
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          }

          return (() => {
            const progress = nextAchievement.progress || 0;
            const total = nextAchievement.total || nextAchievement.requirement || 1;
            const percent = Math.min((progress / total) * 100, 100);
            const category = nextAchievement.category;
            const categoryColor =
              category === 'production' ? '#7c3aed' :
              category === 'streak' ? '#ea580c' :
              category === 'time' ? '#2563eb' :
              category === 'goals' ? '#059669' : '#a1a1aa';
            const iconBgClass =
              category === 'production' ? 'bg-violet-100 text-violet-600 dark:bg-violet-800 dark:text-violet-200 border-violet-200 dark:border-violet-700' :
              category === 'streak' ? 'bg-orange-100 text-orange-600 dark:bg-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700' :
              category === 'time' ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700' :
              category === 'goals' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700' :
              'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700';
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
                  "relative flex items-center p-8 mb-8 rounded-3xl",
                  "bg-white dark:bg-zinc-900",
                  "border border-zinc-200 dark:border-zinc-800",
                  "shadow-lg hover:shadow-2xl transition-all duration-300",
                  "overflow-hidden"
                )}
              >
                {/* Accent bar */}
                <div className={cn(
                  'absolute left-0 top-0 h-full w-2 rounded-l-3xl',
                  category === 'production' && 'bg-violet-600 dark:bg-violet-400',
                  category === 'streak' && 'bg-orange-600 dark:bg-orange-400',
                  category === 'time' && 'bg-blue-600 dark:bg-blue-400',
                  category === 'goals' && 'bg-emerald-600 dark:bg-emerald-400'
                )} />
                {/* Stats in top right */}
                <div className="absolute top-4 right-6 text-right">
                  <div className="text-lg font-bold text-zinc-900 dark:text-white">
                    {unlockedCount}/{totalCount}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {completionRate}% complete
                  </div>
                  {currentStreak > 0 && (
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <Fire className="h-3 w-3 text-orange-500" weight="fill" />
                      <span className="text-xs text-orange-600 dark:text-orange-400">
                        {currentStreak} streak
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Watermark icon */}
                <div className="absolute right-4 bottom-2 opacity-5 pointer-events-none select-none">
                  {getAchievementIcon(nextAchievement.id)}
                </div>
                {/* Icon with progress ring */}
                <div className="relative z-10 mr-8">
                  <ProgressRing percent={percent} color={categoryColor} size={56} thickness={5}>
                    <div className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-full border shadow',
                      iconBgClass
                    )}>
                      {getAchievementIcon(nextAchievement.id)}
                    </div>
                  </ProgressRing>
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0 pr-24">
                  <div className="uppercase text-xs tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Next Up</div>
                  <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">{nextAchievement.name}</div>
                  <div className="text-base text-zinc-700 dark:text-zinc-300 mb-2">{nextAchievement.description}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">{progress} / {total} complete</div>
                    {percent >= 75 && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                        Almost there!
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })();
        })()}

        {/* Achievement Progress */}
        <AchievementProgress />

        {/* Category Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className={cn(
            // Container Layout
            "mx-auto w-fit",
            "flex items-center",
            "gap-2",
            "p-2",
            
            // Visual Style
            "rounded-full",
            "bg-white/10 dark:bg-zinc-900/20",
            "border border-white/20 dark:border-white/10",
            "shadow-xl shadow-black/5 dark:shadow-black/20",
            
            // Glass Effect
            "backdrop-blur-md",
            "backdrop-saturate-150"
          )}>
            {tabItems.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex items-center justify-center gap-2.5",
                  "h-10 px-5",
                  "rounded-full",
                  "text-base font-medium",
                  "text-zinc-600 dark:text-white/70",
                  "bg-transparent",
                  "border border-transparent",
                  "hover:text-zinc-900 dark:hover:text-white",
                  tab.id === 'all' && 'hover:bg-purple-100 data-[state=active]:bg-purple-100 dark:hover:bg-purple-500/20 dark:data-[state=active]:bg-purple-500/20',
                  tab.id === 'streaks' && 'hover:bg-orange-100 data-[state=active]:bg-orange-100 dark:hover:bg-orange-500/20 dark:data-[state=active]:bg-orange-500/20',
                  tab.id === 'production' && 'hover:bg-violet-100 data-[state=active]:bg-violet-100 dark:hover:bg-violet-500/20 dark:data-[state=active]:bg-violet-500/20',
                  tab.id === 'time' && 'hover:bg-blue-100 data-[state=active]:bg-blue-100 dark:hover:bg-blue-500/20 dark:data-[state=active]:bg-blue-500/20',
                  tab.id === 'goals' && 'hover:bg-emerald-100 data-[state=active]:bg-emerald-100 dark:hover:bg-emerald-500/20 dark:data-[state=active]:bg-emerald-500/20',
                  "transition-all duration-200",
                  "data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white",
                  "data-[state=active]:border-white/20",
                  "data-[state=active]:shadow-lg",
                  "data-[state=active]:shadow-black/5"
                )}
              >
                <span className="text-xl">
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {achievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} isLoading={loading} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="streaks" className="mt-8">
            {(() => {
              const streakAchievements = achievements.filter((a) => a.category === 'streak');
              
              if (streakAchievements.length === 0) {
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 px-8 text-center"
                  >
                    <div className="relative mb-6">
                      <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                        <Fire className="w-10 h-10 text-orange-500 dark:text-orange-400" weight="fill" />
                      </div>
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center"
                      >
                        ✨
                      </motion.div>
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                      No Streak Achievements Yet
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
                      Keep working consistently to unlock streak achievements! Start a session to begin your journey.
                    </p>
                  </motion.div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                  {streakAchievements.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} isLoading={loading} />
                  ))}
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="production" className="mt-8">
            {(() => {
              const productionAchievements = achievements.filter((a) => a.category === 'production');
              const collections = [
                {
                  name: "Beat Making Journey",
                  description: "Master the art of beat production",
                  achievements: productionAchievements.filter(a => ['first_beat', 'beat_builder', 'beat_machine'].includes(a.id)),
                  color: "violet"
                },
                {
                  name: "Producer Status",
                  description: "Achieve legendary producer recognition",
                  achievements: productionAchievements.filter(a => ['legendary_producer'].includes(a.id)),
                  color: "purple"
                }
              ];

              return (
                <div className="space-y-8">
                  {collections.map((collection) => (
                    <div key={collection.name} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                            {collection.name}
                          </h3>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {collection.description}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {collection.achievements.filter(a => a.unlocked_at).length}/{collection.achievements.length}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                        {collection.achievements.map((achievement) => (
                          <AchievementCard key={achievement.id} achievement={achievement} isLoading={loading} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="time" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {achievements
                .filter((a) => a.category === 'time')
                .map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} isLoading={loading} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {achievements
                .filter((a) => a.category === 'goals')
                .map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} isLoading={loading} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
} 