import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface TimeRangeSelectorProps {
  timeRange: 'day' | 'week' | 'year'
  onTimeRangeChange: (range: 'day' | 'week' | 'year') => void
  className?: string
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  timeRange,
  onTimeRangeChange,
  className,
}) => {
  const ranges = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Year', value: 'year' },
  ]

  return (
    <div className={cn('flex items-center gap-1 bg-muted/30 p-1 rounded-lg', className)}>
      {ranges.map(({ label, value }) => (
        <Button
          key={value}
          variant={timeRange === value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTimeRangeChange(value as 'day' | 'week' | 'year')}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
