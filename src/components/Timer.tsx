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
} from './timer/timerUtils'
import { TimerDisplay } from './timer/TimerDisplay'
import { TimerControls } from './timer/TimerControls'
import { TimerModeSelector } from './timer/TimerModeSelector'
import { TimerSettings } from './timer/TimerSettings'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { cleanupAudioContext } from '@/lib/audioContext'
import { motion, AnimatePresence } from 'framer-motion'

// Import quotes from MotivationalQuotes component
const quotes = [
  {
    text: 'The music is not in the notes, but in the silence between.',
    author: 'Wolfgang Amadeus Mozart',
  },
  {
    text: 'Your music is a reflection of your soul. Make it beautiful.',
    author: 'Unknown',
  },
  {
    text: 'Music gives a soul to the universe, wings to the mind, flight to the imagination.',
    author: 'Plato',
  },
  {
    text: 'One good thing about music, when it hits you, you feel no pain.',
    author: 'Bob Marley',
  },
  {
    text: 'Without music, life would be a mistake.',
    author: 'Friedrich Nietzsche',
  },
  {
    text: 'Music is the strongest form of magic.',
    author: 'Marilyn Manson',
  },
  {
    text: 'The only truth is music.',
    author: 'Jack Kerouac',
  },
  {
    text: "If you're not doing what you love, you're wasting your time.",
    author: 'Billy Joel',
  },
  {
    text: 'Music is a higher revelation than all wisdom and philosophy.',
    author: 'Ludwig van Beethoven',
  },
  {
    text: 'The more you create, the more creative you become.',
    author: 'Unknown',
  },
  {
    text: 'If it sounds good, it is good.',
    author: 'Duke Ellington',
  },
  {
    text: 'Trust your ear. If something sounds good to you, it is good.',
    author: 'Rick Rubin',
  },
]

const WORK_TIME = 25 * 60 // 25 minutes
const BREAK_TIME = 5 * 60 // 5 minutes

const motivationalQuotes = [
  "Every beat counts. Make it matter.",
  "Your next masterpiece is waiting.",
  "Stay in the groove.",
  "Keep the rhythm flowing.",
  "Let the music guide you.",
  "One session at a time.",
  "Your creativity knows no bounds.",
  "Make every note count.",
  "Stay focused, stay inspired.",
  "Your next hit is in this session."
]

export default function Timer() {
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(WORK_TIME)
  const [initialTime, setInitialTime] = useState(WORK_TIME)
  const [sessions, setSessions] = useState<TimerSession[]>([])
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [workDuration, setWorkDuration] = useState(25) // Minutes
  const [breakDuration, setBreakDuration] = useState(5) // Minutes
  const [showSettings, setShowSettings] = useState(false)
  const [notificationSound, setNotificationSound] = useState<NotificationSound>('beep')
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0])
  const [isAudioLoaded, setIsAudioLoaded] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const audioLoadAttempted = useRef(false)

  // Quote state
  const [quote, setQuote] = useState<(typeof quotes)[0]>(quotes[0])
  const [fadeIn, setFadeIn] = useState(true)

  // Get a random quote that's different from the current one and hasn't been shown recently
  const getRandomQuote = () => {
    const lastQuoteData = localStorage.getItem('lastQuote')
    const lastQuote = lastQuoteData ? JSON.parse(lastQuoteData) : null
    const today = new Date().toDateString()

    // If we have a last quote and it's from today, filter it out
    const availableQuotes = quotes.filter(q => {
      if (!lastQuote) return true
      return q.text !== lastQuote.text || lastQuote.date !== today
    })

    // If all quotes have been shown today, reset the filter
    if (availableQuotes.length === 0) {
      return quotes[Math.floor(Math.random() * quotes.length)]
    }

    const randomIndex = Math.floor(Math.random() * availableQuotes.length)
    return availableQuotes[randomIndex]
  }

  // Change quote with animation
  const changeQuote = () => {
    setFadeIn(false)
    setTimeout(() => {
      const newQuote = getRandomQuote()
      setQuote(newQuote)
      // Save the new quote and today's date
      localStorage.setItem('lastQuote', JSON.stringify({
        text: newQuote.text,
        date: new Date().toDateString()
      }))
      setFadeIn(true)
    }, 300)
  }

  // Initialize with a random quote
  useEffect(() => {
    const lastQuoteData = localStorage.getItem('lastQuote')
    const lastQuote = lastQuoteData ? JSON.parse(lastQuoteData) : null
    const today = new Date().toDateString()

    // If we have a last quote and it's from today, use it
    if (lastQuote && lastQuote.date === today) {
      const savedQuote = quotes.find(q => q.text === lastQuote.text)
      if (savedQuote) {
        setQuote(savedQuote)
      } else {
        setQuote(getRandomQuote())
      }
    } else {
      setQuote(getRandomQuote())
    }
  }, [])

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
        await playNotificationSound(notificationSound)
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
    const newTime = newMode === 'work' ? workDuration * 60 : breakDuration * 60
    setTime(newTime)
    setInitialTime(newTime)
    setSessionStartTime(null)
  }

  // Apply settings
  const applySettings = () => {
    if (isRunning) {
      if (!window.confirm('Timer is running. Changing settings will reset the timer. Continue?')) {
        return
      }
    }

    const newTime = mode === 'work' ? workDuration * 60 : breakDuration * 60
    setTime(newTime)
    setInitialTime(newTime)
    setIsRunning(false)
    setSessionStartTime(null)
    setShowSettings(false)

    // Save notification sound setting
    saveNotificationSound(notificationSound)
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

  // Update quote every 30 seconds
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuote(prev => {
        const currentIndex = motivationalQuotes.indexOf(prev)
        return motivationalQuotes[(currentIndex + 1) % motivationalQuotes.length]
      })
    }, 30000)

    return () => clearInterval(quoteInterval)
  }, [])

  return (
    <div className="bg-card rounded-xl p-3 animate-fade-in theme-transition h-[529px] flex flex-col overflow-hidden">
      {/* Show audio error if exists */}
      {audioError && (
        <div className="mb-2 p-2 bg-destructive/10 text-destructive text-sm rounded-md">
          {audioError}
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium flex items-center gap-2 theme-transition">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Bell size={16} className="text-primary theme-transition" />
          </div>
          Pomodoro Timer
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          title="Timer Settings"
          className="h-8 w-8 rounded-full bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-all duration-300 hover:rotate-45 transform"
          aria-label="Open timer settings"
        >
          <Settings size={14} />
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

          {/* Motivational Quote Section */}
          <div className="text-center space-y-0.5 -mt-5">
            <div className="flex items-center justify-center gap-1.5">
              <h4 className="text-xs font-medium text-muted-foreground/80">Daily Inspiration</h4>
            </div>
            <div className="relative">
              <motion.div
                key={currentQuote}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ duration: 0.2 }}
                >
                  <Quote className="w-3 h-3 text-muted-foreground/50 absolute -top-1 -left-1" />
                </motion.div>
                <p className="text-xs text-muted-foreground/90 italic">{currentQuote}</p>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
