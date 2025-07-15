import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '../utils/auth'
import { handleApiError } from '../utils/error-handler'
import { 
  createSuccessResponse, 
  createCreatedResponse, 
  createUpdatedResponse, 
  createDeletedResponse 
} from '../utils/response'
import { 
  validateRequestBody, 
  validateQueryParams,
  createTransactionSchema, 
  updateTransactionSchema,
  transactionQuerySchema
} from '../utils/validation'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
// Type imports removed - balance updates are now handled by database triggers

type Transaction = Database['public']['Tables']['transactions']['Row']
type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

/**
 * GET /api/transactions
 * Fetch user transactions with optional filtering and infinite scroll support
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const url = new URL(request.url)
    const queryParams = validateQueryParams(url, transactionQuerySchema)
    const supabase = await createClient()

    // Apply pagination
    const limit = queryParams.limit || 50
    const offset = queryParams.offset || 0

    // Build count query for pagination
    let countQuery = supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      
    if (queryParams.account_id) {
      countQuery = countQuery.eq('account_id', queryParams.account_id)
    }
    if (queryParams.category_id) {
      countQuery = countQuery.eq('category_id', queryParams.category_id)
    }
    if (queryParams.type) {
      countQuery = countQuery.eq('type', queryParams.type)
    }
    if (queryParams.start_date) {
      countQuery = countQuery.gte('transaction_date', queryParams.start_date)
    }
    if (queryParams.end_date) {
      countQuery = countQuery.lte('transaction_date', queryParams.end_date)
    }

    const { count: totalCount, error: countError } = await countQuery

    if (countError) throw countError

    // Build data query with relationships
    let dataQuery = supabase
      .from('transactions')
      .select(`
        *,
        accounts!transactions_account_id_fkey(name, type),
        categories!transactions_category_id_fkey(name, type, icon),
        from_accounts:accounts!transactions_from_account_id_fkey(name, type),
        to_accounts:accounts!transactions_to_account_id_fkey(name, type),
        investment_categories:categories!transactions_investment_category_id_fkey(name, type, icon)
      `)
      .eq('user_id', user.id)
      
    if (queryParams.account_id) {
      dataQuery = dataQuery.eq('account_id', queryParams.account_id)
    }
    if (queryParams.category_id) {
      dataQuery = dataQuery.eq('category_id', queryParams.category_id)
    }
    if (queryParams.type) {
      dataQuery = dataQuery.eq('type', queryParams.type)
    }
    if (queryParams.start_date) {
      dataQuery = dataQuery.gte('transaction_date', queryParams.start_date)
    }
    if (queryParams.end_date) {
      dataQuery = dataQuery.lte('transaction_date', queryParams.end_date)
    }

    const { data: transactions, error } = await dataQuery
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Calculate infinite scroll metadata
    const hasMore = (offset + transactions.length) < (totalCount || 0)
    const nextOffset = hasMore ? offset + limit : null

    return createSuccessResponse(
      {
        transactions,
        pagination: {
          limit,
          offset,
          count: transactions.length,
          total_count: totalCount || 0,
          has_more: hasMore,
          next_offset: nextOffset,
        },
      },
      `Retrieved ${transactions.length} of ${totalCount || 0} transactions successfully`
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/transactions
 * Create new transaction with balance updates
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const transactionData = await validateRequestBody(request, createTransactionSchema)
    const supabase = await createClient()

    // Start a transaction
    const { data: newTransaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        ...transactionData,
        user_id: user.id,
      })
      .select()
      .single()

    if (transactionError) throw transactionError

    // Balance updates are handled automatically by the database trigger
    // No manual balance updates needed here

    // Fetch the complete transaction with related data
    const { data: completeTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select(`
        *,
        accounts!transactions_account_id_fkey(name, type),
        categories!transactions_category_id_fkey(name, type, icon),
        from_accounts:accounts!transactions_from_account_id_fkey(name, type),
        to_accounts:accounts!transactions_to_account_id_fkey(name, type),
        investment_categories:categories!transactions_investment_category_id_fkey(name, type, icon)
      `)
      .eq('id', newTransaction.id)
      .single()

    if (fetchError) throw fetchError

    return createCreatedResponse(
      completeTransaction,
      'Transaction created successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/transactions
 * Update transaction (requires transaction_id in request body)
 * Handles transaction type changes using delete-and-recreate approach
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    
    const { transaction_id, ...updateData } = body
    
    if (!transaction_id) {
      throw new Error('transaction_id is required')
    }

    const validatedData = updateTransactionSchema.parse(updateData)
    const supabase = await createClient()

    // Get the original transaction
    const { data: originalTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transaction_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !originalTransaction) {
      throw new Error('Transaction not found or access denied')
    }

    // Check if transaction type is being changed
    const isTypeChanged = validatedData.type && validatedData.type !== originalTransaction.type

    if (isTypeChanged) {
      // Use delete-and-recreate approach for type changes
      return handleTransactionTypeChange(supabase, user, originalTransaction, validatedData, transaction_id)
    } else {
      // Use regular update for non-type changes
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction_id)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      // Fetch the complete transaction with related data
      const { data: completeTransaction, error: completeError } = await supabase
        .from('transactions')
        .select(`
          *,
          accounts!transactions_account_id_fkey(name, type),
          categories!transactions_category_id_fkey(name, type, icon),
          from_accounts:accounts!transactions_from_account_id_fkey(name, type),
          to_accounts:accounts!transactions_to_account_id_fkey(name, type),
          investment_categories:categories!transactions_investment_category_id_fkey(name, type, icon)
        `)
        .eq('id', transaction_id)
        .single()

      if (completeError) throw completeError

      return createUpdatedResponse(
        completeTransaction,
        'Transaction updated successfully'
      )
    }
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/transactions
 * Delete transaction and reverse balance effects
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { transaction_id } = await request.json()
    
    if (!transaction_id) {
      throw new Error('transaction_id is required')
    }

    const supabase = await createClient()

    // Get the transaction before deleting
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transaction_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !transaction) {
      throw new Error('Transaction not found or access denied')
    }

    // Balance updates for transaction deletion are handled by the database trigger
    // Application-level balance reversal is not needed

    // Delete the transaction
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transaction_id)
      .eq('user_id', user.id)

    if (deleteError) throw deleteError

    return createDeletedResponse('Transaction deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Handles transaction type changes using delete-and-recreate approach
 * Maps fields appropriately for the new transaction type
 */
