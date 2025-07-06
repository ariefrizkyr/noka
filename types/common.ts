/**
 * Common TypeScript interfaces used across the application
 * Aligned with database.ts structure for consistency
 */

import { Tables, Enums } from './database';

// Re-export database types for application use
export type Account = Tables<'accounts'>;
export type Category = Tables<'categories'>;
export type Transaction = Tables<'transactions'>;
export type UserSettings = Tables<'user_settings'>;

// Re-export enums
export type AccountType = Enums<'account_type'>;
export type CategoryType = Enums<'category_type'>;
export type TransactionType = Enums<'transaction_type'>;
export type BudgetFrequency = Enums<'budget_frequency'>;

// Application-specific form data interfaces
export interface AccountFormData {
  name: string;
  type: AccountType;
  initial_balance: string;
}

export interface CategoryFormData {
  name: string;
  type: CategoryType;
  icon: string;
  budget_amount: string;
  budget_frequency: BudgetFrequency | '';
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
export interface AccountTypeInfo {
  label: string;
  icon: React.ComponentType<{ className?: string }>; // Lucide icon component
  color: string;
}

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
  };
  categories?: {
    id: string;
    name: string;
    type: CategoryType;
    icon?: string;
  };
  
  // For transfer transactions
  from_accounts?: {
    id: string;
    name: string;
    type: AccountType;
  };
  to_accounts?: {
    id: string;
    name: string;
    type: AccountType;
  };
  investment_categories?: {
    id: string;
    name: string;
    type: 'investment';
    icon?: string;
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

// Entity types for generic components
export type EntityType = 'account' | 'category' | 'transaction';

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