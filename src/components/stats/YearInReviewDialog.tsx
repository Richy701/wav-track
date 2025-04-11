import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ShareableCard } from './ShareableCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMemo } from 'react'

interface YearInReview {
  year: number
  totalBeats: number
  completedProjects: number
  studioTime: string
  monthlyStats: {
    month: string
    beats: number
    completed: number
    studioTime: number
  }[]
  topGenres: string[]
}

interface YearInReviewDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  yearInReview: YearInReview | null
  onExport: () => void
  isLoading?: boolean
}

export function YearInReviewDialog({
  isOpen,
  onOpenChange,
  yearInReview,
  onExport,
  isLoading = false
}: YearInReviewDialogProps) {
  if (!yearInReview) return null

  // Memoize the stats data to prevent recalculation on every render
  const shareableStats = useMemo(() => [
    { label: 'Total Beats', value: yearInReview.totalBeats },
    { label: 'Completed Projects', value: yearInReview.completedProjects },
    { label: 'Studio Time', value: yearInReview.studioTime },
    { label: 'Top Genre', value: yearInReview.topGenres[0] || 'None' }
  ], [yearInReview.totalBeats, yearInReview.completedProjects, yearInReview.studioTime, yearInReview.topGenres])

  // Memoize the monthly stats to prevent recalculation
  const monthlyStatsRows = useMemo(() => (
    yearInReview.monthlyStats.map((stat) => (
      <div key={stat.month} className="grid grid-cols-4 gap-3 text-sm py-1">
        <div className="font-medium">{stat.month}</div>
        <div>{stat.beats} beats</div>
        <div>{stat.completed} completed</div>
        <div>{(stat.studioTime / 60).toFixed(1)} hours</div>
      </div>
    ))
  ), [yearInReview.monthlyStats])

  // Memoize the genre badges to prevent recalculation
  const genreBadges = useMemo(() => (
    yearInReview.topGenres.map((genre, index) => (
      <div
        key={genre}
        className={cn(
          "px-2 py-0.5 rounded-full text-xs font-medium",
          index === 0 && "bg-violet-500/10 text-violet-700 dark:text-violet-300",
          index === 1 && "bg-pink-500/10 text-pink-700 dark:text-pink-300",
          index === 2 && "bg-rose-500/10 text-rose-700 dark:text-rose-300"
        )}
      >
        {genre}
      </div>
    ))
  ), [yearInReview.topGenres])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>{yearInReview.year} Year in Review</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
            <TabsTrigger value="stats" className="rounded-none">Detailed Stats</TabsTrigger>
            <TabsTrigger value="share" className="rounded-none">Share Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats" className="p-4 space-y-4">
            {/* Overall Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border bg-card/50 p-3">
                <h3 className="text-xs font-medium text-muted-foreground mb-1">Total Beats</h3>
                <p className="text-xl font-bold">{yearInReview.totalBeats}</p>
              </div>
              <div className="rounded-lg border bg-card/50 p-3">
                <h3 className="text-xs font-medium text-muted-foreground mb-1">Completed Projects</h3>
                <p className="text-xl font-bold">{yearInReview.completedProjects}</p>
              </div>
              <div className="rounded-lg border bg-card/50 p-3">
                <h3 className="text-xs font-medium text-muted-foreground mb-1">Studio Time</h3>
                <p className="text-xl font-bold">{yearInReview.studioTime}</p>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="rounded-lg border bg-card/50 p-3">
              <h3 className="text-xs font-medium text-muted-foreground mb-3">Monthly Breakdown</h3>
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
                {monthlyStatsRows}
              </div>
            </div>

            {/* Top Genres */}
            <div className="rounded-lg border bg-card/50 p-3">
              <h3 className="text-xs font-medium text-muted-foreground mb-3">Top Genres</h3>
              <div className="flex flex-wrap gap-2">
                {genreBadges}
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end pt-2">
              <Button onClick={onExport} disabled={isLoading} size="sm">
                <Download className="mr-2 h-3 w-3" />
                Export as CSV
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="share" className="flex items-center justify-center p-4">
            <ShareableCard
              title={`${yearInReview.year} Music Production`}
              stats={shareableStats}
              gradientColors={{
                from: '#e11d48',
                via: '#db2777',
                to: '#c026d3'
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 