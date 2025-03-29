import React from 'react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsHoverCardProps {
  children: React.ReactNode
  title: string
  content: React.ReactNode
  onExport: () => void
  className?: string
}

export const StatsHoverCard: React.FC<StatsHoverCardProps> = ({
  children,
  title,
  content,
  onExport,
  className,
}) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className={cn('cursor-pointer', className)}>{children}</div>
      </HoverCardTrigger>
      <HoverCardContent
        className={cn(
          'w-80 p-4',
          'bg-white/80 backdrop-blur-sm border-zinc-200/60',
          'dark:bg-zinc-900/80 dark:border-zinc-800/50',
          'rounded-xl shadow-lg'
        )}
        side="top"
        align="center"
        sideOffset={10}
        openDelay={200}
        closeDelay={200}
      >
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h4>

          <div className="text-sm text-zinc-600 dark:text-zinc-400">{content}</div>

          <Button
            onClick={e => {
              e.stopPropagation()
              onExport()
            }}
            variant="outline"
            size="sm"
            className={cn(
              'w-full',
              'border-zinc-200 hover:bg-zinc-50',
              'dark:border-zinc-800 dark:hover:bg-zinc-800/50',
              'text-sm'
            )}
          >
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
