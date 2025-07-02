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
  createAccountSchema, 
  updateAccountSchema,
  deleteAccountSchema
} from '../utils/validation'
import { TablesInsert } from '@/types/database'

// type Account = Tables<'accounts'>
type AccountInsert = TablesInsert<'accounts'>
// type AccountUpdate = TablesUpdate<'accounts'>

/**
 * GET /api/accounts
 * Fetch user accounts
 */
export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    return createSuccessResponse(
      accounts,
      `Retrieved ${accounts.length} accounts successfully`
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/accounts
 * Create new account
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const accountData = await validateRequestBody(request, createAccountSchema)
    const supabase = await createClient()

    const newAccount: AccountInsert = {
      ...accountData,
      user_id: user.id,
      current_balance: accountData.initial_balance,
    }

    const { data: account, error } = await supabase
      .from('accounts')
      .insert(newAccount)
      .select()
      .single()

    if (error) throw error

    return createCreatedResponse(
      account,
      'Account created successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/accounts
 * Update account (requires account_id in request body)
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    
    // Extract account_id from body
    const { account_id, ...updateData } = body
    
    if (!account_id) {
      throw new Error('account_id is required')
    }

    // Validate the update data
    const validatedData = updateAccountSchema.parse(updateData)
    const supabase = await createClient()

    // Verify the account belongs to the user
    const { data: existingAccount, error: fetchError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', account_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingAccount) {
      throw new Error('Account not found or access denied')
    }

    const { data: updatedAccount, error } = await supabase
      .from('accounts')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', account_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return createUpdatedResponse(
      updatedAccount,
      'Account updated successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/accounts
 * Deactivate account and optionally reassign transactions to new account
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    const deleteData = await validateRequestBody(request, deleteAccountSchema)
    const { account_id, new_account_id } = deleteData
    
    const supabase = await createClient()

    // Verify the account belongs to the user
    const { data: existingAccount, error: fetchError } = await supabase
      .from('accounts')
      .select('id, name, type')
      .eq('id', account_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingAccount) {
      throw new Error('Account not found or access denied')
    }

    // Check if account is being used in transactions
    const { data: transactionsUsingAccount, error: transactionError } = await supabase
      .from('transactions')
      .select('id, type')
      .or(`account_id.eq.${account_id},from_account_id.eq.${account_id},to_account_id.eq.${account_id}`)
      .eq('user_id', user.id)

    if (transactionError) throw transactionError

    const hasTransactions = transactionsUsingAccount && transactionsUsingAccount.length > 0

    // If account has transactions, new_account_id is required
    if (hasTransactions && !new_account_id) {
      throw new Error(`Cannot delete account "${existingAccount.name}" because it has ${transactionsUsingAccount.length} associated transactions. Please provide new_account_id to reassign transactions.`)
    }

    // If new_account_id is provided, verify it belongs to the user, is active, and has same type
    if (new_account_id) {
      const { data: newAccount, error: newAccountError } = await supabase
        .from('accounts')
        .select('id, name, type, is_active')
        .eq('id', new_account_id)
        .eq('user_id', user.id)
        .single()

      if (newAccountError || !newAccount) {
        throw new Error('New account not found or access denied')
      }

      if (!newAccount.is_active) {
        throw new Error('Cannot reassign transactions to an inactive account')
      }

      // Verify account types match
      if (newAccount.type !== existingAccount.type) {
        throw new Error(`Cannot reassign transactions from ${existingAccount.type} to ${newAccount.type}. Account types must match.`)
      }

      // Update transactions to use the new account
      if (hasTransactions) {
        // Update transactions where this account is the main account
        const { error: updateAccountError } = await supabase
          .from('transactions')
          .update({
            account_id: new_account_id,
            updated_at: new Date().toISOString(),
          })
          .eq('account_id', account_id)
          .eq('user_id', user.id)

        if (updateAccountError) throw updateAccountError

        // Update transactions where this account is the source account in transfers
        const { error: updateFromAccountError } = await supabase
          .from('transactions')
          .update({
            from_account_id: new_account_id,
            updated_at: new Date().toISOString(),
          })
          .eq('from_account_id', account_id)
          .eq('user_id', user.id)

        if (updateFromAccountError) throw updateFromAccountError

        // Update transactions where this account is the destination account in transfers
        const { error: updateToAccountError } = await supabase
          .from('transactions')
          .update({
            to_account_id: new_account_id,
            updated_at: new Date().toISOString(),
          })
          .eq('to_account_id', account_id)
          .eq('user_id', user.id)

        if (updateToAccountError) throw updateToAccountError
      }
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('accounts')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', account_id)
      .eq('user_id', user.id)

    if (error) throw error

    const responseMessage = hasTransactions && new_account_id
      ? `Account "${existingAccount.name}" deactivated successfully. ${transactionsUsingAccount.length} transactions reassigned to new account.`
      : `Account "${existingAccount.name}" deactivated successfully.`

    return createDeletedResponse(responseMessage)
  } catch (error) {
    return handleApiError(error)
  }
} 