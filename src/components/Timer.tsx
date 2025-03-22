import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Settings, Quote, Sparkles } from 'lucide-react';
import { 
  TimerSession, 
  loadSessions, 
  saveSession, 
  notifySessionCompletion, 
  playNotificationSound,
  NotificationSound,
  saveNotificationSound,
  loadNotificationSound,
  preloadAudio
} from './timer/timerUtils';
import { TimerDisplay } from './timer/TimerDisplay';
import { TimerControls } from './timer/TimerControls';
import { TimerModeSelector } from './timer/TimerModeSelector';
import { TimerSettings } from './timer/TimerSettings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { cleanupAudioContext } from '@/lib/audioContext';

// Import quotes from MotivationalQuotes component
const quotes = [
  {
    text: "The music is not in the notes, but in the silence between.",
    author: "Wolfgang Amadeus Mozart"
  },
  {
    text: "Your music is a reflection of your soul. Make it beautiful.",
    author: "Unknown"
  },
  {
    text: "Music gives a soul to the universe, wings to the mind, flight to the imagination.",
    author: "Plato"
  },
  {
    text: "One good thing about music, when it hits you, you feel no pain.",
    author: "Bob Marley"
  },
  {
    text: "Without music, life would be a mistake.",
    author: "Friedrich Nietzsche"
  },
  {
    text: "Music is the strongest form of magic.",
    author: "Marilyn Manson"
  },
  {
    text: "The only truth is music.",
    author: "Jack Kerouac"
  },
  {
    text: "If you're not doing what you love, you're wasting your time.",
    author: "Billy Joel"
  },
  {
    text: "Music is a higher revelation than all wisdom and philosophy.",
    author: "Ludwig van Beethoven"
  },
  {
    text: "The more you create, the more creative you become.",
    author: "Unknown"
  },
  {
    text: "If it sounds good, it is good.",
    author: "Duke Ellington"
  },
  {
    text: "Trust your ear. If something sounds good to you, it is good.",
    author: "Rick Rubin"
  }
];

