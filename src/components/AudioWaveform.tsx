import { useEffect, useRef, useState } from 'react'
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

interface AudioWaveformProps {
  audioUrl: string
  id: string
  isPlaying: boolean
  onPlayToggle: (id: string) => void
  className?: string
}

export default function AudioWaveform({
  audioUrl,
  id,
  isPlaying,
  onPlayToggle,
  className,
}: AudioWaveformProps) {
  const waveformRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    // Create audio element
    const audio = new Audio(audioUrl)
    audioRef.current = audio

    // Set up event listeners
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration)
    })

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
    })

    audio.addEventListener('ended', () => {
      onPlayToggle(id)
    })

    // Generate a random waveform pattern for demo purposes
    if (waveformRef.current) {
      const waveformBars = 40 // Number of bars in the waveform
      waveformRef.current.innerHTML = '' // Clear any existing content

      for (let i = 0; i < waveformBars; i++) {
        const bar = document.createElement('div')
        // Random height between 20% and 100%
        const height = Math.floor(Math.random() * 80) + 20
        bar.className = `waveform-bar ${getWaveformGradientClass()} rounded-sm mx-px transition-all duration-300`
        bar.style.height = `${height}%`
        bar.style.width = '3px'
        waveformRef.current.appendChild(bar)
      }
    }

    return () => {
      audio.pause()
      audio.src = ''

      // Clean up event listeners
      audio.removeEventListener('loadedmetadata', () => {})
      audio.removeEventListener('timeupdate', () => {})
      audio.removeEventListener('ended', () => {})
    }
  }, [audioUrl, id, onPlayToggle])

  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  // Update the waveform visualization based on the current time
  useEffect(() => {
    if (!waveformRef.current || !duration) return

    const progress = currentTime / duration
    const bars = waveformRef.current.querySelectorAll('.waveform-bar')

    const activeBarCount = Math.floor(progress * bars.length)

    bars.forEach((bar, index) => {
      if (index < activeBarCount) {
        bar.classList.add('opacity-100')
      } else {
        bar.classList.add('opacity-40')
      }
    })
  }, [currentTime, duration])

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformRef.current || !audioRef.current || !duration) return

    const rect = waveformRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left // x position within the element
    const percentage = x / rect.width

    const newTime = percentage * duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const getWaveformGradientClass = () => {
    switch (theme) {
      case 'light':
        return 'waveform-gradient-light'
      case 'dark':
      default:
        return 'waveform-gradient-dark'
    }
  }

  return (
    <div className={cn('bg-card rounded-lg p-4 theme-transition', className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onPlayToggle(id)}
          className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors"
        >
          {isPlaying ? (
            <PauseIcon className="h-4 w-4 text-primary-foreground" />
          ) : (
            <PlayIcon className="h-4 w-4 text-primary-foreground ml-0.5" />
          )}
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {isMuted ? <SpeakerXMarkIcon className="h-4 w-4" /> : <SpeakerWaveIcon className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={e => setVolume(parseFloat(e.target.value))}
            className="w-20 accent-primary"
          />
        </div>
      </div>

      <div
        ref={waveformRef}
        onClick={handleProgressClick}
        className="h-24 flex items-center cursor-pointer mb-2"
        style={{ alignItems: 'flex-end' }}
      >
        {/* Waveform bars will be added dynamically */}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}
