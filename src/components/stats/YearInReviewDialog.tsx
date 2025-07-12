import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, X, Clock, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ShareableCard } from './ShareableCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { LiquidCard } from '@/components/ui/liquid-glass-card'
import { toast } from 'sonner'

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
  beatGoal: number
  topGenre?: string
}

interface YearInReviewDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  yearInReview: YearInReview
  onExport: () => void
  isLoading?: boolean
  title?: string
  description?: string
}

export function YearInReviewDialog({
  isOpen,
  onOpenChange,
  yearInReview,
  onExport,
  isLoading = false,
  title,
  description
}: YearInReviewDialogProps) {
  const shareableStats = useMemo(() => {
    if (!yearInReview) return []
    return [
      { 
        label: 'Total Beats',
        value: yearInReview.totalBeats.toString(),
      },
      { 
        label: 'Studio Time',
        value: yearInReview.studioTime,
      },
      { 
        label: 'Beat Goal',
        value: `${Math.round((yearInReview.totalBeats / yearInReview.beatGoal) * 100)}%`,
      },
      { 
        label: 'Top Genre',
        value: yearInReview.topGenre || 'Other',
      }
    ]
  }, [yearInReview])

  const handleShare = async () => {
    const shareText = 
      `${yearInReview.year} Year in Review\n\n` +
      shareableStats.map(stat => `${stat.label}: ${stat.value}`).join('\n') +
      '\n\nPowered by WavTrack'

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${yearInReview.year} Year in Review`,
          text: shareText,
          url: window.location.href,
        })
      } catch (err) {
        // Fallback to clipboard if share fails or is cancelled
        await navigator.clipboard.writeText(shareText)
        toast.success('Stats copied to clipboard!', {
          description: 'Share your progress with others.',
        })
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText)
      toast.success('Stats copied to clipboard!', {
        description: 'Share your progress with others.',
      })
    }
  }

  if (!yearInReview) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto bg-transparent border-none p-0">
        <LiquidCard className="w-full will-change-transform bg-black/40">
          <motion.div 
            className="relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header Section */}
            <div className="p-6 border-b border-white/10">
              {/* Close Button */}
              <DialogClose className="absolute right-4 top-4 z-50">
                <div className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="h-4 w-4 text-zinc-400" />
                </div>
              </DialogClose>

              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-violet-200 via-fuchsia-200 to-rose-200 bg-clip-text text-transparent">
                    {yearInReview.year} Year in Review
                  </h3>
                  <p className="text-sm font-medium text-zinc-400/90">
                    Powered by WavTrack
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="p-6">
              <Tabs defaultValue="card" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/20 border border-white/10">
                  <TabsTrigger 
                    value="card" 
                    className="data-[state=active]:bg-white/5 data-[state=active]:text-white transition-colors relative z-10"
                  >
                    Card View
                  </TabsTrigger>
                  <TabsTrigger 
                    value="chart"
                    className="data-[state=active]:bg-white/5 data-[state=active]:text-white transition-colors relative z-10"
                  >
                    Stats View
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="card" className="mt-0">
                  <ShareableCard
                    title={title || `${yearInReview.year} Year in Review`}
                    description={description || "Your beat making journey this year"}
                    stats={shareableStats}
                  />
                </TabsContent>

                <TabsContent value="chart" className="mt-0">
                  <div className="space-y-6">
                    {/* Beats Progress */}
                    <div className="rounded-xl border border-white/10 p-4 bg-white/[0.02]">
                      <h4 className="text-lg font-semibold mb-3 bg-gradient-to-r from-violet-200 to-purple-200 bg-clip-text text-transparent">
                        Beats Created
                      </h4>
                      <div className="h-8 w-full bg-white/5 rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg transition-all duration-500"
                          style={{ width: `${(yearInReview.totalBeats / yearInReview.beatGoal) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="text-zinc-400">{yearInReview.totalBeats} beats</span>
                        <span className="text-zinc-500">Goal: {yearInReview.beatGoal}</span>
                      </div>
                    </div>

                    {/* Studio Time Section */}
                    <div className="rounded-xl border border-white/10 p-4 bg-white/[0.02]">
                      <h4 className="text-lg font-semibold mb-3 bg-gradient-to-r from-violet-200 to-purple-200 bg-clip-text text-transparent">
                        Studio Time
                      </h4>
                      {yearInReview.studioTime === '0h' ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Clock className="w-12 h-12 text-violet-400/50 mb-3" />
                          <p className="text-sm text-zinc-400">No studio sessions recorded yet</p>
                          <p className="text-xs text-zinc-500 mt-1">Start a session to track your studio time</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-7 gap-1.5">
                            {Array.from({ length: 52 }).map((_, i) => {
                              const intensity = Math.random() // Replace with actual data
                              return (
                                <div
                                  key={i}
                                  className={cn(
                                    "h-4 rounded-sm transition-colors",
                                    intensity > 0.7 ? "bg-violet-500" :
                                    intensity > 0.5 ? "bg-violet-500/70" :
                                    intensity > 0.3 ? "bg-violet-500/50" :
                                    "bg-white/10"
                                  )}
                                />
                              )
                            })}
                          </div>
                          <div className="flex justify-between mt-3 text-sm">
                            <span className="text-zinc-400">{yearInReview.studioTime} hours total</span>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-sm bg-violet-500" />
                              <span className="text-zinc-500">More active</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Monthly Activity */}
                    <div className="rounded-xl border border-white/10 p-6 bg-white/[0.02] backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-semibold text-white">
                              Beat Creation
                            </h4>
                            <div className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                              <span className="text-xs font-medium text-violet-300">Last 6 Months</span>
                            </div>
                          </div>
                          <p className="text-sm text-zinc-400">Track your beat making journey</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between gap-10">
                        {/* Pie Chart */}
                        <div className="relative w-44 h-44">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500/10 via-transparent to-fuchsia-500/10 animate-pulse-slow" />
                          {yearInReview.monthlyStats.slice(-6).map((month, i, arr) => {
                            const total = arr.reduce((sum, m) => sum + m.beats, 0)
                            const previousAngles = arr.slice(0, i).reduce((sum, m) => sum + (m.beats / total) * 360, 0)
                            const angle = (month.beats / total) * 360
                            
                            return (
                              <motion.div
                                key={i}
                                className="absolute inset-0"
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                transition={{ 
                                  duration: 0.8, 
                                  delay: i * 0.15,
                                  ease: "easeOut"
                                }}
                              >
                                <motion.div 
                                  className="absolute inset-0"
                                  whileHover={{ scale: 1.02 }}
                                  transition={{ duration: 0.2 }}
                                  style={{
                                    background: `conic-gradient(from ${previousAngles}deg, 
                                      ${i % 2 === 0 ? 'rgb(139, 92, 246)' : 'rgb(124, 58, 237)'} ${angle}deg, 
                                      transparent ${angle}deg)`,
                                    filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.2))'
                                  }}
                                />
                              </motion.div>
                            )
                          })}
                          {/* Center circle */}
                          <div className="absolute inset-[22%] rounded-full bg-background/95 flex items-center justify-center shadow-lg border border-white/5">
                            <motion.div 
                              className="text-center"
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.5, delay: 0.8 }}
                            >
                              <div className="text-3xl font-bold bg-gradient-to-r from-violet-200 via-fuchsia-200 to-violet-200 bg-clip-text text-transparent">
                                {yearInReview.monthlyStats.reduce((sum, m) => sum + m.beats, 0)}
                              </div>
                              <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium mt-0.5">
                                Total Beats
                              </div>
                            </motion.div>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          {yearInReview.monthlyStats.slice(-6).map((month, i) => (
                            <motion.div
                              key={i}
                              className="relative group"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: i * 0.1 }}
                            >
                              {/* Hover gradient background */}
                              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-fuchsia-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              
                              {/* Card content */}
                              <div className="relative flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 transition-all duration-200 group-hover:border-violet-500/20">
                                {/* Accent line */}
                                <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full bg-gradient-to-b from-violet-500/50 to-fuchsia-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                
                                {/* Beat icon indicator */}
                                <div className="relative mt-1">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center group-hover:from-violet-500/20 group-hover:to-fuchsia-500/20 transition-all duration-300">
                                    <svg
                                      viewBox="0 0 24 24"
                                      className="w-4 h-4 text-violet-400 group-hover:text-violet-300 transition-colors duration-200"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M3 12h4v2H3z" />
                                      <path d="M7 8h4v10H7z" />
                                      <path d="M11 14h4v4h-4z" />
                                      <path d="M15 4h4v18h-4z" />
                                      <path d="M19 10h2v6h-2z" />
                                    </svg>
                                  </div>
                                  {/* Animated ring */}
                                  <div className="absolute inset-0 rounded-lg border-2 border-violet-400/30 group-hover:border-violet-400/50 group-hover:scale-110 transition-all duration-300">
                                    {/* Animated corner accents */}
                                    <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-violet-400/50 rounded-tr" />
                                    <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-violet-400/50 rounded-bl" />
                                  </div>
                                </div>

                                <div className="flex-1">
                                  {/* Month name */}
                                  <div className="text-[11px] font-medium text-zinc-400 group-hover:text-violet-200 transition-colors duration-200 uppercase tracking-wider mb-0.5">
                                    {month.month}
                                  </div>
                                  
                                  {/* Beat count */}
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-base font-semibold text-white/90 group-hover:text-white transition-colors duration-200">
                                      {month.beats}
                                    </span>
                                    <span className="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors duration-200">
                                      beats created
                                    </span>
                                  </div>

                                  {/* Progress bar */}
                                  <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(month.beats / Math.max(...yearInReview.monthlyStats.map(m => m.beats))) * 100}%` }}
                                      transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </LiquidCard>
      </DialogContent>
    </Dialog>
  )
} 