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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      condo_import_staging: {
        Row: {
          a1: number | null
          a2: number | null
          b1: number | null
          b2: number | null
          cf: number | null
          er: boolean
          h1: number | null
          h2: number | null
          ip: number | null
          loaded_at: string
          n: string
          ns: string
          p1: number | null
          p2: number | null
          pc: string | null
          sr: string
          y: number | null
        }
        Insert: {
          a1?: number | null
          a2?: number | null
          b1?: number | null
          b2?: number | null
          cf?: number | null
          er?: boolean
          h1?: number | null
          h2?: number | null
          ip?: number | null
          loaded_at?: string
          n: string
          ns: string
          p1?: number | null
          p2?: number | null
          pc?: string | null
          sr: string
          y?: number | null
        }
        Update: {
          a1?: number | null
          a2?: number | null
          b1?: number | null
          b2?: number | null
          cf?: number | null
          er?: boolean
          h1?: number | null
          h2?: number | null
          ip?: number | null
          loaded_at?: string
          n?: string
          ns?: string
          p1?: number | null
          p2?: number | null
          pc?: string | null
          sr?: string
          y?: number | null
        }
        Relationships: []
      }
      condominiums: {
        Row: {
          address: string | null
          amenities: string[]
          area_max_m2: number | null
          area_min_m2: number | null
          bairro_slug: string | null
          bathrooms_max: number | null
          bathrooms_min: number | null
          bedrooms_max: number | null
          bedrooms_min: number | null
          canonical_url: string | null
          city: string
          condo_fee_avg_brl: number | null
          condo_fee_min_brl: number | null
          construction_year: number | null
          created_at: string
          data_quality_status: string | null
          description: string | null
          floors_count: number | null
          id: string
          iptu_avg_brl: number | null
          iptu_min_brl: number | null
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          neighborhood: string | null
          normalized_name: string
          normalized_neighborhood: string | null
          parking_spots_max: number | null
          parking_spots_min: number | null
          postal_code: string | null
          publication_status: string
          reference_updated_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          source_reference_internal: string | null
          state: string
          towers_count: number | null
          units_count: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          amenities?: string[]
          area_max_m2?: number | null
          area_min_m2?: number | null
          bairro_slug?: string | null
          bathrooms_max?: number | null
          bathrooms_min?: number | null
          bedrooms_max?: number | null
          bedrooms_min?: number | null
          canonical_url?: string | null
          city?: string
          condo_fee_avg_brl?: number | null
          condo_fee_min_brl?: number | null
          construction_year?: number | null
          created_at?: string
          data_quality_status?: string | null
          description?: string | null
          floors_count?: number | null
          id?: string
          iptu_avg_brl?: number | null
          iptu_min_brl?: number | null
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          neighborhood?: string | null
          normalized_name: string
          normalized_neighborhood?: string | null
          parking_spots_max?: number | null
          parking_spots_min?: number | null
          postal_code?: string | null
          publication_status?: string
          reference_updated_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          source_reference_internal?: string | null
          state?: string
          towers_count?: number | null
          units_count?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          amenities?: string[]
          area_max_m2?: number | null
          area_min_m2?: number | null
          bairro_slug?: string | null
          bathrooms_max?: number | null
          bathrooms_min?: number | null
          bedrooms_max?: number | null
          bedrooms_min?: number | null
          canonical_url?: string | null
          city?: string
          condo_fee_avg_brl?: number | null
          condo_fee_min_brl?: number | null
          construction_year?: number | null
          created_at?: string
          data_quality_status?: string | null
          description?: string | null
          floors_count?: number | null
          id?: string
          iptu_avg_brl?: number | null
          iptu_min_brl?: number | null
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          neighborhood?: string | null
          normalized_name?: string
          normalized_neighborhood?: string | null
          parking_spots_max?: number | null
          parking_spots_min?: number | null
          postal_code?: string | null
          publication_status?: string
          reference_updated_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          source_reference_internal?: string | null
          state?: string
          towers_count?: number | null
          units_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      cron_secrets: {
        Row: {
          created_at: string
          name: string
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          name: string
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          name?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          area_m2: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          code: string
          condo_features: string[]
          condo_fee_brl: number | null
          condo_name: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          featured: boolean
          features: string[]
          id: string
          iptu_brl: number | null
          is_launch: boolean
          last_check_status: string | null
          last_checked_at: string | null
          neighborhood: string | null
          parking_spots: number | null
          price_brl: number | null
          property_type: string | null
          published: boolean
          source_url: string | null
          state: string | null
          suites: number | null
          title: string
          unavailable_since: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          area_m2?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          code: string
          condo_features?: string[]
          condo_fee_brl?: number | null
          condo_name?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          features?: string[]
          id?: string
          iptu_brl?: number | null
          is_launch?: boolean
          last_check_status?: string | null
          last_checked_at?: string | null
          neighborhood?: string | null
          parking_spots?: number | null
          price_brl?: number | null
          property_type?: string | null
          published?: boolean
          source_url?: string | null
          state?: string | null
          suites?: number | null
          title: string
          unavailable_since?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          area_m2?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          code?: string
          condo_features?: string[]
          condo_fee_brl?: number | null
          condo_name?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          features?: string[]
          id?: string
          iptu_brl?: number | null
          is_launch?: boolean
          last_check_status?: string | null
          last_checked_at?: string | null
          neighborhood?: string | null
          parking_spots?: number | null
          price_brl?: number | null
          property_type?: string | null
          published?: boolean
          source_url?: string | null
          state?: string | null
          suites?: number | null
          title?: string
          unavailable_since?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      property_photos: {
        Row: {
          created_at: string
          id: string
          position: number
          property_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          property_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          property_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_photos_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      merge_condos_from_staging: {
        Args: never
        Returns: {
          inserted_count: number
          skipped_count: number
          total_staged: number
          updated_count: number
        }[]
      }
      normalize_condo_slug: { Args: { s: string }; Returns: string }
      strip_accents_pt: { Args: { s: string }; Returns: string }
    }
    Enums: {
      app_role: "admin"
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
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
