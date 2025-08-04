// Optimized timer display component with performance improvements
import React, { memo, useMemo } from 'react'

interface OptimizedTimerDisplayProps {
  progress: number
  formattedTime: string
  mode: 'focus' | 'break'
  status: string
  size?: number
}

const OptimizedTimerDisplay = memo(function OptimizedTimerDisplay({ 
  progress, 
  formattedTime, 
  mode, 
  status,
  size = 256 
}: OptimizedTimerDisplayProps) {
  // Memoize expensive calculations
  const { radius, circumference, strokeDashoffset } = useMemo(() => {
    const r = (size / 2) - 16 // Account for stroke width
    const circ = 2 * Math.PI * r
    const offset = circ * (1 - progress / 100)
    
    return {
      radius: r,
      circumference: circ,
      strokeDashoffset: offset
    }
  }, [progress, size])
  
  const strokeColor = mode === 'focus' ? '#9333ea' : '#059669'
  const center = size / 2
  
  return (
    <div className="relative inline-block">
      <svg 
        className="transform -rotate-90" 
        width={size} 
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={strokeColor}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          style={{
            // Use CSS custom properties for better performance
            '--stroke-dasharray': circumference,
            '--stroke-dashoffset': strokeDashoffset,
          }}
        />
      </svg>
      
      {/* Timer content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl font-bold text-foreground font-mono">
            {formattedTime}
          </div>
          <div className={`text-sm font-medium mt-2 ${
            mode === 'focus' ? 'text-purple-600' : 'text-emerald-600'
          }`}>
            {mode === 'focus' ? 'Focus Time' : 'Break Time'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {status === 'running' ? 'Running' : 
             status === 'paused' ? 'Paused' : 
             status === 'completed' ? 'Completed' : 'Ready'}
          </div>
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.progress === nextProps.progress &&
    prevProps.formattedTime === nextProps.formattedTime &&
    prevProps.mode === nextProps.mode &&
    prevProps.status === nextProps.status &&
    prevProps.size === nextProps.size
  )
})

export default OptimizedTimerDisplay