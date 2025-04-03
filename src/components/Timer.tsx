import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell, Settings, Quote, Sparkles } from 'lucide-react'
import {
  TimerSession,
  loadSessions,
  saveSession,
  notifySessionCompletion,
  playNotificationSound,
  NotificationSound,
  saveNotificationSound,
  loadNotificationSound,
  preloadAudio,
  loadTimerSettings,
  saveTimerSettings,
} from './timer/timerUtils'
import { TimerDisplay } from './timer/TimerDisplay'
import { TimerControls } from './timer/TimerControls'
import { TimerModeSelector } from './timer/TimerModeSelector'
import { TimerSettings } from './timer/TimerSettings'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { cleanupAudioContext } from '@/lib/audioContext'
import { motion, AnimatePresence } from 'framer-motion'

const motivationalTips = {
  work: [
    { text: "Started from the bottom now we here", artist: "Drake - Started From The Bottom" },
    { text: "I'm just trying to be better than I was yesterday", artist: "Drake - 0 To 100" },
    { text: "Life is good", artist: "Future & Drake - Life Is Good" },
    { text: "I got loyalty, got royalty inside my DNA", artist: "Kendrick Lamar - DNA." },
    { text: "Work hard, stay focused, my vision tunneled", artist: "Tyler, The Creator - CORSO" },
    { text: "Time is the most valuable currency", artist: "Dave - Twenty To One" },
    { text: "Push myself to the limit, yeah, every day I'm winning", artist: "Lil Uzi Vert - Just Wanna Rock" },
    { text: "I'm working twice as hard as I did last year", artist: "Dave - Professor X" },
    { text: "Success is not a destination, it's a journey", artist: "Dave - Survivor's Guilt" },
    { text: "Every L is a lesson, that's how I'm seeing it", artist: "Dave - Heart Attack" }
  ],
  break: [
    { text: "Sometimes I need that time to myself", artist: "Drake - Take Care" },
    { text: "Take time to heal yourself", artist: "SZA - Special" },
    { text: "It's okay to put yourself first", artist: "SZA - Love Galore" },
    { text: "Find peace in solitude", artist: "SZA - Gone Girl" },
    { text: "Take a deep breath, reset your mind", artist: "SZA - Blind" },
    { text: "Sometimes silence is better than words", artist: "Future - Deeper Than The Ocean" },
    { text: "Take time to get my mind right", artist: "Future - All Bad" },
    { text: "Gotta stay balanced", artist: "Future - Overdose" },
    { text: "I love myself", artist: "Kendrick Lamar - i" },
    { text: "Take time to heal", artist: "Kendrick Lamar - United In Grief" }
  ]
}

const WORK_TIME = 25 * 60 // 25 minutes
const BREAK_TIME = 5 * 60 // 5 minutes

// Audio context and buffer management
const createAudioContext = () => new (window.AudioContext || (window as any).webkitAudioContext)()

// Get a random quote that's different from the current one
const getRandomQuote = (mode: 'work' | 'break', currentQuote?: { text: string; artist: string }) => {
  const quotes = mode === 'work' ? motivationalTips.work : motivationalTips.break
  if (currentQuote) {
    const filteredQuotes = quotes.filter(q => q.text !== currentQuote.text)
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length)
    return filteredQuotes[randomIndex]
  } else {
    const randomIndex = Math.floor(Math.random() * quotes.length)
    return quotes[randomIndex]
  }
}

