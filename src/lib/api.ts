import { Track } from '@/types/track'
import { supabase } from './supabase'

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))



export async function fetchTracks(): Promise<Track[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tracks:', error)
    throw error
  }

  return data || []
}

export async function fetchTrackDetails(trackId: string): Promise<Track> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', trackId)
    .single()

  if (error) {
    console.error('Error fetching track details:', error)
    throw error
  }

  if (!data) {
    throw new Error('Track not found')
  }

  return data
} 