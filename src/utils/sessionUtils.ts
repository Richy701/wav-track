export interface SessionData {
  id: string
  type: 'focus' | 'break'
  duration: number // in seconds
  completed: boolean
  startTime: Date
  endTime?: Date
  date: string // YYYY-MM-DD format
}

export interface DailyStats {
  date: string
  focusTime: number // total focus time in seconds
  completedSessions: number
  goalCompletionRate: number
  streak: number
}

export interface TimerSettings {
  focusDuration: number // in minutes
  breakDuration: number // in minutes
  soundEnabled: boolean
  notificationsEnabled: boolean
  autoStartBreaks: boolean
  autoStartFocus: boolean
}

export interface Goal {
  id: string
  text: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  estimatedMinutes: number
  createdAt: Date
  completedAt?: Date
  category?: string
}

// Default settings
export const defaultTimerSettings: TimerSettings = {
  focusDuration: 25,
  breakDuration: 5,
  soundEnabled: true,
  notificationsEnabled: true,
  autoStartBreaks: false,
  autoStartFocus: false
}

// Storage keys
export const STORAGE_KEYS = {
  TIMER_SETTINGS: 'wavtrack_timer_settings',
  GOALS: 'wavtrack_goals',
  SESSIONS: 'wavtrack_sessions',
  DAILY_STATS: 'wavtrack_daily_stats',
  CURRENT_STREAK: 'wavtrack_current_streak'
} as const

// Utility functions
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0]
}

export const getWeekStart = (date: Date = new Date()): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

// Storage functions
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Failed to save to localStorage (${key}):`, error)
  }
}

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key)
    if (stored === null) return defaultValue
    return JSON.parse(stored) as T
  } catch (error) {
    console.error(`Failed to load from localStorage (${key}):`, error)
    return defaultValue
  }
}

// Settings management
export const saveTimerSettings = (settings: TimerSettings): void => {
  saveToStorage(STORAGE_KEYS.TIMER_SETTINGS, settings)
}

export const loadTimerSettings = (): TimerSettings => {
  return loadFromStorage(STORAGE_KEYS.TIMER_SETTINGS, defaultTimerSettings)
}

// Goals management
export const saveGoals = (goals: Goal[]): void => {
  saveToStorage(STORAGE_KEYS.GOALS, goals)
}

export const loadGoals = (): Goal[] => {
  const goals = loadFromStorage<Goal[]>(STORAGE_KEYS.GOALS, [])
  // Convert date strings back to Date objects
  return goals.map(goal => ({
    ...goal,
    createdAt: new Date(goal.createdAt),
    completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined
  }))
}

// Session management
export const saveSessions = (sessions: SessionData[]): void => {
  saveToStorage(STORAGE_KEYS.SESSIONS, sessions)
}

export const loadSessions = (): SessionData[] => {
  const sessions = loadFromStorage<SessionData[]>(STORAGE_KEYS.SESSIONS, [])
  // Convert date strings back to Date objects
  return sessions.map(session => ({
    ...session,
    startTime: new Date(session.startTime),
    endTime: session.endTime ? new Date(session.endTime) : undefined
  }))
}

export const addSession = (session: SessionData): void => {
  const sessions = loadSessions()
  sessions.push(session)
  saveSessions(sessions)
}

// Statistics calculation
export const calculateDailyStats = (date: string = getTodayDateString()): DailyStats => {
  const sessions = loadSessions().filter(s => s.date === date && s.completed)
  const goals = loadGoals()
  const todayGoals = goals.filter(g => {
    const goalDate = new Date(g.createdAt).toISOString().split('T')[0]
    return goalDate === date
  })
  
  const focusTime = sessions
    .filter(s => s.type === 'focus')
    .reduce((total, s) => total + s.duration, 0)
  
  const completedSessions = sessions.filter(s => s.type === 'focus').length
  
  const completedGoals = todayGoals.filter(g => g.completed).length
  const goalCompletionRate = todayGoals.length > 0 ? (completedGoals / todayGoals.length) * 100 : 0
  
  const streak = calculateStreak()
  
  return {
    date,
    focusTime,
    completedSessions,
    goalCompletionRate,
    streak
  }
}

export const calculateStreak = (): number => {
  const sessions = loadSessions()
  const today = getTodayDateString()
  
  let streak = 0
  let currentDate = new Date()
  
  // Check each day going backwards
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const dayFocusTime = sessions
      .filter(s => s.date === dateStr && s.type === 'focus' && s.completed)
      .reduce((total, s) => total + s.duration, 0)
    
    // If this day has at least 25 minutes of focus time, continue streak
    if (dayFocusTime >= 25 * 60) {
      streak++
    } else if (dateStr !== today) {
      // Break streak if no focus time (except for today)
      break
    }
    
    // Go to previous day
    currentDate.setDate(currentDate.getDate() - 1)
    
    // Don't go back more than 365 days
    if (streak > 365) break
  }
  
  return streak
}

export const getWeeklyStats = (): { date: string; focusTime: number }[] => {
  const weekStart = getWeekStart()
  const stats: { date: string; focusTime: number }[] = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    const dailyStats = calculateDailyStats(dateStr)
    
    stats.push({
      date: dateStr,
      focusTime: dailyStats.focusTime
    })
  }
  
  return stats
}

// Notification functions
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return false
  }
  
  if (Notification.permission === 'granted') {
    return true
  }
  
  if (Notification.permission === 'denied') {
    return false
  }
  
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export const showNotification = (title: string, body: string, icon?: string): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      requireInteraction: true
    })
  }
}

// Sound management
export const playNotificationSound = (soundEnabled: boolean = true): void => {
  if (!soundEnabled) return
  
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime) // 800 Hz
    oscillator.type = 'sine'
    
    // Fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1)
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (error) {
    console.error('Failed to play notification sound:', error)
  }
}

// Validation functions
export const validateGoal = (text: string): { valid: boolean; error?: string } => {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Goal cannot be empty' }
  }
  
  if (text.trim().length > 200) {
    return { valid: false, error: 'Goal must be 200 characters or less' }
  }
  
  return { valid: true }
}

export const validateTimerDuration = (duration: number, type: 'focus' | 'break'): { valid: boolean; error?: string } => {
  if (type === 'focus') {
    if (duration < 1 || duration > 120) {
      return { valid: false, error: 'Focus time must be between 1 and 120 minutes' }
    }
  } else {
    if (duration < 1 || duration > 60) {
      return { valid: false, error: 'Break time must be between 1 and 60 minutes' }
    }
  }
  
  return { valid: true }
}

// Goal priority helpers
export const getPriorityColor = (priority: Goal['priority']): string => {
  switch (priority) {
    case 'high':
      return 'destructive'
    case 'medium':
      return 'default'
    case 'low':
      return 'secondary'
    default:
      return 'secondary'
  }
}

export const getPriorityOrder = (priority: Goal['priority']): number => {
  switch (priority) {
    case 'high':
      return 3
    case 'medium':
      return 2
    case 'low':
      return 1
    default:
      return 0
  }
}

export const sortGoalsByPriority = (goals: Goal[]): Goal[] => {
  return [...goals].sort((a, b) => {
    // First sort by completion status (incomplete first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    // Then sort by priority
    return getPriorityOrder(b.priority) - getPriorityOrder(a.priority)
  })
}