import React from 'react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface YearInReviewPreviewProps {
  totalBeats: number
  completedProjects: number
  averageBPM: number
  onExport: () => void
  children: React.ReactNode
}

export const YearInReviewPreview: React.FC<YearInReviewPreviewProps> = ({
  totalBeats,
  completedProjects,
  averageBPM,
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
            Your Year in Review
          </h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Total Beats Created</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {totalBeats}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Completed Projects</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {completedProjects}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Average BPM</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {averageBPM}
              </span>
            </div>
          </div>

          <Button
            onClick={e => {
              e.stopPropagation()
              onExport()
            }}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
