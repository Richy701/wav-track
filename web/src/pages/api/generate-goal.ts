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
    // TODO: Replace with your actual AI API call
    // For now, we'll return a random suggestion
    const randomIndex = Math.floor(Math.random() * FALLBACK_SUGGESTIONS.length)
    const goal = FALLBACK_SUGGESTIONS[randomIndex]

    return res.status(200).json({ goal })
  } catch (error) {
    console.error('Error generating goal:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 