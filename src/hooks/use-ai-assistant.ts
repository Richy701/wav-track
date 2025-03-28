import { useCallback, useState } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { supabase } from '@/lib/supabase'

// Fallback suggestions in case API fails
const FALLBACK_SUGGESTIONS = [
  {
    title: "Mix the chorus",
    description: "Focus on balancing frequencies and adding effects to the chorus section",
    duration: 30
  },
  {
    title: "Refine melody",
    description: "Polish the main melody line and add variations",
    duration: 25
  },
  {
    title: "Finish intro",
    description: "Complete the intro section with proper transitions",
    duration: 20
  },
  {
    title: "Arrange bridge",
    description: "Structure and arrange the bridge section",
    duration: 35
  },
  {
    title: "Master drums",
    description: "Finalize drum mix and add processing",
    duration: 25
  }
]

// Debounce utility
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Types
export interface GoalSuggestion {
  title: string
  description: string
  duration: number
}

export interface UseAIAssistantProps {
  onSuggestionSelect?: (suggestion: GoalSuggestion) => void
  onError?: (error: Error) => void
}

export function useAIAssistant({ onSuggestionSelect, onError }: UseAIAssistantProps = {}) {
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastPrompt, setLastPrompt] = useLocalStorage<string>('last-ai-prompt', '')
  const [lastSuggestions, setLastSuggestions] = useLocalStorage<GoalSuggestion[]>('last-ai-suggestions', [])

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(async (prompt: string) => {
    if (!prompt.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    setLastPrompt(prompt)

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions')
      }

      const data = await response.json()
      setSuggestions(data.suggestions)
      setLastSuggestions(data.suggestions)

      // Log to Supabase for analytics
      await logSuggestionToAnalytics(prompt, data.suggestions)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      onError?.(error as Error)
      // Use fallback suggestions
      setSuggestions(FALLBACK_SUGGESTIONS)
    } finally {
      setIsLoading(false)
    }
  }, [onError])

  // Debounced version of fetchSuggestions
  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions, 500),
    [fetchSuggestions]
  )

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: GoalSuggestion) => {
    onSuggestionSelect?.(suggestion)
    setSuggestions([])
  }, [onSuggestionSelect])

  // Generate a complete goal
  const generateGoal = useCallback(async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch('/api/generate-goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to generate goal')
      }

      const data = await response.json()
      onSuggestionSelect?.(data.goal)
    } catch (error) {
      console.error('Error generating goal:', error)
      onError?.(error as Error)
      // Use a random fallback suggestion
      const randomSuggestion = FALLBACK_SUGGESTIONS[Math.floor(Math.random() * FALLBACK_SUGGESTIONS.length)]
      onSuggestionSelect?.(randomSuggestion)
    } finally {
      setIsLoading(false)
    }
  }, [onSuggestionSelect, onError])

  return {
    suggestions,
    isLoading,
    lastPrompt,
    lastSuggestions,
    fetchSuggestions: debouncedFetchSuggestions,
    handleSuggestionSelect,
    generateGoal,
  }
}

// Utility to log suggestions to Supabase
async function logSuggestionToAnalytics(prompt: string, suggestions: GoalSuggestion[]) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('ai_suggestions_log').insert({
      user_id: user.id,
      prompt,
      suggestions,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error logging suggestions:', error)
  }
} 