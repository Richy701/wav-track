export interface Project {
  id: string
  title: string
  description: string
  status: 'idea' | 'in-progress' | 'mixing' | 'mastering' | 'completed'
  user_id: string
  created_at: string
  last_modified: string
  is_deleted: boolean
  deleted_at: string | null
  // Client-side fields
  dateCreated: string
  lastModified: string
  bpm: number
  key: string
  genre: string
  tags: string[]
  completionPercentage: number
  audio_url: string | null
  audioFile?: {
    name: string
    size: number
    type: string
    url: string
  } | null
}

export interface Sample {
  id: string
  name: string
  url: string
  category: string
  created_at: string
}

export interface Session {
  id: string
  user_id: string
  project_id: string
  duration: number
  created_at: string
  notes?: string
  productivity_score?: number
  tags?: string[]
  status?: string
}

export interface SessionStats {
  totalDuration: number
  averageDuration: number
  totalSessions: number
  productivityScore: number
  mostProductiveTime: string | null
  recentSessions: Session[]
  currentStreak: number
  bestStreak: number
}

export interface Note {
  id: string
  projectId: string
  content: string
  created_at: string
  updated_at: string
}

export interface BeatActivity {
  id: string
  projectId: string
  date: string
  count: number
  timestamp: number
}

export interface BeatActivityWithProject {
  id: string
  user_id: string
  project_id: string
  count: number
  timestamp: number
  projects: {
    is_deleted: boolean
  }
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

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  tier: AchievementTier
  category: 'production' | 'streak' | 'time' | 'goals' | 'social'
  requirement: number
  unlockedAt?: string
  progress?: number
  total?: number
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  progress: number
  total: number
}

export interface ChartData {
  label: string
  value: number
  date?: string
}
