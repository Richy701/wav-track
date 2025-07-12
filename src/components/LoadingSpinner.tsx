import { memo } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullScreen?: boolean
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32
}

const LoadingSpinnerInner = ({ 
  size = 'md', 
  className,
  fullScreen = false 
}: LoadingSpinnerProps) => {
  const containerClasses = cn(
    'flex items-center justify-center',
    fullScreen && 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
    className
  )

  return (
    <div className={containerClasses}>
      <Spinner 
        variant="circle-filled"
        size={sizeMap[size]}
        className="text-primary"
      />
    </div>
  )
}

LoadingSpinnerInner.displayName = 'LoadingSpinnerInner'

export const LoadingSpinner = memo(LoadingSpinnerInner) 