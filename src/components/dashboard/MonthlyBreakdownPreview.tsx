import React from 'react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'
import { BarChart3, Download } from 'lucide-react'

interface MonthlyData {
  month: string
  beats: number
}

interface MonthlyBreakdownPreviewProps {
  monthlyData: MonthlyData[]
  onExport: () => void
  children: React.ReactNode
}

export const MonthlyBreakdownPreview: React.FC<MonthlyBreakdownPreviewProps> = ({
  monthlyData,
  onExport,
  children,
}) => {
  const maxBeats = Math.max(...monthlyData.map(d => d.beats))

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="cursor-pointer">{children}</div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="top" align="center" sideOffset={10}>
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            This Year's Monthly Stats
          </h4>

          <div className="space-y-2">
            {monthlyData.map(data => (
              <div key={data.month} className="flex items-center gap-2">
                <div className="w-16 text-sm text-zinc-600 dark:text-zinc-400">{data.month}</div>
                <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all duration-300"
                    style={{ width: `${(data.beats / maxBeats) * 100}%` }}
                  />
                </div>
                <div className="w-8 text-sm text-right text-zinc-700 dark:text-zinc-300">
                  {data.beats}
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={e => {
              e.stopPropagation()
              onExport()
            }}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
