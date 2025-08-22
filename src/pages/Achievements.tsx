import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useAchievements } from '@/hooks/useAchievements'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AchievementCard } from '@/components/achievements/AchievementCard'
import { AchievementProgress } from '@/components/achievements/AchievementProgress'
import { 
  Trophy, 
  Star, 
  Clock, 
  Target, 
  Flame,
  Music, 
  Medal,
  Activity,
  Waves
} from 'lucide-react'
import { motion, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

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
  first_beat: <Music className="h-8 w-8 text-white" />,
  beat_builder: <Activity className="h-8 w-8 text-white" />,
  beat_machine: <Waves className="h-8 w-8 text-white" />,
  legendary_producer: <Medal className="h-8 w-8 text-white" />,
  // Streak achievements
  daily_grinder: <Flame className="h-8 w-8 text-white" />,
  consistency_king: <Star className="h-8 w-8 text-white" />,
  // Time achievements
  studio_rat: <Clock className="h-8 w-8 text-white" />,
  time_lord: <Clock className="h-8 w-8 text-white" />,
  // Goal achievements
  goal_getter: <Target className="h-8 w-8 text-white" />,
  finish_what_you_start: <Trophy className="h-8 w-8 text-white" />,
  big_vision: <Star className="h-8 w-8 text-white" />
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
    icon: <Trophy className="h-5 w-5 text-purple-500" />,
    colors: {
      hover: 'hover:bg-purple-500/20 dark:hover:bg-purple-500/20',
      active: 'bg-purple-500/20 text-zinc-900 dark:text-purple-100'
    }
  },
  { 
    id: 'streak', 
    label: 'Streak', 
    icon: <Flame className="h-5 w-5 text-orange-500" />,
    colors: {
      hover: 'hover:bg-orange-500/20 dark:hover:bg-orange-500/20',
      active: 'bg-orange-500/20 text-zinc-900 dark:text-orange-100'
    }
  },
  { 
    id: 'production', 
    label: 'Production', 
    icon: <Activity className="h-5 w-5 text-violet-500" />,
    colors: {
      hover: 'hover:bg-violet-500/20 dark:hover:bg-violet-500/20',
      active: 'bg-violet-500/20 text-zinc-900 dark:text-violet-100'
    }
  },
  { 
    id: 'time', 
    label: 'Time', 
    icon: <Clock className="h-5 w-5 text-blue-500" />,
    colors: {
      hover: 'hover:bg-blue-500/20 dark:hover:bg-blue-500/20',
      active: 'bg-blue-500/20 text-zinc-900 dark:text-blue-100'
    }
  },
  { 
    id: 'goals', 
    label: 'Goals', 
    icon: <Target className="h-5 w-5 text-emerald-500" />,
    colors: {
      hover: 'hover:bg-emerald-500/20 dark:hover:bg-emerald-500/20',
      active: 'bg-emerald-500/20 text-zinc-900 dark:text-emerald-100'
    }
  }
]

