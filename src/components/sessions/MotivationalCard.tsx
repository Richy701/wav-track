import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Quote, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MotivationalTip {
  text: string
  artist: string
}

interface MotivationalCardProps {
  mode: 'work' | 'break'
  className?: string
}

export const MotivationalCard: React.FC<MotivationalCardProps> = ({
  mode,
  className
}) => {
  const [currentTip, setCurrentTip] = useState<MotivationalTip | null>(null)

  // Motivational tips based on mode
  const motivationalTips = {
    work: [
      { text: "Started from the bottom now we here", artist: "Drake - Started From The Bottom" },
      { text: "I'm out here grinding like I'm working at the studio", artist: "Drake - Energy" },
      { text: "I'm just feeling like the throne is for the taking, watch me take it", artist: "Drake - Forever" },
      { text: "I'm trying to do better than good enough", artist: "Drake - Best I Ever Had" },
      { text: "I'm the one that's living lavish, I'm the one that's getting passive", artist: "Drake - Money In The Grave" },
      { text: "I'm just trying to stay alive and take care of my people", artist: "Drake - God's Plan" },
      { text: "I'm just trying to be the best version of myself", artist: "Drake - Over" },
      { text: "I'm just trying to make the most of my time", artist: "Drake - Time Flies" },
      { text: "I'm just trying to be great", artist: "Drake - The Motto" },
      { text: "I'm just trying to be better than I was yesterday", artist: "Drake - 0 To 100" },
      { text: "Time is the most valuable currency", artist: "Dave - Twenty To One" },
      { text: "I got vision, that's something you can't buy", artist: "Dave - Starlight" },
      { text: "Success is not a destination, it's a journey", artist: "Dave - Survivor's Guilt" },
      { text: "They say success is the best revenge", artist: "Dave - Purple Heart" },
      { text: "I'm working twice as hard as I did last year", artist: "Dave - Professor X" },
      { text: "Every L is a lesson, that's how I'm seeing it", artist: "Dave - Heart Attack" },
      { text: "I've been grinding, no days off", artist: "Dave - Clash" },
      { text: "My work rate's been crazy, I've been working like a slave", artist: "Dave - Funky Friday" },
      { text: "I've got a bigger purpose than the surface", artist: "Dave - Environment" },
      { text: "Success is inevitable, failure's impossible", artist: "Dave - Psycho" },
      { text: "Work hard, stay focused, my vision tunneled", artist: "Tyler, The Creator - CORSO" },
      { text: "I'm going forward, can't go backwards", artist: "Tyler, The Creator - LUMBERJACK" },
      { text: "Find your wings, now it's time to fly", artist: "Tyler, The Creator - November" },
      { text: "Stay focused, don't let nothing stop your mission", artist: "Tyler, The Creator - SAFARI" },
      { text: "Create, never imitate", artist: "Tyler, The Creator - Manifesto" },
      { text: "Every move is calculated, watch me innovate", artist: "Tyler, The Creator - RUNITUP" },
      { text: "I'm on a mission, can't stop won't stop", artist: "Tyler, The Creator - WHO DAT BOY" },
    ],
    break: [
      { text: "Sometimes I need that time to myself", artist: "Drake - Take Care" },
      { text: "I'm just trying to keep my mind at ease", artist: "Drake - Keep The Family Close" },
      { text: "I'm just trying to stay focused", artist: "Drake - Focus" },
      { text: "I'm just trying to stay grounded", artist: "Drake - Weston Road Flows" },
      { text: "I'm just trying to stay humble", artist: "Drake - Humble" },
      { text: "I'm just trying to stay patient", artist: "Drake - Patient" },
      { text: "I'm just trying to stay grateful", artist: "Drake - Grateful" },
      { text: "I'm just trying to stay blessed", artist: "Drake - Blessings" },
      { text: "Take time to rest and recharge", artist: "Self-care wisdom" },
      { text: "Breaks are productive too", artist: "Productivity mindset" },
      { text: "Rest is not idleness", artist: "Wellness philosophy" },
      { text: "Recharge your creative energy", artist: "Creative process" },
      { text: "Taking breaks improves focus", artist: "Science-backed truth" },
      { text: "Rest is a productive use of time", artist: "Modern wisdom" },
    ]
  }

  const getRandomTip = () => {
    const tips = motivationalTips[mode]
    const randomIndex = Math.floor(Math.random() * tips.length)
    return tips[randomIndex]
  }

  useEffect(() => {
    setCurrentTip(getRandomTip())
  }, [mode])

  const refreshTip = () => {
    setCurrentTip(getRandomTip())
  }

  const cardStyles = {
    base: cn(
      "relative overflow-hidden rounded-2xl",
      "bg-gradient-to-br from-white/90 via-white/95 to-white/90",
      "dark:from-background/80 dark:via-background/95 dark:to-background/90",
      "border border-zinc-200/80 dark:border-zinc-800/80",
      "shadow-md dark:shadow-none",
      "transition-all duration-300 ease-in-out",
      "hover:scale-[1.01]"
    ),
    padding: "p-6 sm:p-7",
  }

  const textStyles = {
    quoteText: "text-sm sm:text-base italic leading-relaxed text-zinc-600 dark:text-zinc-400",
    attributionText: "text-xs text-zinc-500 dark:text-zinc-500",
    sectionTitle: "text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400",
  }

  if (!currentTip) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        cardStyles.base,
        cardStyles.padding,
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Quote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className={textStyles.sectionTitle}>
            {mode === 'work' ? 'Motivation' : 'Mindfulness'}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshTip}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <motion.div
        key={currentTip.text}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-3"
      >
        <blockquote className={textStyles.quoteText}>
          "{currentTip.text}"
        </blockquote>
        <cite className={textStyles.attributionText}>
          — {currentTip.artist}
        </cite>
      </motion.div>
    </motion.div>
  )
}

export default MotivationalCard