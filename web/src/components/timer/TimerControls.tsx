import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react'

interface TimerControlsProps {
  isRunning: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
  mode: 'work' | 'break'
}

export function TimerControls({
  isRunning,
  onStart,
  onPause,
  onReset,
  onSkip,
  mode
}: TimerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      {/* Reset Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        className={cn(
          "p-2 rounded-full transition-colors",
          "hover:bg-muted/50 active:bg-muted",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          mode === 'work' 
            ? "focus:ring-emerald-500/50" 
            : "focus:ring-blue-500/50"
        )}
      >
        <RotateCcw className="w-5 h-5 text-muted-foreground" />
      </motion.button>

      {/* Play/Pause Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={isRunning ? onPause : onStart}
        className={cn(
          "p-4 rounded-full transition-all",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          mode === 'work' 
            ? "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500/50" 
            : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500/50",
          "shadow-lg hover:shadow-xl"
        )}
      >
        {isRunning ? (
          <Pause className="w-6 h-6 text-white" />
        ) : (
          <Play className="w-6 h-6 text-white" />
        )}
      </motion.button>

      {/* Skip Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSkip}
        className={cn(
          "p-2 rounded-full transition-colors",
          "hover:bg-muted/50 active:bg-muted",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          mode === 'work' 
            ? "focus:ring-emerald-500/50" 
            : "focus:ring-blue-500/50"
        )}
      >
        <SkipForward className="w-5 h-5 text-muted-foreground" />
      </motion.button>
    </div>
  )
}
