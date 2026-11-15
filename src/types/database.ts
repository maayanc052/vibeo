// קובץ שנוצר אוטומטית מתוך מסד הנתונים של Supabase — לא לערוך ידנית.
// ליצירה מחדש אחרי שינוי סכמה: Supabase MCP → generate_typescript_types
// (או: npx supabase gen types typescript --project-id qtosudiozndahpmsxmcb)

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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      event_ideas: {
        Row: {
          category: Database["public"]["Enums"]["event_category"] | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          organization_id: string
          status: Database["public"]["Enums"]["idea_status"]
          title: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["event_category"] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          organization_id: string
          status?: Database["public"]["Enums"]["idea_status"]
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["event_category"] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["idea_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_ideas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_ideas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: Database["public"]["Enums"]["event_category"]
          cover_image_url: string | null
          created_at: string
          custom_form_fields: Json
          description: string | null
          event_date: string
          i18n: Json
          id: string
          is_active: boolean
          location: string | null
          max_capacity: number
          organization_id: string
          price: number
          seats_taken: number
          title: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["event_category"]
          cover_image_url?: string | null
          created_at?: string
          custom_form_fields?: Json
          description?: string | null
          event_date: string
          i18n?: Json
          id?: string
          is_active?: boolean
          location?: string | null
          max_capacity: number
          organization_id: string
          price?: number
          seats_taken?: number
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["event_category"]
          cover_image_url?: string | null
          created_at?: string
          custom_form_fields?: Json
          description?: string | null
          event_date?: string
          i18n?: Json
          id?: string
          is_active?: boolean
          location?: string | null
          max_capacity?: number
          organization_id?: string
          price?: number
          seats_taken?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_votes: {
        Row: {
          created_at: string
          idea_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          idea_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          idea_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_votes_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "event_ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          event_id: string | null
          id: string
          notification_type: string
          registration_id: string | null
          sent_at: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          event_id?: string | null
          id?: string
          notification_type: string
          registration_id?: string | null
          sent_at?: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          event_id?: string | null
          id?: string
          notification_type?: string
          registration_id?: string | null
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          brand_colors: Json
          created_at: string
          i18n: Json
          id: string
          logo_url: string | null
          name: string
          slug: string
          tagline: string | null
        }
        Insert: {
          brand_colors?: Json
          created_at?: string
          i18n?: Json
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          tagline?: string | null
        }
        Update: {
          brand_colors?: Json
          created_at?: string
          i18n?: Json
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          tagline?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          gateway: string
          gateway_transaction_id: string | null
          id: string
          registration_id: string
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          gateway?: string
          gateway_transaction_id?: string | null
          id?: string
          registration_id: string
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          gateway?: string
          gateway_transaction_id?: string | null
          id?: string
          registration_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          checked_in_at: string | null
          created_at: string
          custom_answers: Json
          event_id: string
          id: string
          qr_code_hash: string | null
          reminder_24h_sent: boolean
          reminder_2h_sent: boolean
          rsvp_status: Database["public"]["Enums"]["rsvp_status"]
          rsvp_token: string
          status: Database["public"]["Enums"]["registration_status"]
          user_id: string
        }
        Insert: {
          checked_in_at?: string | null
          created_at?: string
          custom_answers?: Json
          event_id: string
          id?: string
          qr_code_hash?: string | null
          reminder_24h_sent?: boolean
          reminder_2h_sent?: boolean
          rsvp_status?: Database["public"]["Enums"]["rsvp_status"]
          rsvp_token?: string
          status?: Database["public"]["Enums"]["registration_status"]
          user_id: string
        }
        Update: {
          checked_in_at?: string | null
          created_at?: string
          custom_answers?: Json
          event_id?: string
          id?: string
          qr_code_hash?: string | null
          reminder_24h_sent?: boolean
          reminder_2h_sent?: boolean
          rsvp_status?: Database["public"]["Enums"]["rsvp_status"]
          rsvp_token?: string
          status?: Database["public"]["Enums"]["registration_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      event_category:
        | "team"
        | "workshops"
        | "community"
        | "conferences"
        | "volunteering"
        | "outdoor"
      idea_status: "open" | "planned" | "done" | "rejected"
      notification_channel: "email" | "whatsapp" | "sms"
      payment_status: "pending" | "succeeded" | "failed" | "refunded"
      registration_status:
        | "pending_approval"
        | "approved"
        | "paid"
        | "cancelled"
      rsvp_status:
        | "awaiting_rsvp"
        | "confirmed_attending"
        | "declined"
        | "checked_in"
      user_role: "super_admin" | "org_admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event_category: [
        "team",
        "workshops",
        "community",
        "conferences",
        "volunteering",
        "outdoor",
      ],
      idea_status: ["open", "planned", "done", "rejected"],
      notification_channel: ["email", "whatsapp", "sms"],
      payment_status: ["pending", "succeeded", "failed", "refunded"],
      registration_status: [
        "pending_approval",
        "approved",
        "paid",
        "cancelled",
      ],
      rsvp_status: [
        "awaiting_rsvp",
        "confirmed_attending",
        "declined",
        "checked_in",
      ],
      user_role: ["super_admin", "org_admin", "user"],
    },
  },
} as const
