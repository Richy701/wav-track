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
      sessions: {
        Row: {
          id: string
          user_id: string
          project_id: string
          duration: number
          created_at: string
          notes?: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          duration: number
          created_at?: string
          notes?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          duration?: number
          created_at?: string
          notes?: string
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