import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { 
  getUserPreferences, 
  getUserMetrics, 
  getCategoryProgress, 
  getSessionsWithGoals 
} from '@/lib/database'

interface AICoachSuggestion {
  type: 'tip' | 'goal' | 'reminder' | 'insight'
  content: string
  priority: 'low' | 'medium' | 'high'
  category: string
  context: string
  tags: string[]
}

interface UserContext {
  recentGoals: string[]
  preferredDuration: number
  lastCompletedGoal?: string
  preferredCategories: string[]
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  preferredGenres: string[]
  timeOfDay: number
  dayOfWeek: string
  productivityScore: number
  streakCount: number
  averageSessionDuration: number
  mostProductiveTime: string
  commonCategories: string[]
  recentProgress: {
    category: string
    improvement: number
  }[]
}

const DEFAULT_SUGGESTIONS = [
  {
    type: 'tip',
    content: 'Start your session with a clear goal in mind. Break down complex tasks into smaller, manageable steps.',
    priority: 'high',
    category: 'productivity',
    context: 'planning',
    tags: ['productivity', 'planning', 'goals']
  },
  {
    type: 'reminder',
    content: 'Take regular breaks every 25-30 minutes to maintain peak creativity and prevent fatigue.',
    priority: 'medium',
    category: 'wellness',
    context: 'break',
    tags: ['wellness', 'break', 'productivity']
  },
  {
    type: 'insight',
    content: 'Morning sessions tend to be most productive. Consider scheduling complex tasks during your peak energy hours.',
    priority: 'medium',
    category: 'productivity',
    context: 'timing',
    tags: ['productivity', 'timing', 'energy']
  }
]

