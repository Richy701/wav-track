// Enhanced Adaptive Achievements Hook
// Integrates ML-powered adaptive gamification while maintaining backward compatibility with existing useAchievements

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Achievement, UserAchievement } from '@/lib/types'
import { 
  AdaptiveAchievement, 
  UserBehaviorPattern, 
  AdaptiveDifficultyEngine,
  AIAchievementGenerator,
  SmartGoalRecommendationEngine,
  enhanceExistingAchievements
} from '@/lib/adaptive-gamification'
import React from 'react'

// Enhanced hook that wraps the original functionality
export function useAdaptiveAchievements(options: {
  enableMLFeatures?: boolean
  enableAIGeneration?: boolean
  adaptiveDifficulty?: boolean
} = {}) {
  const { 
    enableMLFeatures = true, 
    enableAIGeneration = true,
    adaptiveDifficulty = true 
  } = options

  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Import original achievements functionality
  const originalAchievementsQuery = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      if (!user) return []

      try {
        // Fetch all data in parallel for better performance
        const [
          beatActivitiesResult,
          activeProjectsResult,
          allAchievementsResult
        ] = await Promise.all([
          supabase
            .from('beat_activities')
            .select('count')
            .eq('user_id', user.id),
          supabase
            .from('projects')
            .select('status')
            .eq('user_id', user.id)
            .eq('is_deleted', false),
          supabase
            .from('achievements')
            .select('*')
            .order('tier', { ascending: true })
        ])

        // Handle errors from original implementation
        if (beatActivitiesResult.error) throw beatActivitiesResult.error
        if (activeProjectsResult.error) throw activeProjectsResult.error
        if (allAchievementsResult.error) throw allAchievementsResult.error

        const beatActivities = beatActivitiesResult.data
        const activeProjects = activeProjectsResult.data
        let allAchievements = allAchievementsResult.data

        // Calculate stats efficiently
        const totalBeats = beatActivities?.reduce((sum, activity) => sum + (activity.count || 0), 0) || 0
        const completedProjects = activeProjects?.filter(p => p.status === 'completed').length || 0

        // Initialize default achievements if none exist (preserve original logic)
        if (!allAchievements || allAchievements.length === 0) {
          const defaultAchievements = [
            {
              id: 'first_beat',
              name: 'First Beat',
              description: 'Create your first beat',
              icon: '🎵',
              tier: 'bronze',
              category: 'production',
              requirement: 1
            },
            {
              id: 'beat_builder',
              name: 'Beat Builder',
              description: 'Create 10 beats',
              icon: '🎼',
              tier: 'silver',
              category: 'production',
              requirement: 10
            },
            {
              id: 'beat_machine',
              name: 'Beat Machine',
              description: 'Create 25 beats',
              icon: '🎹',
              tier: 'gold',
              category: 'production',
              requirement: 25
            },
            {
              id: 'legendary_producer',
              name: 'Legendary Producer',
              description: 'Create 50+ beats',
              icon: '👑',
              tier: 'platinum',
              category: 'production',
              requirement: 50
            },
            {
              id: 'finish_what_you_start',
              name: 'Finisher',
              description: 'Complete your first project',
              icon: '✅',
              tier: 'bronze',
              category: 'production',
              requirement: 1
            },
            {
              id: 'project_master',
              name: 'Project Master',
              description: 'Complete 5 projects',
              icon: '🏆',
              tier: 'gold',
              category: 'production',
              requirement: 5
            }
          ]

          try {
            const { data: insertedAchievements, error: insertError } = await supabase
              .from('achievements')
              .insert(defaultAchievements)
              .select()

            if (insertError) {
              // Try to fetch again in case they already exist
              const { data: retryAchievements } = await supabase
                .from('achievements')
                .select('*')
                .order('tier', { ascending: true })
              
              allAchievements = retryAchievements || []
            } else {
              allAchievements = insertedAchievements
            }
          } catch (insertError) {
            console.error('[Debug] Failed to initialize achievements:', insertError)
            return []
          }
        }

        // Fetch user achievements
        const { data: userAchievements } = await supabase
          .from('user_achievements')
          .select('achievement_id, progress, unlocked_at')
          .eq('user_id', user.id)

        const userAchievementMap = new Map(
          userAchievements?.map(ua => [ua.achievement_id, ua]) || []
        )

        // Map achievements with progress calculation (preserve original logic)
        const mappedAchievements = allAchievements.map(achievement => {
          const userAchievement = userAchievementMap.get(achievement.id)

          let progress = userAchievement?.progress || 0
          if (achievement.category === 'production') {
            progress = Math.min(totalBeats, achievement.requirement)
          } else if (achievement.id === 'finish_what_you_start') {
            progress = completedProjects
          }

          progress = Math.max(0, progress)
          const isUnlocked = progress >= achievement.requirement
          const unlocked_at = isUnlocked ? userAchievement?.unlocked_at || new Date().toISOString() : null

          return {
            ...achievement,
            progress,
            total: achievement.requirement,
            unlocked_at
          }
        })

        return mappedAchievements
      } catch (error) {
        console.error('[Debug] Error in achievements query:', error)
        throw error
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: 1
  })

  // User behavior pattern analysis
  const userBehaviorQuery = useQuery({
    queryKey: ['user-behavior-pattern', user?.id],
    queryFn: async () => {
      if (!user || !enableMLFeatures) return null

      return await analyzeBehaviorPattern(user.id)
    },
    enabled: !!user && enableMLFeatures,
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false
  })

  // AI-generated achievements
  const aiAchievementsQuery = useQuery({
    queryKey: ['ai-achievements', user?.id, userBehaviorQuery.data?.userId],
    queryFn: async () => {
      if (!user || !enableAIGeneration || !userBehaviorQuery.data) return []

      const generator = new AIAchievementGenerator()
      const existingAchievements = originalAchievementsQuery.data || []
      
      return generator.generatePersonalizedAchievements(
        userBehaviorQuery.data,
        existingAchievements,
        5 // Generate 5 personalized achievements
      )
    },
    enabled: !!user && enableAIGeneration && !!userBehaviorQuery.data,
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false
  })

  // Enhanced achievements with adaptive features
  const enhancedAchievements = React.useMemo(() => {
    if (!enableMLFeatures || !userBehaviorQuery.data) {
      return originalAchievementsQuery.data || []
    }

    const originalAchievements = originalAchievementsQuery.data || []
    const adaptiveAchievements = enhanceExistingAchievements(originalAchievements, userBehaviorQuery.data)
    const aiGenerated = aiAchievementsQuery.data || []

    // Combine original enhanced achievements with AI-generated ones
    return [...adaptiveAchievements, ...aiGenerated]
  }, [originalAchievementsQuery.data, userBehaviorQuery.data, aiAchievementsQuery.data, enableMLFeatures])

  // Smart goal recommendations
  const goalRecommendations = useQuery({
    queryKey: ['goal-recommendations', user?.id, userBehaviorQuery.data?.userId],
    queryFn: async () => {
      if (!user || !enableMLFeatures || !userBehaviorQuery.data) return null

      const engine = new SmartGoalRecommendationEngine()
      
      return {
        weeklyGoals: engine.recommendWeeklyGoals(userBehaviorQuery.data),
        sessionTiming: engine.recommendOptimalSessionTimes(userBehaviorQuery.data)
      }
    },
    enabled: !!user && enableMLFeatures && !!userBehaviorQuery.data,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false
  })

  // Mutation for updating achievement progress (preserve original functionality)
  const updateAchievementProgressMutation = useMutation({
    mutationFn: async ({ achievementId, progress, total }: {
      achievementId: string
      progress: number
      total: number
    }) => {
      if (!user) return

      const isUnlocked = progress >= total
      const now = new Date().toISOString()

      // Try update first, then insert if doesn't exist (original logic)
      const { data: existingRecord } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('achievement_id', achievementId)
        .single()

      if (existingRecord) {
        await supabase
          .from('user_achievements')
          .update({
            progress,
            total,
            unlocked_at: isUnlocked ? now : null
          })
          .eq('user_id', user.id)
          .eq('achievement_id', achievementId)
      } else {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievementId,
            progress,
            total,
            unlocked_at: isUnlocked ? now : null
          })
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['achievements', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['user-behavior-pattern', user?.id] })
    }
  })

  // Subscribe to real-time updates (preserve original functionality)
  React.useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('achievement_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `user_id=eq.${user.id}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['achievements', user.id] })
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_achievements',
        filter: `user_id=eq.${user.id}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['achievements', user.id] })
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'beat_activities',
        filter: `user_id=eq.${user.id}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['achievements', user.id] })
        queryClient.invalidateQueries({ queryKey: ['user-behavior-pattern', user.id] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, queryClient])

  return {
    // Original functionality (backward compatible)
    achievements: enableMLFeatures ? enhancedAchievements : originalAchievementsQuery.data || [],
    loading: originalAchievementsQuery.isLoading,
    error: originalAchievementsQuery.error,
    updateAchievementProgress: updateAchievementProgressMutation.mutate,
    
    // Enhanced ML features
    userBehaviorPattern: userBehaviorQuery.data,
    aiGeneratedAchievements: aiAchievementsQuery.data || [],
    goalRecommendations: goalRecommendations.data,
    
    // Loading states for new features
    isAnalyzingBehavior: userBehaviorQuery.isLoading,
    isGeneratingAI: aiAchievementsQuery.isLoading,
    isLoadingRecommendations: goalRecommendations.isLoading,
    
    // Feature status
    mlFeaturesEnabled: enableMLFeatures,
    aiGenerationEnabled: enableAIGeneration,
    adaptiveDifficultyEnabled: adaptiveDifficulty,
    
    // Manual refresh functions
    refreshBehaviorAnalysis: () => queryClient.invalidateQueries({ queryKey: ['user-behavior-pattern', user?.id] }),
    refreshAIAchievements: () => queryClient.invalidateQueries({ queryKey: ['ai-achievements', user?.id] }),
    refreshGoalRecommendations: () => queryClient.invalidateQueries({ queryKey: ['goal-recommendations', user?.id] })
  }
}

