import { memo } from 'react'
import { Music, Activity, Zap, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FadeIn } from '../ui/fade-in'

interface AudioAnalysisDisplayProps {
  bpm: number
  key: string
  mood: string
  energy: number
  danceability: number
  className?: string
}

export const AudioAnalysisDisplay = memo(function AudioAnalysisDisplay({
  bpm,
  key: musicalKey,
  mood,
  energy,
  danceability,
  className
}: AudioAnalysisDisplayProps) {
  const stats = [
    {
      label: 'BPM',
      value: bpm,
      icon: Music,
      color: 'text-blue-500'
    },
    {
      label: 'Key',
      value: musicalKey,
      icon: Music,
      color: 'text-purple-500'
    },
    {
      label: 'Mood',
      value: mood,
      icon: Heart,
      color: 'text-pink-500'
    },
    {
      label: 'Energy',
      value: `${energy}%`,
      icon: Zap,
      color: 'text-yellow-500'
    },
    {
      label: 'Danceability',
      value: `${danceability}%`,
      icon: Activity,
      color: 'text-green-500'
    }
  ]

  return (
    <FadeIn>
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4', className)}>
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="flex flex-col items-center p-4 rounded-lg bg-card border border-border/50"
          >
            <stat.icon className={cn('w-6 h-6 mb-2', stat.color)} />
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <span className="text-lg font-semibold">{stat.value}</span>
          </div>
        ))}
      </div>
    </FadeIn>
  )
}) 