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
    '2xl'?: number
  }
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end'
}

export default function ResponsiveGrid({
  children,
  className,
  cols = { default: 1 },
  gap = 'md',
  align = 'start',
  ...props
}: ResponsiveGridProps) {
  const getGridCols = () => {
    const { default: defaultCols, sm, md, lg, xl, '2xl': twoXl } = cols
    return cn(
      `grid-cols-${defaultCols}`,
      sm && `sm:grid-cols-${sm}`,
      md && `md:grid-cols-${md}`,
      lg && `lg:grid-cols-${lg}`,
      xl && `xl:grid-cols-${xl}`,
      twoXl && `2xl:grid-cols-${twoXl}`
    )
  }

  const getGapSize = () => {
    switch (gap) {
      case 'none':
        return ''
      case 'xs':
        return 'gap-2 sm:gap-3'
      case 'sm':
        return 'gap-3 sm:gap-4'
      case 'lg':
        return 'gap-6 sm:gap-8'
      case 'xl':
        return 'gap-8 sm:gap-12'
      default: // md
        return 'gap-4 sm:gap-6'
    }
  }

  const getAlignment = () => {
    switch (align) {
      case 'center':
        return 'items-center'
      case 'end':
        return 'items-end'
      default: // start
        return 'items-start'
    }
  }

  return (
    <div 
      className={cn(
        'grid w-full',
        getGridCols(),
        getGapSize(),
        getAlignment(),
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}
