import { useState, useEffect, useCallback } from 'react'
import {
  DailyStats,
  SessionData,
  calculateDailyStats,
  calculateStreak,
  getWeeklyStats,
  loadSessions,
  getTodayDateString
} from '@/utils/sessionUtils'

export interface UseStatsReturn {
  // Current stats
  todaysStats: DailyStats
  weeklyStats: { date: string; focusTime: number }[]
  currentStreak: number
  totalSessions: number
  totalFocusTime: number
  averageSessionLength: number
  recentSessions: SessionData[]
  
  // Actions
  refreshStats: () => void
  
  // Loading state
  isLoading: boolean
}

export const useStats = (): UseStatsReturn => {
  const [todaysStats, setTodaysStats] = useState<DailyStats>(() => calculateDailyStats())
  const [weeklyStats, setWeeklyStats] = useState<{ date: string; focusTime: number }[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [totalSessions, setTotalSessions] = useState(0)
  const [totalFocusTime, setTotalFocusTime] = useState(0)
  const [averageSessionLength, setAverageSessionLength] = useState(0)
  const [recentSessions, setRecentSessions] = useState<SessionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const calculateAllStats = useCallback(() => {
    try {
      setIsLoading(true)
      
      // Get all sessions
      const allSessions = loadSessions()
      const completedFocusSessions = allSessions.filter(s => s.type === 'focus' && s.completed)
      
      // Today's stats
      const todayStats = calculateDailyStats()
      setTodaysStats(todayStats)
      
      // Weekly stats
      const weekStats = getWeeklyStats()
      setWeeklyStats(weekStats)
      
      // Current streak
      const streak = calculateStreak()
      setCurrentStreak(streak)
      
      // Total sessions
      setTotalSessions(completedFocusSessions.length)
      
      // Total focus time
      const totalTime = completedFocusSessions.reduce((total, session) => total + session.duration, 0)
      setTotalFocusTime(totalTime)
      
      // Average session length
      const avgLength = completedFocusSessions.length > 0 
        ? totalTime / completedFocusSessions.length 
        : 0
      setAverageSessionLength(avgLength)
      
      // Recent sessions (last 5 completed focus sessions, sorted by most recent)
      const recentCompletedSessions = completedFocusSessions
        .sort((a, b) => new Date(b.endTime || b.startTime).getTime() - new Date(a.endTime || a.startTime).getTime())
        .slice(0, 5)
      setRecentSessions(recentCompletedSessions)
      
    } catch (error) {
      console.error('Failed to calculate stats:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  const refreshStats = useCallback(() => {
    calculateAllStats()
  }, [calculateAllStats])
  
  // Calculate stats on mount and set up periodic refresh
  useEffect(() => {
    calculateAllStats()
    
    // Refresh stats every minute to keep them current
    const interval = setInterval(calculateAllStats, 60000)
    
    return () => clearInterval(interval)
  }, [calculateAllStats])
  
  // Listen for storage changes to refresh stats when data is updated
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('wavtrack_')) {
        refreshStats()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [refreshStats])
  
  return {
    todaysStats,
    weeklyStats,
    currentStreak,
    totalSessions,
    totalFocusTime,
    averageSessionLength,
    recentSessions,
    refreshStats,
    isLoading
  }
}