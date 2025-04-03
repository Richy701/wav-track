import { toast } from 'sonner'
import { getAudioContext, loadAudioBuffer, playAudioBuffer } from '@/lib/audioContext'

export interface TimerSession {
  id: string
  duration: number
  date: string
  type: 'work' | 'break'
}

export type NotificationSound = 'beep' | 'chime' | 'bell' | 'chirp' | 'ding'

export interface TimerSettings {
  workDuration: number
  breakDuration: number
  notificationSound: NotificationSound
}

// Use local audio files with dynamic base URL
const getBaseUrl = () => {
  // Check if we're in development or production
  const isDev = import.meta.env.DEV
  // For GitHub Pages deployment
  const basePath = import.meta.env.BASE_URL || ''
  return `${window.location.origin}${basePath}`
}

const SOUND_URLS = {
  beep: `${getBaseUrl()}/assets/audio/beep.mp3`,
  chime: `${getBaseUrl()}/assets/audio/chime.mp3`,
  bell: `${getBaseUrl()}/assets/audio/bell.mp3`,
  chirp: `${getBaseUrl()}/assets/audio/chirp.mp3`,
  ding: `${getBaseUrl()}/assets/audio/ding.mp3`,
} as const

// Cache for audio buffers
const audioBufferCache = new Map<NotificationSound, AudioBuffer>()

export const preloadAudio = async () => {
  // Check if Web Audio API is supported
  if (!getAudioContext()) {
    console.warn('Web Audio API is not supported in this browser, using fallback audio')
    return // Continue without throwing an error
  }

  try {
    console.log('Attempting to load audio files from:', SOUND_URLS)
    const results = await Promise.allSettled(
      Object.entries(SOUND_URLS).map(async ([key, url]) => {
        try {
          console.log(`Loading audio file: ${key} from ${url}`)
          const buffer = await loadAudioBuffer(url)
          if (buffer instanceof AudioBuffer) {
            audioBufferCache.set(key as NotificationSound, buffer)
            console.log(`Successfully loaded audio file: ${key}`)
            return key
          } else if (buffer instanceof HTMLAudioElement) {
            // Handle HTML Audio fallback
            console.log(`Loaded ${key} as HTML Audio Element (fallback)`)
            return key
          } else {
            console.warn(`Invalid audio buffer type for ${key}, skipping`)
          }
        } catch (error) {
          console.error(`Failed to load audio: ${key}`, error)
          // Don't throw, just report the error
          return null
        }
      })
    )

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value !== null).length
    const failureCount = results.length - successCount

    console.log(`Audio preload complete: ${successCount} succeeded, ${failureCount} failed`)

    if (successCount === 0) {
      console.warn('No audio files were successfully loaded')
    }
  } catch (error) {
    console.error('Failed to preload audio files:', error)
    // Don't throw, allow the application to continue functioning
  }
}

export const playNotificationSound = async (sound: NotificationSound = 'beep'): Promise<void> => {
  try {
    let buffer = audioBufferCache.get(sound)

    if (!buffer) {
      // If not in cache, try to load it
      try {
        console.log(`Sound '${sound}' not in cache, attempting to load from URL`)
        const newBuffer = await loadAudioBuffer(SOUND_URLS[sound])
        if (newBuffer instanceof AudioBuffer) {
          buffer = newBuffer
          audioBufferCache.set(sound, buffer)
          console.log(`Successfully loaded and cached sound: ${sound}`)
        } else if (newBuffer instanceof HTMLAudioElement) {
          // Play HTML Audio directly
          console.log(`Playing ${sound} as HTML Audio Element`)
          await newBuffer.play()
          return
        }
      } catch (error) {
        console.warn(`Failed to load sound '${sound}', trying fallback`, error)
        // Try fallback beep
        buffer = audioBufferCache.get('beep')
        if (!buffer) {
          // Try to load beep if not already loaded
          try {
            console.log('Attempting to load fallback beep sound')
            const beepBuffer = await loadAudioBuffer(SOUND_URLS.beep)
            if (beepBuffer instanceof AudioBuffer) {
              buffer = beepBuffer
              audioBufferCache.set('beep', buffer)
            }
          } catch (fallbackError) {
            console.error('Failed to load fallback sound', fallbackError)
            return // Continue without sound rather than throwing
          }
        }
      }
    }

    if (buffer instanceof AudioBuffer) {
      try {
        await playAudioBuffer(buffer)
      } catch (playError) {
        console.error(`Error playing sound '${sound}'`, playError)
        // Continue without sound
      }
    } else {
      console.warn(`No valid audio buffer available for '${sound}'`)
    }
  } catch (error) {
    console.error('Error in playNotificationSound:', error)
    // Don't throw, just log the error
  }
}

export const loadSessions = (): TimerSession[] => {
  try {
    const savedSessions = localStorage.getItem('timerSessions')
    return savedSessions ? JSON.parse(savedSessions) : []
  } catch (error) {
    console.error('Failed to load sessions:', error)
    return []
  }
}

export const saveSession = (sessions: TimerSession[], newSession: TimerSession): TimerSession[] => {
  try {
    const updatedSessions = [...sessions, newSession]
    localStorage.setItem('timerSessions', JSON.stringify(updatedSessions))
    return updatedSessions
  } catch (error) {
    console.error('Failed to save session:', error)
    return sessions
  }
}

export const loadNotificationSound = (): NotificationSound => {
  try {
    return (localStorage.getItem('notificationSound') as NotificationSound) || 'beep'
  } catch (error) {
    console.error('Failed to load notification sound setting:', error)
    return 'beep'
  }
}

export const saveNotificationSound = (sound: NotificationSound): void => {
  try {
    localStorage.setItem('notificationSound', sound)
  } catch (error) {
    console.error('Failed to save notification sound setting:', error)
  }
}

export const notifySessionCompletion = (mode: 'work' | 'break', duration: number): void => {
  const minutes = Math.floor(duration / 60)
  const message =
    mode === 'work'
      ? `Work session completed! (${minutes} minutes)`
      : `Break time over! (${minutes} minutes)`

  toast.success(message)
}

export const loadTimerSettings = (): TimerSettings => {
  try {
    const savedSettings = localStorage.getItem('timerSettings')
    if (savedSettings) {
      return JSON.parse(savedSettings)
    }
  } catch (error) {
    console.error('Failed to load timer settings:', error)
  }
  
  // Default settings
  return {
    workDuration: 25,
    breakDuration: 5,
    notificationSound: 'beep'
  }
}

export const saveTimerSettings = (settings: TimerSettings): void => {
  try {
    localStorage.setItem('timerSettings', JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save timer settings:', error)
  }
}
