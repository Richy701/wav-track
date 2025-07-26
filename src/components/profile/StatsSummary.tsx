import React, { useMemo, useState, useEffect, memo } from 'react'
import { MusicNote, Lightning, Clock, Target, ChartLineUp, Trophy, TrendUp, TrendDown, Fire, Star, CheckCircle, Crown, Brain, Timer, Flag } from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects } from '@/hooks/useProjects'
import { useAchievements } from '@/hooks/useAchievements'
import { cn } from '@/lib/utils'
import { getTotalBeatsInTimeRange, getTotalSessionTime } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { format, subDays, isSameDay, startOfWeek, endOfWeek, differenceInDays } from 'date-fns'

// Types
type Stat = {
  title: string
  value: string | number
  subtitle: string
  type: 'primary' | 'secondary' | 'streak' | 'time' | 'goals' | 'achievements'
  trend: string
  priority?: number
  icon?: React.ReactNode
}

type Style = {
  icon: React.ReactNode
  size: 'large' | 'medium' | 'small'
  emphasis: 'high' | 'medium' | 'low'
  gradient: string
}

// Animation variants for premium widget
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95,
    rotateX: -10
  },
  visible: {
    opacity: 1,
    y: 0, 
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const cardHoverVariants = {
  rest: { 
    scale: 1,
    y: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
  },
  hover: { 
    scale: 1.03,
    y: -4,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const iconVariants = {
  rest: { 
    scale: 1,
    rotate: 0
  },
  hover: { 
    scale: 1.1,
    rotate: 5,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
}

const trendVariants = {
  rest: { 
    scale: 1,
    opacity: 0.8
  },
  hover: { 
    scale: 1.15,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
}

const valueVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.8
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

// Premium stat styles with gradients
const statStyles: Record<string, Style> = {
  primary: {
    icon: <MusicNote className="h-5 w-5" weight="fill" />,
    size: 'large',
    emphasis: 'high',
    gradient: 'from-violet-500 via-violet-600 to-purple-600'
  },
  secondary: {
    icon: <ChartLineUp className="h-5 w-5" weight="fill" />,
    size: 'medium',
    emphasis: 'medium',
    gradient: 'from-blue-500 via-blue-600 to-indigo-600'
  },
  streak: {
    icon: <Fire className="h-5 w-5" weight="fill" />,
    size: 'large',
    emphasis: 'high',
    gradient: 'from-orange-500 via-orange-600 to-red-500'
  },
  time: {
    icon: <Clock className="h-5 w-5" weight="fill" />,
    size: 'medium',
    emphasis: 'medium',
    gradient: 'from-emerald-500 via-emerald-600 to-teal-600'
  },
  goals: {
    icon: <Target className="h-5 w-5" weight="fill" />,
    size: 'small',
    emphasis: 'low',
    gradient: 'from-fuchsia-500 via-fuchsia-600 to-pink-600'
  },
  achievements: {
    icon: <Trophy className="h-5 w-5" weight="fill" />,
    size: 'small',
    emphasis: 'low',
    gradient: 'from-amber-500 via-amber-600 to-yellow-500'
  }
}

// Helper to fetch beats in a custom date range
interface BeatActivityCountRow { count: number }
async function getBeatsInRange(start: Date, end: Date) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { data, error } = await supabase
    .from('beat_activities')
    .select('count')
    .eq('user_id', user.id as unknown as string)
    .gte('timestamp', start.getTime())
    .lte('timestamp', end.getTime());
  if (error) return 0;
  return (data as BeatActivityCountRow[])?.reduce((sum, activity) => sum + (activity.count || 0), 0) || 0;
}

// Premium StatCard component
const StatCard = memo(function StatCard({ 
  stat, 
  style,
  isLoading 
}: { 
  stat: Stat
  style: Style
  isLoading: boolean
}) {
  const sizeClasses = {
    large: "p-6",
    medium: "p-5", 
    small: "p-4"
  }
  
  const emphasisClasses = {
    high: "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 shadow-lg hover:shadow-xl",
    medium: "bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-lg",
    low: "bg-white/60 dark:bg-zinc-900/60 border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-md"
  }

  const textSizeClasses = {
    large: "text-2xl",
    medium: "text-xl",
    small: "text-lg"
  }

  // Determine trend icon and value
  let trendIcon = null
  let trendValue = ''
  if (stat.trend.startsWith('+')) {
    trendIcon = <TrendUp className="h-4 w-4 text-green-600 dark:text-green-400" />
    trendValue = stat.trend
  } else if (stat.trend.startsWith('-')) {
    trendIcon = <TrendDown className="h-4 w-4 text-red-600 dark:text-red-400" />
    trendValue = stat.trend
  } else if (stat.trend.includes('🔥')) {
    trendIcon = <Fire className="h-4 w-4 text-orange-500" />
    trendValue = ''
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover="hover"
      initial="rest"
      animate="rest"
      className={cn(
        "relative rounded-2xl border backdrop-blur-sm transition-all duration-300",
        sizeClasses[style.size],
        emphasisClasses[style.emphasis],
        "group overflow-hidden"
      )}
    >
      {/* Gradient background overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300",
        `bg-gradient-to-br ${style.gradient}`
      )} />
      
      {/* Main icon (always present, left-aligned) */}
      <div className="flex items-start justify-between mb-4">
        <motion.div 
          variants={iconVariants}
          className={cn(
            "relative p-3 rounded-xl w-fit",
            `bg-gradient-to-br ${style.gradient}`,
            "shadow-lg"
          )}
        >
          <div className="text-white">
            {style.icon}
          </div>
        </motion.div>
        {/* Trend icon and value (if present, top right, smaller, visually separated) */}
        {(trendIcon || trendValue) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.span 
                  variants={trendVariants}
                  className="ml-2 mt-1 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800/80 px-2 py-1 gap-1 shadow-sm min-w-[32px] min-h-[28px]"
                >
                  {trendIcon}
                  {trendValue && (
                    <motion.span 
                      variants={valueVariants}
                      className={cn(
                        "text-xs font-semibold",
                        trendValue.startsWith('+') ? "text-green-600 dark:text-green-400" : 
                        trendValue.startsWith('-') ? "text-red-600 dark:text-red-400" : 
                        trendValue.includes('🔥') ? "text-orange-500" :
                        "text-zinc-500 dark:text-zinc-400"
                      )}
                    >
                      {trendValue}
                    </motion.span>
                  )}
                </motion.span>
              </TooltipTrigger>
              <TooltipContent sideOffset={4} className="text-xs">
                {stat.trend.includes('🔥') ? 'On fire! Keep it up!' : 'Change vs previous period'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Content */}
      <div className="relative space-y-2">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {stat.title}
        </h3>
        <AnimatePresence mode="wait">
          <motion.p
            key={stat.value}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={valueVariants}
            className={cn(
              "font-bold text-zinc-900 dark:text-white tracking-tight",
              textSizeClasses[style.size]
            )}
          >
            {isLoading ? (
              <div className="h-6 w-16 animate-pulse bg-zinc-200 dark:bg-zinc-700 rounded" />
            ) : (
              stat.value
            )}
          </motion.p>
        </AnimatePresence>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          {stat.subtitle}
        </p>
      </div>
    </motion.div>
  )
})

interface SmartInsight {
  type: 'achievement' | 'prediction' | 'comparison' | 'suggestion'
  title: string
  description: string
  icon: React.ReactNode
  color: string
  priority: number
}



export function StatsSummary() {
  const { profile } = useAuth()
  const { allProjects } = useProjects()
  const { achievements } = useAchievements()

  // --- Monthly Beat Goal ---
  const MONTHLY_BEAT_GOAL = 30 // You can make this dynamic per user later

  // State for real-time data
  const [statsData, setStatsData] = useState({
    dailyBeats: 0,
    weeklyBeats: 0,
    monthlyBeats: 0,
    yearlyBeats: 0,
    prevDailyBeats: 0,
    prevWeeklyBeats: 0,
    prevMonthlyBeats: 0,
    prevYearlyBeats: 0,
    totalSessionTime: 0,
    isLoading: true
  })
  // State for 14-day activity
  const [activity14, setActivity14] = useState<{ date: Date; count: number }[]>([])

  // Filter out soft-deleted projects
  const activeProjects = useMemo(() => 
    allProjects.filter(project => !project.is_deleted),
    [allProjects]
  )

  const totalBeats = activeProjects.length
  const completedProjects = activeProjects.filter(p => p.status === 'completed').length
  const completionRate = activeProjects.length > 0 
    ? Math.round((completedProjects / activeProjects.length) * 100) 
    : 0

  // Fetch all stats data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setStatsData(prev => ({ ...prev, isLoading: true }))
        
        // Current period calculations
        const now = new Date();
        // Day
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        // Previous day
        const yestStart = new Date(todayStart); yestStart.setDate(yestStart.getDate() - 1);
        const yestEnd = new Date(todayStart); yestEnd.setMilliseconds(-1);
        // Week (Monday as first day)
        const weekDay = todayStart.getDay() === 0 ? 6 : todayStart.getDay() - 1;
        const weekStart = new Date(todayStart); weekStart.setDate(todayStart.getDate() - weekDay);
        const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); weekEnd.setHours(23,59,59,999);
        // Previous week
        const prevWeekEnd = new Date(weekStart); prevWeekEnd.setMilliseconds(-1);
        const prevWeekStart = new Date(prevWeekEnd); prevWeekStart.setDate(prevWeekEnd.getDate() - 6); prevWeekStart.setHours(0,0,0,0);
        // Month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        // Previous month
        const prevMonthEnd = new Date(monthStart); prevMonthEnd.setMilliseconds(-1);
        const prevMonthStart = new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), 1);
        // Year
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        // Previous year
        const prevYearEnd = new Date(yearStart); prevYearEnd.setMilliseconds(-1);
        const prevYearStart = new Date(prevYearEnd.getFullYear(), 0, 1);

        // Fetch all time ranges in parallel
        const [
          dailyBeats, prevDailyBeats,
          weeklyBeats, prevWeeklyBeats,
          monthlyBeats, prevMonthlyBeats,
          yearlyBeats, prevYearlyBeats,
          totalSessionTime
        ] = await Promise.all([
          getBeatsInRange(todayStart, todayEnd),
          getBeatsInRange(yestStart, yestEnd),
          getBeatsInRange(weekStart, weekEnd),
          getBeatsInRange(prevWeekStart, prevWeekEnd),
          getBeatsInRange(monthStart, monthEnd),
          getBeatsInRange(prevMonthStart, prevMonthEnd),
          getBeatsInRange(yearStart, yearEnd),
          getBeatsInRange(prevYearStart, prevYearEnd),
          getTotalSessionTime()
        ])
        
        // --- 14-day activity ---
        const { data: { user } } = await supabase.auth.getUser();
        const activityArr: { date: Date; count: number }[] = []
        if (user) {
          const start = subDays(new Date(), 13)
          const end = new Date()
          const { data: beats, error } = await supabase
            .from('beat_activities')
            .select('date,count')
            .eq('user_id', user.id as unknown as string)
            .gte('date', format(start, 'yyyy-MM-dd'))
            .lte('date', format(end, 'yyyy-MM-dd'))
          // Build array for each day
          for (let i = 0; i < 14; i++) {
            const d = subDays(end, 13 - i)
            const found = beats?.find(b => isSameDay(new Date(b.date), d))
            activityArr.push({ date: d, count: found ? found.count : 0 })
          }
        }
        setActivity14(activityArr)

        setStatsData({
          dailyBeats,
          weeklyBeats,
          monthlyBeats,
          yearlyBeats,
          prevDailyBeats,
          prevWeeklyBeats,
          prevMonthlyBeats,
          prevYearlyBeats,
          totalSessionTime,
          isLoading: false
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        setStatsData(prev => ({ ...prev, isLoading: false }))
      }
    }
    fetchData()
  }, [])

  // Calculate unlocked achievements
  const unlockedAchievements = useMemo(() => {
    return achievements.filter(a => a.unlocked_at).length
  }, [achievements])

  // --- Monthly Progress Calculation ---
  const monthlyProgress = Math.min(statsData.monthlyBeats / MONTHLY_BEAT_GOAL, 1)
  const isGoalMet = statsData.monthlyBeats >= MONTHLY_BEAT_GOAL

  // Smart insights calculation
  const calculateInsights = useMemo((): SmartInsight[] => {
    const insights: SmartInsight[] = []
    
    if (!statsData.dailyBeats || !statsData.weeklyBeats || !statsData.monthlyBeats) return insights

    // Goal prediction insight
    const monthlyGoal = 20 // MONTHLY_BEAT_GOAL
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const currentDay = new Date().getDate()
    const daysRemaining = daysInMonth - currentDay + 1
    
    if (statsData.monthlyBeats > 0) {
      const currentRate = statsData.monthlyBeats / currentDay
      const projectedTotal = currentRate * daysInMonth
      const daysToGoal = Math.ceil((monthlyGoal - statsData.monthlyBeats) / currentRate)
      
      if (projectedTotal >= monthlyGoal) {
        insights.push({
          type: 'prediction',
          title: 'Goal Crushing!',
          description: `At this rate, you'll hit your monthly goal in ${daysToGoal} days`,
          icon: <Target className="h-4 w-4" />,
          color: 'text-emerald-600 dark:text-emerald-400',
          priority: 1
        })
      } else {
        insights.push({
          type: 'suggestion',
          title: 'Goal Adjustment',
          description: `You're on track for ${Math.round(projectedTotal)} beats this month. Consider adjusting your goal.`,
          icon: <TrendUp className="h-4 w-4" />,
          color: 'text-blue-600 dark:text-blue-400',
          priority: 2
        })
      }
    }

    // Consistency insight
    if (statsData.weeklyBeats > 0 && statsData.dailyBeats > 0) {
      const weeklyAverage = statsData.weeklyBeats / 7
      const dailyVsWeekly = statsData.dailyBeats / weeklyAverage
      
      if (dailyVsWeekly > 1.5) {
        insights.push({
          type: 'achievement',
          title: 'Hot Streak!',
          description: 'You\'re producing 50% more than your weekly average today!',
          icon: <Fire className="h-4 w-4" />,
          color: 'text-orange-500',
          priority: 1
        })
      } else if (dailyVsWeekly < 0.5) {
        insights.push({
          type: 'suggestion',
          title: 'Slow Start',
          description: 'Today\'s output is below your weekly average. Consider a quick session!',
          icon: <Clock className="h-4 w-4" />,
          color: 'text-yellow-600 dark:text-yellow-400',
          priority: 3
        })
      }
    }

    // Week-over-week comparison
    if (statsData.weeklyBeats > 0 && statsData.prevWeeklyBeats > 0) {
      const weekOverWeek = ((statsData.weeklyBeats - statsData.prevWeeklyBeats) / statsData.prevWeeklyBeats) * 100
      
      if (weekOverWeek > 20) {
        insights.push({
          type: 'achievement',
          title: 'Massive Growth!',
          description: `You're up ${Math.round(weekOverWeek)}% from last week!`,
          icon: <TrendUp className="h-4 w-4" />,
          color: 'text-green-600 dark:text-green-400',
          priority: 1
        })
      } else if (weekOverWeek < -20) {
        insights.push({
          type: 'suggestion',
          title: 'Week-over-Week',
          description: `Down ${Math.round(Math.abs(weekOverWeek))}% from last week. Time to bounce back!`,
          icon: <TrendDown className="h-4 w-4" />,
          color: 'text-red-600 dark:text-red-400',
          priority: 2
        })
      }
    }

    // Best day insight
    if (statsData.dailyBeats > 0) {
      const today = new Date().getDay()
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      
      if (statsData.dailyBeats >= 3) {
        insights.push({
          type: 'achievement',
          title: `${dayNames[today]} Power!`,
          description: `${dayNames[today]}s are becoming your most productive day!`,
          icon: <Star className="h-4 w-4" />,
          color: 'text-purple-600 dark:text-purple-400',
          priority: 2
        })
      }
    }

    return insights.sort((a, b) => a.priority - b.priority).slice(0, 3)
  }, [statsData])



  // Helper to calculate trend string
  function getTrend(current: number, prev: number) {
    if (prev === 0 && current === 0) return ''
    if (current > prev) return `+${current - prev}`
    if (current < prev) return `-${prev - current}`
    return ''
  }

  // Premium stats with better organization
  const stats: Stat[] = [
    // Hero metrics
    {
      title: 'Today\'s Beats',
      value: statsData.dailyBeats,
      subtitle: 'beats created today',
      type: 'primary',
      trend: getTrend(statsData.dailyBeats, statsData.prevDailyBeats),
      priority: 1
    },
    {
      title: 'Current Streak',
      value: profile?.current_streak || 0,
      subtitle: `${profile?.best_streak || 0} day record`,
      type: 'streak',
      trend: (profile?.current_streak || 0) >= (profile?.best_streak || 0) ? '🔥' : '',
      priority: 1
    },
    // Performance metrics
    {
      title: 'Weekly Progress',
      value: statsData.weeklyBeats,
      subtitle: 'beats this week',
      type: 'secondary',
      trend: getTrend(statsData.weeklyBeats, statsData.prevWeeklyBeats),
      priority: 2
    },
    {
      title: 'Studio Hours',
      value: `${Math.round(statsData.totalSessionTime / 60)}h`,
      subtitle: 'this month',
      type: 'time',
      trend: '',
      priority: 2
    },
    // Achievement metrics
    {
      title: 'Success Rate',
      value: `${completionRate}%`,
      subtitle: `${completedProjects}/${totalBeats} completed`,
      type: 'goals',
      trend: '',
      priority: 3
    },
    {
      title: 'Achievements',
      value: `${unlockedAchievements}/${achievements.length}`,
      subtitle: 'unlocked',
      type: 'achievements',
      trend: '',
      priority: 3
    }
  ]

  // --- Activity Heatmap Color ---
  function getHeatColor(count: number) {
    if (count >= 5) return 'bg-emerald-500'
    if (count >= 3) return 'bg-purple-500'
    if (count >= 1) return 'bg-violet-500'
    return 'bg-zinc-200 dark:bg-zinc-800'
  }

  // --- Achievement Icon Mapping ---
  function getAchievementIcon(achievementId: string) {
    const iconMap: Record<string, React.ReactNode> = {
      // Production achievements
      'first_beat': <MusicNote size={16} weight="fill" />,
      'beat_builder': <Trophy size={16} weight="fill" />,
      'beat_machine': <Star size={16} weight="fill" />,
      'legendary_producer': <Crown size={16} weight="fill" />,
      
      // Streak achievements
      'daily_grinder': <Fire size={16} weight="fill" />,
      'consistency_king': <Lightning size={16} weight="fill" />,
      'on_fire': <TrendUp size={16} weight="fill" />,
      
      // Time achievements
      'studio_rat': <Clock size={16} weight="fill" />,
      'time_lord': <Timer size={16} weight="fill" />,
      'focused_af': <Target size={16} weight="fill" />,
      
      // Goal achievements
      'goal_getter': <CheckCircle size={16} weight="fill" />,
      'finish_what_you_start': <Flag size={16} weight="fill" />,
      'big_vision': <Brain size={16} weight="fill" />,
      
      // Default fallback
      'default': <Star size={16} weight="fill" />
    }
    
    return iconMap[achievementId] || iconMap['default']
  }

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 p-8"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-transparent to-purple-500/20" />
      </div>

      {/* Widget Header */}
      <div className="relative mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
            <Star className="h-5 w-5 text-white" weight="fill" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Production Stats
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your music production journey
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid - Premium Layout */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {stats.map((stat) => {
          const style = statStyles[stat.type]
          return (
            <StatCard
              key={stat.title}
              stat={stat}
              style={style}
              isLoading={statsData.isLoading}
            />
          )
        })}
      </motion.div>

      {/* Smart Insights Section */}
      {calculateInsights.length > 0 && (
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.h3 
            className="text-lg font-semibold text-zinc-900 dark:text-white mb-4"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            Smart Insights
          </motion.h3>
          <div className="grid gap-3">
            {calculateInsights.map((insight, index) => (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ 
                  delay: 0.5 + (index * 0.1),
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{ 
                  scale: 1.02,
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-800/50 dark:to-zinc-700/50 border border-zinc-200/50 dark:border-zinc-600/50 backdrop-blur-sm cursor-pointer group hover:shadow-lg hover:border-zinc-300/70 dark:hover:border-zinc-500/70 transition-all duration-300"
              >
                <motion.div 
                  className={`p-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 shadow-sm ${insight.color} group-hover:shadow-md transition-shadow duration-300`}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    transition: { duration: 0.2 }
                  }}
                >
                  {insight.icon}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <motion.h4 
                    className="font-semibold text-zinc-900 dark:text-white text-sm"
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    {insight.title}
                  </motion.h4>
                  <motion.p 
                    className="text-xs text-zinc-600 dark:text-zinc-400 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 + (index * 0.1), duration: 0.3 }}
                  >
                    {insight.description}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
              )}

        {/* Recent Achievements Section */}
        {achievements.filter(a => a.unlocked_at).length > 0 && (
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.h3 
              className="text-lg font-semibold text-zinc-900 dark:text-white mb-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              Recent Achievements
            </motion.h3>
            <div className="flex flex-wrap gap-3">
              {achievements
                .filter(a => a.unlocked_at)
                .slice(0, 4)
                .map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                      delay: 0.8 + (index * 0.1),
                      duration: 0.4,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    whileHover={{ 
                      scale: 1.08,
                      y: -3,
                      rotateY: 5,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 border border-zinc-300/50 dark:border-zinc-600/50 shadow-sm cursor-pointer group hover:shadow-lg hover:border-zinc-400/70 dark:hover:border-zinc-500/70 transition-all duration-300"
                  >
                    <motion.div 
                      className="text-zinc-700 dark:text-zinc-300"
                      whileHover={{ 
                        scale: 1.2,
                        rotate: 10,
                        transition: { duration: 0.2 }
                      }}
                    >
                      {getAchievementIcon(achievement.id)}
                    </motion.div>
                    <motion.div 
                      className="text-xs font-semibold text-zinc-900 dark:text-white"
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                    >
                      {achievement.name}
                    </motion.div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

      {/* Monthly Beat Goal Progress */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Monthly Beat Goal
          </span>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {statsData.monthlyBeats} / {MONTHLY_BEAT_GOAL} beats
          </span>
        </div>
        <div className="relative w-full h-3 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div
            className={cn(
              "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
              isGoalMet
                ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                : "bg-gradient-to-r from-violet-500 to-purple-600"
            )}
            style={{ width: `${monthlyProgress * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          {isGoalMet ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              <CheckCircle className="h-4 w-4" weight="fill" /> Goal met!
            </span>
          ) : (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {MONTHLY_BEAT_GOAL - statsData.monthlyBeats} beats to go this month
            </span>
          )}
        </div>
      </div>

      {/* 14-day Activity Heatmap */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Last 14 Days
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Activity
          </span>
        </div>
        <div className="flex gap-2">
          {activity14.map((a, i) => (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "w-6 h-6 rounded-md border border-zinc-200 dark:border-zinc-800 transition-colors duration-200",
                      getHeatColor(a.count)
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent sideOffset={4} className="text-xs">
                  {format(a.date, 'EEE, MMM d')}: {a.count} beat{a.count === 1 ? '' : 's'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </motion.section>
  )
}