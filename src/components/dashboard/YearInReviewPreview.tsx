import { memo, useState } from 'react'
import { Music, Clock, ChevronRight, Sparkles, Calendar, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { LiquidCard } from '@/components/ui/liquid-glass-card'
import { Button } from '@/components/ui/button'

interface YearInReviewPreviewProps {
  totalBeats: number
  studioTime: number | string
  isLoading?: boolean
  onExport: () => void
  className?: string
  topGenre?: string
  title?: string
  description?: string
}

export const YearInReviewPreview = memo(function YearInReviewPreview({
  totalBeats,
  studioTime,
  isLoading = false,
  onExport,
  className,
  topGenre,
  title = "Beat Creation",
  description = "Track your beat making progress"
}: YearInReviewPreviewProps) {
  const [isHovered, setIsHovered] = useState(false)

  const formatStudioTime = (time: number | string) => {
    if (typeof time === 'string') {
      // If it's already a formatted string, just return it
      return time
    }
    // If it's a number (hours), format it
    if (time === 0) return '0h'
    if (time < 1) return '<1h'
    return `${Math.floor(time)}h`
  }

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

  const hasNoActivity = totalBeats === 0 && studioTime === 0

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
          <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20 opacity-50" />
          
          <div className="flex flex-col p-6 relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 bg-clip-text text-transparent">
                    {title}
                  </h3>
                  <Sparkles className="w-4 h-4 text-amber-400/80" />
                </div>
                <p className="text-sm font-medium text-white/80 leading-relaxed">
                  {description}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400/90 ring-1 ring-amber-500/20">
                <BarChart className="h-6 w-6" />
              </div>
            </div>
            
            {hasNoActivity ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400">
                  <Award className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                  No Activity Yet
                </h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-sm">
                  Start creating beats to see your year in review stats
                </p>
              </div>
            ) : (
              /* Stats Grid */
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 w-full overflow-hidden mb-6 min-w-0">
                {/* Total Beats */}
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-white border border-zinc-200 min-w-0 truncate text-wrap overflow-hidden dark:bg-white/[0.03] dark:backdrop-blur-lg dark:border-white/[0.05]"
                >
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-500 flex-shrink-0 dark:bg-amber-500/10 dark:text-amber-400">
                    <Music className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-zinc-500 dark:text-white/90 truncate">Total Beats</p>
                    <div className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                      {totalBeats}
                    </div>
                  </div>
                </motion.div>
                
                {/* Studio Time */}
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-white border border-zinc-200 min-w-0 truncate text-wrap overflow-hidden dark:bg-white/[0.03] dark:backdrop-blur-lg dark:border-white/[0.05]"
                >
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-500 flex-shrink-0 dark:bg-amber-500/10 dark:text-amber-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-zinc-500 dark:text-white/90 truncate">Studio Time</p>
                    <div className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                      {formatStudioTime(studioTime)}
                    </div>
                  </div>
                </motion.div>

                {/* Top Genre */}
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-white border border-zinc-200 min-w-0 truncate text-wrap overflow-hidden dark:bg-white/[0.03] dark:backdrop-blur-lg dark:border-white/[0.05]"
                >
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-500 flex-shrink-0 dark:bg-amber-500/10 dark:text-amber-400">
                    <Music className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="text-[10px] font-medium text-zinc-500 dark:text-white/90 truncate">Top Genre</p>
                    <p
                      className="text-[10px] sm:text-[12px] font-bold tracking-tight text-zinc-900 dark:text-white truncate w-full max-w-[90vw] break-words"
                      title={topGenre === 'Uncategorized' ? 'Uncategorized' : topGenre || 'None'}
                    >
                      {topGenre === 'Uncategorized' ? (
                        <>
                          <span className="inline sm:hidden">Other</span>
                          <span className="hidden sm:inline">Uncategorized</span>
                        </>
                      ) : (
                        topGenre || 'None'
                      )}
                    </p>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Export Button */}
            <div className="absolute bottom-0 left-0 w-full rounded-b-md bg-gradient-to-t from-black/80 to-transparent p-6">
              <Button 
                onClick={onExport}
                className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Export Year in Review
              </Button>
            </div>
          </div>
        </div>
      </LiquidCard>
    </motion.div>
  )
})
