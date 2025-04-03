import { Track } from '@/types/track'
import { supabase } from './supabase'

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Simulated track data
const tracks: Track[] = [
  {
    id: '1',
    title: 'Sample Track 1',
    artist: 'Artist 1',
    cover_art: 'https://picsum.photos/200',
    duration: '3:45',
    genre: 'Pop',
    status: 'completed',
    created_at: new Date().toISOString(),
    user_id: '1',
    notes: 'A sample track description',
    last_modified: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Sample Track 2',
    artist: 'Artist 2',
    cover_art: 'https://picsum.photos/201',
    duration: '4:20',
    genre: 'Rock',
    status: 'in_progress',
    created_at: new Date().toISOString(),
    user_id: '1',
    notes: 'Another sample track description',
    last_modified: new Date().toISOString()
  }
]

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