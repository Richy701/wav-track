import * as React from 'react'
import { cn } from '@/lib/utils'

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'thin' | 'rounded' | 'hide'
  orientation?: 'vertical' | 'horizontal' | 'both'
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, variant = 'default', orientation = 'vertical', children, ...props }, ref) => {
    const scrollClasses = cn(
      // Base styles
      'relative',
      // Orientation styles
      orientation === 'vertical' && 'overflow-y-auto overflow-x-hidden',
      orientation === 'horizontal' && 'overflow-x-auto overflow-y-hidden',
      orientation === 'both' && 'overflow-auto',
      // Variant styles
      variant === 'thin' && 'scrollbar-thin',
      variant === 'rounded' && 'scrollbar-rounded',
      variant === 'hide' && 'scrollbar-hide',
      // iOS Safari compatibility
      'touch-pan-x',
      className
    )

    return (
      <div 
        ref={ref} 
        className={scrollClasses} 
        style={{
          // Fallback for iOS Safari < 16
          WebkitOverflowScrolling: 'touch',
          // Prevent horizontal scroll on iOS
          position: 'relative',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'auto',
          scrollBehavior: 'smooth'
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ScrollArea.displayName = 'ScrollArea'

export { ScrollArea }

// Example usage component
export const ScrollableDemo = () => {
  return (
    <div className="space-y-4">
      {/* Default Scrollbar */}
      <ScrollArea className="h-[200px] w-full rounded-lg border border-border bg-card p-4">
        <div className="space-y-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-[40px] rounded-lg bg-muted/50" />
          ))}
        </div>
      </ScrollArea>

      {/* Thin Scrollbar */}
      <ScrollArea
        variant="thin"
        className="h-[200px] w-full rounded-lg border border-border bg-card p-4"
      >
        <div className="space-y-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-[40px] rounded-lg bg-muted/50" />
          ))}
        </div>
      </ScrollArea>

      {/* Rounded Scrollbar */}
      <ScrollArea
        variant="rounded"
        className="h-[200px] w-full rounded-lg border border-border bg-card p-4"
      >
        <div className="space-y-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-[40px] rounded-lg bg-muted/50" />
          ))}
        </div>
      </ScrollArea>

      {/* Hide Scrollbar */}
      <ScrollArea
        variant="hide"
        className="h-[200px] w-full rounded-lg border border-border bg-card p-4"
      >
        <div className="space-y-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-[40px] rounded-lg bg-muted/50" />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
