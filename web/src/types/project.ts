export type Project = {
  id: string
  title: string
  description: string
  status: 'not_started' | 'in_progress' | 'completed'
  dateCreated: string
  lastModified: string
  completedAt?: string
  userId: string
  collaborators?: string[]
  tags?: string[]
  progress?: number
  deadline?: string
  priority?: 'low' | 'medium' | 'high'
  bpm: number
  key: string
  genre: string
  completionPercentage: number
  audio_url?: string | null
  audio_filename?: string | null
}
