import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'text'
  size?: 'sm' | 'md' | 'lg'
}

export function Skeleton({ 
  className, 
  variant = 'default',
  size = 'md',
  ...props 
}: SkeletonProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  const variantClasses = {
    default: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded'
  }

  return (
    <motion.div
      className={cn(
        "animate-pulse bg-muted",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      {...props}
    />
  )
}
