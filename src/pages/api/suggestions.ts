import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

// Enhanced fallback suggestions with more context and categories
const FALLBACK_SUGGESTIONS = [
  {
    title: "Mix the chorus",
    description: "Focus on balancing frequencies and adding effects to the chorus section. Consider using a subtle reverb for depth.",
    duration: 30,
    priority: 'high',
    context: 'mixing',
    category: 'mixing',
    difficulty: 'intermediate',
    tags: ['mixing', 'effects', 'chorus']
  },
  {
    title: "Refine melody",
    description: "Polish the main melody line and add variations. Try experimenting with different note patterns.",
    duration: 25,
    priority: 'medium',
    context: 'composition',
    category: 'composition',
    difficulty: 'beginner',
    tags: ['melody', 'composition', 'arrangement']
  },
  {
    title: "Finish intro",
    description: "Complete the intro section with proper transitions. Ensure it builds anticipation for the verse.",
    duration: 20,
    priority: 'high',
    context: 'arrangement',
    category: 'arrangement',
    difficulty: 'intermediate',
    tags: ['intro', 'arrangement', 'transitions']
  },
  {
    title: "Arrange bridge",
    description: "Structure and arrange the bridge section. Consider adding a key change for emotional impact.",
    duration: 35,
    priority: 'medium',
    context: 'arrangement',
    category: 'arrangement',
    difficulty: 'advanced',
    tags: ['bridge', 'arrangement', 'key-change']
  },
  {
    title: "Master drums",
    description: "Finalize drum mix and add processing. Focus on punch and clarity in the kick and snare.",
    duration: 25,
    priority: 'high',
    context: 'mixing',
    category: 'mixing',
    difficulty: 'advanced',
    tags: ['drums', 'mixing', 'mastering']
  }
]

// Music production categories
const CATEGORIES = [
  'mixing',
  'composition',
  'arrangement',
  'recording',
  'sound design',
  'mastering',
  'production',
  'songwriting'
]

// Music genres
const GENRES = [
  'pop',
  'rock',
  'hip hop',
  'electronic',
  'jazz',
  'classical',
  'folk',
  'r&b',
  'metal',
  'country'
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { prompt, context } = req.body

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' })
    }

    // Get user's recent activity and preferences
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Get user's recent goals
    const { data: recentGoals } = await supabase
      .from('session_goals')
      .select('goal_text')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get user's preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Combine context from request and user data
    const enhancedContext = {
      ...context,
      recentGoals: recentGoals?.map(goal => goal.goal_text) || [],
      preferences: preferences || {
        preferredCategories: [],
        skillLevel: 'intermediate',
        preferredGenres: []
      }
    }

    // Generate personalized suggestions
    let suggestions = FALLBACK_SUGGESTIONS

    // Filter suggestions based on context
    if (prompt.trim()) {
      suggestions = suggestions.filter(suggestion => 
        suggestion.title.toLowerCase().includes(prompt.toLowerCase()) ||
        suggestion.description.toLowerCase().includes(prompt.toLowerCase()) ||
        suggestion.tags.some(tag => tag.toLowerCase().includes(prompt.toLowerCase()))
      )
    }

    // Filter by preferred categories if specified
    if (enhancedContext.preferences?.preferredCategories?.length > 0) {
      suggestions = suggestions.filter(suggestion =>
        enhancedContext.preferences.preferredCategories.includes(suggestion.category)
      )
    }

    // Filter by skill level
    if (enhancedContext.preferences?.skillLevel) {
      suggestions = suggestions.filter(suggestion =>
        suggestion.difficulty === enhancedContext.preferences.skillLevel
      )
    }

    // Filter by preferred genres
    if (enhancedContext.preferences?.preferredGenres?.length > 0) {
      suggestions = suggestions.filter(suggestion =>
        suggestion.tags.some(tag => 
          enhancedContext.preferences.preferredGenres.includes(tag)
        )
      )
    }

    // If no matches found, return contextual suggestions
    if (suggestions.length === 0) {
      suggestions = FALLBACK_SUGGESTIONS.filter(suggestion =>
        suggestion.category === enhancedContext.preferences?.preferredCategories?.[0] ||
        suggestion.difficulty === enhancedContext.preferences?.skillLevel ||
        suggestion.tags.some(tag => 
          enhancedContext.preferences?.preferredGenres?.includes(tag)
        )
      )
    }

    // If still no matches, return all suggestions
    if (suggestions.length === 0) {
      suggestions = FALLBACK_SUGGESTIONS
    }

    // Log suggestions for analytics
    await supabase.from('ai_suggestions_log').insert({
      user_id: user.id,
      prompt,
      context: enhancedContext,
      suggestions,
      created_at: new Date().toISOString()
    })

    return res.status(200).json(suggestions)
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 