// Analyze user behavior pattern
async function analyzeBehaviorPattern(userId: string): Promise<UserBehaviorPattern> {
  try {
    // Fetch user data in parallel
    const [
      sessionsResult,
      projectsResult,
      achievementsResult,
      beatActivitiesResult,
      profileResult
    ] = await Promise.all([
      supabase
        .from('sessions')
        .select('duration, created_at, productivity_score')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('projects')
        .select('created_at, last_modified, completion_percentage, status, bpm, genre')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .limit(50),
      supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at, progress, total, achievements(*)')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false }),
      supabase
        .from('beat_activities')
        .select('count, timestamp')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(100),
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
    ])

    const sessions = sessionsResult.data || []
    const projects = projectsResult.data || []
    const userAchievements = achievementsResult.data || []
    const beatActivities = beatActivitiesResult.data || []
    const profile = profileResult.data

    // Calculate session patterns
    const now = Date.now()
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)
    const recentSessions = sessions.filter(s => new Date(s.created_at).getTime() > thirtyDaysAgo)
    
    const averageSessionLength = recentSessions.length > 0 
      ? recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / recentSessions.length
      : 60 // Default 1 hour

    const sessionsPerWeek = (recentSessions.length / 4.3) // 4.3 weeks in a month
    
    // Calculate preferred working hours
    const sessionHours = recentSessions.map(s => new Date(s.created_at).getHours())
    const hourCounts = sessionHours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)
    
    const preferredWorkingHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour))

    // Calculate peak productivity time
    const productivityByHour = sessionHours.reduce((acc, hour, index) => {
      const session = recentSessions[index]
      if (!acc[hour]) acc[hour] = { total: 0, count: 0 }
      acc[hour].total += session.productivity_score || 50
      acc[hour].count++
      return acc
    }, {} as Record<number, { total: number; count: number }>)

    const peakProductivityHour = Object.entries(productivityByHour)
      .map(([hour, data]) => ({ hour: parseInt(hour), avg: data.total / data.count }))
      .sort((a, b) => b.avg - a.avg)[0]?.hour || 10

    const peakProductivityTime = peakProductivityHour < 12 ? 'morning' : 
                                peakProductivityHour < 17 ? 'afternoon' : 'evening'

    // Calculate achievement patterns
    const completedAchievements = userAchievements.filter(ua => ua.unlocked_at)
    const completionRate = userAchievements.length > 0 ? completedAchievements.length / userAchievements.length : 0
    
    const achievementTimes = completedAchievements.map(ua => 
      new Date(ua.unlocked_at!).getTime() - new Date(ua.unlocked_at!).getTime() // Simplified
    )
    const averageTimeToComplete = achievementTimes.length > 0 
      ? achievementTimes.reduce((sum, time) => sum + time, 0) / achievementTimes.length / (24 * 60 * 60 * 1000)
      : 7 // Default 7 days

    // Calculate content preferences
    const genres = projects.map(p => p.genre).filter(Boolean)
    const genreCounts = genres.reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const preferredGenres = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre)

    const bpms = projects.map(p => p.bpm).filter(Boolean)
    const averageBPM = bpms.length > 0 ? bpms.reduce((sum, bpm) => sum + bpm, 0) / bpms.length : 120

    // Calculate productivity metrics
    const completedProjects = projects.filter(p => p.status === 'completed')
    const averageProjectCompletionTime = completedProjects.length > 0 ? 7 : 14 // Default estimates

    const totalBeats = beatActivities.reduce((sum, activity) => sum + activity.count, 0)
    const beatsPerSession = recentSessions.length > 0 ? totalBeats / recentSessions.length : 1

    const consistencyScore = Math.min(sessionsPerWeek / 3, 1) // Target 3 sessions per week

    // Generate basic personality profile (would be enhanced with actual personality assessment)
    const personalityProfile = {
      openness: Math.min(preferredGenres.length / 5, 1), // More genres = more open
      conscientiousness: completionRate, // Achievement completion rate
      extroversion: 0.5, // Default middle ground
      agreeableness: 0.5, // Default middle ground  
      neuroticism: Math.max(0, 1 - (averageSessionLength / 120)) // Longer sessions = less neurotic
    }

    return {
      userId,
      sessionPatterns: {
        averageSessionLength,
        preferredWorkingHours,
        peakProductivityTime,
        sessionsPerWeek
      },
      achievementPatterns: {
        completionRate,
        averageTimeToComplete,
        preferredDifficulty: completionRate > 0.7 ? 'hard' : completionRate > 0.4 ? 'medium' : 'easy',
        motivationType: 'intrinsic' // Would be determined by analysis
      },
      contentPreferences: {
        preferredGenres,
        averageBPM,
        energyPreference: 70, // Default
        complexityPreference: 60 // Default
      },
      personalityProfile,
      productivityMetrics: {
        averageProjectCompletionTime,
        beatsPerSession,
        qualityScore: 70, // Default
        consistencyScore
      }
    }

  } catch (error) {
    console.error('Failed to analyze user behavior pattern:', error)
    
    // Return default pattern if analysis fails
    return {
      userId,
      sessionPatterns: {
        averageSessionLength: 60,
        preferredWorkingHours: [10, 14, 19],
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

// Backward compatibility export
export { useAdaptiveAchievements as useEnhancedAchievements }