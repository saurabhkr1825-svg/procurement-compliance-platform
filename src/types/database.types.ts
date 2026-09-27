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
      audit_logs: {
        Row: {
          action: string
          bidder_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          tender_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          bidder_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          tender_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          bidder_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          tender_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_bidder_id_fkey"
            columns: ["bidder_id"]
            isOneToOne: false
            referencedRelation: "bidders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bidder_documents: {
        Row: {
          bidder_id: string
          created_at: string | null
          document_type: string | null
          file_name: string
          file_size: number | null
          id: string
          mime_type: string | null
          page_count: number | null
          processing_status: string
          storage_path: string
        }
        Insert: {
          bidder_id: string
          created_at?: string | null
          document_type?: string | null
          file_name: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          page_count?: number | null
          processing_status?: string
          storage_path: string
        }
        Update: {
          bidder_id?: string
          created_at?: string | null
          document_type?: string | null
          file_name?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          page_count?: number | null
          processing_status?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "bidder_documents_bidder_id_fkey"
            columns: ["bidder_id"]
            isOneToOne: false
            referencedRelation: "bidders"
            referencedColumns: ["id"]
          },
        ]
      }
      bidders: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          legal_name: string
          registration_number: string | null
          tender_id: string
          trade_name: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          legal_name: string
          registration_number?: string | null
          tender_id: string
          trade_name?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          legal_name?: string
          registration_number?: string | null
          tender_id?: string
          trade_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bidders_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_results: {
        Row: {
          ai_result: string | null
          bidder_id: string
          confidence: number | null
          created_at: string | null
          evidence: string | null
          evidence_document_id: string | null
          evidence_page: number | null
          id: string
          officer_remark: string | null
          officer_result: string | null
          reason: string | null
          requirement_id: string
          result: string
          reviewed_at: string | null
          reviewed_by: string | null
          updated_at: string | null
        }
        Insert: {
          ai_result?: string | null
          bidder_id: string
          confidence?: number | null
          created_at?: string | null
          evidence?: string | null
          evidence_document_id?: string | null
          evidence_page?: number | null
          id?: string
          officer_remark?: string | null
          officer_result?: string | null
          reason?: string | null
          requirement_id: string
          result: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_result?: string | null
          bidder_id?: string
          confidence?: number | null
          created_at?: string | null
          evidence?: string | null
          evidence_document_id?: string | null
          evidence_page?: number | null
          id?: string
          officer_remark?: string | null
          officer_result?: string | null
          reason?: string | null
          requirement_id?: string
          result?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_results_bidder_id_fkey"
            columns: ["bidder_id"]
            isOneToOne: false
            referencedRelation: "bidders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_results_evidence_document_id_fkey"
            columns: ["evidence_document_id"]
            isOneToOne: false
            referencedRelation: "bidder_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_results_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_results_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      extracted_fields: {
        Row: {
          confidence: number | null
          created_at: string | null
          data_type: string | null
          document_id: string
          field_name: string
          field_value: string | null
          id: string
          normalized_value: string | null
          page_number: number | null
          source_text: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          data_type?: string | null
          document_id: string
          field_name: string
          field_value?: string | null
          id?: string
          normalized_value?: string | null
          page_number?: number | null
          source_text?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          data_type?: string | null
          document_id?: string
          field_name?: string
          field_value?: string | null
          id?: string
          normalized_value?: string | null
          page_number?: number | null
          source_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_fields_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "bidder_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          organization: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          organization?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          organization?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      requirements: {
        Row: {
          category: string | null
          confidence: number | null
          created_at: string | null
          description: string | null
          id: string
          mandatory: boolean
          requirement_type: string | null
          source_document_id: string | null
          source_page: number | null
          source_text: string | null
          tender_id: string
          threshold_operator: string | null
          threshold_value: number | null
          title: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          confidence?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          mandatory?: boolean
          requirement_type?: string | null
          source_document_id?: string | null
          source_page?: number | null
          source_text?: string | null
          tender_id: string
          threshold_operator?: string | null
          threshold_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          confidence?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          mandatory?: boolean
          requirement_type?: string | null
          source_document_id?: string | null
          source_page?: number | null
          source_text?: string | null
          tender_id?: string
          threshold_operator?: string | null
          threshold_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requirements_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "tender_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirements_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_flags: {
        Row: {
          bidder_id: string
          created_at: string | null
          description: string | null
          evidence: string | null
          id: string
          requirement_id: string | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          risk_type: string
          severity: string
          title: string
        }
        Insert: {
          bidder_id: string
          created_at?: string | null
          description?: string | null
          evidence?: string | null
          id?: string
          requirement_id?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          risk_type: string
          severity: string
          title: string
        }
        Update: {
          bidder_id?: string
          created_at?: string | null
          description?: string | null
          evidence?: string | null
          id?: string
          requirement_id?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          risk_type?: string
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_flags_bidder_id_fkey"
            columns: ["bidder_id"]
            isOneToOne: false
            referencedRelation: "bidders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_flags_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_flags_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_documents: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          id: string
          mime_type: string | null
          page_count: number | null
          processing_status: string
          storage_path: string
          tender_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          page_count?: number | null
          processing_status?: string
          storage_path: string
          tender_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          page_count?: number | null
          processing_status?: string
          storage_path?: string
          tender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tender_documents_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      tenders: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          organization: string | null
          reference_number: string | null
          status: string
          submission_deadline: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          organization?: string | null
          reference_number?: string | null
          status?: string
          submission_deadline?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          organization?: string | null
          reference_number?: string | null
          status?: string
          submission_deadline?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenders_created_by_fkey"
            columns: ["created_by"]
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
    Enums: {},
  },
} as const
