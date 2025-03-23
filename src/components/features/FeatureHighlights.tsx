import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Headphones, Waveform, Sparkle } from '@phosphor-icons/react'

const features = [
  {
    title: 'Streamline Your Workflow',
    description: 'Organize all your beats and tracks in one central workspace',
    stat: 'Producers save 5+ hours weekly on project management',
    icon: Waveform,
    gradient: 'from-indigo-500 to-purple-500',
    bgGradient: 'from-indigo-500/20 to-purple-500/20',
    hoverGradient: 'from-indigo-600 to-purple-600',
    glowColor: 'indigo',
  },
  {
    title: 'Focus on Creating',
    description: 'Set production goals, track studio time, and eliminate creative roadblocks',
    stat: '78% of users report fewer unfinished projects',
    icon: Sparkle,
    gradient: 'from-violet-500 to-fuchsia-500',
    bgGradient: 'from-violet-500/20 to-fuchsia-500/20',
    hoverGradient: 'from-violet-600 to-fuchsia-600',
    glowColor: 'violet',
  },
  {
    title: 'Unlock Achievements',
    description: 'Earn rewards for consistently creating new projects and building momentum',
    stat: 'Producers with streaks finish 3× more tracks per month',
    icon: Headphones,
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-500/20 to-orange-500/20',
    hoverGradient: 'from-amber-600 to-orange-600',
    glowColor: 'amber',
  },
]

export function FeatureHighlights() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.1 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
      },
    },
  }

  return (
    <motion.div
      ref={containerRef}
      className="w-full max-w-3xl mx-auto h-auto"
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      <div className="space-y-10 pb-0">
        {features.map((feature, index) => (
          <div key={index}>
            <motion.div
              variants={itemVariants}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
              className={cn(
                'flex flex-col gap-4 p-6',
                'rounded-xl',
                'bg-white/80 dark:bg-zinc-900/70',
                'backdrop-blur-md',
                'border border-zinc-200/70 dark:border-zinc-800/70',
                'shadow-[0_8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]',
                'transition-all duration-300',
                'hover:shadow-[0_12px_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)]',
                'hover:border-zinc-300/90 dark:hover:border-zinc-700/90',
                'group relative overflow-hidden'
              )}
            >
              {/* Glow effect on hover */}
              <div
                className={cn(
                  'absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-70 blur-xl transition-opacity duration-500',
                  feature.bgGradient
                )}
              />

              {/* Right side accent line */}
              <div
                className={cn(
                  'absolute right-0 top-0 w-1 h-full',
                  'bg-gradient-to-b',
                  feature.gradient,
                  'opacity-60 dark:opacity-80 group-hover:opacity-100',
                  'transition-all duration-[800ms]'
                )}
              />

              {/* Header with icon */}
              <div className="flex items-start gap-4 relative z-10">
                <motion.div
                  whileHover={{
                    y: -5,
                    rotate: 5,
                    scale: 1.1,
                    transition: { type: 'spring', stiffness: 300 },
                  }}
                  className={cn(
                    'p-3 rounded-xl',
                    'bg-gradient-to-br',
                    feature.gradient,
                    'group-hover:bg-gradient-to-br',
                    feature.hoverGradient,
                    'shadow-lg',
                    `shadow-${feature.glowColor}-500/40`,
                    'transition-all duration-300'
                  )}
                >
                  <feature.icon size={24} weight="fill" className="text-white" />
                </motion.div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Stat highlight */}
              <div className="relative z-10 mt-1">
                <div
                  className={cn(
                    'p-3 rounded-lg',
                    'bg-zinc-100/80 dark:bg-zinc-800/80',
                    'border border-zinc-200/50 dark:border-zinc-700/50'
                  )}
                >
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    {feature.stat}
                  </p>
                </div>
              </div>

              {/* Bottom decoration */}
              <div
                className={cn(
                  'absolute bottom-0 right-0 w-32 h-32 -z-0 rounded-tl-full',
                  'bg-gradient-to-br opacity-10 dark:opacity-15',
                  feature.gradient,
                  'group-hover:opacity-15 dark:group-hover:opacity-25',
                  'transition-opacity duration-300'
                )}
              />
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