export default function Timer() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(25 * 60); // Default 25 minutes for work period
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [workDuration, setWorkDuration] = useState(25); // Minutes
  const [breakDuration, setBreakDuration] = useState(5); // Minutes
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSound, setNotificationSound] = useState<NotificationSound>('beep');
  
  // Quote state
  const [quote, setQuote] = useState<typeof quotes[0]>(quotes[0]);
  const [fadeIn, setFadeIn] = useState(true);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioLoadAttempted = useRef(false);

  // Get a random quote that's different from the current one
  const getRandomQuote = () => {
    const filteredQuotes = quotes.filter(q => q.text !== quote.text);
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    return filteredQuotes[randomIndex];
  };

  // Change quote with animation
  const changeQuote = () => {
    setFadeIn(false);
    setTimeout(() => {
      setQuote(getRandomQuote());
      setFadeIn(true);
    }, 300);
  };

  // Initialize with a random quote
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);

  // Load settings from localStorage when component mounts
  useEffect(() => {
    setSessions(loadSessions());
    setNotificationSound(loadNotificationSound());
  }, []);
  
  // Save sessions to localStorage when they change
  useEffect(() => {
    localStorage.setItem('timerSessions', JSON.stringify(sessions));
  }, [sessions]);

  // Load audio files when component mounts
  useEffect(() => {
    if (!audioLoadAttempted.current) {
      audioLoadAttempted.current = true;
      
      const loadAudio = async () => {
        try {
          await preloadAudio();
          setIsAudioLoaded(true);
          setAudioError(null);
        } catch (error) {
          console.error('Failed to load audio files:', error);
          setIsAudioLoaded(false);
          setAudioError('Failed to load notification sounds. Timer will still work without sound.');
          toast.error('Failed to load notification sounds', {
            description: 'Timer will continue to work without sound notifications.'
          });
        }
      };

      // Add a delay and retry mechanism
      let retryCount = 0;
      const maxRetries = 3;
      
      const attemptLoad = () => {
        loadAudio().catch((error) => {
          console.error(`Audio load attempt ${retryCount + 1} failed:`, error);
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(attemptLoad, 1000 * retryCount); // Exponential backoff
          }
        });
      };

      // Start loading after user interaction
      const handleUserInteraction = () => {
        attemptLoad();
        // Remove event listeners after first interaction
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
      };

      // Add event listeners for user interaction
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('keydown', handleUserInteraction);

      return () => {
        // Clean up event listeners and audio context
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        cleanupAudioContext();
      };
    }
  }, []);

  // Handle timer completion with error handling
  const handleTimerComplete = useCallback(async () => {
    const currentMode = mode;
    
    // Save the completed session
    if (sessionStartTime) {
      const newSession: TimerSession = {
        id: Date.now().toString(),
        duration: initialTime,
        date: new Date().toISOString(),
        type: currentMode
      };
      
      setSessions(prevSessions => saveSession(prevSessions, newSession));
      notifySessionCompletion(currentMode, initialTime);
    }
    
    // Switch modes automatically
    const nextMode = currentMode === 'work' ? 'break' : 'work';
    setMode(nextMode);
    
    // Set new time based on next mode
    const nextTime = nextMode === 'work' ? workDuration * 60 : breakDuration * 60;
    setTime(nextTime);
    setInitialTime(nextTime);
    setIsRunning(false);
    setSessionStartTime(null);
    
    // Play sound notification with error handling
    if (isAudioLoaded) {
      try {
        await playNotificationSound(notificationSound);
      } catch (error) {
        console.error('Failed to play notification sound:', error);
        // Only show error if we haven't shown one already
        if (!audioError) {
          setAudioError('Failed to play notification sound');
          toast.error('Failed to play notification sound', {
            description: 'Please check your browser audio settings.'
          });
        }
      }
    }
  }, [mode, sessionStartTime, initialTime, workDuration, breakDuration, notificationSound, audioError, isAudioLoaded]);
  
  // Start/pause the timer
  const toggleTimer = () => {
    if (!isRunning) {
      // Starting the timer
      setSessionStartTime(new Date());
    }
    setIsRunning(!isRunning);
  };
  
  // Reset the timer
  const resetTimer = () => {
    if (isRunning && time > 5) {
      // Confirm reset if timer is running and has more than 5 seconds
      if (window.confirm("Timer is running. Are you sure you want to reset?")) {
        setIsRunning(false);
        const resetTime = mode === 'work' ? workDuration * 60 : breakDuration * 60;
        setTime(resetTime);
        setInitialTime(resetTime);
        setSessionStartTime(null);
      }
    } else {
      setIsRunning(false);
      const resetTime = mode === 'work' ? workDuration * 60 : breakDuration * 60;
      setTime(resetTime);
      setInitialTime(resetTime);
      setSessionStartTime(null);
    }
  };
  
  // Switch between work and break modes
  const switchMode = (newMode: 'work' | 'break') => {
    if (isRunning) {
      if (!window.confirm("Timer is running. Are you sure you want to switch modes?")) {
        return;
      }
      setIsRunning(false);
    }
    
    setMode(newMode);
    const newTime = newMode === 'work' ? workDuration * 60 : breakDuration * 60;
    setTime(newTime);
    setInitialTime(newTime);
    setSessionStartTime(null);
  };
  
  // Apply settings
  const applySettings = () => {
    if (isRunning) {
      if (!window.confirm("Timer is running. Changing settings will reset the timer. Continue?")) {
        return;
      }
    }
    
    const newTime = mode === 'work' ? workDuration * 60 : breakDuration * 60;
    setTime(newTime);
    setInitialTime(newTime);
    setIsRunning(false);
    setSessionStartTime(null);
    setShowSettings(false);
    
    // Save notification sound setting
    saveNotificationSound(notificationSound);
  };
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(interval);
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, handleTimerComplete]);

  return (
    <div className="bg-card rounded-xl p-6 animate-fade-in theme-transition">
      {/* Show audio error if exists */}
      {audioError && (
        <div className="mb-4 p-2 bg-destructive/10 text-destructive text-sm rounded-md">
          {audioError}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-5">
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
        <TimerSettings
          workDuration={workDuration}
          breakDuration={breakDuration}
          setWorkDuration={setWorkDuration}
          setBreakDuration={setBreakDuration}
          notificationSound={notificationSound}
          setNotificationSound={setNotificationSound}
          applySettings={applySettings}
        />
      ) : (
        <>
          <TimerModeSelector 
            mode={mode} 
            switchMode={switchMode} 
          />
          
          <TimerDisplay 
            time={time} 
            initialTime={initialTime} 
            sessionStartTime={sessionStartTime} 
            mode={mode} 
          />
          
          <TimerControls 
            isRunning={isRunning} 
            time={time} 
            initialTime={initialTime} 
            toggleTimer={toggleTimer} 
            resetTimer={resetTimer} 
          />

          {/* Motivational Quote Section */}
          <div className="mt-8 pt-5 border-t border-border/50">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Quote className="h-4 w-4 text-primary/70" />
                </div>
                <h4 className="text-sm font-medium text-muted-foreground">Daily Inspiration</h4>
              </div>
              <button
                onClick={changeQuote}
                className="h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                title="Get new quote"
                aria-label="Get new inspirational quote"
              >
                <Sparkles size={14} className="text-primary" />
              </button>
            </div>
            
            <div 
              className={cn(
                "transition-opacity duration-300", 
                fadeIn ? "opacity-100" : "opacity-0"
              )}
            >
              <div className="relative px-7 py-3">
                <Quote className="absolute left-1 top-0 h-4 w-4 text-primary/10" />
                <Quote className="absolute right-1 bottom-0 h-4 w-4 text-primary/10 rotate-180" />
                <div className="text-center space-y-3">
                  <p className="text-[15px] leading-relaxed text-foreground font-medium tracking-tight">
                    "{quote.text}"
                  </p>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent via-border/70 to-transparent"></div>
                    <span className="text-xs text-muted-foreground tracking-wide">
                      {quote.author}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