// Helper function to get icon for achievement
const getAchievementIcon = (achievementId: string) => {
  return achievementIcons[achievementId as keyof typeof achievementIcons] || 
    <Trophy className="h-8 w-8 text-white" />
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
    <div className="">
      <main className="w-full space-y-8">
        {/* Hero Section with Stats */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg"
              >
                <Trophy className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                  Achievements
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track your progress and unlock rewards
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {achievements.filter(a => a.unlocked_at).length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Unlocked</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {profile?.current_streak || 0}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Day Streak</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round((achievements.filter(a => a.unlocked_at).length / achievements.length) * 100)}%
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Complete</div>
              </motion.div>
            </div>
          </div>
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
                  "relative p-8 rounded-3xl overflow-hidden",
                  "bg-gradient-to-br from-purple-100 via-purple-50 to-violet-100",
                  "dark:from-purple-950/30 dark:via-purple-900/20 dark:to-violet-950/30",
                  "border-2 border-purple-300 dark:border-purple-700",
                  "shadow-2xl shadow-purple-500/20"
                )}>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                        <Trophy className="h-6 w-6" />
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
                whileHover={{ scale: 1.01, y: -2 }}
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
                  "bg-gradient-to-br from-white via-white to-purple-50/30",
                  "dark:from-zinc-900 dark:via-zinc-900 dark:to-purple-950/20",
                  "border-2 border-purple-200 dark:border-purple-800",
                  "shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20",
                  "transition-all duration-300",
                  "overflow-hidden group"
                )}
              >
                {/* Animated accent bar */}
                <motion.div 
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={cn(
                    'absolute left-0 top-0 h-full w-3 rounded-l-3xl origin-top',
                    category === 'production' && 'bg-gradient-to-b from-violet-500 to-violet-600',
                    category === 'streak' && 'bg-gradient-to-b from-orange-500 to-orange-600',
                    category === 'time' && 'bg-gradient-to-b from-blue-500 to-blue-600',
                    category === 'goals' && 'bg-gradient-to-b from-emerald-500 to-emerald-600'
                  )} 
                />
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
                      <Flame className="h-3 w-3 text-orange-500" />
                      <span className="text-xs text-orange-600 dark:text-orange-400">
                        {currentStreak} streak
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Animated watermark icon */}
                <motion.div 
                  animate={{ 
                    opacity: [0.05, 0.1, 0.05],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute right-8 bottom-4 pointer-events-none select-none text-purple-500 dark:text-purple-400"
                >
                  <div className="w-24 h-24 opacity-20 group-hover:opacity-30 transition-opacity [&>svg]:w-full [&>svg]:h-full">
                    {getAchievementIcon(nextAchievement.id)}
                  </div>
                </motion.div>
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
                  <div className="flex items-center gap-2 mb-2">
                    <span className="uppercase text-xs tracking-wider text-purple-600 dark:text-purple-400 font-semibold">Next Achievement</span>
                    <Badge className={cn(
                      "capitalize",
                      nextAchievement.tier === 'bronze' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                      nextAchievement.tier === 'silver' && "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
                      nextAchievement.tier === 'gold' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                      nextAchievement.tier === 'platinum' && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    )}>
                      {nextAchievement.tier}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
                    {nextAchievement.name}
                  </div>
                  <div className="text-base text-zinc-600 dark:text-zinc-400 mb-3">
                    {nextAchievement.description}
                  </div>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex justify-center mb-8 px-4"
          >
            <TabsList className={cn(
              // Container Layout
              "inline-flex items-center justify-center",
              "h-12 p-1",
              "gap-1",
              
              // Visual Style  
              "rounded-2xl",
              "bg-muted/30",
              "border border-border/50",
              "shadow-lg shadow-black/5 dark:shadow-black/20"
            )}>
              {tabItems.map((tab, index) => (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                >
                  <TabsTrigger
                    value={tab.id}
                    className={cn(
                      "relative inline-flex items-center justify-center gap-2",
                      "h-10 px-3 sm:px-4 min-w-[100px] sm:min-w-[120px]",
                      "rounded-xl",
                      "text-sm font-medium whitespace-nowrap",
                      "text-muted-foreground",
                      "transition-all duration-200",
                      "hover:text-foreground",
                      "data-[state=active]:text-white",
                      "data-[state=active]:shadow-lg",
                      "disabled:pointer-events-none disabled:opacity-50",
                      "group"
                    )}
                  >
                    {/* Active state background */}
                    <motion.div
                      className={cn(
                        "absolute inset-0 rounded-xl opacity-0",
                        "data-[state=active]:opacity-100",
                        tab.id === 'all' && "bg-gradient-to-r from-purple-500 to-purple-600",
                        tab.id === 'streak' && "bg-gradient-to-r from-orange-500 to-orange-600",
                        tab.id === 'production' && "bg-gradient-to-r from-violet-500 to-violet-600",
                        tab.id === 'time' && "bg-gradient-to-r from-blue-500 to-blue-600",
                        tab.id === 'goals' && "bg-gradient-to-r from-emerald-500 to-emerald-600"
                      )}
                      layoutId="activeTab"
                    />
                    
                    {/* Content */}
                    <span className="relative z-10 transition-transform group-hover:scale-110">
                      {tab.icon}
                    </span>
                    <span className="relative z-10 truncate">{tab.label}</span>
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>
          </motion.div>

          <TabsContent value="all" className="mt-8">
            <motion.div 
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  variants={fadeInUp}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <AchievementCard achievement={achievement} isLoading={loading} />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="streak" className="mt-8">
            {(() => {
              const streakAchievements = achievements.filter((a) => a.category === 'streak');
              
              if (streakAchievements.length === 0) {
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 px-8 text-center rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-2 border-dashed border-orange-300 dark:border-orange-700"
                  >
                    <motion.div className="relative mb-8">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-xl"
                      >
                        <Flame className="w-12 h-12 text-white" />
                      </motion.div>
                      <motion.div
                        animate={{ 
                          scale: [0.8, 1.2, 0.8],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-lg"
                      >
                        ⚡
                      </motion.div>
                    </motion.div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-3">
                      Start Your Streak Journey
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-md mb-6">
                      Consistency is key! Complete daily sessions to build your streak and unlock amazing achievements.
                    </p>
                    <Button 
                      onClick={() => navigate('/sessions')}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                    >
                      Start a Session
                    </Button>
                  </motion.div>
                );
              }

              return (
                <motion.div 
                  initial="initial"
                  animate="animate"
                  variants={staggerContainer}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {streakAchievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      variants={fadeInUp}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <AchievementCard achievement={achievement} isLoading={loading} />
                    </motion.div>
                  ))}
                </motion.div>
              );
            })()}
          </TabsContent>

          <TabsContent value="production" className="mt-8">
            {(() => {
              const productionAchievements = achievements.filter((a) => a.category === 'production');
              const collections = [
                {
                  name: "🎵 Beat Making Journey",
                  description: "Master the art of beat production from first beat to beat machine",
                  achievements: productionAchievements.filter(a => ['first_beat', 'beat_builder', 'beat_machine'].includes(a.id)),
                  color: "violet",
                  bgColor: "from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20",
                  borderColor: "border-violet-200 dark:border-violet-800",
                  icon: <Activity className="h-6 w-6 text-violet-500" />
                },
                {
                  name: "🏆 Producer Status", 
                  description: "Achieve legendary producer recognition and master status",
                  achievements: productionAchievements.filter(a => ['legendary_producer'].includes(a.id)),
                  color: "purple",
                  bgColor: "from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20",
                  borderColor: "border-purple-200 dark:border-purple-800",
                  icon: <Medal className="h-6 w-6 text-purple-500" />
                },
                {
                  name: "⭐ Advanced Production",
                  description: "Additional production milestones and special recognitions", 
                  achievements: productionAchievements.filter(a => !['first_beat', 'beat_builder', 'beat_machine', 'legendary_producer'].includes(a.id)),
                  color: "indigo",
                  bgColor: "from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20",
                  borderColor: "border-indigo-200 dark:border-indigo-800",
                  icon: <Star className="h-6 w-6 text-indigo-500" />
                }
              ].filter(collection => collection.achievements.length > 0);

              return (
                <div className="space-y-10">
                  {collections.map((collection, collectionIndex) => (
                    <motion.div 
                      key={collection.name} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: collectionIndex * 0.1 }}
                      className="space-y-6"
                    >
                      <div className={`flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r ${collection.bgColor} border ${collection.borderColor} shadow-sm`}>
                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 shadow-md">
                          {collection.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
                            {collection.name}
                          </h3>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {collection.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${
                            collection.color === 'violet' ? 'text-violet-600 dark:text-violet-400' :
                            collection.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                            'text-indigo-600 dark:text-indigo-400'
                          }`}>
                            {collection.achievements.filter(a => a.unlocked_at).length}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            of {collection.achievements.length} unlocked
                          </div>
                        </div>
                      </div>
                      <motion.div 
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      >
                        {collection.achievements.map((achievement, index) => (
                          <motion.div
                            key={achievement.id}
                            variants={fadeInUp}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <AchievementCard achievement={achievement} isLoading={loading} />
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="time" className="mt-8">
            <motion.div 
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {achievements
                .filter((a) => a.category === 'time')
                .map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    variants={fadeInUp}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <AchievementCard achievement={achievement} isLoading={loading} />
                  </motion.div>
                ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="goals" className="mt-8">
            <motion.div 
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {achievements
                .filter((a) => a.category === 'goals')
                .map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    variants={fadeInUp}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <AchievementCard achievement={achievement} isLoading={loading} />
                  </motion.div>
                ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 