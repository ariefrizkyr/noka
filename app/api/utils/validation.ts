import { z } from 'zod'
// import { Database } from '@/types/database'

// Type aliases for cleaner code
// type AccountType = Database['public']['Enums']['account_type']
// type CategoryType = Database['public']['Enums']['category_type']
// type BudgetFrequency = Database['public']['Enums']['budget_frequency']
// type TransactionType = Database['public']['Enums']['transaction_type']

// Common validation patterns
const uuidSchema = z.string().uuid()
const positiveNumber = z.number().positive()

// Settings validation schemas
export const updateUserSettingsSchema = z.object({
  currency_code: z.string().length(3).optional(), // ISO 4217 currency codes
  financial_month_start_day: z.number().int().min(1).max(31).optional(),
  financial_week_start_day: z.number().int().min(0).max(6).optional(), // 0 = Sunday
  onboarding_completed: z.boolean().optional(),
})

// Account validation schemas
export const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['bank_account', 'credit_card', 'investment_account'] as const),
  initial_balance: z.number().default(0),
})

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['bank_account', 'credit_card', 'investment_account'] as const).optional(),
  current_balance: z.number().optional(),
  is_active: z.boolean().optional(),
})

// Category validation schemas
export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['expense', 'income', 'investment'] as const),
  icon: z.string().max(50).optional(),
  budget_amount: z.number().positive().nullable().optional(),
  budget_frequency: z.enum(['weekly', 'monthly', 'one_time'] as const).nullable().optional(),
}).refine((data) => {
  // Income categories should not have budget/frequency
  if (data.type === 'income') {
    return data.budget_amount === null && data.budget_frequency === null
  }
  
  // For expense/investment categories: if one budget field is provided, both must be provided
  if (data.budget_amount !== null || data.budget_frequency !== null) {
    return data.budget_amount !== null && data.budget_frequency !== null
  }
  
  return true
}, {
  message: "Income categories cannot have budgets. Expense/Investment categories must have both budget amount and frequency if either is provided.",
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['expense', 'income', 'investment'] as const).optional(),
  icon: z.string().max(50).optional(),
  budget_amount: z.number().positive().nullable().optional(),
  budget_frequency: z.enum(['weekly', 'monthly', 'one_time'] as const).nullable().optional(),
  is_active: z.boolean().optional(),
})

// Transaction validation schemas
export const createTransactionSchema = z.object({
  amount: positiveNumber,
  type: z.enum(['income', 'expense', 'transfer'] as const),
  transaction_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)), // ISO date or datetime
  description: z.string().max(500).optional(),
  account_id: uuidSchema.optional(),
  category_id: uuidSchema.optional(),
  investment_category_id: uuidSchema.optional(),
  from_account_id: uuidSchema.optional(),
  to_account_id: uuidSchema.optional(),
}).refine((data) => {
  // For transfers, both from_account_id and to_account_id are required
  if (data.type === 'transfer') {
    return data.from_account_id && data.to_account_id
  }
  // For income/expense, account_id is required
  return data.account_id
}, {
  message: "Transfer requires both from_account_id and to_account_id. Income/expense requires account_id.",
})

export const updateTransactionSchema = z.object({
  amount: positiveNumber.optional(),
  type: z.enum(['income', 'expense', 'transfer'] as const).optional(),
  transaction_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  description: z.string().max(500).nullable().optional(),
  account_id: uuidSchema.nullable().optional(),
  category_id: uuidSchema.nullable().optional(),
  investment_category_id: uuidSchema.nullable().optional(),
  from_account_id: uuidSchema.nullable().optional(),
  to_account_id: uuidSchema.nullable().optional(),
})

// Query parameter validation schemas
export const transactionQuerySchema = z.object({
  account_id: uuidSchema.optional(),
  category_id: uuidSchema.optional(),
  type: z.enum(['income', 'expense', 'transfer'] as const).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
})

// Helper function to validate request body
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await request.json()
  return schema.parse(body)
}

// Category deletion schema
export const deleteCategorySchema = z.object({
  category_id: uuidSchema,
  new_category_id: uuidSchema.optional(), // Required if category has transactions
})

// Account deletion schema
export const deleteAccountSchema = z.object({
  account_id: uuidSchema,
  new_account_id: uuidSchema.optional(), // Required if account has transactions
})

// Helper function to validate query parameters
export function validateQueryParams<T>(
  url: URL,
  schema: z.ZodSchema<T>
): T {
  const params = Object.fromEntries(url.searchParams)
  return schema.parse(params)
} 