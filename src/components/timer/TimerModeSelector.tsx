import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Music, Coffee } from 'lucide-react'

interface TimerModeSelectorProps {
  mode: 'work' | 'break'
  onModeChange: (mode: 'work' | 'break') => void
}

export function TimerModeSelector({ mode, onModeChange }: TimerModeSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onModeChange('work')}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md transition-all cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500/50",
          mode === 'work'
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
        )}
      >
        <Music className="w-4 h-4" />
        <span className="text-sm">Focus</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onModeChange('break')}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md transition-all cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50",
          mode === 'break'
            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium border border-blue-500/20"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
        )}
      >
        <Coffee className="w-4 h-4" />
        <span className="text-sm">Break</span>
      </motion.button>
    </div>
  )
}