export default function Timer() {
  // Load saved settings
  const savedSettings = loadTimerSettings()
  
  // State
  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [workDuration, setWorkDuration] = useState(savedSettings.workDuration)
  const [breakDuration, setBreakDuration] = useState(savedSettings.breakDuration)
  const [notificationSound, setNotificationSound] = useState<NotificationSound>(savedSettings.notificationSound)
  const [time, setTime] = useState(workDuration * 60)
  const [initialTime, setInitialTime] = useState(workDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [sessions, setSessions] = useState<TimerSession[]>(loadSessions())
  const [isAudioLoaded, setIsAudioLoaded] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [quote, setQuote] = useState(() => getRandomQuote('work'))
  const audioLoadAttempted = useRef(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  // Quote state
  const [fadeIn, setFadeIn] = useState(true)

  // Change quote with animation
  const changeQuote = () => {
    setFadeIn(false)
    setTimeout(() => {
      const newQuote = getRandomQuote(mode, quote)
      setQuote(newQuote)
      setFadeIn(true)
    }, 300)
  }

  // Update quote when mode changes
  useEffect(() => {
    setQuote(getRandomQuote(mode))
  }, [mode])

  // Load settings from localStorage when component mounts
  useEffect(() => {
    setSessions(loadSessions())
    setNotificationSound(loadNotificationSound())
  }, [])

  // Save sessions to localStorage when they change
  useEffect(() => {
    localStorage.setItem('timerSessions', JSON.stringify(sessions))
  }, [sessions])

  // Load audio files when component mounts
  useEffect(() => {
    if (!audioLoadAttempted.current) {
      audioLoadAttempted.current = true

      const loadAudio = async () => {
        try {
          await preloadAudio()
          setIsAudioLoaded(true)
          setAudioError(null)
        } catch (error) {
          console.error('Failed to load audio files:', error)
          setIsAudioLoaded(false)
          setAudioError('Failed to load notification sounds. Timer will still work without sound.')
          toast.error('Failed to load notification sounds', {
            description: 'Timer will continue to work without sound notifications.',
          })
        }
      }

      // Add a delay and retry mechanism
      let retryCount = 0
      const maxRetries = 3

      const attemptLoad = () => {
        loadAudio().catch(error => {
          console.error(`Audio load attempt ${retryCount + 1} failed:`, error)
          if (retryCount < maxRetries) {
            retryCount++
            setTimeout(attemptLoad, 1000 * retryCount) // Exponential backoff
          }
        })
      }

      // Start loading after user interaction
      const handleUserInteraction = () => {
        attemptLoad()
        // Remove event listeners after first interaction
        document.removeEventListener('click', handleUserInteraction)
        document.removeEventListener('keydown', handleUserInteraction)
      }

      // Add event listeners for user interaction
      document.addEventListener('click', handleUserInteraction)
      document.addEventListener('keydown', handleUserInteraction)

      return () => {
        // Clean up event listeners and audio context
        document.removeEventListener('click', handleUserInteraction)
        document.removeEventListener('keydown', handleUserInteraction)
        cleanupAudioContext()
      }
    }
  }, [])

  // Handle timer completion with error handling
  const handleTimerComplete = useCallback(async () => {
    const currentMode = mode

    // Save the completed session
    if (sessionStartTime) {
      const newSession: TimerSession = {
        id: Date.now().toString(),
        duration: initialTime,
        date: new Date().toISOString(),
        type: currentMode,
      }

      setSessions(prevSessions => saveSession(prevSessions, newSession))
      notifySessionCompletion(currentMode, initialTime)
    }

    // Switch modes automatically
    const nextMode = currentMode === 'work' ? 'break' : 'work'
    setMode(nextMode)

    // Set new time based on next mode
    const nextTime = nextMode === 'work' ? workDuration * 60 : breakDuration * 60
    setTime(nextTime)
    setInitialTime(nextTime)
    setIsRunning(false)
    setSessionStartTime(null)

    // Play sound notification with error handling
    if (isAudioLoaded) {
      try {
        await playNotification()
      } catch (error) {
        console.error('Failed to play notification sound:', error)
        // Only show error if we haven't shown one already
        if (!audioError) {
          setAudioError('Failed to play notification sound')
          toast.error('Failed to play notification sound', {
            description: 'Please check your browser audio settings.',
          })
        }
      }
    }
  }, [
    mode,
    sessionStartTime,
    initialTime,
    workDuration,
    breakDuration,
    notificationSound,
    audioError,
    isAudioLoaded,
  ])

  // Start/pause the timer
  const toggleTimer = () => {
    if (!isRunning) {
      // Starting the timer
      setSessionStartTime(new Date())
    }
    setIsRunning(!isRunning)
  }

  // Reset the timer
  const resetTimer = () => {
    if (isRunning && time > 5) {
      // Confirm reset if timer is running and has more than 5 seconds
      if (window.confirm('Timer is running. Are you sure you want to reset?')) {
        setIsRunning(false)
        const resetTime = mode === 'work' ? workDuration * 60 : breakDuration * 60
        setTime(resetTime)
        setInitialTime(resetTime)
        setSessionStartTime(null)
      }
    } else {
      setIsRunning(false)
      const resetTime = mode === 'work' ? workDuration * 60 : breakDuration * 60
      setTime(resetTime)
      setInitialTime(resetTime)
      setSessionStartTime(null)
    }
  }

  // Switch between work and break modes
  const switchMode = (newMode: 'work' | 'break') => {
    if (isRunning) {
      if (!window.confirm('Timer is running. Are you sure you want to switch modes?')) {
        return
      }
      setIsRunning(false)
    }

    setMode(newMode)
    const newDuration = newMode === 'work' ? workDuration : breakDuration
    setTime(newDuration * 60)
    setInitialTime(newDuration * 60)
    setSessionStartTime(null)
    
    // Change quote when switching modes
    setQuote(getRandomQuote(newMode))
  }

  // Apply settings
  const applySettings = () => {
    if (isRunning) {
      if (!window.confirm('Timer is running. Changing settings will reset the timer. Continue?')) {
        return
      }
    }

    // Save all settings
    saveTimerSettings({
      workDuration,
      breakDuration,
      notificationSound
    })

    // Update timer state
    const newTime = mode === 'work' ? workDuration * 60 : breakDuration * 60
    setTime(newTime)
    setInitialTime(newTime)
    setIsRunning(false)
    setSessionStartTime(null)
    setShowSettings(false)
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false)
            setSessionStartTime(null)
            return mode === 'work' ? BREAK_TIME : WORK_TIME
          }
          return prevTime - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, time, mode])

  // Preload audio file
  const preloadAudio = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = createAudioContext()
      }

      // Map notification sounds to their file names
      const soundFiles: Record<NotificationSound, string> = {
        'beep': 'beep.mp3',
        'bell': 'bell.mp3',
        'chime': 'chime.mp3',
        'chirp': 'chirp.mp3',
        'ding': 'ding.mp3'
      }

      const audioFile = soundFiles[notificationSound]
      const baseUrl = import.meta.env.BASE_URL || ''
      const response = await fetch(`${baseUrl}assets/audio/${audioFile}`)
      
      if (!response.ok) {
        throw new Error(`Failed to load audio file: ${response.statusText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error('Received empty audio file')
      }

      try {
        audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer)
        setIsAudioLoaded(true)
        setAudioError(null)
      } catch (decodeError) {
        console.error('Audio decoding error:', decodeError)
        throw new Error('Failed to decode audio file')
      }
    } catch (error) {
      console.error('Error preloading audio:', error)
      setAudioError('Failed to load notification sound. Please check your audio settings.')
      setIsAudioLoaded(false)
    }
  }

  // Effect to reload audio when notification sound changes
  useEffect(() => {
    if (isAudioLoaded) {
      preloadAudio()
    }
  }, [notificationSound])

  // Initialize audio nodes
  const initializeAudioNodes = () => {
    if (!audioContextRef.current || !audioBufferRef.current) return

    gainNodeRef.current = audioContextRef.current.createGain()
    gainNodeRef.current.gain.value = 0.5 // Set default volume to 50%

    audioSourceRef.current = audioContextRef.current.createBufferSource()
    audioSourceRef.current.buffer = audioBufferRef.current
    audioSourceRef.current.connect(gainNodeRef.current)
    gainNodeRef.current.connect(audioContextRef.current.destination)
  }

  // Play notification sound
  const playNotification = async () => {
    try {
      if (!audioBufferRef.current) {
        await preloadAudio()
      }

      if (!audioContextRef.current || !audioBufferRef.current) {
        throw new Error('Audio context or buffer not initialized')
      }

      // Resume audio context if it was suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      // Create new source for each play
      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBufferRef.current

      // Create new gain node for each play
      const gain = audioContextRef.current.createGain()
      gain.gain.value = 0.5

      // Connect nodes
      source.connect(gain)
      gain.connect(audioContextRef.current.destination)

      // Play sound
      source.start(0)

      // Cleanup after playback
      source.onended = () => {
        source.disconnect()
        gain.disconnect()
      }
    } catch (error) {
      console.error('Error playing notification:', error)
      setAudioError('Failed to play notification sound. Please check your audio settings.')
    }
  }

  // Cleanup audio resources
  const cleanupAudio = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop()
      audioSourceRef.current.disconnect()
      audioSourceRef.current = null
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect()
      gainNodeRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }

  // Effect to handle audio initialization and cleanup
  useEffect(() => {
    preloadAudio()
    return () => {
      cleanupAudio()
    }
  }, [])

  // Add effect to change quote every 3 minutes
  useEffect(() => {
    const quoteInterval = setInterval(changeQuote, 180000) // 3 minutes
    return () => clearInterval(quoteInterval)
  }, [mode]) // Reset interval when mode changes

  return (
    <div className="bg-card rounded-xl p-3 animate-fade-in theme-transition h-[480px] flex flex-col relative z-10 -mt-1 shadow-sm">
      {/* Show audio error if exists */}
      {audioError && (
        <div className="mb-2 p-2 bg-destructive/10 text-destructive text-sm rounded-md">
          {audioError}
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <h3 className={cn(
            "font-medium flex items-center gap-2 theme-transition",
            mode === 'work'
              ? "text-emerald-600/90 dark:text-emerald-400/90"
              : "text-violet-600/90 dark:text-violet-400/90"
          )}>
            <div className={cn(
              "p-1.5 rounded-md",
              mode === 'work'
                ? "bg-emerald-100 dark:bg-emerald-500/10"
                : "bg-violet-100 dark:bg-violet-500/10"
            )}>
              <Bell size={16} className={cn(
                mode === 'work'
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-violet-600 dark:text-violet-400"
              )} />
            </div>
            Pomodoro Timer
          </h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Timer Settings"
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 hover:rotate-45 transform",
              mode === 'work'
                ? "bg-emerald-100/50 hover:bg-emerald-200/50 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20"
                : "bg-violet-100/50 hover:bg-violet-200/50 dark:bg-violet-500/10 dark:hover:bg-violet-500/20"
            )}
            aria-label="Open timer settings"
          >
            <Settings size={14} className={cn(
              mode === 'work'
                ? "text-emerald-600/90 dark:text-emerald-400/90"
                : "text-violet-600/90 dark:text-violet-400/90"
            )} />
          </button>
        </div>

        {showSettings ? (
          <div className="flex-1">
            <TimerSettings
              workDuration={workDuration}
              breakDuration={breakDuration}
              setWorkDuration={setWorkDuration}
              setBreakDuration={setBreakDuration}
              notificationSound={notificationSound}
              setNotificationSound={setNotificationSound}
              applySettings={applySettings}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              <TimerModeSelector mode={mode} onModeChange={switchMode} />
              <TimerDisplay
                time={time}
                initialTime={initialTime}
                sessionStartTime={sessionStartTime}
                mode={mode}
                isRunning={isRunning}
              />
              <TimerControls
                isRunning={isRunning}
                onStart={toggleTimer}
                onPause={toggleTimer}
                onReset={resetTimer}
                onSkip={handleTimerComplete}
                mode={mode}
              />
            </div>

            {/* Subtle divider */}
            <div className="h-px bg-border/30 my-0.5" />

            {/* Motivational Quote */}
            <div className="text-center h-[80px] flex items-center justify-center relative w-full px-4 group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={quote.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 0.4,
                    ease: "easeOut"
                  }}
                  className={cn(
                    "space-y-2 absolute inset-x-0 mx-auto",
                    mode === 'work'
                      ? "text-emerald-600/90 dark:text-emerald-400/90"
                      : "text-violet-600/90 dark:text-violet-400/90"
                  )}
                >
                  <div className="relative">
                    <button
                      onClick={changeQuote}
                      className={cn(
                        "absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                        mode === 'work'
                          ? "hover:bg-emerald-100 dark:hover:bg-emerald-500/10"
                          : "hover:bg-violet-100 dark:hover:bg-violet-500/10"
                      )}
                      title="Change quote"
                    >
                      <Sparkles className={cn(
                        "w-3.5 h-3.5",
                        mode === 'work'
                          ? "text-emerald-600/90 dark:text-emerald-400/90"
                          : "text-violet-600/90 dark:text-violet-400/90"
                      )} />
                    </button>
                    <p className="text-base font-medium leading-relaxed tracking-tight text-center mx-auto">
                      "{quote.text}"
                    </p>
                  </div>
                  <p className="text-xs font-medium tracking-wide opacity-70 text-center">
                    {quote.artist}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

