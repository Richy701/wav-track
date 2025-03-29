import { memo } from 'react'
import { Calendar } from 'lucide-react'
import { StatCard } from '../ui/stat-card'
import { cn } from '@/lib/utils'

interface YearInReviewPreviewProps {
  totalBeats: number
  completedProjects: number
  averageBPM: number
  isLoading?: boolean
  onExport: () => void
  className?: string
}

export const YearInReviewPreview = memo(function YearInReviewPreview({
  totalBeats,
  completedProjects,
  averageBPM,
  isLoading = false,
  onExport,
  className
}: YearInReviewPreviewProps) {
  return (
    <StatCard
      title="Year in Review"
      value={totalBeats}
      description={`${completedProjects} projects completed • ${averageBPM} BPM avg`}
      icon={<Calendar className="h-6 w-6" />}
      isLoading={isLoading}
      className={cn('cursor-pointer hover:bg-accent/50', className)}
      onClick={onExport}
    />
  )
})
