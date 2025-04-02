import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface StatCardSkeletonProps {
  className?: string
  title?: string
  description?: string
  showIcon?: boolean
  iconSize?: 'sm' | 'md' | 'lg'
}

export const StatCardSkeleton = ({
  className,
  title = 'Loading...',
  description = 'Loading data...',
  showIcon = true,
  iconSize = 'md'
}: StatCardSkeletonProps) => {
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <motion.div
      className={cn(
        'h-[160px] w-full rounded-lg bg-card p-6',
        'border border-border/50 shadow-sm',
        className
      )}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-3 w-32 bg-muted rounded animate-pulse" />
        </div>
        {showIcon && (
          <div className={cn('bg-muted rounded-full animate-pulse', iconSizes[iconSize])} />
        )}
      </div>
      <div className="mt-4">
        <div className="h-6 w-16 bg-muted rounded animate-pulse" />
        <div className="mt-2 h-3 w-24 bg-muted rounded animate-pulse" />
      </div>
    </motion.div>
  )
} 