import { memo } from 'react'
import { Share2 } from 'lucide-react'
import { StatCard } from '../ui/stat-card'
import { cn } from '@/lib/utils'

interface ShareProgressPreviewProps {
  totalAchievements: number
  sharedAchievements: number
  isLoading?: boolean
  onExport: () => void
  className?: string
}

export const ShareProgressPreview = memo(function ShareProgressPreview({
  totalAchievements,
  sharedAchievements,
  isLoading = false,
  onExport,
  className
}: ShareProgressPreviewProps) {
  const sharePercentage = Math.round((sharedAchievements / totalAchievements) * 100)

  return (
    <StatCard
      title="Share Your Progress"
      value={`${sharedAchievements}/${totalAchievements}`}
      description={`${sharePercentage}% of achievements shared`}
      icon={<Share2 className="h-6 w-6" />}
      isLoading={isLoading}
      className={cn('cursor-pointer hover:bg-accent/50', className)}
      onClick={onExport}
    />
  )
})
