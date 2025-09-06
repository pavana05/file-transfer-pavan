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
      get_file_by_pin: {
        Args: { p_share_pin: string }
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
      get_file_by_token: {
        Args: { p_share_token: string }
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
      increment_collection_download_count: {
        Args: { p_share_token: string }
        Returns: boolean
      }
      increment_file_download_count: {
        Args: { p_share_token: string }
        Returns: boolean
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
