import React from 'react'
import { cn } from '@/lib/utils'

interface ChartContainerProps {
  children: React.ReactNode
  config?: {
    height?: string | number
    width?: string | number
    className?: string
  }
}

export function ChartContainer({ children, config }: ChartContainerProps) {
  const { height = '100%', width = '100%', className } = config || {}

  return (
    <div 
      className={cn('relative', className)}
      style={{ 
        height,
        width,
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        perspective: 1000,
      }}
    >
      {children}
    </div>
  )
} 