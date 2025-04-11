import { memo } from 'react'
import { Calendar, Music, CheckCircle, Clock } from 'lucide-react'
import { StatCard } from '../ui/stat-card'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface YearInReviewPreviewProps {
  totalBeats: number
  completedProjects: number
  averageBPM: number
  isLoading?: boolean
  onExport: () => void
  className?: string
}

export const YearInReviewPreview = memo(function YearInReviewPreview({
  totalBeats,
  completedProjects,
  averageBPM,
  isLoading = false,
  onExport,
  className
}: YearInReviewPreviewProps) {
  // Motivational lyrics that can be displayed
  const motivationalLyrics = [
    "A year of beats, a year of growth",
    "Every track tells your story",
    "From January to December, your sound evolved",
    "Your year in music, your legacy"
  ]
  
  // Randomly select a lyric
  const randomLyric = motivationalLyrics[Math.floor(Math.random() * motivationalLyrics.length)]

  if (isLoading) {
    return (
      <div className={cn(
        'relative h-auto w-full rounded-xl overflow-hidden',
        'bg-white/5 dark:bg-black/20 backdrop-blur-md',
        'border border-white/10 dark:border-white/5',
        'shadow-lg shadow-black/5 dark:shadow-black/10',
        'animate-pulse',
        className
      )}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="h-6 w-32 bg-white/10 rounded"></div>
              <div className="h-4 w-48 bg-white/10 rounded"></div>
            </div>
            <div className="h-10 w-10 bg-white/10 rounded-xl"></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[1, 2, 3].map((i) => (
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
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={cn('relative', className)}
    >
      <div
        className={cn(
          'relative h-auto w-full rounded-xl overflow-hidden',
          'bg-white/5 dark:bg-black/20 backdrop-blur-md',
          'border border-white/10 dark:border-white/5',
          'shadow-lg shadow-black/5 dark:shadow-black/10',
          'transition-all duration-300 ease-out',
          'hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1',
          'after:absolute after:inset-0 after:rounded-xl after:ring-1 after:ring-inset after:ring-white/10',
          'cursor-pointer',
          'group'
        )}
        onClick={onExport}
      >
        {/* WavTrack Logo Watermark */}
        <div className="absolute top-4 left-4 opacity-10">
          <div className="text-xl font-bold tracking-tight bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
            WavTrack
          </div>
        </div>
        
        <div className="flex flex-col p-6 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-zinc-100/90 dark:text-zinc-200/90">Year in Review</h3>
              <p className="text-sm font-medium text-zinc-400/90 dark:text-zinc-400/80 leading-relaxed">
                Your annual music production journey
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 dark:bg-black/20 text-primary/90 ring-1 ring-white/10 dark:ring-white/5 backdrop-blur-sm">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          
          {/* Progress Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 dark:bg-black/20 backdrop-blur-sm"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Music className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400/80">Total Beats</p>
                <p className="text-xl font-bold text-zinc-100">{totalBeats}</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 dark:bg-black/20 backdrop-blur-sm"
            >
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400/80">Completed</p>
                <p className="text-xl font-bold text-zinc-100">{completedProjects}</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 dark:bg-black/20 backdrop-blur-sm"
            >
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400/80">Avg BPM</p>
                <p className="text-xl font-bold text-zinc-100">{averageBPM}</p>
              </div>
            </motion.div>
          </div>
          
          {/* Motivational Lyric */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center py-2 italic text-sm text-zinc-400/80 border-t border-white/5 dark:border-white/5"
          >
            "{randomLyric}"
          </motion.div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-60" />
      </div>
    </motion.div>
  )
})
