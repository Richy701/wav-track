export interface Track {
  id: string
  title: string
  artist: string
  genre: string
  duration: string
  status: 'completed' | 'in_progress'
  created_at: string
  user_id: string
  // cover_art removed
  notes?: string
  last_modified: string
} 