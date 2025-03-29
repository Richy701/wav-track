import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TimeRangeSelectorProps {
  timeRange: 'day' | 'week' | 'year'
  onTimeRangeChange: (range: 'day' | 'week' | 'year') => void
  className?: string
}

export function TimeRangeSelector({
  timeRange,
  onTimeRangeChange,
  className,
}: TimeRangeSelectorProps) {
  return (
    <div className={cn('bg-secondary/50 rounded-lg p-1 flex space-x-1 self-start', className)}>
      <Button
        variant={timeRange === 'day' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onTimeRangeChange('day')}
        className="text-xs h-7 px-3"
      >
        Day
      </Button>
      <Button
        variant={timeRange === 'week' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onTimeRangeChange('week')}
        className="text-xs h-7 px-3"
      >
        Week
      </Button>
      <Button
        variant={timeRange === 'year' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onTimeRangeChange('year')}
        className="text-xs h-7 px-3"
      >
        Year
      </Button>
    </div>
  )
}
