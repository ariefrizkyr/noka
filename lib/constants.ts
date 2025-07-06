/**
 * Centralized constants and configurations for the application
 * Extracted from transaction components to reduce duplication
 */

import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Building, CreditCard, TrendingUp, Wallet } from 'lucide-react';
import type { 
  TransactionTypeConfig, 
  AccountTypeConfig, 
  CategoryTypeConfig,
  AccountType,
  CategoryType,
  TransactionType 
} from '@/types/common';

// Transaction type configurations
export const TRANSACTION_TYPE_CONFIG: Record<TransactionType, TransactionTypeConfig> = {
  income: {
    icon: ArrowUpRight,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    badge: 'bg-green-100 text-green-800',
    label: 'Income',
  },
  expense: {
    icon: ArrowDownLeft,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    badge: 'bg-red-100 text-red-800',
    label: 'Expense',
  },
  transfer: {
    icon: ArrowLeftRight,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800',
    label: 'Transfer',
  },
};

// Account type configurations
export const ACCOUNT_TYPE_CONFIG: Record<AccountType, AccountTypeConfig> = {
  bank_account: {
    label: 'Bank Accounts',
    shortLabel: 'Bank',
    icon: Building,
    color: 'bg-blue-100 text-blue-800',
  },
  credit_card: {
    label: 'Credit Cards',
    shortLabel: 'Credit Card',
    icon: CreditCard,
    color: 'bg-orange-100 text-orange-800',
  },
  investment_account: {
    label: 'Investment Accounts',
    shortLabel: 'Investment',
    icon: TrendingUp,
    color: 'bg-green-100 text-green-800',
  },
};

// Category type configurations
export const CATEGORY_TYPE_CONFIG: Record<CategoryType, CategoryTypeConfig> = {
  expense: {
    label: 'Expense',
    color: 'bg-red-100 text-red-800',
    description: 'Money going out',
  },
  income: {
    label: 'Income',
    color: 'bg-green-100 text-green-800',
    description: 'Money coming in',
  },
  investment: {
    label: 'Investment',
    color: 'bg-blue-100 text-blue-800',
    description: 'Investment contributions',
  },
};

// Default pagination settings
export const DEFAULT_PAGINATION = {
  LIMIT: 20,
  OFFSET: 0,
} as const;

// Default transaction filters
export const DEFAULT_TRANSACTION_FILTERS = {
  limit: DEFAULT_PAGINATION.LIMIT,
  offset: DEFAULT_PAGINATION.OFFSET,
} as const;

// Account type filter options
export const ACCOUNT_FILTER_OPTIONS = {
  TRANSFER_FROM: 'bank_account,credit_card',
  ALL: undefined,
} as const;

// Selector placeholders
export const SELECTOR_PLACEHOLDERS = {
  ACCOUNT: 'Select account...',
  CATEGORY: 'Select category...',
  ACCOUNT_FILTER: 'All accounts',
  CATEGORY_FILTER: 'All categories',
  TRANSACTION_TYPE: 'All types',
  TYPE_FILTER: 'All types',
} as const;

// Form validation constants
export const FORM_LIMITS = {
  DESCRIPTION_MAX_LENGTH: 500,
  AMOUNT_MIN: 0.01,
  AMOUNT_MAX: 999999999,
} as const;

// Date formatting constants
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_LONG: 'EEEE, MMMM dd, yyyy',
  API: 'yyyy-MM-dd',
  FILTER_DISPLAY: 'PPP',
  BADGE_DISPLAY: 'MMM dd',
} as const;

// Currency constants
export const CURRENCY_DEFAULTS = {
  DEFAULT_CURRENCY: 'IDR',
  DEFAULT_LOCALE: 'id-ID',
} as const;

// Utility functions for getting configurations
export function getTransactionTypeConfig(type: TransactionType) {
  return TRANSACTION_TYPE_CONFIG[type] || TRANSACTION_TYPE_CONFIG.expense;
}

export function getAccountTypeConfig(type: AccountType) {
  return ACCOUNT_TYPE_CONFIG[type] || {
    label: 'Other Accounts',
    shortLabel: 'Other',
    icon: Wallet,
    color: 'bg-gray-100 text-gray-800',
  };
}

export function getCategoryTypeConfig(type: CategoryType) {
  return CATEGORY_TYPE_CONFIG[type] || CATEGORY_TYPE_CONFIG.expense;
}

// Account type labels (for backward compatibility)
export const ACCOUNT_TYPE_LABELS = Object.fromEntries(
  Object.entries(ACCOUNT_TYPE_CONFIG).map(([key, config]) => [key, config.shortLabel])
) as Record<AccountType, string>;

// Category type labels (for backward compatibility)
export const CATEGORY_TYPE_LABELS = Object.fromEntries(
  Object.entries(CATEGORY_TYPE_CONFIG).map(([key, config]) => [key, config.label])
) as Record<CategoryType, string>;