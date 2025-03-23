import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MusicNote, CheckCircle, ChartLineUp, Target } from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'

export function StatsSummary() {
  const { profile } = useAuth()

  const stats = [
    {
      title: 'Total Beats',
      value: profile?.total_beats || 0,
      icon: <MusicNote weight="fill" className="w-5 h-5" />,
      description: 'Across all projects',
      iconColor: 'text-indigo-500 dark:text-indigo-400',
      hoverGradient: 'group-hover:from-indigo-500/20 group-hover:to-violet-500/20',
    },
    {
      title: 'Completed Projects',
      value: profile?.completed_projects || 0,
      icon: <CheckCircle weight="fill" className="w-5 h-5" />,
      description: 'Successfully finished',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      hoverGradient: 'group-hover:from-emerald-500/20 group-hover:to-teal-500/20',
    },
    {
      title: 'Productivity Score',
      value: `${profile?.productivity_score || 0}%`,
      icon: <ChartLineUp weight="fill" className="w-5 h-5" />,
      description: 'Based on beats and completed projects',
      iconColor: 'text-violet-500 dark:text-violet-400',
      hoverGradient: 'group-hover:from-violet-500/20 group-hover:to-purple-500/20',
    },
    {
      title: 'Success Rate',
      value: `${profile?.completion_rate || 0}%`,
      icon: <Target weight="fill" className="w-5 h-5" />,
      description: 'Projects completed',
      iconColor: 'text-rose-500 dark:text-rose-400',
      hoverGradient: 'group-hover:from-rose-500/20 group-hover:to-pink-500/20',
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
                          transition-opacity duration-300 pointer-events-none rounded-lg ${stat.hoverGradient}`}
            />

            <div
              className={`relative mx-auto mb-2 flex items-center justify-center w-10 h-10 rounded-full 
                           bg-muted ${stat.iconColor}
                           transition-all duration-300 ease-out
                           group-hover:scale-110 group-hover:shadow-sm
                           group-hover:bg-muted/80`}
            >
              {stat.icon}
            </div>
            <div
              className={`relative text-2xl font-bold transition-colors duration-300 ${stat.iconColor}`}
            >
              {stat.value}
            </div>
            <div className="relative text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
              {stat.title}
            </div>
            <div className="relative text-xs text-muted-foreground mt-1">{stat.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
