import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'



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

    // TODO: Replace with actual AI API call
    // For now, return empty suggestions since we removed fallback data
    const suggestions = []

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