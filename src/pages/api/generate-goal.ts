import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // TODO: Replace with your actual AI API call
    // For now, return an error since we removed fallback data
    return res.status(501).json({ message: 'AI goal generation not implemented yet' })
  } catch (error) {
    console.error('Error generating goal:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 