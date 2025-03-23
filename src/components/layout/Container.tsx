import React from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export default function Container({
  children,
  className,
  size = 'lg',
  padding = 'md',
  ...props
}: ContainerProps) {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'max-w-3xl'
      case 'md':
        return 'max-w-4xl'
      case 'lg':
        return 'max-w-6xl'
      case 'xl':
        return 'max-w-7xl'
      case 'full':
        return 'max-w-full'
      default:
        return 'max-w-6xl'
    }
  }

  const getPaddingClass = () => {
    switch (padding) {
      case 'none':
        return ''
      case 'sm':
        return 'px-4 py-4 sm:px-6 sm:py-6'
      case 'lg':
        return 'px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16'
      default: // md
        return 'px-4 py-6 sm:px-6 sm:py-8 lg:px-8'
    }
  }

  return (
    <div className={cn('w-full mx-auto', getSizeClass(), getPaddingClass(), className)} {...props}>
      {children}
    </div>
  )
}
