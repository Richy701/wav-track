import { useCallback, useState } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useDebounce } from '@/hooks/use-debounce'

// Music production categories
const MUSIC_CATEGORIES = {
  mixing: ['mixing', 'mastering', 'eq', 'compression', 'reverb', 'delay'],
  composition: ['melody', 'harmony', 'chord progression', 'arrangement', 'songwriting'],
  soundDesign: ['synthesis', 'sampling', 'sound design', 'presets', 'effects'],
  recording: ['recording', 'microphone', 'audio interface', 'vocal recording', 'instrument recording'],
  arrangement: ['arrangement', 'structure', 'song form', 'transitions', 'build-ups'],
  performance: ['performance', 'practice', 'technique', 'instrument', 'vocal'],
  production: ['production', 'workflow', 'organization', 'project management', 'collaboration']
}

// Music genres
const MUSIC_GENRES = {
  pop: ['pop', 'contemporary', 'mainstream', 'radio', 'commercial'],
  rock: ['rock', 'alternative', 'indie', 'punk', 'metal'],
  electronic: ['electronic', 'edm', 'house', 'techno', 'dance'],
  hiphop: ['hiphop', 'rap', 'trap', 'r&b', 'urban'],
  jazz: ['jazz', 'blues', 'swing', 'fusion', 'improvisation'],
  classical: ['classical', 'orchestral', 'symphonic', 'chamber', 'acoustic']
}

// Enhanced fallback suggestions with technical details
const fallbackSuggestions: GoalSuggestion[] = [
  {
    title: "Mix the chorus",
    description: "Balance levels and add dynamic processing to create a solid rhythmic foundation",
    duration: 45,
    priority: "high",
    context: "mixing",
    category: "mixing",
    difficulty: "intermediate",
    tags: ["mixing", "chorus", "dynamics"],
    technicalTips: [
      "Use parallel compression for punchier drums",
      "Apply subtle sidechain compression to create space",
      "Consider using a reference track for level matching"
    ],
    commonChallenges: [
      "Getting the right balance between elements",
      "Maintaining clarity in the mix",
      "Achieving consistent levels"
    ],
    recommendedTools: [
      "Compressor",
      "EQ",
      "Reverb",
      "Reference track"
    ]
  },
  {
    title: "Create a melodic hook",
    description: "Focus on crafting a memorable and catchy melody that captures the emotional core of the song",
    duration: 30,
    priority: "high",
    context: "composition",
    category: "composition",
    difficulty: "intermediate",
    tags: ["melody", "hook", "composition"],
    technicalTips: [
      "Start with a strong rhythmic foundation",
      "Use scale degrees 1, 3, and 5 for stability",
      "Add passing tones for movement"
    ],
    commonChallenges: [
      "Creating something unique",
      "Balancing simplicity and complexity",
      "Making it memorable"
    ],
    recommendedTools: [
      "Piano or MIDI controller",
      "Scale reference",
      "Melody analyzer"
    ]
  },
  {
    title: "Design a lead synth",
    description: "Create a distinctive lead sound that cuts through the mix",
    duration: 25,
    priority: "medium",
    context: "sound design",
    category: "sound design",
    difficulty: "advanced",
    tags: ["synthesis", "lead", "sound design"],
    technicalTips: [
      "Layer multiple oscillators for richness",
      "Use filter modulation for movement",
      "Add subtle distortion for character"
    ],
    commonChallenges: [
      "Getting the right amount of presence",
      "Balancing harmonics",
      "Creating movement without being distracting"
    ],
    recommendedTools: [
      "Synthesizer",
      "Filter",
      "Distortion",
      "Modulation effects"
    ]
  }
]

// Types
export interface GoalSuggestion {
  title: string
  description: string
  duration: number
  priority: 'high' | 'medium' | 'low'
  context: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  technicalTips?: string[]
  commonChallenges?: string[]
  recommendedTools?: string[]
}

export interface UseAIAssistantProps {
  onSuggestionSelect?: (suggestion: GoalSuggestion) => void
  onError?: (error: Error) => void
}

