export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          artist_name: string | null
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
      sessions: {
        Row: {
          id: string
          user_id: string
          project_id: string
          duration: number
          created_at: string
          notes?: string | null
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          duration: number
          created_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          duration?: number
          created_at?: string
          notes?: string | null
        }
        Relationships: []
      }
      session_goals: {
        Row: {
          id: string
          user_id: string
          goal_text: string
          description: string | null
          expected_duration_minutes: number
          status: 'pending' | 'completed'
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          goal_text: string
          description?: string | null
          expected_duration_minutes: number
          status?: 'pending' | 'completed'
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          goal_text?: string
          description?: string | null
          expected_duration_minutes?: number
          status?: 'pending' | 'completed'
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
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