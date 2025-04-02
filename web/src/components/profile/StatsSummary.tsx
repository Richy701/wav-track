import React, { useMemo } from 'react'
import { MusicNote, CheckCircle, ChartLine, Lightning } from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects } from '@/hooks/useProjects'

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
      title: 'Total Beats',
      value: totalBeats,
      icon: <MusicNote weight="fill" className="w-5 h-5" />,
      description: 'Across all projects',
      color: {
        light: 'indigo-500',
        dark: 'indigo-400',
        gradient: {
          from: 'indigo-500',
          to: 'violet-500',
        },
      },
    },
    {
      title: 'Completed Projects',
      value: completedProjects,
      icon: <CheckCircle weight="fill" className="w-5 h-5" />,
      description: 'Successfully finished',
      color: {
        light: 'emerald-500',
        dark: 'emerald-400',
        gradient: {
          from: 'emerald-500',
          to: 'teal-500',
        },
      },
    },
    {
      title: 'Productivity Score',
      value: `${productivityScore}%`,
      icon: <ChartLine weight="fill" className="w-5 h-5" />,
      description: 'Based on beats and completed projects',
      color: {
        light: 'violet-500',
        dark: 'violet-400',
        gradient: {
          from: 'violet-500',
          to: 'purple-500',
        },
      },
    },
    {
      title: 'Success Rate',
      value: `${completionRate}%`,
      icon: <Lightning weight="fill" className="w-5 h-5" />,
      description: 'Projects completed',
      color: {
        light: 'rose-500',
        dark: 'rose-400',
        gradient: {
          from: 'rose-500',
          to: 'pink-500',
        },
      },
    },
  ]

  return (
    <div className="bg-background border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground">Progress Overview</h2>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group relative bg-card border border-border rounded-lg p-4 text-center overflow-hidden
                     transition-all duration-300 ease-out
                     hover:scale-[1.02] hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20
                     hover:border-primary/20 dark:hover:border-primary/20"
            aria-label={`${stat.title}: ${stat.value} - ${stat.description}`}
          >
            {/* Gradient overlay on hover */}
            <span
              className={`absolute inset-0 bg-gradient-to-tr opacity-0 group-hover:opacity-100 
                          transition-opacity duration-300 pointer-events-none rounded-lg
                          group-hover:from-${stat.color.gradient.from}/20 group-hover:to-${stat.color.gradient.to}/20`}
            />

            {/* Icon container */}
            <div
              className={`relative mx-auto mb-2 flex items-center justify-center w-10 h-10 rounded-full 
                           bg-muted text-${stat.color.light} dark:text-${stat.color.dark}
                           transition-all duration-300 ease-out
                           group-hover:scale-110 group-hover:shadow-sm
                           group-hover:bg-muted/80`}
            >
              {stat.icon}
            </div>

            {/* Value */}
            <div
              className={`relative text-2xl font-bold transition-colors duration-300
                         text-${stat.color.light} dark:text-${stat.color.dark}`}
            >
              {stat.value}
            </div>

            {/* Title */}
            <div className="relative text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
              {stat.title}
            </div>

            {/* Description */}
            <div className="relative text-xs text-muted-foreground mt-1">
              {stat.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
