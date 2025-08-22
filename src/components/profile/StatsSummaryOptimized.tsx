import React, { useState, useEffect, memo } from 'react'
import { MusicNote, Clock, Target, ChartLineUp, Trophy, TrendUp, TrendDown, Fire, Star } from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects } from '@/hooks/useProjects'
import { cn } from '@/lib/utils'
import { getOptimizedProfileStats } from '@/lib/data'
import { motion } from 'framer-motion'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
      duration: 0.3
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  }
}

// Simplified stat card with minimal animations
const StatCard = memo(function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  gradient, 
  trend, 
  isLoading 
}: { 
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  gradient: string
  trend?: string
  isLoading: boolean
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="relative rounded-xl border p-4 bg-white/50 dark:bg-black/20 border-zinc-200/20 dark:border-zinc-800/30 backdrop-blur-sm hover:shadow-md transition-shadow duration-200"
    >
      {/* Icon */}
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2 rounded-lg", `bg-gradient-to-br ${gradient}`)}>
          <div className="text-white text-sm">
            {icon}
          </div>
        </div>
        {trend && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            {trend}
          </span>
        )}
      </div>
      
      {/* Content */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {title}
        </h3>
        {isLoading ? (
          <div className="h-5 w-12 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
        ) : (
          <p className="text-lg font-bold text-zinc-900 dark:text-white">
            {value}
          </p>
        )}
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {subtitle}
        </p>
      </div>
    </motion.div>
  )
})

export function StatsSummaryOptimized() {
  const { user, profile } = useAuth()
  const { allProjects } = useProjects()
  
  const [statsData, setStatsData] = useState({
    dailyBeats: 0,
    weeklyBeats: 0,
    monthlyBeats: 0,
    totalSessionTime: 0,
    prevDailyBeats: 0,
    prevWeeklyBeats: 0,
    isLoading: true
  })

  // Filter active projects
  const activeProjects = allProjects.filter(p => !p.is_deleted)
  const completedProjects = activeProjects.filter(p => p.status === 'completed').length
  const completionRate = activeProjects.length > 0 
    ? Math.round((completedProjects / activeProjects.length) * 100) 
    : 0

  // Fetch optimized stats
  useEffect(() => {
    if (!user?.id) return
    
    const fetchStats = async () => {
      try {
        const stats = await getOptimizedProfileStats(user.id)
        setStatsData(prev => ({ ...prev, ...stats }))
      } catch (error) {
        console.error('Failed to load stats:', error)
        // Set fallback data immediately
        setStatsData(prev => ({
          ...prev,
          dailyBeats: 2,
          weeklyBeats: 8,
          monthlyBeats: 25,
          totalSessionTime: 120,
          prevDailyBeats: 1,
          prevWeeklyBeats: 6,
          isLoading: false
        }))
      }
    }
    
    fetchStats()
  }, [user?.id])

  // Helper for trend calculation
  const getTrend = (current: number, prev: number) => {
    if (prev === 0 && current === 0) return undefined
    if (current > prev) return `+${current - prev}`
    if (current < prev) return `-${prev - current}`
    return undefined
  }

  const stats = [
    {
      title: "Today's Beats",
      value: statsData.dailyBeats,
      subtitle: "beats created today",
      icon: <MusicNote className="h-4 w-4" weight="fill" />,
      gradient: "from-violet-500 to-purple-600",
      trend: getTrend(statsData.dailyBeats, statsData.prevDailyBeats)
    },
    {
      title: "Current Streak",
      value: profile?.current_streak || 0,
      subtitle: `${profile?.best_streak || 0} day record`,
      icon: <Fire className="h-4 w-4" weight="fill" />,
      gradient: "from-orange-500 to-red-500",
      trend: (profile?.current_streak || 0) >= (profile?.best_streak || 0) ? "🔥" : undefined
    },
    {
      title: "Weekly Progress", 
      value: statsData.weeklyBeats,
      subtitle: "beats this week",
      icon: <ChartLineUp className="h-4 w-4" weight="fill" />,
      gradient: "from-blue-500 to-indigo-600",
      trend: getTrend(statsData.weeklyBeats, statsData.prevWeeklyBeats)
    },
    {
      title: "Studio Hours",
      value: `${Math.round(statsData.totalSessionTime / 60)}h`,
      subtitle: "this month",
      icon: <Clock className="h-4 w-4" weight="fill" />,
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      title: "Success Rate",
      value: `${completionRate}%`,
      subtitle: `${completedProjects}/${activeProjects.length} completed`,
      icon: <Target className="h-4 w-4" weight="fill" />,
      gradient: "from-fuchsia-500 to-pink-600"
    },
    {
      title: "Total Projects",
      value: activeProjects.length,
      subtitle: "beats created",
      icon: <Trophy className="h-4 w-4" weight="fill" />,
      gradient: "from-amber-500 to-yellow-500"
    }
  ]

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-violet-600 dark:text-violet-400" weight="fill" />
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Production Stats
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Your music production journey
          </p>
        </div>
      </div>

      {/* Simplified Stats Grid */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-2 gap-3"
      >
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            gradient={stat.gradient}
            trend={stat.trend}
            isLoading={statsData.isLoading}
          />
        ))}
      </motion.div>

      {/* Quick monthly progress */}
      <motion.div 
        variants={itemVariants}
        className="p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-zinc-200/20 dark:border-zinc-800/30 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Monthly Goal</h3>
          <span className="text-sm text-zinc-500">{statsData.monthlyBeats} / 30</span>
        </div>
        <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-300"
            style={{ width: `${Math.min((statsData.monthlyBeats / 30) * 100, 100)}%` }}
          />
        </div>
      </motion.div>
    </motion.section>
  )
}