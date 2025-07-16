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
          'relative h-[160px] w-full rounded-xl',
          'bg-white dark:bg-black/20',
          'border border-white/10 dark:border-white/5',
          'shadow-lg shadow-black/5 dark:shadow-black/10',
          'transition-all duration-300 ease-out',
          'hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1',
          'after:absolute after:inset-0 after:rounded-xl after:ring-1 after:ring-inset after:ring-white/10',
          className
        )}
      >
        <div className="flex items-start justify-between relative z-10 p-6">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-zinc-100/90 dark:text-zinc-200/90">{title}</h3>
            {description && (
              <p className="text-xs font-medium text-zinc-400/90 dark:text-zinc-400/80 leading-relaxed max-w-[180px]">{description}</p>
            )}
          </div>
          {icon && (
            <div className="p-2.5 rounded-xl bg-white/5 dark:bg-black/20 text-primary/90 ring-1 ring-white/10 dark:ring-white/5 backdrop-blur-sm">
              {icon}
            </div>
          )}
        </div>
        <div className="px-6 pb-6 relative z-10">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-zinc-400/90 dark:from-zinc-100 dark:to-zinc-400/80 bg-clip-text text-transparent">
              {value}
            </p>
            {trend && (
              <span
                className={cn(
                  'text-sm font-semibold',
                  trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-60" />
      </div>
    </FadeIn>
  )
}) 