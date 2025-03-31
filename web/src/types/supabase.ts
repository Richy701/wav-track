export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

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
          join_date: string
          timezone: string
          notification_preferences: Json
          created_at: string
          updated_at: string
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
          join_date?: string
          timezone?: string
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
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
          join_date?: string
          timezone?: string
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
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
  }
}

// Add user metadata type
export interface UserMetadata {
  has_seen_welcome?: boolean
  name?: string
  [key: string]: any
}
