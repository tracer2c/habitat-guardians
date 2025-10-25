export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      dashboard_layouts: {
        Row: {
          created_at: string | null
          id: string
          layout_order: number[] | null
          locations: Json
          mode: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          layout_order?: number[] | null
          locations: Json
          mode: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          layout_order?: number[] | null
          locations?: Json
          mode?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      environmental_readings: {
        Row: {
          co2_level: number | null
          created_at: string
          crisis_type: string | null
          humidity: number
          id: string
          is_crisis: boolean | null
          mode: string
          oxygen: number
          power: number | null
          pressure: number
          radiation: number | null
          stability_score: number
          temperature: number
          timestamp: string
        }
        Insert: {
          co2_level?: number | null
          created_at?: string
          crisis_type?: string | null
          humidity: number
          id?: string
          is_crisis?: boolean | null
          mode: string
          oxygen: number
          power?: number | null
          pressure: number
          radiation?: number | null
          stability_score: number
          temperature: number
          timestamp?: string
        }
        Update: {
          co2_level?: number | null
          created_at?: string
          crisis_type?: string | null
          humidity?: number
          id?: string
          is_crisis?: boolean | null
          mode?: string
          oxygen?: number
          power?: number | null
          pressure?: number
          radiation?: number | null
          stability_score?: number
          temperature?: number
          timestamp?: string
        }
        Relationships: []
      }
      mars_missions: {
        Row: {
          assigned_to: string | null
          category: string
          completed_at: string | null
          created_at: string | null
          deadline: string | null
          dependencies: Json | null
          description: string | null
          estimated_duration: number | null
          id: string
          metadata: Json | null
          priority: string
          status: string
          title: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          completed_at?: string | null
          created_at?: string | null
          deadline?: string | null
          dependencies?: Json | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          metadata?: Json | null
          priority: string
          status?: string
          title: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string | null
          deadline?: string | null
          dependencies?: Json | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          metadata?: Json | null
          priority?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      rover_status: {
        Row: {
          battery_level: number | null
          current_task_id: string | null
          id: string
          last_updated: string | null
          location_x: number | null
          location_y: number | null
          name: string
          rover_id: string
          status: string
        }
        Insert: {
          battery_level?: number | null
          current_task_id?: string | null
          id?: string
          last_updated?: string | null
          location_x?: number | null
          location_y?: number | null
          name: string
          rover_id: string
          status: string
        }
        Update: {
          battery_level?: number | null
          current_task_id?: string | null
          id?: string
          last_updated?: string | null
          location_x?: number | null
          location_y?: number | null
          name?: string
          rover_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rover_status_current_task_id_fkey"
            columns: ["current_task_id"]
            isOneToOne: false
            referencedRelation: "mars_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      system_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          message: string
          metadata: Json | null
          mode: string
          reading_id: string | null
          severity: string | null
          timestamp: string
          title: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          message: string
          metadata?: Json | null
          mode: string
          reading_id?: string | null
          severity?: string | null
          timestamp?: string
          title: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          message?: string
          metadata?: Json | null
          mode?: string
          reading_id?: string | null
          severity?: string | null
          timestamp?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_events_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "environmental_readings"
            referencedColumns: ["id"]
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
