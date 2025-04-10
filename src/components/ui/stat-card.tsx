import { cn } from '@/lib/utils'
import { StatCardSkeleton } from './stat-card-skeleton'
import { memo } from 'react'
import { FadeIn } from './fade-in'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  isLoading?: boolean
  className?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export const StatCard = memo(function StatCard({
  title,
  value,
  description,
  icon,
  isLoading = false,
  className,
  trend
}: StatCardProps) {
  if (isLoading) {
    return <StatCardSkeleton className={className} />
  }

  return (
    <FadeIn>
      <div
        className={cn(
          'relative h-[160px] w-full rounded-xl bg-gradient-to-b from-card/80 to-card p-6',
          'border border-border/50 shadow-sm backdrop-blur-sm',
          'transition-all duration-300 ease-in-out',
          'hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-0.5',
          'after:absolute after:inset-0 after:rounded-xl after:ring-1 after:ring-inset after:ring-white/5',
          className
        )}
      >
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground/90">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground/70 leading-relaxed max-w-[180px]">{description}</p>
            )}
          </div>
          {icon && (
            <div className="p-2 rounded-lg bg-primary/5 text-primary/80 ring-1 ring-primary/10">
              {icon}
            </div>
          )}
        </div>
        <div className="mt-4 relative z-10">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              {value}
            </p>
            {trend && (
              <span
                className={cn(
                  'text-sm font-semibold',
                  trend.isPositive ? 'text-green-500' : 'text-red-500'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
        </div>
      </div>
    </FadeIn>
  )
}) 