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
          'h-[160px] w-full rounded-lg bg-card p-6',
          'border border-border/50 shadow-sm',
          'transition-all duration-200 hover:shadow-md',
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold">{value}</p>
            {trend && (
              <span
                className={cn(
                  'text-sm font-medium',
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