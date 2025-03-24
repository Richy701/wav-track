import { Play, Pause, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimerControlsProps {
  isRunning: boolean
  time: number
  initialTime: number
  toggleTimer: () => void
  resetTimer: () => void
}

export function TimerControls({
  isRunning,
  time,
  initialTime,
  toggleTimer,
  resetTimer,
}: TimerControlsProps) {
  return (
    <div className="flex items-center justify-center space-x-4">
      <button
        onClick={toggleTimer}
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        className={cn(
          'h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95',
          isRunning
            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 dark:from-red-500 dark:to-pink-500 dark:hover:from-red-600 dark:hover:to-pink-600'
            : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600'
        )}
      >
        {isRunning ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
      </button>

      <button
        onClick={resetTimer}
        aria-label="Reset timer"
        className="h-10 w-10 rounded-full bg-secondary hover:bg-secondary/70 flex items-center justify-center transition-all duration-300 transform hover:rotate-180 hover:scale-105 active:scale-95"
        disabled={time === initialTime && !isRunning}
      >
        <RotateCcw
          size={16}
          className={time === initialTime && !isRunning ? 'text-muted-foreground' : ''}
        />
      </button>
    </div>
  )
}
