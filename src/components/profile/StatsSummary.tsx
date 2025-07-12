import React, { useMemo, useState, useEffect, memo } from 'react'
import { MusicNote, CheckCircle, ChartLine, Lightning } from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects } from '@/hooks/useProjects'
import { useAchievements } from '@/hooks/useAchievements'
import { cn } from '@/lib/utils'
import { getTotalBeatsInTimeRange, getTotalSessionTime } from '@/lib/data'
import { motion } from 'framer-motion'
import { 
  Trophy,
  Clock,
  Target,
  ChartLineUp,
  Star,
  Crown
} from '@phosphor-icons/react'

// Add types for StatCard props
type Stat = {
  title: string;
  value: string | number;
  subtitle: string;
  type: string;
  trend: string;
};
type Style = {
  icon: React.ReactNode;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
}

const statStyles = {
  beats: {
    gradient: 'from-violet-400 to-violet-600',
    icon: <MusicNote className="h-5 w-5" weight="fill" />,
    ring: 'ring-violet-400/20',
    shadow: 'shadow-violet-400/20'
  },
  streak: {
    gradient: 'from-orange-400 to-orange-600',
    icon: <Lightning className="h-5 w-5" weight="fill" />,
    ring: 'ring-orange-400/20',
    shadow: 'shadow-orange-400/20'
  },
  time: {
    gradient: 'from-blue-400 to-blue-600',
    icon: <Clock className="h-5 w-5" weight="fill" />,
    ring: 'ring-blue-400/20',
    shadow: 'shadow-blue-400/20'
  },
  goals: {
    gradient: 'from-emerald-400 to-emerald-600',
    icon: <Target className="h-5 w-5" weight="fill" />,
    ring: 'ring-emerald-400/20',
    shadow: 'shadow-emerald-400/20'
  },
  progress: {
    gradient: 'from-fuchsia-400 to-pink-600',
    icon: <ChartLineUp className="h-5 w-5" weight="fill" />,
    ring: 'ring-fuchsia-400/20',
    shadow: 'shadow-fuchsia-400/20'
  },
  achievements: {
    gradient: 'from-amber-400 to-yellow-600',
    icon: <Trophy className="h-5 w-5" weight="fill" />,
    ring: 'ring-amber-400/20',
    shadow: 'shadow-amber-400/20'
  }
}

// Memoized StatCard for performance
const StatCard = memo(function StatCard({ stat, style, onClick }: { stat: Stat; style: Style; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
      className={cn(
        "relative p-4 h-full rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md w-full text-left group focus:outline-none focus:ring-2 transition",
      )}
      onClick={onClick}
      aria-label={`View details for ${stat.title}`}
      type="button"
    >
      <div className={cn(
        "p-2 rounded-xl mb-3 w-fit",
        stat.type === 'beats' && "bg-violet-100 text-violet-600 dark:bg-violet-800 dark:text-violet-200",
        stat.type === 'streak' && "bg-orange-100 text-orange-600 dark:bg-orange-800 dark:text-orange-200",
        stat.type === 'time' && "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200",
        stat.type === 'goals' && "bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-200",
        stat.type === 'progress' && "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-800 dark:text-fuchsia-200",
        stat.type === 'achievements' && "bg-amber-100 text-amber-600 dark:bg-amber-800 dark:text-amber-200"
      )}>
        {style.icon}
      </div>
      <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-0.5">{stat.title}</h3>
      <motion.p
        className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mb-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {stat.value}
      </motion.p>
      <p className="text-xs text-zinc-700 dark:text-white/70 mb-3">{stat.subtitle}</p>
      {/* Progress bar or other details can go here */}
      <div className="mt-3 pt-3 text-xs border-t border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-white/80">
        {stat.trend}
      </div>
      {/* Placeholder for modal/drawer expansion */}
    </motion.button>
  );
});

export function StatsSummary() {
  const { profile } = useAuth()
  const { allProjects } = useProjects()
  const { achievements } = useAchievements()
  const [monthlyBeats, setMonthlyBeats] = useState(0)
  const [lastMonthBeats, setLastMonthBeats] = useState(0)
  const [totalSessionTime, setTotalSessionTime] = useState(0)
  const [lastMonthSessionTime, setLastMonthSessionTime] = useState(0)

  // Filter out soft-deleted projects and calculate stats
  const activeProjects = useMemo(() => 
    allProjects.filter(project => !project.is_deleted),
    [allProjects]
  )

  const totalBeats = activeProjects.length
  const completedProjects = activeProjects.filter(p => p.status === 'completed').length
  const completionRate = activeProjects.length > 0 
    ? Math.round((completedProjects / activeProjects.length) * 100) 
    : 0

  // Fetch monthly beats and session time
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current month's beats
        const thisMonth = await getTotalBeatsInTimeRange('month')
        setMonthlyBeats(thisMonth)

        // Get last month's beats
        const lastMonth = await getTotalBeatsInTimeRange('month') // TODO: Add support for previous month
        setLastMonthBeats(lastMonth)

        // Get session times
        const totalTime = await getTotalSessionTime()
        setTotalSessionTime(totalTime)

        // TODO: Add support for last month's session time
        setLastMonthSessionTime(0)
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    fetchData()
  }, [])

  // Calculate unlocked achievements
  const unlockedAchievements = useMemo(() => {
    return achievements.filter(a => a.unlocked_at).length
  }, [achievements])

  const stats = [
    {
      title: 'Total Beats',
      value: totalBeats.toString(),
      subtitle: `${monthlyBeats} beats this month`,
      type: 'beats',
      trend: `${monthlyBeats > lastMonthBeats ? '+' : ''}${monthlyBeats - lastMonthBeats} from last month`
    },
    {
      title: 'Current Streak',
      value: profile?.current_streak || '0',
      subtitle: `Best: ${profile?.best_streak || '0'} days`,
      type: 'streak',
      trend: (profile?.current_streak || 0) >= (profile?.best_streak || 0) ? 'On track for a new record!' : 'Keep it going!'
    },
    {
      title: 'Studio Time',
      value: `${Math.round(totalSessionTime / 60)}h`,
      subtitle: 'This month',
      type: 'time',
      trend: `${totalSessionTime > lastMonthSessionTime ? '+' : ''}${Math.round((totalSessionTime - lastMonthSessionTime) / 60)}h from last month`
    },
    {
      title: 'Goals Completed',
      value: `${completedProjects}/${totalBeats}`,
      subtitle: 'Completion rate',
      type: 'goals',
      trend: `${completionRate}% completion rate`
    },
    {
      title: 'Progress',
      value: `${completionRate}%`,
      subtitle: 'Completion rate',
      type: 'progress',
      trend: `${completedProjects} of ${totalBeats} beats completed`
    },
    {
      title: 'Achievements',
      value: `${unlockedAchievements}/${achievements.length}`,
      subtitle: 'Total unlocked',
      type: 'achievements',
      trend: `${achievements.length - unlockedAchievements} more to unlock`
    }
  ]

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-8 dark:bg-zinc-950/50"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">Progress Overview</h2>
      </div>
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch"
      >
        {stats.map((stat) => {
          const style = statStyles[stat.type as keyof typeof statStyles];
          return (
            <StatCard
              key={stat.title}
              stat={stat}
              style={style}
              onClick={() => {/* Placeholder for modal/drawer expansion */}}
            />
          );
        })}
      </motion.div>
    </motion.section>
  )
}