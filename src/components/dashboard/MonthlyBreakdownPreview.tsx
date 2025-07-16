import { memo } from 'react'
import { BarChart, TrendingDown, TrendingUp, Music, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { LiquidCard } from '@/components/ui/liquid-glass-card'
import { Button } from '@/components/ui/button'

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
  const isPositiveTrend = trend > 0
  
  // Motivational lyrics that can be displayed
  const motivationalLyrics = [
    "Month by month, beat by beat",
    "Your consistency is your superpower",
    "Every month brings new inspiration",
    "Track your progress, amplify your success"
  ]
  
  // Randomly select a lyric
  const randomLyric = motivationalLyrics[Math.floor(Math.random() * motivationalLyrics.length)]

  if (isLoading) {
    return (
      <LiquidCard className={cn('w-full min-h-[320px] animate-pulse', className)}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="h-6 w-32 bg-white/10 rounded"></div>
              <div className="h-4 w-48 bg-white/10 rounded"></div>
            </div>
            <div className="h-10 w-10 bg-white/10 rounded-xl"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                <div className="h-9 w-9 bg-white/10 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-white/10 rounded"></div>
                  <div className="h-6 w-12 bg-white/10 rounded"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="h-4 w-full bg-white/10 rounded mb-2"></div>
          <div className="h-2 w-full bg-white/10 rounded"></div>
        </div>
      </LiquidCard>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={cn('relative', className)}
    >
      <LiquidCard className="w-full min-h-[320px] cursor-pointer transition-transform duration-300 hover:scale-[1.02] bg-white/5 backdrop-blur-lg border border-white/10">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20 opacity-50" />
          <div className="flex flex-col p-6 relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-zinc-900 dark:bg-gradient-to-r dark:from-white dark:to-white/70 dark:bg-clip-text dark:text-transparent">
                    Monthly Breakdown
                  </h3>
                  <Sparkles className="w-4 h-4 text-purple-400/80" />
                </div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400/80 leading-relaxed">
                  Your production trends over time
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-500 ring-1 ring-purple-200 dark:bg-purple-500/10 dark:text-purple-400/90 dark:ring-purple-500/20">
                <BarChart className="h-6 w-6" />
              </div>
            </div>

            {/* Tablist */}
            <div
              role="tablist"
              className="h-10 p-1 gap-0.5 text-sm grid w-full grid-cols-2 mb-6 bg-zinc-100 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-md items-center justify-center sm:h-8 sm:p-0.5 sm:text-xs"
            >
              <button
                type="button"
                role="tab"
                aria-selected="true"
                className="inline-flex items-center justify-center min-w-0 w-full whitespace-nowrap rounded-sm px-2 py-0 text-sm font-medium sm:py-0.5 sm:text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-white/5 dark:data-[state=active]:text-white transition-colors relative z-10"
              >
                Chart View
              </button>
              <button
                type="button"
                role="tab"
                aria-selected="false"
                className="inline-flex items-center justify-center min-w-0 w-full whitespace-nowrap rounded-sm px-2 py-0 text-sm font-medium sm:py-0.5 sm:text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-white/5 dark:data-[state=active]:text-white transition-colors relative z-10"
              >
                Share Stats
              </button>
            </div>
            
            {/* Progress Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex items-center space-x-3 p-4 rounded-lg bg-white/10 backdrop-blur-lg border border-white/10 min-w-0"
              >
                <div className="p-2.5 rounded-lg bg-purple-100 text-purple-500 flex-shrink-0 dark:bg-purple-500/10 dark:text-purple-400">
                  <Music className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400/80 truncate">Total Beats</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:bg-gradient-to-r dark:from-purple-400 dark:to-pink-400 dark:bg-clip-text dark:text-transparent truncate">
                    {totalBeats}
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex items-center space-x-3 p-4 rounded-lg bg-white/10 backdrop-blur-lg border border-white/10 min-w-0"
              >
                <div className={cn(
                  'p-2.5 rounded-lg flex-shrink-0',
                  isPositiveTrend ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-100 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400'
                )}>
                  {isPositiveTrend ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-200 dark:bg-emerald-600/20">
                      <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-200 dark:bg-rose-600/20">
                      <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400/80 truncate">Monthly Trend</p>
                  <p className={cn(
                    'text-2xl font-bold truncate',
                    isPositiveTrend ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  )}>
                    {isPositiveTrend ? '+' : ''}{Math.abs(Math.round(trend))}%
                  </p>
                </div>
              </motion.div>
            </div>
            
            {/* Monthly Average */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400/80">Monthly Average</span>
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400/90">{averageBeats} beats</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-lg">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (averageBeats / 20) * 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </div>

            {/* Export Button */}
            <div className="absolute bottom-0 left-0 w-full rounded-b-md bg-gradient-to-t from-black/80 to-transparent p-6">
              <Button 
                onClick={onExport}
                className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Export Stats
              </Button>
            </div>
          </div>
        </div>
      </LiquidCard>
    </motion.div>
  )
})
