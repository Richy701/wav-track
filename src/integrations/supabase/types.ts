export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement: number
          tier: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon: string
          id: string
          name: string
          requirement: number
          tier: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement?: number
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      beat_activities: {
        Row: {
          count: number
          created_at: string | null
          date: string
          id: string
          project_id: string | null
          timestamp: number
          user_id: string | null
        }
        Insert: {
          count?: number
          created_at?: string | null
          date: string
          id?: string
          project_id?: string | null
          timestamp: number
          user_id?: string | null
        }
        Update: {
          count?: number
          created_at?: string | null
          date?: string
          id?: string
          project_id?: string | null
          timestamp?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beat_activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          artist_name: string | null
          avatar_url: string | null
          beats_created: number | null
          bio: string | null
          birthday: string | null
          completed_projects: number | null
          completion_rate: number | null
          daw: string | null
          email: string
          genres: string | null
          id: string
          join_date: string | null
          location: string | null
          name: string | null
          notification_preferences: Json | null
          phone: string | null
          productivity_score: number | null
          social_links: Json | null
          timezone: string | null
          total_beats: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          artist_name?: string | null
          avatar_url?: string | null
          beats_created?: number | null
          bio?: string | null
          birthday?: string | null
          completed_projects?: number | null
          completion_rate?: number | null
          daw?: string | null
          email: string
          genres?: string | null
          id: string
          join_date?: string | null
          location?: string | null
          name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          productivity_score?: number | null
          social_links?: Json | null
          timezone?: string | null
          total_beats?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          artist_name?: string | null
          avatar_url?: string | null
          beats_created?: number | null
          bio?: string | null
          birthday?: string | null
          completed_projects?: number | null
          completion_rate?: number | null
          daw?: string | null
          email?: string
          genres?: string | null
          id?: string
          join_date?: string | null
          location?: string | null
          name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          productivity_score?: number | null
          social_links?: Json | null
          timezone?: string | null
          total_beats?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          audio_url: string | null
          bpm: number | null
          completion_percentage: number | null
          created_at: string | null
          date_created: string | null
          deleted_at: string | null
          description: string | null
          genre: string | null
          id: string
          is_deleted: boolean | null
          key: string | null
          last_modified: string | null
          status: string | null
          tags: string[] | null
          title: string
          user_id: string | null
        }
        Insert: {
          audio_url?: string | null
          bpm?: number | null
          completion_percentage?: number | null
          created_at?: string | null
          date_created?: string | null
          deleted_at?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          is_deleted?: boolean | null
          key?: string | null
          last_modified?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          user_id?: string | null
        }
        Update: {
          audio_url?: string | null
          bpm?: number | null
          completion_percentage?: number | null
          created_at?: string | null
          date_created?: string | null
          deleted_at?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          is_deleted?: boolean | null
          key?: string | null
          last_modified?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      session_goals: {
        Row: {
          completed_at: string | null
          created_at: string
          expected_duration_minutes: number | null
          goal_text: string
          id: string
          project_id: string | null
          status: Database["public"]["Enums"]["goal_status"]
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          expected_duration_minutes?: number | null
          goal_text: string
          id?: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          expected_duration_minutes?: number | null
          goal_text?: string
          id?: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_goals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          duration: number
          ended_at: string | null
          feedback: string | null
          goal: string | null
          goal_completed: boolean | null
          id: string
          notes: string | null
          productivity_score: number | null
          project_id: string | null
          status: string | null
          streak_count: number | null
          tags: string[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration: number
          ended_at?: string | null
          feedback?: string | null
          goal?: string | null
          goal_completed?: boolean | null
          id?: string
          notes?: string | null
          productivity_score?: number | null
          project_id?: string | null
          status?: string | null
          streak_count?: number | null
          tags?: string[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number
          ended_at?: string | null
          feedback?: string | null
          goal?: string | null
          goal_completed?: boolean | null
          id?: string
          notes?: string | null
          productivity_score?: number | null
          project_id?: string | null
          status?: string | null
          streak_count?: number | null
          tags?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          progress: number
          total: number
          unlocked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          progress?: number
          total: number
          unlocked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          progress?: number
          total?: number
          unlocked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
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
      goal_status: "pending" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
