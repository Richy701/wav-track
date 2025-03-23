import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

interface TimerModeSelectorProps {
  mode: 'work' | 'break'
  switchMode: (newMode: 'work' | 'break') => void
}

export function TimerModeSelector({ mode, switchMode }: TimerModeSelectorProps) {
  return (
    <div className="flex justify-center space-x-2 mb-4">
      <Button
        size="sm"
        variant={mode === 'work' ? 'default' : 'outline'}
        onClick={() => switchMode('work')}
        className={cn(
          'w-24 transition-all duration-300',
          mode === 'work' && 'animate-pulse-subtle'
        )}
      >
        Work
      </Button>
      <Button
        size="sm"
        variant={mode === 'break' ? 'default' : 'outline'}
        onClick={() => switchMode('break')}
        className={cn(
          'w-24 transition-all duration-300',
          mode === 'break' && 'animate-pulse-subtle'
        )}
      >
        Break
      </Button>
    </div>
  )
}
