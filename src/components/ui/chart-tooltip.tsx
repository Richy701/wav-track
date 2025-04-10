import React from 'react'
import { cn } from '@/lib/utils'

interface ChartTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  cursor?: boolean
  content?: React.ReactNode
  hideLabel?: boolean
}

export function ChartTooltip({ 
  active, 
  payload, 
  label, 
  cursor = true,
  content,
  hideLabel = false
}: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null

  return (
    <div 
      className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3"
      style={{ 
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        perspective: 1000,
      }}
    >
      {!hideLabel && (
        <div className="text-xs font-medium text-muted-foreground mb-1">
          {label}
        </div>
      )}
      {content || (
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="h-2 w-2 rounded-full" 
                style={{ backgroundColor: entry.color || '#8884d8' }} 
              />
              <span className="text-sm font-medium">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: any[]
  label?: string
  hideLabel?: boolean
}

export function ChartTooltipContent({ 
  active, 
  payload, 
  label,
  hideLabel = false
}: ChartTooltipContentProps) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="space-y-1">
      {!hideLabel && (
        <div className="text-xs font-medium text-muted-foreground mb-1">
          {label}
        </div>
      )}
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="h-2 w-2 rounded-full" 
            style={{ backgroundColor: entry.color || '#8884d8' }} 
          />
          <span className="text-sm font-medium">
            {entry.name}: {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
} 