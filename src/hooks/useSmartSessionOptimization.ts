// Smart Session Optimization Hook
// Integrates ML-powered session optimization with existing WavTrack session system

import { useState, useCallback, useEffect, useRef } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import {
  SmartSessionData,
  SessionSuccessPredictor,
  ProductivityMonitor,
  SessionAnalytics
} from '@/lib/smart-session-optimizer'
import { UserBehaviorPattern } from '@/lib/adaptive-gamification'

interface SmartSessionOptions {
  enablePredictions?: boolean
  enableRealTimeMonitoring?: boolean
  enableAnalytics?: boolean
  sessionType?: SmartSessionData['sessionType']
  targetDuration?: number
}

interface SessionState {
  isActive: boolean
  currentSession: SmartSessionData | null
  timeElapsed: number
  predictionData?: {
    successProbability: number
    recommendations: string[]
    optimalNextTime?: Date
  }
  realTimeMetrics?: {
    focusScore: number
    energyLevel: number
    distractionCount: number
    flowStateAchieved: boolean
  }
}

export function useSmartSessionOptimization(options: SmartSessionOptions = {}) {
  const {
    enablePredictions = true,
    enableRealTimeMonitoring = true,
    enableAnalytics = true,
    sessionType = 'pomodoro',
    targetDuration = 60
  } = options

  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const [sessionState, setSessionState] = useState<SessionState>({
    isActive: false,
    currentSession: null,
    timeElapsed: 0
  })

  const predictorRef = useRef(new SessionSuccessPredictor())
  const monitorRef = useRef(new ProductivityMonitor())
  const analyticsRef = useRef(new SessionAnalytics())
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch user behavior pattern for predictions
  const userBehaviorQuery = useQuery({
    queryKey: ['user-behavior-smart-sessions', user?.id],
    queryFn: async () => {
      if (!user) return null
      // This would use the same behavior analysis from adaptive-gamification
      return await analyzeBehaviorPattern(user.id)
    },
    enabled: !!user && enablePredictions,
    staleTime: 30 * 60 * 1000 // 30 minutes
  })

  // Fetch recent session history
  const recentSessionsQuery = useQuery({
    queryKey: ['recent-smart-sessions', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('smart_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching recent sessions:', error)
        return []
      }

      return (data || []).map(session => ({
        id: session.id,
        userId: session.user_id,
        projectId: session.project_id,
        startTime: new Date(session.start_time),
        endTime: session.end_time ? new Date(session.end_time) : undefined,
        duration: session.duration,
        sessionType: session.session_type,
        productivity: JSON.parse(session.productivity || '{}'),
        environment: JSON.parse(session.environment || '{}'),
        outcomes: JSON.parse(session.outcomes || '{}'),
        aiInsights: session.ai_insights ? JSON.parse(session.ai_insights) : undefined
      })) as SmartSessionData[]
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Session analytics
  const analyticsQuery = useQuery({
    queryKey: ['session-analytics', user?.id, recentSessionsQuery.data?.length],
    queryFn: async () => {
      if (!recentSessionsQuery.data || !enableAnalytics) return null
      
      return analyticsRef.current.analyzeSessionTrends(recentSessionsQuery.data)
    },
    enabled: !!user && enableAnalytics && !!recentSessionsQuery.data,
    staleTime: 15 * 60 * 1000 // 15 minutes
  })

  // Save session mutation
  const saveSessionMutation = useMutation({
    mutationFn: async (sessionData: SmartSessionData) => {
      if (!user) return

      const { error } = await supabase
        .from('smart_sessions')
        .insert({
          id: sessionData.id,
          user_id: sessionData.userId,
          project_id: sessionData.projectId,
          start_time: sessionData.startTime.toISOString(),
          end_time: sessionData.endTime?.toISOString(),
          duration: sessionData.duration,
          session_type: sessionData.sessionType,
          productivity: JSON.stringify(sessionData.productivity),
          environment: JSON.stringify(sessionData.environment),
          outcomes: JSON.stringify(sessionData.outcomes),
          ai_insights: sessionData.aiInsights ? JSON.stringify(sessionData.aiInsights) : null
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-smart-sessions', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['session-analytics', user?.id] })
    }
  })

  // Start a smart session
  const startSession = useCallback(async (sessionOptions: {
    projectId?: string
    sessionType?: SmartSessionData['sessionType']
    duration?: number
    mood?: string
  } = {}) => {
    if (!user || sessionState.isActive) return

    const startTime = new Date()
    const sessionDuration = sessionOptions.duration || targetDuration

    // Generate prediction if enabled
    let predictionData
    if (enablePredictions && userBehaviorQuery.data && recentSessionsQuery.data) {
      const prediction = predictorRef.current.predictSessionSuccess(
        {
          startTime,
          duration: sessionDuration,
          sessionType: sessionOptions.sessionType || sessionType,
          userMood: sessionOptions.mood
        },
        userBehaviorQuery.data,
        recentSessionsQuery.data
      )

      predictionData = {
        successProbability: prediction.successProbability,
        recommendations: prediction.recommendations,
        optimalNextTime: prediction.factors.find(f => f.factor === 'Time of Day')?.impact > 0.7 
          ? undefined 
          : new Date(startTime.getTime() + 4 * 60 * 60 * 1000) // 4 hours later if timing isn't optimal
      }
    }

    // Start real-time monitoring if enabled
    if (enableRealTimeMonitoring) {
      monitorRef.current.startMonitoring({
        id: `session_${Date.now()}`,
        userId: user.id,
        projectId: sessionOptions.projectId,
        sessionType: sessionOptions.sessionType || sessionType
      })
    }

    // Start timer
    timerRef.current = setInterval(() => {
      setSessionState(prev => ({
        ...prev,
        timeElapsed: prev.timeElapsed + 1
      }))

      // Update real-time metrics
      if (enableRealTimeMonitoring) {
        const currentData = monitorRef.current.getCurrentSessionData()
        if (currentData) {
          setSessionState(prev => ({
            ...prev,
            realTimeMetrics: {
              focusScore: currentData.productivity.focusScore,
              energyLevel: currentData.productivity.energyLevel,
              distractionCount: currentData.productivity.distractionCount,
              flowStateAchieved: currentData.productivity.flowStateAchieved
            }
          }))
        }
      }
    }, 1000) // Update every second

    setSessionState({
      isActive: true,
      currentSession: null, // Will be populated by monitor
      timeElapsed: 0,
      predictionData,
      realTimeMetrics: enableRealTimeMonitoring ? {
        focusScore: 100,
        energyLevel: 80,
        distractionCount: 0,
        flowStateAchieved: false
      } : undefined
    })

  }, [user, sessionState.isActive, targetDuration, sessionType, enablePredictions, enableRealTimeMonitoring, userBehaviorQuery.data, recentSessionsQuery.data])

  // End session
  const endSession = useCallback(async () => {
    if (!sessionState.isActive || !user) return

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Get final session data from monitor
    let completedSession: SmartSessionData | null = null
    if (enableRealTimeMonitoring) {
      completedSession = monitorRef.current.endSession()
    }

    // Save session if we have data
    if (completedSession) {
      try {
        await saveSessionMutation.mutateAsync(completedSession)
      } catch (error) {
        console.error('Failed to save session:', error)
      }
    }

    setSessionState({
      isActive: false,
      currentSession: completedSession,
      timeElapsed: 0,
      predictionData: undefined,
      realTimeMetrics: undefined
    })

    return completedSession

  }, [sessionState.isActive, user, enableRealTimeMonitoring, saveSessionMutation])

  // Update session progress
  const updateSessionProgress = useCallback((progress: {
    beatsCreated?: number
    projectProgress?: number
    goalsAchieved?: string[]
  }) => {
    if (enableRealTimeMonitoring && sessionState.isActive) {
      monitorRef.current.updateProgress(progress)
    }
  }, [enableRealTimeMonitoring, sessionState.isActive])

  // Get session recommendations
  const getSessionRecommendations = useCallback(async (targetTime?: Date): Promise<{
    recommendedTime: Date
    alternatives: Array<{ time: Date; successProbability: number }>
    reasoning: string[]
  } | null> => {
    if (!enablePredictions || !userBehaviorQuery.data || !recentSessionsQuery.data) {
      return null
    }

    const target = targetTime || new Date()
    return predictorRef.current.findOptimalSessionTime(
      target,
      targetDuration,
      sessionType,
      userBehaviorQuery.data,
      recentSessionsQuery.data
    )
  }, [enablePredictions, userBehaviorQuery.data, recentSessionsQuery.data, targetDuration, sessionType])

  // Pause/Resume session
  const pauseSession = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const resumeSession = useCallback(() => {
    if (sessionState.isActive && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setSessionState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1
        }))
      }, 1000)
    }
  }, [sessionState.isActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Format time helper
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    // Session control
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    updateSessionProgress,
    
    // Session state
    sessionState,
    isActive: sessionState.isActive,
    timeElapsed: sessionState.timeElapsed,
    formattedTime: formatTime(sessionState.timeElapsed),
    
    // Predictions and recommendations
    getSessionRecommendations,
    predictionData: sessionState.predictionData,
    
    // Real-time metrics
    realTimeMetrics: sessionState.realTimeMetrics,
    
    // Analytics
    analytics: analyticsQuery.data,
    recentSessions: recentSessionsQuery.data || [],
    
    // Loading states
    isLoadingBehavior: userBehaviorQuery.isLoading,
    isLoadingSessions: recentSessionsQuery.isLoading,
    isLoadingAnalytics: analyticsQuery.isLoading,
    isSaving: saveSessionMutation.isPending,
    
    // Feature flags
    predictionsEnabled: enablePredictions,
    monitoringEnabled: enableRealTimeMonitoring,
    analyticsEnabled: enableAnalytics,
    
    // Manual refresh
    refreshData: () => {
      queryClient.invalidateQueries({ queryKey: ['user-behavior-smart-sessions', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['recent-smart-sessions', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['session-analytics', user?.id] })
    }
  }
}

// Helper function for behavior analysis (simplified version)
async function analyzeBehaviorPattern(userId: string): Promise<UserBehaviorPattern> {
  // This is a simplified version - in a real implementation, this would be more comprehensive
  try {
    const [sessionsResult, projectsResult, achievementsResult] = await Promise.all([
      supabase
        .from('sessions')
        .select('duration, created_at, productivity_score')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('projects')
        .select('created_at, completion_percentage, status, bpm, genre')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .limit(30),
      supabase
        .from('user_achievements')
        .select('unlocked_at')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false })
        .limit(20)
    ])

    const sessions = sessionsResult.data || []
    const projects = projectsResult.data || []
    const achievements = achievementsResult.data || []

    // Calculate basic patterns
    const avgSessionLength = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + (s.duration || 60), 0) / sessions.length
      : 60

    const sessionsPerWeek = Math.max(1, sessions.length / 4) // Assuming 4 weeks of data

    const completedProjects = projects.filter(p => p.status === 'completed').length
    const completionRate = projects.length > 0 ? completedProjects / projects.length : 0.5

    // Basic personality inference
    const personalityProfile = {
      openness: Math.min(1, (new Set(projects.map(p => p.genre)).size) / 5),
      conscientiousness: completionRate,
      extroversion: 0.5,
      agreeableness: 0.5,
      neuroticism: Math.max(0, 1 - (avgSessionLength / 90))
    }

    return {
      userId,
      sessionPatterns: {
        averageSessionLength: avgSessionLength,
        preferredWorkingHours: [9, 14, 19], // Default
        peakProductivityTime: 'morning',
        sessionsPerWeek
      },
      achievementPatterns: {
        completionRate,
        averageTimeToComplete: 7,
        preferredDifficulty: completionRate > 0.7 ? 'hard' : 'medium',
        motivationType: 'intrinsic'
      },
      contentPreferences: {
        preferredGenres: [],
        averageBPM: 120,
        energyPreference: 70,
        complexityPreference: 60
      },
      personalityProfile,
      productivityMetrics: {
        averageProjectCompletionTime: 14,
        beatsPerSession: 1,
        qualityScore: 70,
        consistencyScore: Math.min(1, sessionsPerWeek / 3)
      }
    }

  } catch (error) {
    console.error('Error analyzing behavior pattern:', error)
    
    // Return default pattern
    return {
      userId,
      sessionPatterns: {
        averageSessionLength: 60,
        preferredWorkingHours: [9, 14, 19],
        peakProductivityTime: 'morning',
        sessionsPerWeek: 3
      },
      achievementPatterns: {
        completionRate: 0.5,
        averageTimeToComplete: 7,
        preferredDifficulty: 'medium',
        motivationType: 'intrinsic'
      },
      contentPreferences: {
        preferredGenres: [],
        averageBPM: 120,
        energyPreference: 70,
        complexityPreference: 60
      },
      personalityProfile: {
        openness: 0.5,
        conscientiousness: 0.5,
        extroversion: 0.5,
        agreeableness: 0.5,
        neuroticism: 0.5
      },
      productivityMetrics: {
        averageProjectCompletionTime: 14,
        beatsPerSession: 1,
        qualityScore: 70,
        consistencyScore: 0.5
      }
    }
  }
}