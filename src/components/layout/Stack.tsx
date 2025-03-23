import React from 'react'
import { cn } from '@/lib/utils'

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  dividers?: boolean
}

export default function Stack({
  children,
  className,
  spacing = 'md',
  dividers = false,
  ...props
}: StackProps) {
  const getSpacingClass = () => {
    switch (spacing) {
      case 'none':
        return ''
      case 'xs':
        return 'space-y-1 sm:space-y-2'
      case 'sm':
        return 'space-y-2 sm:space-y-3'
      case 'lg':
        return 'space-y-6 sm:space-y-8'
      case 'xl':
        return 'space-y-8 sm:space-y-12'
      default: // md
        return 'space-y-4 sm:space-y-6'
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col w-full',
        getSpacingClass(),
        dividers && 'divide-y divide-border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