export function useAIAssistant({ onSuggestionSelect, onError }: UseAIAssistantProps = {}) {
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [lastPrompt, setLastPrompt] = useLocalStorage<string>('last-ai-prompt', '')
  const [lastSuggestions, setLastSuggestions] = useLocalStorage<GoalSuggestion[]>('last-ai-suggestions', [])
  const [userContext, setUserContext] = useState<{
    recentGoals: string[];
    preferredDuration: number;
    lastCompletedGoal?: string;
    preferredCategories: string[];
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    preferredGenres: string[];
    timeOfDay: number;
    dayOfWeek: string;
  }>({
    recentGoals: [],
    preferredDuration: 25,
    preferredCategories: [],
    skillLevel: 'intermediate',
    preferredGenres: [],
    timeOfDay: new Date().getHours(),
    dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
  })

  // Debounced fetch function
  const debouncedFetch = useDebounce(async (input: string) => {
    if (!input.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    setLastPrompt(input)

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input,
          context: "music production session goals",
          categories: Object.keys(MUSIC_CATEGORIES),
          genres: Object.keys(MUSIC_GENRES)
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions')
      }

      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        setSuggestions(data)
      } else {
        setSuggestions(getContextualFallbacks(input))
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions(getContextualFallbacks(input))
      onError?.(error as Error)
    } finally {
      setIsLoading(false)
    }
  }, 300)

  const fetchSuggestions = useCallback((input: string) => {
    setUserInput(input)
    debouncedFetch(input)
  }, [debouncedFetch])

  // Helper function to get contextual fallback suggestions
  const getContextualFallbacks = (input: string): GoalSuggestion[] => {
    // Filter and modify fallback suggestions based on input
    return fallbackSuggestions
      .filter(suggestion => {
        if (!input) return true
        const searchTerms = input.toLowerCase().split(' ')
        return searchTerms.some(term =>
          suggestion.title.toLowerCase().includes(term) ||
          suggestion.description.toLowerCase().includes(term) ||
          suggestion.tags.some(tag => tag.toLowerCase().includes(term)) ||
          suggestion.category.toLowerCase().includes(term)
        )
      })
      .map(suggestion => ({
        ...suggestion,
        priority: determinePriority(suggestion, input),
        context: determineContext(suggestion, input),
        difficulty: determineDifficulty(suggestion, input),
        category: determineCategory(suggestion, input),
        tags: determineTags(suggestion, input)
      }))
  }

  // Helper function to determine priority based on context
  const determinePriority = (suggestion: GoalSuggestion, input: string): 'high' | 'medium' | 'low' => {
    // Determine priority based on input and suggestion context
    if (input.toLowerCase().includes('urgent') || input.toLowerCase().includes('important')) {
      return 'high'
    }
    if (suggestion.duration > 45) {
      return 'high'
    }
    if (suggestion.duration < 25) {
      return 'low'
    }
    return 'medium'
  }

  // Helper function to determine context based on suggestion
  const determineContext = (suggestion: GoalSuggestion, input: string): string => {
    // Determine context based on input and suggestion
    if (input.toLowerCase().includes('mix') || input.toLowerCase().includes('mixdown')) {
      return 'mixing'
    }
    if (input.toLowerCase().includes('write') || input.toLowerCase().includes('compose')) {
      return 'composition'
    }
    if (input.toLowerCase().includes('sound') || input.toLowerCase().includes('synth')) {
      return 'sound design'
    }
    return suggestion.context
  }

  // Helper function to determine difficulty based on context
  const determineDifficulty = (suggestion: GoalSuggestion, input: string): 'beginner' | 'intermediate' | 'advanced' => {
    // Determine difficulty based on input and suggestion
    if (input.toLowerCase().includes('basic') || input.toLowerCase().includes('simple')) {
      return 'beginner'
    }
    if (input.toLowerCase().includes('advanced') || input.toLowerCase().includes('complex')) {
      return 'advanced'
    }
    return suggestion.difficulty
  }

  // Helper function to determine category based on context
  const determineCategory = (suggestion: GoalSuggestion, input: string): string => {
    // Determine category based on input and suggestion
    for (const [category, keywords] of Object.entries(MUSIC_CATEGORIES)) {
      if (keywords.some(keyword => input.toLowerCase().includes(keyword))) {
        return category
      }
    }
    return suggestion.category
  }

  // Helper function to generate tags based on context
  const determineTags = (suggestion: GoalSuggestion, input: string): string[] => {
    // Determine tags based on input and suggestion
    const tags = new Set(suggestion.tags)
    
    // Add genre tags if mentioned
    for (const [genre, keywords] of Object.entries(MUSIC_GENRES)) {
      if (keywords.some(keyword => input.toLowerCase().includes(keyword))) {
        tags.add(genre)
      }
    }

    // Add category-specific tags
    const category = determineCategory(suggestion, input)
    if (MUSIC_CATEGORIES[category as keyof typeof MUSIC_CATEGORIES]) {
      MUSIC_CATEGORIES[category as keyof typeof MUSIC_CATEGORIES].forEach(tag => tags.add(tag))
    }

    return Array.from(tags)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: GoalSuggestion) => {
    onSuggestionSelect?.(suggestion)
    setSuggestions([])
  }, [onSuggestionSelect])

  // Generate a complete goal
  const generateGoal = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: "Generate a music production goal",
          context: "music production session goals",
          categories: Object.keys(MUSIC_CATEGORIES),
          genres: Object.keys(MUSIC_GENRES)
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate goal')
      }

      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        setSuggestions(data)
      } else {
        setSuggestions(getContextualFallbacks(""))
      }
    } catch (error) {
      console.error('Error generating goal:', error)
      setSuggestions(getContextualFallbacks(""))
      onError?.(error as Error)
    } finally {
      setIsLoading(false)
    }
  }, [onError])

  return {
    suggestions,
    isLoading,
    userInput,
    lastPrompt,
    lastSuggestions,
    fetchSuggestions,
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