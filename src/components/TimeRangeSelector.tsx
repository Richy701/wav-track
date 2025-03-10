import { cn } from "@/lib/utils";

interface TimeRangeSelectorProps {
  timeRange: 'day' | 'week' | 'month' | 'year';
  onTimeRangeChange: (range: 'day' | 'week' | 'month' | 'year') => void;
  className?: string;
}

export function TimeRangeSelector({ 
  timeRange, 
  onTimeRangeChange,
  className 
}: TimeRangeSelectorProps) {
  return (
    <div className={cn("flex items-center gap-1 bg-muted/30 p-1 rounded-lg", className)}>
      {['day', 'week', 'month', 'year'].map((range) => (
        <button
          key={range}
          onClick={() => onTimeRangeChange(range as 'day' | 'week' | 'month' | 'year')}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-md transition-all",
            timeRange === range
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          {range.charAt(0).toUpperCase() + range.slice(1)}
        </button>
      ))}
    </div>
  );
} 