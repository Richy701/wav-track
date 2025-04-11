import { memo } from 'react'
import { Share2, Music, CheckCircle, TrendingUp } from 'lucide-react'
import { StatCard } from '../ui/stat-card'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface ShareProgressPreviewProps {
  totalAchievements: number
  sharedAchievements: number
  isLoading?: boolean
  onExport: () => void
  className?: string
}

export const ShareProgressPreview = memo(function ShareProgressPreview({
  totalAchievements,
  sharedAchievements,
  isLoading = false,
  onExport,
  className
}: ShareProgressPreviewProps) {
  const sharePercentage = Math.round((sharedAchievements / totalAchievements) * 100)
  
  // Motivational lyrics that can be displayed
  const motivationalLyrics = [
    "I'm in the zone, leave me alone",
    "Every beat I drop is a step to the top",
    "Making waves with every track",
    "Your journey, your sound, your legacy"
  ]
  
  // Randomly select a lyric
  const randomLyric = motivationalLyrics[Math.floor(Math.random() * motivationalLyrics.length)]

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
              <h3 className="text-lg font-bold text-zinc-100/90 dark:text-zinc-200/90">Share Your Progress</h3>
              <p className="text-sm font-medium text-zinc-400/90 dark:text-zinc-400/80 leading-relaxed">
                Powered by WavTrack – Your Beat Journey Starts Here
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 dark:bg-black/20 text-primary/90 ring-1 ring-white/10 dark:ring-white/5 backdrop-blur-sm">
              <Share2 className="h-6 w-6" />
            </div>
          </div>
          
          {/* Progress Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
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
                <p className="text-xl font-bold text-zinc-100">{totalAchievements}</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 dark:bg-black/20 backdrop-blur-sm"
            >
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400/80">Completed</p>
                <p className="text-xl font-bold text-zinc-100">{sharedAchievements}</p>
              </div>
            </motion.div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium text-zinc-400/80">Progress</span>
              <span className="text-xs font-medium text-zinc-400/80">{sharePercentage}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 dark:bg-black/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${sharePercentage}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              />
            </div>
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