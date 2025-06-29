import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { MusicalNoteIcon, BeakerIcon } from '@heroicons/react/24/outline'

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
        <MusicalNoteIcon className="w-4 h-4" />
        <span className="text-sm">Focus</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onModeChange('break')}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md transition-all cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500/50",
          mode === 'break'
            ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium border border-violet-500/20"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
        )}
      >
        <BeakerIcon className="w-4 h-4" />
        <span className="text-sm">Break</span>
      </motion.button>
    </div>
  )
}
