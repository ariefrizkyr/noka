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
      accounts: {
        Row: {
          account_scope: Database["public"]["Enums"]["account_scope"]
          created_at: string
          current_balance: number
          family_id: string | null
          id: string
          initial_balance: number
          is_active: boolean
          name: string
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_scope?: Database["public"]["Enums"]["account_scope"]
          created_at?: string
          current_balance?: number
          family_id?: string | null
          id?: string
          initial_balance?: number
          is_active?: boolean
          name: string
          type: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_scope?: Database["public"]["Enums"]["account_scope"]
          created_at?: string
          current_balance?: number
          family_id?: string | null
          id?: string
          initial_balance?: number
          is_active?: boolean
          name?: string
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      balance_ledger: {
        Row: {
          account_id: string | null
          balance_after: number
          balance_before: number
          change_amount: number
          created_at: string
          id: string
          transaction_id: string | null
        }
        Insert: {
          account_id?: string | null
          balance_after: number
          balance_before: number
          change_amount: number
          created_at?: string
          id?: string
          transaction_id?: string | null
        }
        Update: {
          account_id?: string | null
          balance_after?: number
          balance_before?: number
          change_amount?: number
          created_at?: string
          id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "balance_ledger_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balance_ledger_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          budget_amount: number | null
          budget_frequency:
            | Database["public"]["Enums"]["budget_frequency"]
            | null
          created_at: string
          family_id: string | null
          icon: string | null
          id: string
          is_active: boolean
          is_shared: boolean
          name: string
          type: Database["public"]["Enums"]["category_type"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          budget_amount?: number | null
          budget_frequency?:
            | Database["public"]["Enums"]["budget_frequency"]
            | null
          created_at?: string
          family_id?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_shared?: boolean
          name: string
          type: Database["public"]["Enums"]["category_type"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          budget_amount?: number | null
          budget_frequency?:
            | Database["public"]["Enums"]["budget_frequency"]
            | null
          created_at?: string
          family_id?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_shared?: boolean
          name?: string
          type?: Database["public"]["Enums"]["category_type"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      family_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          family_id: string | null
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["family_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          family_id?: string | null
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["family_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          family_id?: string | null
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["family_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_invitations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          family_id: string | null
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["family_role"]
          user_id: string | null
        }
        Insert: {
          family_id?: string | null
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["family_role"]
          user_id?: string | null
        }
        Update: {
          family_id?: string | null
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["family_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string | null
          created_at: string
          description: string | null
          from_account_id: string | null
          id: string
          investment_category_id: string | null
          logged_by_user_id: string
          to_account_id: string | null
          transaction_date: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          from_account_id?: string | null
          id?: string
          investment_category_id?: string | null
          logged_by_user_id: string
          to_account_id?: string | null
          transaction_date: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          from_account_id?: string | null
          id?: string
          investment_category_id?: string | null
          logged_by_user_id?: string
          to_account_id?: string | null
          transaction_date?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_investment_category_id_fkey"
            columns: ["investment_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          currency_code: string
          financial_month_start_day: number
          financial_week_start_day: number
          id: string
          onboarding_completed: boolean
          onboarding_current_step: number | null
          onboarding_step_1_completed: boolean | null
          onboarding_step_2_completed: boolean | null
          onboarding_step_3_completed: boolean | null
          updated_at: string
          user_id: string | null
          weekend_end_handling:
            | Database["public"]["Enums"]["weekend_handling"]
            | null
        }
        Insert: {
          created_at?: string
          currency_code?: string
          financial_month_start_day?: number
          financial_week_start_day?: number
          id?: string
          onboarding_completed?: boolean
          onboarding_current_step?: number | null
          onboarding_step_1_completed?: boolean | null
          onboarding_step_2_completed?: boolean | null
          onboarding_step_3_completed?: boolean | null
          updated_at?: string
          user_id?: string | null
          weekend_end_handling?:
            | Database["public"]["Enums"]["weekend_handling"]
            | null
        }
        Update: {
          created_at?: string
          currency_code?: string
          financial_month_start_day?: number
          financial_week_start_day?: number
          id?: string
          onboarding_completed?: boolean
          onboarding_current_step?: number | null
          onboarding_step_1_completed?: boolean | null
          onboarding_step_2_completed?: boolean | null
          onboarding_step_3_completed?: boolean | null
          updated_at?: string
          user_id?: string | null
          weekend_end_handling?:
            | Database["public"]["Enums"]["weekend_handling"]
            | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_weekend_date: {
        Args: {
          p_weekend_handling: Database["public"]["Enums"]["weekend_handling"]
          p_date: string
        }
        Returns: string
      }
      get_budget_progress: {
        Args: { p_user_id: string }
        Returns: {
          budget_frequency: Database["public"]["Enums"]["budget_frequency"]
          spent_amount: number
          remaining_amount: number
          progress_percentage: number
          period_start: string
          period_end: string
          is_shared: boolean
          family_id: string
          budget_amount: number
          member_contributions: Json
          family_name: string
          category_id: string
          category_name: string
          category_type: Database["public"]["Enums"]["category_type"]
          category_icon: string
        }[]
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_family_members_with_emails: {
        Args: { p_family_id: string }
        Returns: {
          role: Database["public"]["Enums"]["family_role"]
          id: string
          user_id: string
          email: string
          joined_at: string
        }[]
      }
      get_financial_summary: {
        Args: { p_user_id: string }
        Returns: {
          period_end: string
          period_start: string
          net_savings: number
          total_expenses: number
          total_income: number
        }[]
      }
      get_investment_progress: {
        Args: { p_user_id: string }
        Returns: {
          invested_amount: number
          progress_percentage: number
          period_start: string
          period_end: string
          is_shared: boolean
          family_id: string
          family_name: string
          member_contributions: Json
          category_id: string
          category_name: string
          category_icon: string
          target_amount: number
          target_frequency: Database["public"]["Enums"]["budget_frequency"]
          remaining_amount: number
        }[]
      }
      get_member_contributions: {
        Args: {
          p_end_date?: string
          p_start_date?: string
          p_category_id: string
          p_family_id: string
        }
        Returns: {
          user_email: string
          percentage_of_total: number
          user_id: string
          transaction_count: number
          contribution_amount: number
        }[]
      }
      get_transaction_user_email: {
        Args: { p_user_id: string }
        Returns: string
      }
      test_family_insert_policy: {
        Args: { test_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      account_scope: "personal" | "joint"
      account_type: "bank_account" | "credit_card" | "investment_account"
      budget_frequency: "weekly" | "monthly" | "one_time"
      category_type: "expense" | "income" | "investment"
      family_role: "admin" | "member"
      invitation_status: "pending" | "accepted" | "declined" | "expired"
      transaction_type: "income" | "expense" | "transfer"
      weekend_handling: "no_adjustment" | "move_to_friday" | "move_to_monday"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_scope: ["personal", "joint"],
      account_type: ["bank_account", "credit_card", "investment_account"],
      budget_frequency: ["weekly", "monthly", "one_time"],
      category_type: ["expense", "income", "investment"],
      family_role: ["admin", "member"],
      invitation_status: ["pending", "accepted", "declined", "expired"],
      transaction_type: ["income", "expense", "transfer"],
      weekend_handling: ["no_adjustment", "move_to_friday", "move_to_monday"],
    },
  },
} as const