export function useAICoach() {
  const [suggestions, setSuggestions] = useState<AICoachSuggestion[]>(DEFAULT_SUGGESTIONS)
  const [userContext, setUserContext] = useState<UserContext>({
    recentGoals: [],
    preferredDuration: 25,
    preferredCategories: [],
    skillLevel: 'intermediate',
    preferredGenres: [],
    timeOfDay: new Date().getHours(),
    dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    productivityScore: 0,
    streakCount: 0,
    averageSessionDuration: 25,
    mostProductiveTime: 'morning',
    commonCategories: [],
    recentProgress: []
  })

  // Fetch user's activity data and generate personalized suggestions
  const { data: activityData, refetch, isLoading, error } = useQuery({
    queryKey: ['user-activity'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.log('No authenticated user found')
          return null
        }

        // Fetch sessions with goals using the utility function
        const sessions = await getSessionsWithGoals(user.id)

        // Fetch user preferences using the utility function
        const preferences = await getUserPreferences(user.id)

        // Fetch user metrics using the utility function
        const metrics = await getUserMetrics(user.id)

        // Fetch category progress using the utility function
        const categoryProgress = await getCategoryProgress(user.id)

        // Map category progress to the expected format
        const mappedCategoryProgress = categoryProgress.map(progress => ({
          category: progress.category,
          improvement: progress.progress_percent
        }))

        return {
          sessions,
          preferences: preferences || {},
          metrics: metrics || {},
          categoryProgress: mappedCategoryProgress
        }
      } catch (error) {
        console.error('Error in useAICoach query:', error)
        return null
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: true, // Allow refetch on mount
    refetchOnReconnect: false, // Prevent refetch on reconnect
    keepPreviousData: true // Keep previous data while fetching new data
  })

  // Separate effect for handling suggestions updates
  useEffect(() => {
    if (isLoading) {
      // Keep existing suggestions while loading
      return
    }

    if (error || !activityData) {
      // On error or no data, ensure we have default suggestions
      setSuggestions(DEFAULT_SUGGESTIONS)
      return
    }

    try {
      const { sessions, preferences, metrics, categoryProgress } = activityData
      
      // If we have no real data, keep using default suggestions
      if (!sessions?.length && !preferences && !metrics && !categoryProgress?.length) {
        setSuggestions(DEFAULT_SUGGESTIONS)
        return
      }

      // Calculate average session duration
      const avgDuration = sessions?.reduce((acc, session) => 
        acc + (session.duration || 25), 0) / (sessions?.length || 1)

      // Determine most productive time
      const timeDistribution = sessions?.reduce((acc, session) => {
        const hour = new Date(session.created_at).getHours()
        if (hour >= 5 && hour < 12) acc.morning++
        else if (hour >= 12 && hour < 17) acc.afternoon++
        else acc.evening++
        return acc
      }, { morning: 0, afternoon: 0, evening: 0 }) || { morning: 0, afternoon: 0, evening: 0 }

      const mostProductiveTime = Object.entries(timeDistribution)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'morning'

      // Calculate common categories
      const categoryCount = sessions?.reduce((acc, session) => {
        const category = session.active_goal?.category || 'general'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const commonCategories = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category)

      // Calculate recent progress by category
      const recentProgress = categoryProgress?.map(progress => ({
        category: progress.category,
        improvement: progress.improvement
      })) || []

      // Update user context with enhanced data
      const updatedContext = {
        recentGoals: sessions?.map(s => s.active_goal?.goal_text).filter(Boolean) || [],
        preferredDuration: preferences?.preferred_duration || 25,
        lastCompletedGoal: sessions?.[0]?.active_goal?.goal_text,
        preferredCategories: preferences?.preferred_categories || [],
        skillLevel: preferences?.skill_level || 'intermediate',
        preferredGenres: preferences?.preferred_genres || [],
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        productivityScore: metrics?.productivity_score || 0,
        streakCount: metrics?.streak_count || 0,
        averageSessionDuration: Math.round(avgDuration),
        mostProductiveTime,
        commonCategories,
        recentProgress
      }

      setUserContext(updatedContext)

      // Generate personalized suggestions based on enhanced context
      const newSuggestions = generateSuggestions(sessions, preferences, metrics, categoryProgress)
      
      // Combine default and personalized suggestions, ensuring we always have some suggestions
      const combinedSuggestions = [...newSuggestions, ...DEFAULT_SUGGESTIONS].slice(0, 5)
      
      // Only update suggestions if we have new ones
      if (combinedSuggestions.length > 0) {
        setSuggestions(combinedSuggestions)
      }
    } catch (error) {
      console.error('Error processing AI coach data:', error)
      // Keep using default suggestions on error
      setSuggestions(DEFAULT_SUGGESTIONS)
    }
  }, [activityData, isLoading, error])

  const generateSuggestions = (
    sessions: any[],
    preferences: any,
    metrics: any,
    categoryProgress: any[]
  ): AICoachSuggestion[] => {
    const suggestions: AICoachSuggestion[] = []
    const timeOfDay = new Date().getHours()
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' })

    // Productivity insights
    if (metrics?.productivity_score > 0.8) {
      suggestions.push({
        type: 'insight',
        content: 'You\'re on fire! Your productivity is 20% above average. Keep this momentum going!',
        priority: 'high',
        category: 'productivity',
        context: 'performance',
        tags: ['productivity', 'motivation']
      })
    }

    // Streak-based motivation
    if (metrics?.streak_count >= 3) {
      suggestions.push({
        type: 'reminder',
        content: `You're on a ${metrics.streak_count}-day streak! Maintain this consistency for better results.`,
        priority: 'medium',
        category: 'motivation',
        context: 'streak',
        tags: ['streak', 'motivation']
      })
    }

    // Time-based suggestions with enhanced context
    if (timeOfDay >= 9 && timeOfDay <= 12) {
      suggestions.push({
        type: 'tip',
        content: 'Morning hours are your peak productivity time. Focus on complex tasks now.',
        priority: 'high',
        category: 'productivity',
        context: 'time',
        tags: ['productivity', 'time-management']
      })
    }

    // Category-based goals with progress tracking
    if (categoryProgress?.length > 0) {
      const bestCategory = categoryProgress
        .sort((a, b) => b.improvement - a.improvement)[0]
      
      if (bestCategory.improvement > 0) {
        suggestions.push({
          type: 'goal',
          content: `Your ${bestCategory.category} skills have improved by ${Math.round(bestCategory.improvement * 100)}%. Keep pushing in this area!`,
          priority: 'high',
          category: 'goal',
          context: 'progress',
          tags: ['goal', bestCategory.category, 'improvement']
        })
      }
    }

    // Break reminders with duration awareness
    if (sessions?.length > 0) {
      const lastSession = sessions[0]
      if (lastSession.duration > 45) {
        suggestions.push({
          type: 'reminder',
          content: 'Take a short break to maintain your creative flow. 5 minutes can do wonders!',
          priority: 'low',
          category: 'wellness',
          context: 'break',
          tags: ['wellness', 'break']
        })
      }
    }

    // Skill level progression
    if (metrics?.skill_progress) {
      const nextLevel = getNextSkillLevel(preferences?.skill_level)
      suggestions.push({
        type: 'goal',
        content: `You're close to reaching ${nextLevel} level! Focus on challenging tasks to level up.`,
        priority: 'medium',
        category: 'progression',
        context: 'skill',
        tags: ['skill', 'progression', nextLevel]
      })
    }

    // Genre-specific suggestions
    if (preferences?.preferred_genres?.length > 0) {
      const genre = preferences.preferred_genres[0]
      suggestions.push({
        type: 'tip',
        content: `Try incorporating ${genre} elements into your current project for fresh inspiration.`,
        priority: 'medium',
        category: 'creativity',
        context: 'genre',
        tags: ['creativity', genre]
      })
    }

    return suggestions
  }

  const getNextSkillLevel = (currentLevel: string): string => {
    switch (currentLevel) {
      case 'beginner': return 'intermediate'
      case 'intermediate': return 'advanced'
      case 'advanced': return 'expert'
      default: return 'intermediate'
    }
  }

  const refreshSuggestions = useCallback(() => {
    refetch()
  }, [refetch])

  return {
    suggestions,
    userContext,
    refreshSuggestions,
    isLoading
  }
} 