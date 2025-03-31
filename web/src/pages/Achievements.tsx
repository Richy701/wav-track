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
  first_beat: <MusicNoteSimple className="h-5 w-5" weight="fill" />,
  beat_builder: <Waveform className="h-5 w-5" weight="fill" />,
  beat_machine: <Waves className="h-5 w-5" weight="fill" />,
  legendary_producer: <Medal className="h-5 w-5" weight="fill" />
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
    icon: '🏆',
    colors: {
      hover: 'hover:bg-purple-500/20 dark:hover:bg-purple-500/20',
      active: 'bg-purple-500/20 text-purple-900 dark:text-purple-100'
    }
  },
  { 
    id: 'streaks', 
    label: 'Streaks', 
    icon: '🔥',
    colors: {
      hover: 'hover:bg-orange-500/20 dark:hover:bg-orange-500/20',
      active: 'bg-orange-500/20 text-orange-900 dark:text-orange-100'
    }
  },
  { 
    id: 'production', 
    label: 'Production', 
    icon: '🎵',
    colors: {
      hover: 'hover:bg-violet-500/20 dark:hover:bg-violet-500/20',
      active: 'bg-violet-500/20 text-violet-900 dark:text-violet-100'
    }
  },
  { 
    id: 'time', 
    label: 'Time', 
    icon: '⏱️',
    colors: {
      hover: 'hover:bg-blue-500/20 dark:hover:bg-blue-500/20',
      active: 'bg-blue-500/20 text-blue-900 dark:text-blue-100'
    }
  },
  { 
    id: 'goals', 
    label: 'Goals', 
    icon: '🎯',
    colors: {
      hover: 'hover:bg-emerald-500/20 dark:hover:bg-emerald-500/20',
      active: 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-100'
    }
  }
]

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
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-sm text-destructive">Failed to load achievements</p>
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-7xl mx-auto px-4 pt-24 pb-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 mb-12 group"
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

        {/* Next Achievement Banner */}
        {nextAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "mb-8 p-6 rounded-2xl",
              "bg-gradient-to-br",
              tierColors[nextAchievement.tier as keyof typeof tierColors].gradient,
              "border border-white/10 dark:border-white/5",
              "shadow-lg shadow-black/5 dark:shadow-black/20"
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-xl",
                "bg-white/10 dark:bg-white/5",
                "backdrop-blur-sm"
              )}>
                {achievementIcons[nextAchievement.id as keyof typeof achievementIcons]}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Next Achievement
                </h3>
                <p className="text-white/80 text-sm">
                  {nextAchievement.name}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  {nextAchievement.description}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Achievement Progress */}
        <AchievementProgress />

        {/* Category Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className={cn(
            // Container Layout
            "mx-auto w-fit",
            "flex items-center",
            "gap-1.5",
            "p-1.5",
            
            // Visual Style
            "rounded-full",
            "bg-white/80 dark:bg-zinc-800/80",
            "border border-zinc-200/50 dark:border-zinc-700/50",
            "shadow-sm dark:shadow-zinc-950/20",
            
            // Glass Effect
            "backdrop-blur-sm",
            "backdrop-saturate-150"
          )}>
            {tabItems.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  // Base Layout
                  "flex items-center justify-center gap-2",
                  "h-9 px-4",
                  "rounded-full",
                  
                  // Typography
                  "text-sm font-medium",
                  
                  // Default State
                  "text-zinc-600 dark:text-zinc-400",
                  "hover:text-zinc-900 dark:hover:text-zinc-100",
                  
                  // Transitions
                  "transition-all duration-200",
                  
                  // Hover Effect (Color-coded)
                  tab.colors.hover,
                  
                  // Active State (Color-coded)
                  `data-[state=active]:${tab.colors.active}`,
                  "data-[state=active]:shadow-sm"
                )}
              >
                <span className="text-base">
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} isLoading={loading} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="streaks" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements
                .filter((a) => a.category === 'streak')
                .map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} isLoading={loading} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="production" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements
                .filter((a) => a.category === 'production')
                .map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} isLoading={loading} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="time" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements
                .filter((a) => a.category === 'time')
                .map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} isLoading={loading} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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