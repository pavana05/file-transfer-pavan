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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      file_collections: {
        Row: {
          collection_name: string
          collection_size: number
          created_date: string
          description: string | null
          download_count: number
          expires_at: string | null
          id: string
          is_public: boolean | null
          last_accessed_at: string | null
          max_downloads: number | null
          share_token: string
          user_id: string | null
        }
        Insert: {
          collection_name?: string
          collection_size?: number
          created_date?: string
          description?: string | null
          download_count?: number
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          last_accessed_at?: string | null
          max_downloads?: number | null
          share_token?: string
          user_id?: string | null
        }
        Update: {
          collection_name?: string
          collection_size?: number
          created_date?: string
          description?: string | null
          download_count?: number
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          last_accessed_at?: string | null
          max_downloads?: number | null
          share_token?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pin_attempts: {
        Row: {
          attempt_time: string | null
          id: string
          ip_address: unknown | null
          share_pin: string
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          attempt_time?: string | null
          id?: string
          ip_address?: unknown | null
          share_pin: string
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          attempt_time?: string | null
          id?: string
          ip_address?: unknown | null
          share_pin?: string
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      upload_rate_limits: {
        Row: {
          created_at: string | null
          id: string
          uploads_count: number | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          uploads_count?: number | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          uploads_count?: number | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      uploaded_files: {
        Row: {
          collection_id: string | null
          download_count: number
          expires_at: string | null
          file_size: number
          file_type: string
          filename: string
          id: string
          is_public: boolean | null
          last_accessed_at: string | null
          max_downloads: number | null
          original_name: string
          share_pin: string | null
          share_token: string
          storage_path: string
          upload_date: string
          user_id: string | null
        }
        Insert: {
          collection_id?: string | null
          download_count?: number
          expires_at?: string | null
          file_size: number
          file_type: string
          filename: string
          id?: string
          is_public?: boolean | null
          last_accessed_at?: string | null
          max_downloads?: number | null
          original_name: string
          share_pin?: string | null
          share_token: string
          storage_path: string
          upload_date?: string
          user_id?: string | null
        }
        Update: {
          collection_id?: string | null
          download_count?: number
          expires_at?: string | null
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          is_public?: boolean | null
          last_accessed_at?: string | null
          max_downloads?: number | null
          original_name?: string
          share_pin?: string | null
          share_token?: string
          storage_path?: string
          upload_date?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_files_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "file_collections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_file: {
        Args: {
          p_collection_id?: string
          p_share_pin?: string
          p_share_token?: string
        }
        Returns: boolean
      }
      check_pin_rate_limit: {
        Args: { p_ip_address: unknown; p_share_pin: string }
        Returns: boolean
      }
      check_upload_rate_limit: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      generate_share_pin: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_share_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_collection_by_token: {
        Args: { p_share_token: string }
        Returns: {
          collection_name: string
          collection_size: number
          created_date: string
          description: string
          download_count: number
          id: string
          share_token: string
          user_id: string
        }[]
      }
      get_file_by_pin: {
        Args: { p_share_pin: string }
        Returns: {
          collection_id: string
          download_count: number
          file_size: number
          file_type: string
          filename: string
          id: string
          original_name: string
          share_pin: string
          share_token: string
          storage_path: string
          upload_date: string
          user_id: string
        }[]
      }
      get_file_by_token: {
        Args: { p_share_token: string }
        Returns: {
          collection_id: string
          download_count: number
          file_size: number
          file_type: string
          filename: string
          id: string
          original_name: string
          share_pin: string
          share_token: string
          storage_path: string
          upload_date: string
          user_id: string
        }[]
      }
      get_files_by_collection_token: {
        Args: { p_collection_token: string }
        Returns: {
          collection_id: string | null
          download_count: number
          expires_at: string | null
          file_size: number
          file_type: string
          filename: string
          id: string
          is_public: boolean | null
          last_accessed_at: string | null
          max_downloads: number | null
          original_name: string
          share_pin: string | null
          share_token: string
          storage_path: string
          upload_date: string
          user_id: string | null
        }[]
      }
      get_user_collections: {
        Args: Record<PropertyKey, never>
        Returns: {
          collection_name: string
          collection_size: number
          created_date: string
          description: string | null
          download_count: number
          expires_at: string | null
          id: string
          is_public: boolean | null
          last_accessed_at: string | null
          max_downloads: number | null
          share_token: string
          user_id: string | null
        }[]
      }
      get_user_files: {
        Args: Record<PropertyKey, never>
        Returns: {
          collection_id: string | null
          download_count: number
          expires_at: string | null
          file_size: number
          file_type: string
          filename: string
          id: string
          is_public: boolean | null
          last_accessed_at: string | null
          max_downloads: number | null
          original_name: string
          share_pin: string | null
          share_token: string
          storage_path: string
          upload_date: string
          user_id: string | null
        }[]
      }
      increment_collection_download_count: {
        Args: { p_share_token: string }
        Returns: boolean
      }
      increment_file_download_count: {
        Args: { p_share_token: string }
        Returns: boolean
      }
      log_pin_attempt: {
        Args: {
          p_ip_address: unknown
          p_share_pin: string
          p_success: boolean
          p_user_id: string
        }
        Returns: undefined
      }
      revoke_collection_access: {
        Args: { p_share_token: string }
        Returns: boolean
      }
      revoke_file_access: {
        Args: { p_share_token: string }
        Returns: boolean
      }
      validate_collection_access: {
        Args: { p_share_token: string }
        Returns: boolean
      }
      validate_file_access: {
        Args: { p_share_pin?: string; p_share_token?: string }
        Returns: boolean
      }
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
