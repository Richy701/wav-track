import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullScreen?: boolean
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
}

export const LoadingSpinner = ({ 
  size = 'md', 
  className,
  fullScreen = false 
}: LoadingSpinnerProps) => {
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  }

  const containerClasses = cn(
    'flex items-center justify-center',
    fullScreen && 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
    className
  )

  return (
    <div className={containerClasses}>
      <motion.div
        className={cn(
          'border-2 border-primary border-t-transparent rounded-full',
          sizeMap[size]
        )}
        variants={spinnerVariants}
        animate="animate"
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      />
    </div>
  )
} 