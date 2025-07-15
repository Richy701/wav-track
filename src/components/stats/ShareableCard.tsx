import { motion, AnimatePresence } from 'framer-motion'
import { LiquidCard } from '@/components/ui/liquid-glass-card'
import { useState } from 'react'
import { Music2, TrendingUp, Activity, Users, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Stat {
  label: string
  value: number | string
}

interface ShareableCardProps {
  title: string
  description?: string
  stats: {
    label: string
    value: string
  }[]
}

const icons = [Music2, TrendingUp, Activity, Users]

export function ShareableCard({ title, description, stats }: ShareableCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleShare = async () => {
    const shareText = 
      `${title}\n\n` +
      stats.map(stat => `${stat.label}: ${stat.value}`).join('\n') +
      '\n\nPowered by WavTrack'

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
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

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="w-full"
    >
      <LiquidCard className="w-full bg-black/40 overflow-hidden">
        <div className="p-6 relative">
          {/* Subtle animated gradient background */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] via-transparent to-fuchsia-500/[0.02]"
            animate={{
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Title Section */}
          <div className="relative border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <motion.h2 
                className="text-4xl font-bold tracking-tight text-white mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {title}
              </motion.h2>
              <Button
                onClick={handleShare}
                variant="ghost"
                size="icon"
                className="rounded-full p-2 hover:bg-white/10 transition-colors"
              >
                <Share2 className="h-5 w-5 text-white/80" />
              </Button>
            </div>
            {description && (
              <motion.div 
                className="text-base text-zinc-200 font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {description}
              </motion.div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="relative grid grid-cols-2 gap-4">
            {stats.map((stat, index) => {
              const Icon = icons[index % icons.length]
              const gradients = [
                'from-violet-500/[0.08] via-violet-400/[0.04] to-fuchsia-500/[0.08]',
                'from-fuchsia-500/[0.08] via-pink-400/[0.04] to-rose-500/[0.08]',
                'from-rose-500/[0.08] via-amber-400/[0.04] to-orange-500/[0.08]',
                'from-orange-500/[0.08] via-yellow-400/[0.04] to-amber-500/[0.08]'
              ]
              const iconGradients = [
                'bg-violet-500/[0.08]',
                'bg-fuchsia-500/[0.08]',
                'bg-rose-500/[0.08]',
                'bg-amber-500/[0.08]'
              ]
              const iconColors = [
                'text-violet-200',
                'text-fuchsia-200',
                'text-rose-200',
                'text-amber-200'
              ]
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative group"
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                >
                  {/* Colorful stat card background */}
                  <motion.div 
                    className={cn(
                      "absolute inset-0 rounded-3xl bg-[#1a1a1a]/80",
                      "before:absolute before:inset-0 before:rounded-3xl",
                      `before:bg-gradient-to-br ${gradients[index % gradients.length]} before:opacity-100`,
                      "after:absolute after:inset-0 after:rounded-3xl after:border after:border-white/[0.03]"
                    )}
                    animate={{
                      scale: hoveredIndex === index ? 1.02 : 1
                    }}
                    transition={{ duration: 0.2 }}
                  />
                  
                  {/* Stat Content */}
                  <div className="relative p-4">
                    {/* Label & Icon Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-white font-medium uppercase tracking-wide">
                        {stat.label}
                      </div>
                      <motion.div 
                        className={cn(
                          "p-2.5 rounded-2xl",
                          iconGradients[index % iconGradients.length],
                          iconColors[index % iconColors.length],
                          "backdrop-blur-sm"
                        )}
                        animate={{
                          scale: hoveredIndex === index ? 1.1 : 1,
                          rotate: hoveredIndex === index ? [0, -10, 10, 0] : 0
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.div>
                    </div>

                    {/* Value */}
                    <motion.div 
                      className={cn(
                        stat.label === 'Top Genre'
                          ? 'text-[36px] sm:text-3xl font-bold tracking-tight text-white break-words whitespace-normal leading-tight'
                          : 'text-4xl font-bold tracking-tight text-white'
                      )}
                      animate={{
                        scale: hoveredIndex === index ? 1.02 : 1
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {stat.label === 'Top Genre' && stat.value === 'Uncategorized' ? (
                        <>
                          <span className="inline sm:hidden"></span>
                          <span className="hidden sm:inline">Uncategorized</span>
                        </>
                      ) : (
                        stat.value
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Footer */}
          <motion.div 
            className="relative mt-6 pt-4 flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            <div className="text-sm text-zinc-300 font-medium">
              {new Date().getFullYear()}
            </div>
            <div className="flex items-center gap-2">
              <motion.div 
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="text-sm text-zinc-300">
                Stats Generated
              </div>
            </div>
          </motion.div>
        </div>
      </LiquidCard>
    </motion.div>
  )
} 