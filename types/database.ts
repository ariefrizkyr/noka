export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          variables?: Json;
          operationName?: string;
          query?: string;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string;
          current_balance: number;
          id: string;
          initial_balance: number;
          is_active: boolean;
          name: string;
          type: Database["public"]["Enums"]["account_type"];
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          current_balance?: number;
          id?: string;
          initial_balance?: number;
          is_active?: boolean;
          name: string;
          type: Database["public"]["Enums"]["account_type"];
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          current_balance?: number;
          id?: string;
          initial_balance?: number;
          is_active?: boolean;
          name?: string;
          type?: Database["public"]["Enums"]["account_type"];
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      balance_ledger: {
        Row: {
          account_id: string | null;
          balance_after: number;
          balance_before: number;
          change_amount: number;
          created_at: string;
          id: string;
          transaction_id: string | null;
        };
        Insert: {
          account_id?: string | null;
          balance_after: number;
          balance_before: number;
          change_amount: number;
          created_at?: string;
          id?: string;
          transaction_id?: string | null;
        };
        Update: {
          account_id?: string | null;
          balance_after?: number;
          balance_before?: number;
          change_amount?: number;
          created_at?: string;
          id?: string;
          transaction_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "balance_ledger_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "balance_ledger_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          budget_amount: number | null;
          budget_frequency:
            | Database["public"]["Enums"]["budget_frequency"]
            | null;
          created_at: string;
          icon: string | null;
          id: string;
          is_active: boolean;
          name: string;
          type: Database["public"]["Enums"]["category_type"];
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          budget_amount?: number | null;
          budget_frequency?:
            | Database["public"]["Enums"]["budget_frequency"]
            | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          type: Database["public"]["Enums"]["category_type"];
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          budget_amount?: number | null;
          budget_frequency?:
            | Database["public"]["Enums"]["budget_frequency"]
            | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          type?: Database["public"]["Enums"]["category_type"];
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          account_id: string | null;
          amount: number;
          category_id: string | null;
          created_at: string;
          description: string | null;
          from_account_id: string | null;
          id: string;
          investment_category_id: string | null;
          to_account_id: string | null;
          transaction_date: string;
          type: Database["public"]["Enums"]["transaction_type"];
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          account_id?: string | null;
          amount: number;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          from_account_id?: string | null;
          id?: string;
          investment_category_id?: string | null;
          to_account_id?: string | null;
          transaction_date: string;
          type: Database["public"]["Enums"]["transaction_type"];
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          account_id?: string | null;
          amount?: number;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          from_account_id?: string | null;
          id?: string;
          investment_category_id?: string | null;
          to_account_id?: string | null;
          transaction_date?: string;
          type?: Database["public"]["Enums"]["transaction_type"];
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_from_account_id_fkey";
            columns: ["from_account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_investment_category_id_fkey";
            columns: ["investment_category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_to_account_id_fkey";
            columns: ["to_account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      user_settings: {
        Row: {
          created_at: string;
          currency_code: string;
          financial_month_start_day: number;
          financial_week_start_day: number;
          id: string;
          onboarding_completed: boolean;
          onboarding_step_1_completed: boolean;
          onboarding_step_2_completed: boolean;
          onboarding_step_3_completed: boolean;
          onboarding_current_step: number;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          currency_code?: string;
          financial_month_start_day?: number;
          financial_week_start_day?: number;
          id?: string;
          onboarding_completed?: boolean;
          onboarding_step_1_completed?: boolean;
          onboarding_step_2_completed?: boolean;
          onboarding_step_3_completed?: boolean;
          onboarding_current_step?: number;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          currency_code?: string;
          financial_month_start_day?: number;
          financial_week_start_day?: number;
          id?: string;
          onboarding_completed?: boolean;
          onboarding_step_1_completed?: boolean;
          onboarding_step_2_completed?: boolean;
          onboarding_step_3_completed?: boolean;
          onboarding_current_step?: number;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_budget_progress: {
        Args: { p_user_id: string };
        Returns: {
          category_id: string;
          category_name: string;
          category_type: Database["public"]["Enums"]["category_type"];
          category_icon: string;
          budget_amount: number;
          budget_frequency: Database["public"]["Enums"]["budget_frequency"];
          spent_amount: number;
          remaining_amount: number;
          progress_percentage: number;
          period_start: string;
          period_end: string;
        }[];
      };
      get_financial_summary: {
        Args: { p_user_id: string };
        Returns: {
          total_income: number;
          total_expenses: number;
          net_savings: number;
          period_start: string;
          period_end: string;
        }[];
      };
      get_investment_progress: {
        Args: { p_user_id: string };
        Returns: {
          category_id: string;
          category_name: string;
          category_icon: string;
          target_amount: number;
          target_frequency: Database["public"]["Enums"]["budget_frequency"];
          invested_amount: number;
          remaining_amount: number;
          progress_percentage: number;
          period_start: string;
          period_end: string;
        }[];
      };
    };
    Enums: {
      account_type: "bank_account" | "credit_card" | "investment_account";
      budget_frequency: "weekly" | "monthly" | "one_time";
      category_type: "expense" | "income" | "investment";
      transaction_type: "income" | "expense" | "transfer";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_type: ["bank_account", "credit_card", "investment_account"],
      budget_frequency: ["weekly", "monthly", "one_time"],
      category_type: ["expense", "income", "investment"],
      transaction_type: ["income", "expense", "transfer"],
    },
  },
} as const;
