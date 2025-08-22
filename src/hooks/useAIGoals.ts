// AI-Powered Goals Hook
// Integrates intelligent goal setting and tracking with existing WavTrack goal system

import { useState, useCallback, useEffect } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { WeeklyGoal } from '@/lib/types'
import {
  SmartGoal,
  AIGoalRecommendationEngine,
  SmartProgressTracker,
  GoalRiskAssessment
} from '@/lib/ai-goal-system'
import { UserBehaviorPattern } from '@/lib/adaptive-gamification'

interface AIGoalOptions {
  enableAIRecommendations?: boolean
  enableProgressTracking?: boolean
  enableRiskAssessment?: boolean
  autoAdaptTargets?: boolean
}

interface GoalInsights {
  riskAssessment?: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    riskScore: number
    primaryRiskFactors: Array<{ factor: string; severity: number; mitigation: string }>
    recommendations: string[]
  }
  progressPrediction?: {
    projectedCompletion: string
    successProbability: number
    recommendedActions: string[]
  }
  personalizedRecommendations?: SmartGoal[]
}

export function useAIGoals(options: AIGoalOptions = {}) {
  const {
    enableAIRecommendations = true,
    enableProgressTracking = true,
    enableRiskAssessment = true,
    autoAdaptTargets = true
  } = options

  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [insights, setInsights] = useState<GoalInsights>({})
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)

  const recommendationEngine = new AIGoalRecommendationEngine()
  const progressTracker = new SmartProgressTracker()
  const riskAssessment = new GoalRiskAssessment()

  // Fetch existing goals (backward compatible with WeeklyGoal)
  const existingGoalsQuery = useQuery({
    queryKey: ['weekly-goals', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Error fetching goals:', error)
        return []
      }

      return data || []
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Fetch enhanced goals (SmartGoal format)
  const smartGoalsQuery = useQuery({
    queryKey: ['smart-goals', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('smart_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        // Table might not exist yet, return empty array
        console.log('Smart goals table not available yet')
        return []
      }

      return (data || []).map(goal => ({
        id: goal.id,
        userId: goal.user_id,
        targetBeats: goal.target_beats || 0,
        completedBeats: goal.completed_beats || 0,
        startDate: goal.start_date,
        endDate: goal.end_date,
        status: goal.status,
        createdAt: goal.created_at,
        updatedAt: goal.updated_at,
        type: goal.type || 'weekly',
        category: goal.category || 'production',
        priority: goal.priority || 'medium',
        difficulty: goal.difficulty || 'medium',
        aiGenerated: goal.ai_generated || false,
        personalityMatch: goal.personality_match || 0.5,
        successProbability: goal.success_probability || 0.5,
        adaptiveTargets: JSON.parse(goal.adaptive_targets || '{"minimum": 1, "optimal": 5, "stretch": 10}'),
        milestones: JSON.parse(goal.milestones || '[]'),
        progressInsights: JSON.parse(goal.progress_insights || '{}'),
        contextualFactors: JSON.parse(goal.contextual_factors || '{}')
      })) as SmartGoal[]
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000
  })

  // Fetch user behavior pattern
  const userBehaviorQuery = useQuery({
    queryKey: ['user-behavior-goals', user?.id],
    queryFn: async () => {
      if (!user) return null
      return await analyzeBehaviorPatternForGoals(user.id)
    },
    enabled: !!user && enableAIRecommendations,
    staleTime: 30 * 60 * 1000 // 30 minutes
  })

  // Fetch recent sessions for context
  const recentSessionsQuery = useQuery({
    queryKey: ['recent-sessions-goals', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error fetching recent sessions:', error)
        return []
      }

      return data || []
    },
    enabled: !!user && (enableProgressTracking || enableRiskAssessment),
    staleTime: 10 * 60 * 1000 // 10 minutes
  })

  // Save smart goal mutation
  const saveSmartGoalMutation = useMutation({
    mutationFn: async (goal: SmartGoal) => {
      if (!user) return

      const goalData = {
        id: goal.id,
        user_id: goal.userId,
        target_beats: goal.targetBeats,
        completed_beats: goal.completedBeats,
        start_date: goal.startDate,
        end_date: goal.endDate,
        status: goal.status,
        created_at: goal.createdAt,
        updated_at: goal.updatedAt,
        type: goal.type,
        category: goal.category,
        priority: goal.priority,
        difficulty: goal.difficulty,
        ai_generated: goal.aiGenerated,
        personality_match: goal.personalityMatch,
        success_probability: goal.successProbability,
        adaptive_targets: JSON.stringify(goal.adaptiveTargets),
        milestones: JSON.stringify(goal.milestones),
        progress_insights: JSON.stringify(goal.progressInsights),
        contextual_factors: JSON.stringify(goal.contextualFactors)
      }

      const { error } = await supabase
        .from('smart_goals')
        .upsert(goalData)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-goals', user?.id] })
    }
  })

  // Create traditional weekly goal mutation (backward compatibility)
  const createWeeklyGoalMutation = useMutation({
    mutationFn: async (goalData: Omit<WeeklyGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) return

      const { error } = await supabase
        .from('weekly_goals')
        .insert({
          ...goalData,
          userId: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-goals', user?.id] })
    }
  })

  // Generate AI recommendations
  const generateRecommendations = useCallback(async (preferences: {
    focusAreas?: ('production' | 'learning' | 'quality')[]
    timeCommitment?: 'low' | 'medium' | 'high'
    challengeLevel?: 'maintain' | 'increase' | 'decrease'
  } = {}) => {
    if (!enableAIRecommendations || !userBehaviorQuery.data) {
      return []
    }

    setIsGeneratingRecommendations(true)

    try {
      const currentSmartGoals = smartGoalsQuery.data || []
      const recommendations = await recommendationEngine.generatePersonalizedGoals(
        userBehaviorQuery.data,
        currentSmartGoals,
        preferences
      )

      setInsights(prev => ({
        ...prev,
        personalizedRecommendations: recommendations
      }))

      return recommendations
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return []
    } finally {
      setIsGeneratingRecommendations(false)
    }
  }, [enableAIRecommendations, userBehaviorQuery.data, smartGoalsQuery.data, recommendationEngine])

  // Update goal progress with AI insights
  const updateGoalProgress = useCallback(async (
    goalId: string,
    newProgress: number,
    sessionData?: {
      duration: number
      productivity: number
      beatsCreated: number
    }
  ) => {
    const goal = smartGoalsQuery.data?.find(g => g.id === goalId)
    if (!goal || !enableProgressTracking) return

    // Update progress using AI tracker
    const updatedGoal = progressTracker.updateGoalProgress(goal, newProgress, sessionData)

    // Auto-adapt targets if enabled and significant performance change detected
    if (autoAdaptTargets) {
      const recentProgress = [newProgress] // Would include more historical data in real implementation
      const adaptedGoal = progressTracker.adaptGoalTargets(updatedGoal, recentProgress)
      
      // Save updated goal
      await saveSmartGoalMutation.mutateAsync(adaptedGoal)
    } else {
      await saveSmartGoalMutation.mutateAsync(updatedGoal)
    }
  }, [smartGoalsQuery.data, enableProgressTracking, autoAdaptTargets, progressTracker, saveSmartGoalMutation])

  // Assess goal risk
  const assessGoalRisk = useCallback(async (goalId: string) => {
    if (!enableRiskAssessment || !userBehaviorQuery.data) return null

    const goal = smartGoalsQuery.data?.find(g => g.id === goalId)
    if (!goal) return null

    const riskAssessmentResult = riskAssessment.assessGoalRisk(
      goal,
      userBehaviorQuery.data,
      recentSessionsQuery.data || []
    )

    setInsights(prev => ({
      ...prev,
      riskAssessment: riskAssessmentResult
    }))

    return riskAssessmentResult
  }, [enableRiskAssessment, userBehaviorQuery.data, smartGoalsQuery.data, recentSessionsQuery.data, riskAssessment])

  // Create smart goal from recommendation
  const createSmartGoal = useCallback(async (recommendation: SmartGoal) => {
    if (!user) return

    const goal: SmartGoal = {
      ...recommendation,
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await saveSmartGoalMutation.mutateAsync(goal)
  }, [user, saveSmartGoalMutation])

  // Convert traditional goal to smart goal
  const upgradeToSmartGoal = useCallback(async (weeklyGoal: WeeklyGoal) => {
    if (!userBehaviorQuery.data) return

    const smartGoal: SmartGoal = {
      id: `smart_${weeklyGoal.id}`,
      userId: weeklyGoal.userId,
      targetBeats: weeklyGoal.targetBeats,
      completedBeats: weeklyGoal.completedBeats,
      startDate: weeklyGoal.startDate,
      endDate: weeklyGoal.endDate,
      status: weeklyGoal.status,
      createdAt: weeklyGoal.createdAt,
      updatedAt: new Date().toISOString(),
      
      // Enhanced properties with defaults
      type: 'weekly',
      category: 'production',
      priority: 'medium',
      difficulty: 'medium',
      aiGenerated: false,
      personalityMatch: 0.7,
      successProbability: 0.6,
      adaptiveTargets: {
        minimum: Math.max(1, Math.round(weeklyGoal.targetBeats * 0.6)),
        optimal: weeklyGoal.targetBeats,
        stretch: Math.round(weeklyGoal.targetBeats * 1.5)
      },
      milestones: [],
      progressInsights: {
        velocity: 0,
        projectedCompletion: weeklyGoal.endDate,
        riskFactors: [],
        successFactors: [],
        recommendations: []
      },
      contextualFactors: {
        seasonality: 'none',
        workload: 'normal',
        energyLevel: 70,
        motivation: 70,
        externalPressure: 30
      }
    }

    await saveSmartGoalMutation.mutateAsync(smartGoal)
  }, [userBehaviorQuery.data, saveSmartGoalMutation])

  // Auto-generate insights when data changes
  useEffect(() => {
    if (!enableRiskAssessment || !smartGoalsQuery.data || !userBehaviorQuery.data) return

    const activeGoals = smartGoalsQuery.data.filter(g => g.status === 'active')
    
    // Assess risk for all active goals
    activeGoals.forEach(async (goal) => {
      const risk = riskAssessment.assessGoalRisk(
        goal,
        userBehaviorQuery.data!,
        recentSessionsQuery.data || []
      )
      
      if (risk.riskLevel === 'high' || risk.riskLevel === 'critical') {
        setInsights(prev => ({
          ...prev,
          riskAssessment: risk
        }))
      }
    })
  }, [enableRiskAssessment, smartGoalsQuery.data, userBehaviorQuery.data, recentSessionsQuery.data, riskAssessment])

  // Get all goals (traditional + smart)
  const allGoals = useCallback(() => {
    const traditional = existingGoalsQuery.data || []
    const smart = smartGoalsQuery.data || []
    return { traditional, smart, total: traditional.length + smart.length }
  }, [existingGoalsQuery.data, smartGoalsQuery.data])

  return {
    // Goal data
    traditionalGoals: existingGoalsQuery.data || [],
    smartGoals: smartGoalsQuery.data || [],
    allGoals: allGoals(),
    
    // AI insights
    insights,
    personalizedRecommendations: insights.personalizedRecommendations || [],
    
    // Actions
    generateRecommendations,
    createSmartGoal,
    createWeeklyGoal: createWeeklyGoalMutation.mutate,
    upgradeToSmartGoal,
    updateGoalProgress,
    assessGoalRisk,
    
    // Loading states
    isLoadingGoals: existingGoalsQuery.isLoading || smartGoalsQuery.isLoading,
    isGeneratingRecommendations,
    isSavingGoal: saveSmartGoalMutation.isPending || createWeeklyGoalMutation.isPending,
    isLoadingBehavior: userBehaviorQuery.isLoading,
    
    // Feature flags
    aiRecommendationsEnabled: enableAIRecommendations,
    progressTrackingEnabled: enableProgressTracking,
    riskAssessmentEnabled: enableRiskAssessment,
    autoAdaptEnabled: autoAdaptTargets,
    
    // Utilities
    refreshData: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-goals', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['smart-goals', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['user-behavior-goals', user?.id] })
    }
  }
}

// Simplified behavior analysis for goals
async function analyzeBehaviorPatternForGoals(userId: string): Promise<UserBehaviorPattern> {
  try {
    const [sessionsResult, projectsResult, goalsResult] = await Promise.all([
      supabase
        .from('sessions')
        .select('duration, created_at, productivity_score')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('projects')
        .select('created_at, completion_percentage, status, bpm, genre')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .limit(20),
      supabase
        .from('weekly_goals')
        .select('status, targetBeats, completedBeats, createdAt, endDate')
        .eq('userId', userId)
        .limit(10)
    ])

    const sessions = sessionsResult.data || []
    const projects = projectsResult.data || []
    const goals = goalsResult.data || []

    // Calculate basic metrics
    const avgSessionLength = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + (s.duration || 60), 0) / sessions.length
      : 60

    const completedGoals = goals.filter(g => g.status === 'completed').length
    const goalCompletionRate = goals.length > 0 ? completedGoals / goals.length : 0.5

    const completedProjects = projects.filter(p => p.status === 'completed').length
    const projectCompletionRate = projects.length > 0 ? completedProjects / projects.length : 0.5

    // Estimate personality from behavior
    const personalityProfile = {
      openness: Math.min(1, (new Set(projects.map(p => p.genre)).size) / 5),
      conscientiousness: Math.max(goalCompletionRate, projectCompletionRate),
      extroversion: 0.5, // Default
      agreeableness: 0.5, // Default
      neuroticism: Math.max(0, 1 - (avgSessionLength / 90))
    }

    return {
      userId,
      sessionPatterns: {
        averageSessionLength: avgSessionLength,
        preferredWorkingHours: [9, 14, 19],
        peakProductivityTime: 'morning',
        sessionsPerWeek: Math.min(7, sessions.length / 2) // Rough estimate
      },
      achievementPatterns: {
        completionRate: goalCompletionRate,
        averageTimeToComplete: 7,
        preferredDifficulty: goalCompletionRate > 0.7 ? 'hard' : 'medium',
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
        consistencyScore: Math.min(1, (sessions.length / 7) / 3) // Sessions per week / target 3
      }
    }
  } catch (error) {
    console.error('Error analyzing behavior for goals:', error)
    
    // Return sensible defaults
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