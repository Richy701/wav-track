import { NextApiRequest, NextApiResponse } from 'next'
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { prompt } = req.body

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' })
    }

    // TODO: Replace with your actual AI API call
    // For now, we'll use a simple pattern matching approach
    const suggestions = FALLBACK_SUGGESTIONS.filter(suggestion => 
      suggestion.title.toLowerCase().includes(prompt.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(prompt.toLowerCase())
    )

    // If no matches found, return all suggestions
    const finalSuggestions = suggestions.length > 0 ? suggestions : FALLBACK_SUGGESTIONS

    // Return the array directly instead of nesting it in an object
    return res.status(200).json(finalSuggestions)
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 