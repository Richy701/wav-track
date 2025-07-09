import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Play, Pause, RotateCcw, Settings, Music, Radio } from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface SessionTimerProps {
  isWorking: boolean
  timeLeft: number
  isPlaying: boolean
  handlePlayPause: () => void
  handleReset: () => void
  handleModeChange: (working: boolean) => void
  workDuration: number
  breakDuration: number
  onWorkDurationChange: (duration: number) => void
  onBreakDurationChange: (duration: number) => void
  formatTime: (seconds: number) => string
  className?: string
}

export const SessionTimer: React.FC<SessionTimerProps> = ({
  isWorking,
  timeLeft,
  isPlaying,
  handlePlayPause,
  handleReset,
  handleModeChange,
  workDuration,
  breakDuration,
  onWorkDurationChange,
  onBreakDurationChange,
  formatTime,
  className
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [currentSession, setCurrentSession] = useState(1)
  const [isAmbientSoundPlaying, setIsAmbientSoundPlaying] = useState(false)
  const ambientSoundRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  // Calculate progress for the circular timer
  const CIRCLE_RADIUS = 120
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS
  const progress = ((isWorking ? workDuration * 60 : breakDuration * 60) - timeLeft) / (isWorking ? workDuration * 60 : breakDuration * 60) * CIRCLE_CIRCUMFERENCE

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
    focus: cn(
      "border-l-4 border-l-emerald-500/50 dark:border-l-emerald-400/20"
    ),
  }

  const textStyles = {
    timerText: "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-emerald-600 dark:text-emerald-400",
    sectionTitle: "text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400",
  }

  const buttonStyles = {
    gradient: cn(
      "relative w-full bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600",
      "text-white font-medium",
      "shadow-md hover:shadow-lg dark:shadow-emerald-500/10",
      "transition-all duration-200",
      "border border-emerald-500/20 dark:border-emerald-400/10",
      "hover:border-emerald-500/40 dark:hover:border-emerald-400/20",
      "rounded-xl"
    ),
    outlineGradient: cn(
      "relative w-full bg-white hover:bg-emerald-50 dark:bg-background dark:hover:bg-emerald-900/20",
      "text-emerald-700 dark:text-emerald-400 font-medium",
      "border border-emerald-300 dark:border-emerald-800",
      "shadow-sm hover:shadow-md dark:shadow-emerald-500/5",
      "transition-all duration-200",
      "hover:border-emerald-400 dark:hover:border-emerald-700",
      "rounded-xl"
    )
  }

  const toggleAmbientSound = () => {
    if (isAmbientSoundPlaying) {
      ambientSoundRef.current?.pause()
      setIsAmbientSoundPlaying(false)
      toast({
        title: "Ambient sound stopped",
        description: "Focus music has been paused",
      })
    } else {
      // In a real app, you'd load an actual audio file
      setIsAmbientSoundPlaying(true)
      toast({
        title: "Ambient sound playing",
        description: "Relaxing focus music is now playing",
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        cardStyles.base,
        cardStyles.focus,
        "flex flex-col items-center",
        cardStyles.padding,
        className
      )}
    >
      {/* Timer Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className={textStyles.sectionTitle}>
            {isWorking ? "Focus Session" : "Break Time"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAmbientSound}
            className="h-8 w-8 p-0"
          >
            {isAmbientSoundPlaying ? (
              <Music className="h-4 w-4 text-emerald-600" />
            ) : (
              <Radio className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="h-8 w-8 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Circular Timer */}
      <div className="relative mb-8">
        <svg width="280" height="280" className="transform -rotate-90">
          <circle
            cx="140"
            cy="140"
            r={CIRCLE_RADIUS}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-zinc-200 dark:text-zinc-800"
          />
          <circle
            cx="140"
            cy="140"
            r={CIRCLE_RADIUS}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={CIRCLE_CIRCUMFERENCE - progress}
            className="text-emerald-500 dark:text-emerald-400 transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={textStyles.timerText}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              Session {currentSession}
            </div>
          </div>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex space-x-4 mb-6 w-full max-w-md">
        <Button
          onClick={handlePlayPause}
          className={buttonStyles.gradient}
        >
          {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
          {isPlaying ? "Pause" : "Start"}
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          className={buttonStyles.outlineGradient}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </Button>
      </div>

      {/* Mode Toggle */}
      <div className="flex space-x-2 mb-6">
        <Button
          onClick={() => handleModeChange(true)}
          variant={isWorking ? "default" : "outline"}
          size="sm"
          className={isWorking ? buttonStyles.gradient : buttonStyles.outlineGradient}
        >
          Work
        </Button>
        <Button
          onClick={() => handleModeChange(false)}
          variant={!isWorking ? "default" : "outline"}
          size="sm"
          className={!isWorking ? buttonStyles.gradient : buttonStyles.outlineGradient}
        >
          Break
        </Button>
      </div>

      {/* Settings Panel */}
      {isSettingsOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="w-full border-t border-zinc-200 dark:border-zinc-800 pt-6"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                Work Duration: {workDuration} minutes
              </label>
              <Slider
                value={[workDuration]}
                onValueChange={(value) => onWorkDurationChange(value[0])}
                max={60}
                min={5}
                step={5}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                Break Duration: {breakDuration} minutes
              </label>
              <Slider
                value={[breakDuration]}
                onValueChange={(value) => onBreakDurationChange(value[0])}
                max={30}
                min={5}
                step={5}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                Ambient Sound
              </label>
              <Select defaultValue="none">
                <SelectTrigger>
                  <SelectValue placeholder="Select ambient sound" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="rain">Rain</SelectItem>
                  <SelectItem value="forest">Forest</SelectItem>
                  <SelectItem value="ocean">Ocean Waves</SelectItem>
                  <SelectItem value="cafe">Coffee Shop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default SessionTimer