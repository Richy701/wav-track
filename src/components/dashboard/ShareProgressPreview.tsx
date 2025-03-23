import React from 'react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'
import { Share2, Trophy } from 'lucide-react'

interface ShareProgressPreviewProps {
  totalAchievements: number
  sharedAchievements: number
  onExport: () => void
  children: React.ReactNode
}

export const ShareProgressPreview: React.FC<ShareProgressPreviewProps> = ({
  totalAchievements,
  sharedAchievements,
  onExport,
  children,
}) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="cursor-pointer">{children}</div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="top" align="center" sideOffset={10}>
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Progress Summary
          </h4>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <Trophy className="w-4 h-4 text-violet-500" />
              <span>{totalAchievements} achievements unlocked</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <Share2 className="w-4 h-4 text-violet-500" />
              <span>{sharedAchievements} shared publicly</span>
            </div>
          </div>

          <Button
            onClick={e => {
              e.stopPropagation()
              onExport()
            }}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            Share Now
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
