import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { PlayIcon as PlaySolid, PauseIcon as PauseSolid, ArrowPathIcon as ArrowPathSolid, ForwardIcon as ForwardSolid } from '@heroicons/react/24/solid'

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
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          mode === 'work'
            ? "text-emerald-600/70 hover:bg-emerald-100/50 focus:ring-emerald-500/50 dark:text-emerald-400/70 dark:hover:bg-emerald-500/10"
            : "text-violet-600/70 hover:bg-violet-100/50 focus:ring-violet-500/50 dark:text-violet-400/70 dark:hover:bg-violet-500/10"
        )}
      >
        <ArrowPathSolid className="w-5 h-5" />
      </motion.button>

      {/* Play/Pause Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={isRunning ? onPause : onStart}
        className={cn(
          "p-4 rounded-full transition-all",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "shadow-lg hover:shadow-xl",
          mode === 'work'
            ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            : "bg-violet-600 hover:bg-violet-700 focus:ring-violet-500/50 dark:bg-violet-500 dark:hover:bg-violet-600"
        )}
      >
        {isRunning ? (
          <PauseSolid className="w-6 h-6 text-white" />
        ) : (
          <PlaySolid className="w-6 h-6 text-white" />
        )}
      </motion.button>

      {/* Skip Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSkip}
        className={cn(
          "p-2 rounded-full transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          mode === 'work'
            ? "text-emerald-600/70 hover:bg-emerald-100/50 focus:ring-emerald-500/50 dark:text-emerald-400/70 dark:hover:bg-emerald-500/10"
            : "text-violet-600/70 hover:bg-violet-100/50 focus:ring-violet-500/50 dark:text-violet-400/70 dark:hover:bg-violet-500/10"
        )}
      >
        <ForwardSolid className="w-5 h-5" />
      </motion.button>
    </div>
  )
}
