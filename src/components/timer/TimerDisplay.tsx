import { cn } from '@/lib/utils'

interface TimerDisplayProps {
  time: number
  initialTime: number
  sessionStartTime: Date | null
  mode: 'work' | 'break'
}

export function TimerDisplay({ time, initialTime, sessionStartTime, mode }: TimerDisplayProps) {
  // Format time to display as MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60

    return [m.toString().padStart(2, '0'), s.toString().padStart(2, '0')].join(':')
  }

  // Calculate progress percentage
  const progress = initialTime ? ((initialTime - time) / initialTime) * 100 : 0

  return (
    <div className="text-center my-6 relative">
      {/* Progress bar */}
      <div className="h-1 w-full bg-secondary mb-4 rounded overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-1000',
            mode === 'work' ? 'bg-primary' : 'bg-green-500'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        className={cn(
          'text-4xl font-light transition-colors duration-300',
          mode === 'work' ? 'text-foreground' : 'text-green-500'
        )}
      >
        {formatTime(time)}
      </div>

      {sessionStartTime && (
        <div className="text-xs text-muted-foreground mt-2 animate-fade-in">
          Started:{' '}
          {new Date(sessionStartTime).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </div>
      )}
    </div>
  )
}
