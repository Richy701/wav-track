import React from 'react'
import { cn } from '@/lib/utils'

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  dividers?: boolean
  align?: 'start' | 'center' | 'end'
  justify?: 'start' | 'center' | 'end' | 'between'
}

export default function Stack({
  children,
  className,
  spacing = 'md',
  dividers = false,
  align = 'start',
  justify = 'start',
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

  const getJustify = () => {
    switch (justify) {
      case 'center':
        return 'justify-center'
      case 'end':
        return 'justify-end'
      case 'between':
        return 'justify-between'
      default: // start
        return 'justify-start'
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col w-full',
        getSpacingClass(),
        getAlignment(),
        getJustify(),
        dividers && 'divide-y divide-border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
