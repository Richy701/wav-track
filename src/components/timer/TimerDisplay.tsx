import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface TimerDisplayProps {
  time: number
  initialTime: number
  sessionStartTime: Date | null
  mode: 'work' | 'break'
  isRunning: boolean
}

export function TimerDisplay({ 
  time, 
  initialTime, 
  sessionStartTime, 
  mode,
  isRunning,
}: TimerDisplayProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return [m.toString().padStart(2, '0'), s.toString().padStart(2, '0')].join(':')
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Time display */}
      <motion.div
        key={time}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "text-6xl font-bold tracking-tight",
          mode === 'work' 
            ? "text-emerald-600 dark:text-emerald-400" 
            : "text-violet-600 dark:text-violet-400"
        )}
      >
        {formatTime(time)}
      </motion.div>

      {/* Mode label */}
      <div className={cn(
        "text-sm mt-2",
        mode === 'work'
          ? "text-emerald-600/70 dark:text-emerald-400/70"
          : "text-violet-600/70 dark:text-violet-400/70"
      )}>
        {mode === 'work' ? 'Focus Time' : 'Break Time'}
      </div>

      {/* Session start time */}
      {sessionStartTime && (
        <motion.div
          className={cn(
            "text-xs mt-4",
            mode === 'work'
              ? "text-emerald-600/50 dark:text-emerald-400/50"
              : "text-violet-600/50 dark:text-violet-400/50"
          )}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Started:{' '}
          {new Date(sessionStartTime).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </motion.div>
      )}
    </div>
  )
}
