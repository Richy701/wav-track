import React, { useMemo, useState, useEffect } from 'react'
import { MusicNote, CheckCircle, ChartLine, Lightning } from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects } from '@/hooks/useProjects'
import { cn } from '@/lib/utils'
import { getTotalSessionTime } from '@/lib/data'

export function StatsSummary() {
  const { profile } = useAuth()
  const { allProjects } = useProjects()
  const [totalSessionTime, setTotalSessionTime] = useState(0)

  // Fetch total session time
  useEffect(() => {
    const fetchSessionTime = async () => {
      try {
        const time = await getTotalSessionTime()
        setTotalSessionTime(time)
      } catch (error) {
        console.error('Error fetching session time:', error)
      }
    }
    fetchSessionTime()
  }, [])

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
    const sessionScore = Math.min(20, Math.round(totalSessionTime / 60 / 10) * 20)

    // Total score (max 100)
    return beatsScore + completionScore + sessionScore
  }, [activeProjects.length, totalBeats, completedProjects, totalSessionTime])

  const stats = [
    {
      title: 'Productivity Score',
      value: `${productivityScore}%`,
      subtitle: 'Based on beats and completed projects',
      icon: <ChartLine weight="fill" className="w-4 h-4 text-violet-500 dark:text-violet-400" />,
      hover: "hover:border-violet-500 dark:hover:border-violet-400"
    },
    {
      title: 'Total Beats',
      value: totalBeats.toString(),
      subtitle: 'Across all projects',
      icon: <MusicNote weight="fill" className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />,
      hover: "hover:border-indigo-500 dark:hover:border-indigo-400"
    },
    {
      title: 'Completed Projects',
      value: completedProjects.toString(),
      subtitle: 'Successfully finished',
      icon: <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
      hover: "hover:border-emerald-500 dark:hover:border-emerald-400"
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      subtitle: 'Projects completed',
      icon: <Lightning weight="fill" className="w-4 h-4 text-rose-500 dark:text-rose-400" />,
      hover: "hover:border-rose-500 dark:hover:border-rose-400"
    }
  ]

  return (
    <section className="w-full max-w-5xl mx-auto mt-10 px-4">
      <h2 className="text-xl font-semibold mb-6 text-foreground/90">Progress Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map(({ title, value, subtitle, icon, hover }) => (
          <div
            key={title}
            className={cn(
              "relative flex flex-col justify-between",
              "bg-muted/20 border border-border rounded-xl p-5",
              "transition-all duration-300 group hover:shadow-md",
              hover
            )}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
              <div className="bg-muted p-1.5 rounded-md group-hover:scale-105 transition-transform">
                {icon}
              </div>
            </div>
            <p className="text-2xl font-bold mt-2 text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
        ))}
      </div>
    </section>
  )
}