import { memo, useState } from 'react'
import { BarChart, TrendingDown, TrendingUp, Music, Sparkles, Calendar } from 'lucide-react'
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
  const [isHovered, setIsHovered] = useState(false)
  
  const totalBeats = monthlyData.reduce((sum, month) => sum + month.beats, 0)
  const averageBeats = Math.round(totalBeats / monthlyData.length)
  const latestMonth = monthlyData[monthlyData.length - 1]
  const previousMonth = monthlyData[monthlyData.length - 2]
  const trend = previousMonth ? ((latestMonth.beats - previousMonth.beats) / previousMonth.beats) * 100 : 0
  const isPositiveTrend = trend > 0

  if (isLoading) {
    return (
      <LiquidCard className={cn('w-full min-h-[280px] animate-pulse', className)}>
        <div className="p-6">
          <div className="flex items-start mb-4">
            <div className="space-y-2">
              <div className="h-6 w-32 bg-white/10 rounded"></div>
              <div className="h-4 w-48 bg-white/10 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                <div className="h-9 w-9 bg-white/10 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-white/10 rounded"></div>
                  <div className="h-5 w-12 bg-white/10 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </LiquidCard>
    )
  }

  const hasNoData = monthlyData.length === 0 || totalBeats === 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <LiquidCard className="w-full min-h-[320px] cursor-pointer transition-transform duration-300 hover:scale-[1.02] bg-white border border-zinc-200 dark:bg-zinc-900/80 dark:border-white/10">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-violet-500/20 via-transparent to-purple-500/20 opacity-50" />
          
          <div className="flex flex-col p-6 relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-violet-200 via-purple-200 to-violet-200 bg-clip-text text-transparent">
                    Monthly Breakdown
                  </h3>
                  <Sparkles className="w-4 h-4 text-violet-400/80" />
                </div>
                <p className="text-sm font-medium text-white/80 leading-relaxed">
                  Your production trends over time
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400/90 ring-1 ring-violet-500/20">
                <Calendar className="h-6 w-6" />
              </div>
            </div>

            {!hasNoData && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 w-full overflow-hidden mb-6 min-w-0">
                  {/* Total Beats */}
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="flex items-center space-x-3 p-4 rounded-lg bg-white border border-zinc-200 min-w-0 truncate text-wrap overflow-hidden dark:bg-white/[0.03] dark:backdrop-blur-lg dark:border-white/[0.05]"
                  >
                    <div className="p-2 rounded-lg bg-violet-100 text-violet-500 flex-shrink-0 dark:bg-violet-500/10 dark:text-violet-400">
                      <Music className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-zinc-500 dark:text-white/90 truncate">Total Beats</p>
                      <div className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        {totalBeats}
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Monthly Trend */}
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="flex items-center space-x-3 p-4 rounded-lg bg-white border border-zinc-200 min-w-0 truncate text-wrap overflow-hidden dark:bg-white/[0.03] dark:backdrop-blur-lg dark:border-white/[0.05]"
                  >
                    <div className={cn(
                      'p-2 rounded-lg flex-shrink-0',
                      isPositiveTrend ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-100 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400'
                    )}>
                      {isPositiveTrend ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-zinc-500 dark:text-white/90 truncate">Monthly Trend</p>
                      <div className={cn(
                        'text-4xl font-bold tracking-tight',
                        isPositiveTrend ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      )}>
                        {isPositiveTrend ? '+' : ''}{Math.abs(Math.round(trend))}%
                      </div>
                    </div>
                  </motion.div>

                  {/* Average Beats */}
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="flex items-center space-x-3 p-4 rounded-lg bg-white border border-zinc-200 min-w-0 truncate text-wrap overflow-hidden dark:bg-white/[0.03] dark:backdrop-blur-lg dark:border-white/[0.05]"
                  >
                    <div className="p-2 rounded-lg bg-violet-100 text-violet-500 flex-shrink-0 dark:bg-violet-500/10 dark:text-violet-400">
                      <BarChart className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="text-[10px] font-medium text-zinc-500 dark:text-white/90 truncate">Avg per Month</p>
                      <div className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white truncate">
                        {averageBeats}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
            {hasNoData && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400">
                  <Calendar className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                  No Monthly Data
                </h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-sm">
                  Start creating beats to see your monthly breakdown and trends
                </p>
              </div>
            )}

            {/* Export Button */}
            <div className="absolute bottom-0 left-0 w-full rounded-b-md bg-gradient-to-t from-black/80 to-transparent p-6">
              <Button 
                onClick={onExport}
                className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Export Monthly Breakdown
              </Button>
            </div>
          </div>
        </div>
      </LiquidCard>
    </motion.div>
  )
})
