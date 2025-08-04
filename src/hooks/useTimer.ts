import { useState, useEffect, useCallback, useRef } from 'react'
import {
  TimerSettings,
  SessionData,
  loadTimerSettings,
  saveTimerSettings,
  addSession,
  getTodayDateString,
  showNotification,
  playNotificationSound,
  requestNotificationPermission
} from '@/utils/sessionUtils'

export type TimerMode = 'focus' | 'break'
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'

export interface TimerState {
  // Time state
  timeLeft: number // seconds
  initialTime: number // seconds
  mode: TimerMode
  status: TimerStatus
  
  // Session tracking
  currentSessionId: string | null
  sessionStartTime: Date | null
  completedSessions: number
  
  // Settings
  settings: TimerSettings
}

export interface UseTimerReturn {
  // State
  state: TimerState
  
  // Controls
  start: () => void
  pause: () => void
  reset: () => void
  stop: () => void
  switchMode: (mode: TimerMode) => void
  
  // Settings
  updateSettings: (settings: Partial<TimerSettings>) => void
  setFocusDuration: (minutes: number) => void
  setBreakDuration: (minutes: number) => void
  
  // Computed values
  progress: number // 0-100
  formattedTime: string
  isActive: boolean
  isPaused: boolean
}

export const useTimer = (): UseTimerReturn => {
  const [state, setState] = useState<TimerState>(() => {
    const settings = loadTimerSettings()
    return {
      timeLeft: settings.focusDuration * 60,
      initialTime: settings.focusDuration * 60,
      mode: 'focus',
      status: 'idle',
      currentSessionId: null,
      sessionStartTime: null,
      completedSessions: 0,
      settings
    }
  })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasRequestedPermission = useRef(false)
  
  // Request notification permission on first load
  useEffect(() => {
    if (!hasRequestedPermission.current && state.settings.notificationsEnabled) {
      hasRequestedPermission.current = true
      requestNotificationPermission()
    }
  }, [state.settings.notificationsEnabled])
  
  // Timer countdown logic
  useEffect(() => {
    if (state.status === 'running' && state.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          const newTimeLeft = prev.timeLeft - 1
          
          if (newTimeLeft <= 0) {
            // Timer completed
            return {
              ...prev,
              timeLeft: 0,
              status: 'completed'
            }
          }
          
          return {
            ...prev,
            timeLeft: newTimeLeft
          }
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [state.status, state.timeLeft])
  
  // Handle timer completion
  useEffect(() => {
    if (state.status === 'completed' && state.currentSessionId) {
      handleTimerComplete()
    }
  }, [state.status, state.currentSessionId])
  
  const handleTimerComplete = useCallback(() => {
    const session: SessionData = {
      id: state.currentSessionId!,
      type: state.mode,
      duration: state.initialTime,
      completed: true,
      startTime: state.sessionStartTime!,
      endTime: new Date(),
      date: getTodayDateString()
    }
    
    // Save completed session
    addSession(session)
    
    // Show notification
    if (state.settings.notificationsEnabled) {
      const title = state.mode === 'focus' ? '🎉 Focus Session Complete!' : '✨ Break Time Over!'
      const body = state.mode === 'focus' 
        ? 'Great work! Time for a well-deserved break.' 
        : 'Break time is over. Ready to focus again?'
      showNotification(title, body)
    }
    
    // Play sound
    if (state.settings.soundEnabled) {
      playNotificationSound(true)
    }
    
    // Update completed sessions count
    const newCompletedSessions = state.mode === 'focus' ? state.completedSessions + 1 : state.completedSessions
    
    // Auto-switch modes if enabled
    const shouldAutoSwitch = state.mode === 'focus' 
      ? state.settings.autoStartBreaks 
      : state.settings.autoStartFocus
    
    if (shouldAutoSwitch) {
      const nextMode = state.mode === 'focus' ? 'break' : 'focus'
      const nextDuration = nextMode === 'focus' 
        ? state.settings.focusDuration * 60 
        : state.settings.breakDuration * 60
      
      setState(prev => ({
        ...prev,
        mode: nextMode,
        timeLeft: nextDuration,
        initialTime: nextDuration,
        status: 'running',
        currentSessionId: `session_${Date.now()}`,
        sessionStartTime: new Date(),
        completedSessions: newCompletedSessions
      }))
    } else {
      // Switch mode but don't auto-start
      const nextMode = state.mode === 'focus' ? 'break' : 'focus'
      const nextDuration = nextMode === 'focus' 
        ? state.settings.focusDuration * 60 
        : state.settings.breakDuration * 60
      
      setState(prev => ({
        ...prev,
        mode: nextMode,
        timeLeft: nextDuration,
        initialTime: nextDuration,
        status: 'idle',
        currentSessionId: null,
        sessionStartTime: null,
        completedSessions: newCompletedSessions
      }))
    }
  }, [state])
  
  const start = useCallback(() => {
    if (state.status === 'idle' || state.status === 'completed') {
      // Starting new session
      const sessionId = `session_${Date.now()}`
      setState(prev => ({
        ...prev,
        status: 'running',
        currentSessionId: sessionId,
        sessionStartTime: new Date()
      }))
    } else if (state.status === 'paused') {
      // Resuming paused session
      setState(prev => ({
        ...prev,
        status: 'running'
      }))
    }
  }, [state.status])
  
  const pause = useCallback(() => {
    if (state.status === 'running') {
      setState(prev => ({
        ...prev,
        status: 'paused'
      }))
    }
  }, [state.status])
  
  const reset = useCallback(() => {
    const duration = state.mode === 'focus' 
      ? state.settings.focusDuration * 60 
      : state.settings.breakDuration * 60
    
    setState(prev => ({
      ...prev,
      timeLeft: duration,
      initialTime: duration,
      status: 'idle',
      currentSessionId: null,
      sessionStartTime: null
    }))
  }, [state.mode, state.settings])
  
  const stop = useCallback(() => {
    // Stop current session and return to focus mode
    setState(prev => ({
      ...prev,
      mode: 'focus',
      timeLeft: prev.settings.focusDuration * 60,
      initialTime: prev.settings.focusDuration * 60,
      status: 'idle',
      currentSessionId: null,
      sessionStartTime: null
    }))
  }, [])
  
  const switchMode = useCallback((newMode: TimerMode) => {
    if (state.status === 'running') {
      // Confirm if user wants to switch during active session
      if (!window.confirm('Timer is running. Are you sure you want to switch modes?')) {
        return
      }
    }
    
    const duration = newMode === 'focus' 
      ? state.settings.focusDuration * 60 
      : state.settings.breakDuration * 60
    
    setState(prev => ({
      ...prev,
      mode: newMode,
      timeLeft: duration,
      initialTime: duration,
      status: 'idle',
      currentSessionId: null,
      sessionStartTime: null
    }))
  }, [state.status, state.settings])
  
  const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    const updatedSettings = { ...state.settings, ...newSettings }
    
    setState(prev => {
      const currentDuration = prev.mode === 'focus' 
        ? updatedSettings.focusDuration * 60 
        : updatedSettings.breakDuration * 60
      
      // Only update time if timer is idle
      const shouldUpdateTime = prev.status === 'idle'
      
      return {
        ...prev,
        settings: updatedSettings,
        timeLeft: shouldUpdateTime ? currentDuration : prev.timeLeft,
        initialTime: shouldUpdateTime ? currentDuration : prev.initialTime
      }
    })
    
    saveTimerSettings(updatedSettings)
  }, [state.settings, state.mode, state.status])
  
  const setFocusDuration = useCallback((minutes: number) => {
    updateSettings({ focusDuration: minutes })
  }, [updateSettings])
  
  const setBreakDuration = useCallback((minutes: number) => {
    updateSettings({ breakDuration: minutes })
  }, [updateSettings])
  
  // Computed values
  const progress = state.initialTime > 0 ? ((state.initialTime - state.timeLeft) / state.initialTime) * 100 : 0
  
  const formattedTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])
  
  const isActive = state.status === 'running'
  const isPaused = state.status === 'paused'
  
  return {
    state,
    start,
    pause,
    reset,
    stop,
    switchMode,
    updateSettings,
    setFocusDuration,
    setBreakDuration,
    progress,
    formattedTime: formattedTime(state.timeLeft),
    isActive,
    isPaused
  }
}