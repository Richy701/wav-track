import React from 'react'
import { MusicNote, CheckCircle, ChartLine, Lightning } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface OverviewCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  color: {
    light: string
    dark: string
    gradient: {
      from: string
      to: string
    }
  }
  ariaLabel: string
}

const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  value,
  description,
  icon,
  color,
  ariaLabel,
}) => {
  return (
    <div
      className={cn(
        'group relative bg-card border border-border rounded-lg p-4 text-center overflow-hidden',
        'transition-all duration-300 ease-out hover:scale-[1.02]',
        'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
        'hover:border-primary/20 dark:hover:border-primary/20'
      )}
      aria-label={ariaLabel}
    >
      {/* Gradient overlay on hover */}
      <span
        className={cn(
          'absolute inset-0 bg-gradient-to-tr opacity-0',
          'transition-opacity duration-300 pointer-events-none rounded-lg',
          'group-hover:opacity-100',
          `group-hover:from-${color.gradient.from}/20 group-hover:to-${color.gradient.to}/20`
        )}
      />

      {/* Icon container */}
      <div
        className={cn(
          'relative mx-auto mb-2 flex items-center justify-center',
          'w-10 h-10 rounded-full bg-muted',
          'transition-all duration-300 ease-out',
          'group-hover:scale-110 group-hover:shadow-sm',
          'group-hover:bg-muted/80',
          `text-${color.light} dark:text-${color.dark}`
        )}
      >
        {icon}
      </div>

      {/* Value */}
      <div
        className={cn(
          'relative text-2xl font-bold',
          'transition-colors duration-300',
          `text-${color.light} dark:text-${color.dark}`
        )}
      >
        {value}
      </div>

      {/* Title */}
      <div className="relative text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
        {title}
      </div>

      {/* Description */}
      <div className="relative text-xs text-muted-foreground mt-1">
        {description}
      </div>
    </div>
  )
}

interface ProjectOverviewProps {
  totalBeats: number
  completedProjects: number
  productivityScore: number
  successRate: number
}

export function ProjectOverview({
  totalBeats,
  completedProjects,
  productivityScore,
  successRate,
}: ProjectOverviewProps) {
  return (
    <div className="bg-background border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground">Progress Overview</h2>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <OverviewCard
          title="Total Beats"
          value={totalBeats}
          description="Across all projects"
          icon={<MusicNote className="w-5 h-5" weight="fill" />}
          color={{
            light: 'indigo-500',
            dark: 'indigo-400',
            gradient: {
              from: 'indigo-500',
              to: 'violet-500',
            },
          }}
          ariaLabel={`Total Beats: ${totalBeats} - Across all projects`}
        />

        <OverviewCard
          title="Completed Projects"
          value={completedProjects}
          description="Successfully finished"
          icon={<CheckCircle className="w-5 h-5" weight="fill" />}
          color={{
            light: 'emerald-500',
            dark: 'emerald-400',
            gradient: {
              from: 'emerald-500',
              to: 'teal-500',
            },
          }}
          ariaLabel={`Completed Projects: ${completedProjects} - Successfully finished`}
        />

        <OverviewCard
          title="Productivity Score"
          value={`${productivityScore}%`}
          description="Based on beats and completed projects"
          icon={<ChartLine className="w-5 h-5" weight="fill" />}
          color={{
            light: 'violet-500',
            dark: 'violet-400',
            gradient: {
              from: 'violet-500',
              to: 'purple-500',
            },
          }}
          ariaLabel={`Productivity Score: ${productivityScore}% - Based on beats and completed projects`}
        />

        <OverviewCard
          title="Success Rate"
          value={`${successRate}%`}
          description="Projects completed"
          icon={<Lightning className="w-5 h-5" weight="fill" />}
          color={{
            light: 'rose-500',
            dark: 'rose-400',
            gradient: {
              from: 'rose-500',
              to: 'pink-500',
            },
          }}
          ariaLabel={`Success Rate: ${successRate}% - Projects completed`}
        />
      </div>
    </div>
  )
} 