async function handleTransactionTypeChange(
  supabase: SupabaseClient<Database>,
  user: User,
  originalTransaction: Transaction,
  validatedData: TransactionUpdate,
  transaction_id: string
) {
  // Map fields from original transaction to new transaction type
  const newTransactionData = mapTransactionFields(originalTransaction, validatedData)
  
  // Validate the new transaction data using create schema
  try {
    const validatedNewTransaction = createTransactionSchema.parse(newTransactionData)

    // Delete the original transaction (this will trigger balance reversal)
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transaction_id)
      .eq('user_id', user.id)

    if (deleteError) throw deleteError

    // Create new transaction with new type and mapped fields
    const { data: newTransaction, error: createError } = await supabase
      .from('transactions')
      .insert({
        ...validatedNewTransaction,
        user_id: user.id,
        created_at: originalTransaction.created_at, // Preserve original creation time
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) throw createError

    // Fetch the complete transaction with related data
    const { data: completeTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select(`
        *,
        accounts!transactions_account_id_fkey(name, type),
        categories!transactions_category_id_fkey(name, type, icon),
        from_accounts:accounts!transactions_from_account_id_fkey(name, type),
        to_accounts:accounts!transactions_to_account_id_fkey(name, type),
        investment_categories:categories!transactions_investment_category_id_fkey(name, type, icon)
      `)
      .eq('id', newTransaction.id)
      .single()

    if (fetchError) throw fetchError

    return createUpdatedResponse(
      completeTransaction,
      'Transaction updated successfully'
    )
  } catch (validationError) {
    console.error('Transaction type change validation failed:', {
      originalTransaction,
      validatedData,
      newTransactionData,
      error: validationError
    })
    throw new Error(`Transaction validation failed: ${validationError instanceof Error ? validationError.message : 'Unknown error'}`)
  }
}

/**
 * Maps fields from original transaction to new transaction type
 */
function mapTransactionFields(originalTransaction: Transaction, validatedData: TransactionUpdate) {
  const newType = validatedData.type
  const originalType = originalTransaction.type
  
  // Base fields that are common to all transaction types
  const baseData = {
    type: newType,
    amount: validatedData.amount ?? originalTransaction.amount,
    transaction_date: validatedData.transaction_date ?? originalTransaction.transaction_date,
    ...(validatedData.description !== undefined || originalTransaction.description !== null 
      ? { description: validatedData.description ?? originalTransaction.description } 
      : {})
  }

  // Build type-specific data objects to avoid null values for optional fields
  if (newType === 'transfer') {
    // Transfer transaction: only include transfer-specific fields
    let fromAccountId: string | undefined
    let toAccountId: string | undefined
    
    if (originalType === 'income' || originalType === 'expense') {
      // Income/Expense → Transfer: map account_id to from_account_id
      fromAccountId = validatedData.from_account_id ?? (originalTransaction.account_id || undefined)
      toAccountId = validatedData.to_account_id || undefined
    } else {
      // Transfer → Transfer: keep existing values or use form data
      fromAccountId = validatedData.from_account_id ?? (originalTransaction.from_account_id || undefined)
      toAccountId = validatedData.to_account_id ?? (originalTransaction.to_account_id || undefined)
    }
    
    return {
      ...baseData,
      from_account_id: fromAccountId,
      to_account_id: toAccountId,
      ...(validatedData.investment_category_id !== undefined 
        ? { investment_category_id: validatedData.investment_category_id }
        : {})
    }
  } else {
    // Income/Expense transaction: only include income/expense-specific fields
    let accountId: string | undefined
    let categoryId: string | undefined
    
    if (originalType === 'transfer') {
      // Transfer → Income/Expense: map from_account_id to account_id
      accountId = validatedData.account_id ?? (originalTransaction.from_account_id || undefined)
      categoryId = validatedData.category_id || undefined
    } else {
      // Income/Expense → Income/Expense: keep account_id, category comes from form
      accountId = validatedData.account_id ?? (originalTransaction.account_id || undefined)
      categoryId = validatedData.category_id || undefined
    }
    
    return {
      ...baseData,
      account_id: accountId,
      category_id: categoryId
    }
  }
}

// Helper functions removed - balance updates are now handled by database triggers