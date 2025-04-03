import React, { useMemo } from 'react'
import { MusicNote, CheckCircle, ChartLine, Lightning } from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects } from '@/hooks/useProjects'
import { cn } from '@/lib/utils'

export function StatsSummary() {
  const { profile } = useAuth()
  const { allProjects } = useProjects()

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

  // Calculate productivity score
  const productivityScore = useMemo(() => {
    if (activeProjects.length === 0) return 0

    // Base score from total beats (max 50 points)
    const beatsScore = Math.min(50, Math.round((totalBeats / 20) * 50))

    // Score from completed projects (max 30 points)
    const completionScore = Math.min(30, completedProjects * 5)

    // Score from active sessions (max 20 points)
    const sessionScore = Math.min(20, Math.round((profile?.total_session_time || 0) / 60 / 10) * 20)

    // Total score (max 100)
    return beatsScore + completionScore + sessionScore
  }, [activeProjects.length, totalBeats, completedProjects, profile?.total_session_time])

  const stats = [
    {
      title: 'Productivity Score',
      value: `${productivityScore}%`,
      subtitle: 'Based on beats and completed projects',
      icon: <ChartLine weight="fill" className="w-4 h-4 text-violet-500 dark:text-violet-400" />
    },
    {
      title: 'Total Beats',
      value: totalBeats.toString(),
      subtitle: 'Across all projects',
      icon: <MusicNote weight="fill" className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
    },
    {
      title: 'Completed Projects',
      value: completedProjects.toString(),
      subtitle: 'Successfully finished',
      icon: <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      subtitle: 'Projects completed',
      icon: <Lightning weight="fill" className="w-4 h-4 text-rose-500 dark:text-rose-400" />
    }
  ]

  return (
    <div className="bg-white dark:bg-background border border-zinc-200 dark:border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-foreground">Progress Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 mt-4">
        {stats.map(({ title, value, subtitle, icon }) => (
          <div
            key={title}
            className={cn(
              "rounded-xl p-4 sm:p-5 transition-all",
              "bg-white dark:bg-zinc-900",
              "text-black dark:text-white",
              "border border-zinc-200 dark:border-zinc-800",
              "hover:shadow-md dark:hover:shadow-lg",
              "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-sm sm:text-base cursor-help" data-state="closed">
                {title}
              </h3>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                {icon}
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">{value}</p>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}