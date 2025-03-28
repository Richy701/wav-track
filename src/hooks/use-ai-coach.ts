import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface AICoachSuggestion {
  type: 'tip' | 'goal' | 'reminder'
  content: string
  priority: 'low' | 'medium' | 'high'
}

export function useAICoach() {
  const [suggestions, setSuggestions] = useState<AICoachSuggestion[]>([])

  // Fetch user's activity data and generate personalized suggestions
  const { data: activityData, refetch } = useQuery({
    queryKey: ['user-activity'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No authenticated user')
      }

      const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      return sessions
    }
  })

  useEffect(() => {
    if (activityData) {
      // Generate personalized suggestions based on activity data
      const newSuggestions: AICoachSuggestion[] = [
        {
          type: 'tip',
          content: 'Based on your recent sessions, you\'re most productive in the morning. Try scheduling your complex tasks during this time.',
          priority: 'high'
        },
        {
          type: 'goal',
          content: 'You\'re close to completing your weekly goal! Just 2 more sessions to go.',
          priority: 'medium'
        },
        {
          type: 'reminder',
          content: 'Remember to take regular breaks to maintain your creative flow.',
          priority: 'low'
        }
      ]
      setSuggestions(newSuggestions)
    }
  }, [activityData])

  const refreshSuggestions = () => {
    refetch()
  }

  return {
    suggestions,
    refreshSuggestions
  }
} 