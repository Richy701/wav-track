import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Pause, Volume2, VolumeX, BarChart3, Activity, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EnhancedAudioVisualizer } from './EnhancedAudioVisualizer'

interface AudioPlayerProps {
  url: string
  className?: string
  showVisualizer?: boolean
}

export function AudioPlayer({ url, className, showVisualizer = true }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [activeTab, setActiveTab] = useState('waveform')
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeChange = (value: number[]) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return
    const newVolume = value[0]
    audioRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    const newMuted = !isMuted
    audioRef.current.volume = newMuted ? 0 : volume
    setIsMuted(newMuted)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn('space-y-4', className)}>
      <audio ref={audioRef} src={url} />
      
      {/* Audio Controls */}
      <div className="flex items-center gap-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          className="h-10 w-10"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        <div className="flex-1 space-y-2">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleTimeChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>
      </div>

      {/* Enhanced Audio Visualizations */}
      {showVisualizer && url && (
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="waveform" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Waveform
              </TabsTrigger>
              <TabsTrigger value="spectrum" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Spectrum
              </TabsTrigger>
              <TabsTrigger value="spectrogram" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Spectrogram
              </TabsTrigger>
              <TabsTrigger value="emotion" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Emotion
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="waveform" className="mt-4">
              <EnhancedAudioVisualizer
                audioElement={audioRef.current}
                visualizationType="waveform"
                currentTime={currentTime}
                isPlaying={isPlaying}
                className="h-32"
              />
            </TabsContent>
            
            <TabsContent value="spectrum" className="mt-4">
              <EnhancedAudioVisualizer
                audioElement={audioRef.current}
                visualizationType="spectrum"
                currentTime={currentTime}
                isPlaying={isPlaying}
                className="h-32"
              />
            </TabsContent>
            
            <TabsContent value="spectrogram" className="mt-4">
              <EnhancedAudioVisualizer
                audioElement={audioRef.current}
                visualizationType="spectrogram"
                currentTime={currentTime}
                isPlaying={isPlaying}
                className="h-32"
              />
            </TabsContent>
            
            <TabsContent value="emotion" className="mt-4">
              <EnhancedAudioVisualizer
                audioElement={audioRef.current}
                visualizationType="emotion"
                currentTime={currentTime}
                isPlaying={isPlaying}
                className="h-32"
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
} 