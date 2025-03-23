import React from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  cols?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'small' | 'medium' | 'large'
}

export default function ResponsiveGrid({
  children,
  className,
  cols = { default: 1 },
  gap = 'medium',
  ...props
}: ResponsiveGridProps) {
  const getGridCols = () => {
    const { default: defaultCols, sm, md, lg, xl } = cols
    return cn(
      `grid-cols-${defaultCols}`,
      sm && `sm:grid-cols-${sm}`,
      md && `md:grid-cols-${md}`,
      lg && `lg:grid-cols-${lg}`,
      xl && `xl:grid-cols-${xl}`
    )
  }

  const getGapSize = () => {
    switch (gap) {
      case 'small':
        return 'gap-2 sm:gap-3'
      case 'large':
        return 'gap-6 sm:gap-8'
      default:
        return 'gap-4 sm:gap-6'
    }
  }

  return (
    <div className={cn('grid w-full', getGridCols(), getGapSize(), className)} {...props}>
      {children}
    </div>
  )
}
