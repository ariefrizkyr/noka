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
 * Deactivate account without reassigning transactions
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    const deleteData = await validateRequestBody(request, deleteAccountSchema)
    const { account_id } = deleteData
    
    const supabase = await createClient()

    // Verify the account belongs to the user
    const { data: existingAccount, error: fetchError } = await supabase
      .from('accounts')
      .select('id, name')
      .eq('id', account_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingAccount) {
      throw new Error('Account not found or access denied')
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

    return createDeletedResponse(
      `Account "${existingAccount.name}" deactivated successfully.`
    )
  } catch (error) {
    return handleApiError(error)
  }
} 