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
import { Tables, TablesInsert, TablesUpdate } from '@/types/database'

type Transaction = Tables<'transactions'>
type TransactionInsert = TablesInsert<'transactions'>
type TransactionUpdate = TablesUpdate<'transactions'>
type Account = Tables<'accounts'>
type BalanceLedgerInsert = TablesInsert<'balance_ledger'>

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

    // Create base query for filtering (used for both count and data)
    const buildBaseQuery = (query: any) => {
      let baseQuery = query.eq('user_id', user.id)
      
      if (queryParams.account_id) {
        baseQuery = baseQuery.eq('account_id', queryParams.account_id)
      }
      if (queryParams.category_id) {
        baseQuery = baseQuery.eq('category_id', queryParams.category_id)
      }
      if (queryParams.type) {
        baseQuery = baseQuery.eq('type', queryParams.type)
      }
      if (queryParams.start_date) {
        baseQuery = baseQuery.gte('transaction_date', queryParams.start_date)
      }
      if (queryParams.end_date) {
        baseQuery = baseQuery.lte('transaction_date', queryParams.end_date)
      }
      
      return baseQuery
    }

    // Get total count for infinite scroll pagination
    const countQuery = buildBaseQuery(supabase.from('transactions'))
    const { count: totalCount, error: countError } = await countQuery
      .select('*', { count: 'exact', head: true })

    if (countError) throw countError

    // Get actual data with relationships
    const dataQuery = buildBaseQuery(
      supabase
        .from('transactions')
        .select(`
          *,
          accounts!transactions_account_id_fkey(name, type),
          categories!transactions_category_id_fkey(name, type, icon),
          from_accounts:accounts!transactions_from_account_id_fkey(name, type),
          to_accounts:accounts!transactions_to_account_id_fkey(name, type),
          investment_categories:categories!transactions_investment_category_id_fkey(name, type, icon)
        `)
    )

    // Apply pagination and ordering
    const limit = queryParams.limit || 50
    const offset = queryParams.offset || 0
    
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

    // Update account balances based on transaction type
    if (transactionData.type === 'transfer') {
      // Handle transfer - update both accounts
      if (!transactionData.from_account_id || !transactionData.to_account_id) {
        throw new Error('Transfer requires both from_account_id and to_account_id')
      }

      // Update from account (subtract amount)
      await updateAccountBalance(
        supabase,
        transactionData.from_account_id,
        -transactionData.amount,
        newTransaction.id,
        user.id
      )

      // Update to account (add amount)
      await updateAccountBalance(
        supabase,
        transactionData.to_account_id,
        transactionData.amount,
        newTransaction.id,
        user.id
      )
    } else {
      // Handle income/expense
      if (!transactionData.account_id) {
        throw new Error('Income/expense requires account_id')
      }

      const balanceChange = transactionData.type === 'income' 
        ? transactionData.amount 
        : -transactionData.amount

      await updateAccountBalance(
        supabase,
        transactionData.account_id,
        balanceChange,
        newTransaction.id,
        user.id
      )
    }

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

    // If amount or accounts changed, update balances
    if (
      validatedData.amount !== undefined ||
      validatedData.account_id !== undefined ||
      validatedData.from_account_id !== undefined ||
      validatedData.to_account_id !== undefined
    ) {
      // Reverse the original transaction's balance effects
      await reverseTransactionBalanceEffects(supabase, originalTransaction, user.id)
      
      // Apply the new transaction's balance effects
      await applyTransactionBalanceEffects(supabase, updatedTransaction, user.id)
    }

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

    // Reverse the transaction's balance effects
    await reverseTransactionBalanceEffects(supabase, transaction, user.id)

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
 * Helper function to update account balance
 */
async function updateAccountBalance(
  supabase: any,
  accountId: string,
  changeAmount: number,
  transactionId: string,
  userId: string
) {
  // Get current balance
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('current_balance')
    .eq('id', accountId)
    .eq('user_id', userId)
    .single()

  if (accountError) throw accountError

  const balanceBefore = account.current_balance
  const balanceAfter = balanceBefore + changeAmount

  // Update account balance
  const { error: updateError } = await supabase
    .from('accounts')
    .update({
      current_balance: balanceAfter,
      updated_at: new Date().toISOString(),
    })
    .eq('id', accountId)
    .eq('user_id', userId)

  if (updateError) throw updateError

  // Create balance ledger entry
  const ledgerEntry: BalanceLedgerInsert = {
    account_id: accountId,
    transaction_id: transactionId,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    change_amount: changeAmount,
  }

  const { error: ledgerError } = await supabase
    .from('balance_ledger')
    .insert(ledgerEntry)

  if (ledgerError) throw ledgerError
}

/**
 * Helper function to reverse transaction balance effects
 */
async function reverseTransactionBalanceEffects(
  supabase: any,
  transaction: Transaction,
  userId: string
) {
  if (transaction.type === 'transfer') {
    if (transaction.from_account_id) {
      await updateAccountBalance(supabase, transaction.from_account_id, transaction.amount, transaction.id, userId)
    }
    if (transaction.to_account_id) {
      await updateAccountBalance(supabase, transaction.to_account_id, -transaction.amount, transaction.id, userId)
    }
  } else {
    if (transaction.account_id) {
      const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount
      await updateAccountBalance(supabase, transaction.account_id, balanceChange, transaction.id, userId)
    }
  }
}

/**
 * Helper function to apply transaction balance effects
 */
async function applyTransactionBalanceEffects(
  supabase: any,
  transaction: Transaction,
  userId: string
) {
  if (transaction.type === 'transfer') {
    if (transaction.from_account_id) {
      await updateAccountBalance(supabase, transaction.from_account_id, -transaction.amount, transaction.id, userId)
    }
    if (transaction.to_account_id) {
      await updateAccountBalance(supabase, transaction.to_account_id, transaction.amount, transaction.id, userId)
    }
  } else {
    if (transaction.account_id) {
      const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount
      await updateAccountBalance(supabase, transaction.account_id, balanceChange, transaction.id, userId)
    }
  }
} 