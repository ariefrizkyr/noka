/**
 * Common TypeScript interfaces used across the application
 * Aligned with database.ts structure for consistency
 */

import { Tables, Enums } from "./database";

// Re-export database types for application use
export type Account = Tables<"accounts">;
export type Category = Tables<"categories">;
export type Transaction = Tables<"transactions">;
export type UserSettings = Tables<"user_settings">;
export type Family = Tables<"families">;
export type FamilyMember = Tables<"family_members">;
export type FamilyInvitation = Tables<"family_invitations">;

// Re-export enums
export type AccountType = Enums<"account_type">;
export type AccountScope = Enums<"account_scope">;
export type CategoryType = Enums<"category_type">;
export type TransactionType = Enums<"transaction_type">;
export type BudgetFrequency = Enums<"budget_frequency">;
export type FamilyRole = Enums<"family_role">;
export type InvitationStatus = Enums<"invitation_status">;

// Application-specific form data interfaces
export interface AccountFormData {
  name: string;
  type: AccountType;
  initial_balance: string;
  account_scope?: AccountScope;
  family_id?: string;
}

export interface CategoryFormData {
  name: string;
  type: CategoryType;
  icon: string;
  budget_amount: string;
  budget_frequency: BudgetFrequency | "";
  is_shared?: boolean;
  family_id?: string;
}

export interface TransactionFormData {
  type: TransactionType;
  amount: string;
  transaction_date: Date;
  description?: string;
  account_id?: string;
  category_id?: string;
  from_account_id?: string;
  to_account_id?: string;
  investment_category_id?: string;
}

// Family-specific form data interfaces
export interface FamilyFormData {
  name: string;
}

export interface FamilyInvitationFormData {
  email: string;
  role: FamilyRole;
}

// Grouped data interfaces
export interface GroupedAccounts {
  bank_account: Account[];
  credit_card: Account[];
  investment_account: Account[];
}

export interface GroupedCategories {
  expense: Category[];
  income: Category[];
  investment: Category[];
}

// CRUD dialog state interfaces
export interface DeleteDialogState<T> {
  item: T | null;
  reassignOptions: T[];
  selectedReassignId: string;
  hasTransactions: boolean;
  checkingTransactions: boolean;
}

// API response interfaces
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  error: string;
  details?: any;
}

// Form state interfaces
export interface FormState<T> {
  data: T;
  loading: boolean;
  errors: Record<string, string>;
}

// Loading and error state interfaces
export interface LoadingState {
  loading: boolean;
  error: Error | null;
}

// Account type information

// Category type information
export interface CategoryTypeInfo {
  label: string;
  description: string;
  defaultIcon: string;
}

// Currency information
export interface CurrencyInfo {
  symbol: string;
  name: string;
}

// Extended transaction interface with relations for UI components
export interface TransactionWithRelations extends Transaction {
  // For income/expense transactions
  accounts?: {
    id: string;
    name: string;
    type: AccountType;
    account_scope?: AccountScope;
    family?: {
      id: string;
      name: string;
    } | null;
  };
  categories?: {
    id: string;
    name: string;
    type: CategoryType;
    icon?: string;
    is_shared?: boolean;
    family?: {
      id: string;
      name: string;
    } | null;
  };

  // For transfer transactions
  from_accounts?: {
    id: string;
    name: string;
    type: AccountType;
    account_scope?: AccountScope;
  };
  to_accounts?: {
    id: string;
    name: string;
    type: AccountType;
    account_scope?: AccountScope;
  };
  investment_categories?: {
    id: string;
    name: string;
    type: "investment";
    icon?: string;
    is_shared?: boolean;
    family?: {
      id: string;
      name: string;
    } | null;
  };

  // Transaction attribution
  logged_by_user?: {
    id: string;
    email: string;
  };
}

// Transaction filtering interface
export interface TransactionFilters {
  start_date?: Date;
  end_date?: Date;
  account_id?: string;
  category_id?: string;
  type?: TransactionType;
}

// Pagination metadata
export interface PaginationMeta {
  limit: number;
  offset: number;
  count: number;
  total_count: number;
  has_more: boolean;
  next_offset: number | null;
}

// Transaction list API response
export interface TransactionListResponse {
  transactions: TransactionWithRelations[];
  pagination: PaginationMeta;
}

// Transaction type configuration
export interface TransactionTypeConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  iconColor: string;
  badge: string;
  label: string;
}

// Account type configuration
export interface AccountTypeConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  shortLabel?: string;
}

// Category type configuration
export interface CategoryTypeConfig {
  label: string;
  color: string;
  description?: string;
}

// Family role configuration
export interface FamilyRoleConfig {
  label: string;
  description: string;
  permissions: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// Account scope configuration
export interface AccountScopeConfig {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge: string;
}

// Family-related interfaces with relations
export interface FamilyWithMembers extends Family {
  member_count: number;
  user_role: FamilyRole;
  family_members?: Array<{
    id: string;
    user_id: string;
    role: FamilyRole;
    joined_at: string;
    user: {
      id: string;
      email: string;
    };
  }>;
}

export interface FamilyInvitationWithRelations extends FamilyInvitation {
  family: {
    id: string;
    name: string;
  };
  inviter: {
    id: string;
    email: string;
  };
}

export interface AccountWithFamily extends Account {
  family?: {
    id: string;
    name: string;
  } | null;
  family_name?: string | null;
  user_role?: FamilyRole | null;
}

export interface CategoryWithFamily extends Category {
  family?: {
    id: string;
    name: string;
  } | null;
  family_name?: string | null;
  user_role?: FamilyRole | null;
}

// Budget and Investment Progress interfaces (matching database function returns)
export interface BudgetProgress {
  category_id: string;
  category_name: string;
  category_type: CategoryType;
  category_icon: string;
  budget_amount: number;
  budget_frequency: BudgetFrequency;
  spent_amount: number;
  remaining_amount: number;
  progress_percentage: number;
  period_start: string;
  period_end: string;
  is_shared: boolean;
  family_id: string | null;
  family_name: string | null;
  member_contributions: Array<{
    user_id: string;
    user_email: string;
    contribution_amount: number;
    percentage: number;
  }>;
}

export interface InvestmentProgress {
  category_id: string;
  category_name: string;
  category_icon: string;
  target_amount: number;
  target_frequency: BudgetFrequency;
  invested_amount: number;
  remaining_amount: number;
  progress_percentage: number;
  period_start: string;
  period_end: string;
  is_shared: boolean;
  family_id: string | null;
  family_name: string | null;
  member_contributions: Array<{
    user_id: string;
    user_email: string;
    contribution_amount: number;
    percentage: number;
  }>;
}

// Entity types for generic components
export type EntityType = "account" | "category" | "transaction" | "family";

// Common props for form components
export interface FormComponentProps<T> {
  data: T;
  loading: boolean;
  onSubmit: (data: T) => void | Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

// Common props for list components
export interface ListComponentProps<T> {
  items: T[];
  loading: boolean;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onAdd: () => void;
  emptyMessage?: string;
}
