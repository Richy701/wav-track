export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface UserPreferences {
  user_id: string;
  theme: string;
  notifications_enabled: boolean;
}

export interface UserMetrics {
  user_id: string;
  total_beats: number;
  total_sessions: number;
  last_active: string;
}

export interface CategoryProgress {
  user_id: string;
  category: string;
  progress_percent: number;
  date: string;
}

export interface Session {
  id: string;
  user_id: string;
  project_id: string | null;
  duration: number;
  created_at: string;
  notes?: string;
  active_goal_id?: string;
  goals?: any[];
  active_goal?: SessionGoal | null;
}

export interface SessionGoal {
  id: string;
  user_id: string;
  goal_text: string;
  description?: string;
  expected_duration_minutes: number;
  status: 'pending' | 'completed';
  created_at: string;
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          artist_name: string | null
          avatar_url: string | null
          genres: string[] | null
          daw: string | null
          bio: string | null
          location: string | null
          phone: string | null
          website: string | null
          instagram: string | null
          twitter: string | null
          facebook: string | null
          youtube: string | null
          soundcloud: string | null
          spotify: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          artist_name?: string | null
          avatar_url?: string | null
          genres?: string[] | null
          daw?: string | null
          bio?: string | null
          location?: string | null
          phone?: string | null
          website?: string | null
          instagram?: string | null
          twitter?: string | null
          facebook?: string | null
          youtube?: string | null
          soundcloud?: string | null
          spotify?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          artist_name?: string | null
          avatar_url?: string | null
          genres?: string[] | null
          daw?: string | null
          bio?: string | null
          location?: string | null
          phone?: string | null
          website?: string | null
          instagram?: string | null
          twitter?: string | null
          facebook?: string | null
          youtube?: string | null
          soundcloud?: string | null
          spotify?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'idea' | 'in-progress' | 'mixing' | 'mastering' | 'completed'
          date_created: string
          last_modified: string
          bpm: number | null
          key: string | null
          genre: string | null
          tags: string[] | null
          completion_percentage: number
          audio_file: any | null
          created_at: string
          is_deleted: boolean
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: 'idea' | 'in-progress' | 'mixing' | 'mastering' | 'completed'
          date_created?: string
          last_modified?: string
          bpm?: number | null
          key?: string | null
          genre?: string | null
          tags?: string[] | null
          completion_percentage?: number
          audio_file?: any | null
          created_at?: string
          is_deleted?: boolean
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: 'idea' | 'in-progress' | 'mixing' | 'mastering' | 'completed'
          date_created?: string
          last_modified?: string
          bpm?: number | null
          key?: string | null
          genre?: string | null
          tags?: string[] | null
          completion_percentage?: number
          audio_file?: any | null
          created_at?: string
          is_deleted?: boolean
          deleted_at?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: UserPreferences;
        Insert: Omit<UserPreferences, 'user_id'> & { user_id?: string };
        Update: Partial<Omit<UserPreferences, 'user_id'>>;
      };
      user_metrics: {
        Row: UserMetrics;
        Insert: Omit<UserMetrics, 'user_id'> & { user_id?: string };
        Update: Partial<Omit<UserMetrics, 'user_id'>>;
      };
      category_progress: {
        Row: CategoryProgress;
        Insert: Omit<CategoryProgress, 'user_id'> & { user_id?: string };
        Update: Partial<Omit<CategoryProgress, 'user_id'>>;
      };
      sessions: {
        Row: Session;
        Insert: Omit<Session, 'id' | 'user_id'> & { id?: string; user_id?: string; project_id?: string | null };
        Update: Partial<Omit<Session, 'id' | 'user_id'>>;
      };
      session_goals: {
        Row: SessionGoal;
        Insert: Omit<SessionGoal, 'id' | 'user_id'> & { id?: string; user_id?: string };
        Update: Partial<Omit<SessionGoal, 'id' | 'user_id'>>;
      };
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 