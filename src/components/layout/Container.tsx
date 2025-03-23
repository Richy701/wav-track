import React from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
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
      case 'xs':
        return 'max-w-2xl'
      case 'sm':
        return 'max-w-3xl'
      case 'md':
        return 'max-w-4xl'
      case 'lg':
        return 'max-w-6xl'
      case 'xl':
        return 'max-w-7xl'
      case '2xl':
        return 'max-w-[1536px]'
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
      case 'xs':
        return 'px-3 py-3 sm:px-4 sm:py-4'
      case 'sm':
        return 'px-4 py-4 sm:px-6 sm:py-6'
      case 'lg':
        return 'px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16'
      case 'xl':
        return 'px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24'
      default: // md
        return 'px-4 py-6 sm:px-6 sm:py-8 lg:px-8'
    }
  }

  return (
    <div 
      className={cn(
        'w-full mx-auto',
        getSizeClass(),
        getPaddingClass(),
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}
