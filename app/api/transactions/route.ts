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
// Type imports removed - balance updates are now handled by database triggers

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

    // Update the transaction
    const { data: updatedTransaction, error: updateError } = await supabase
      .from('transactions')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) throw updateError

    // Balance updates for transaction modifications are handled by the database trigger
    // Application-level balance reversal/reapplication is not needed

    return createUpdatedResponse(
      updatedTransaction,
      'Transaction updated successfully'
    )
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

// Helper functions removed - balance updates are now handled by database triggers