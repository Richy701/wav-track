import { memo } from 'react'
import { BarChart } from 'lucide-react'
import { StatCard } from '../ui/stat-card'
import { cn } from '@/lib/utils'

interface MonthlyData {
  month: string
  beats: number
}

interface MonthlyBreakdownPreviewProps {
  monthlyData: MonthlyData[]
  isLoading?: boolean
  onExport: () => void
  className?: string
}

export const MonthlyBreakdownPreview = memo(function MonthlyBreakdownPreview({
  monthlyData,
  isLoading = false,
  onExport,
  className
}: MonthlyBreakdownPreviewProps) {
  const totalBeats = monthlyData.reduce((sum, month) => sum + month.beats, 0)
  const averageBeats = Math.round(totalBeats / monthlyData.length)
  const latestMonth = monthlyData[monthlyData.length - 1]
  const previousMonth = monthlyData[monthlyData.length - 2]
  const trend = previousMonth ? ((latestMonth.beats - previousMonth.beats) / previousMonth.beats) * 100 : 0

  return (
    <StatCard
      title="Monthly Breakdown"
      value={totalBeats}
      description={`${averageBeats} beats per month`}
      icon={<BarChart className="h-6 w-6" />}
      isLoading={isLoading}
      className={cn('cursor-pointer hover:bg-accent/50', className)}
      onClick={onExport}
      trend={{
        value: Math.abs(trend),
        isPositive: trend > 0
      }}
    />
  )
})
