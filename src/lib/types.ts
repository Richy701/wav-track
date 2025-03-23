export interface Project {
  id: string
  title: string
  description: string
  status: 'idea' | 'in-progress' | 'mixing' | 'mastering' | 'completed'
  user_id?: string
  created_at?: string
  last_modified?: string
  // Client-side fields
  dateCreated: string
  lastModified: string
  bpm?: number
  key?: string
  genre?: string
  tags?: string[]
  completionPercentage?: number
  audioFile?: {
    name: string
    size: number
    type: string
    url: string
  } | null
  coverArt?: null
}

export interface Sample {
  id: string
  name: string
  type: 'drum' | 'bass' | 'melody' | 'vocal' | 'fx' | 'other'
  dateAdded: string
  favorite: boolean
  source: string
}

export interface Session {
  id: string
  projectId: string
  duration: number // in minutes
  date: string
  notes: string
}

export interface Note {
  id: string
  projectId?: string
  title: string
  content: string
  dateCreated: string
  pinned: boolean
}

export interface BeatActivity {
  id: string
  projectId: string
  date: string
  count: number
  timestamp?: number
}

export interface AudioProcessingState {
  isProcessing: boolean
  progress: number
  result?: {
    vocals?: string
    instrumental?: string
    bass?: string
    drums?: string
  }
}

export type StemType = 'vocals' | 'instrumental' | 'bass' | 'drums'

export interface Profile {
  id: string
  username: string
  name: string
  artist_name?: string
  avatar_url?: string
  bio?: string
  website?: string
  location?: string
  email?: string
  phone?: string
  daw?: string
  genres: string[]
  followers: number
  following: number
  collaborations: number
  productivity_score?: number
  total_beats?: number
  completed_projects?: number
  completion_rate?: number
  instagram?: string
  instagram_username?: string
  social?: {
    twitter?: string
    twitter_username?: string
    youtube?: string
    youtube_username?: string
    linkedin?: string
    github?: string
  }
  notifications?: {
    newFollowers?: boolean
    beatComments?: boolean
    collaborationRequests?: boolean
    email?: boolean
    push?: boolean
  }
}

export interface BeatCoachMessage {
  id: string
  projectId: string
  message: string
  createdAt: string
  isRead: boolean
}

export interface WeeklyGoal {
  id: string
  userId: string
  targetBeats: number
  completedBeats: number
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'skipped'
  createdAt: string
  updatedAt: string
}
