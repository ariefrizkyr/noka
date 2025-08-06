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
  createAccountSchemaEnhanced, 
  updateAccountSchemaEnhanced,
  deleteAccountSchema
} from '../utils/validation'
import { 
  verifyAccountAccess, 
  verifyFamilyAccess, 
  getUserFamilyIds 
} from '../utils/family-auth'
import { TablesInsert, TablesUpdate } from '@/types/database'

// type Account = Tables<'accounts'>
type AccountInsert = TablesInsert<'accounts'>
type AccountUpdate = TablesUpdate<'accounts'>

/**
 * GET /api/accounts
 * Fetch user accounts (both personal and family accounts)
 */
export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get user's family IDs
    const familyIds = await getUserFamilyIds(user.id)

    // Build query to get both personal and family accounts
    let query = supabase
      .from('accounts')
      .select(`
        *,
        families!accounts_family_id_fkey(id, name)
      `)
      .eq('is_active', true)

    // Add conditions for personal OR family accounts
    if (familyIds.length > 0) {
      query = query.or(`user_id.eq.${user.id},family_id.in.(${familyIds.join(',')})`)
    } else {
      query = query.eq('user_id', user.id)
    }

    const { data: accounts, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    // Transform the response to include family information
    const enhancedAccounts = accounts.map(account => ({
      ...account,
      family_name: account.families?.name || null,
    }))

    return createSuccessResponse(
      enhancedAccounts,
      `Retrieved ${enhancedAccounts.length} accounts successfully`
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/accounts
 * Create new account (personal or joint)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const accountData = await validateRequestBody(request, createAccountSchemaEnhanced)
    const supabase = await createClient()

    // For joint accounts, verify user has admin access to the family
    if (accountData.account_scope === 'joint' && accountData.family_id) {
      const { isAdmin } = await verifyFamilyAccess(user.id, accountData.family_id)
      if (!isAdmin) {
        throw new Error('Only family admins can create joint accounts')
      }
    }

    const newAccount: AccountInsert = {
      ...accountData,
      user_id: accountData.account_scope === 'personal' ? user.id : null,
      family_id: accountData.account_scope === 'joint' ? accountData.family_id : null,
      current_balance: accountData.initial_balance,
    }

    const { data: account, error } = await supabase
      .from('accounts')
      .insert(newAccount)
      .select(`
        *,
        families!accounts_family_id_fkey(id, name)
      `)
      .single()

    if (error) throw error

    // Add family information to response
    const enhancedAccount = {
      ...account,
      family_name: account.families?.name || null,
    }

    return createCreatedResponse(
      enhancedAccount,
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
    const validatedData = updateAccountSchemaEnhanced.parse(updateData)
    const supabase = await createClient()

    // Verify user has access to this account (personal or family)
    await verifyAccountAccess(user.id, account_id)

    // For scope changes to joint, verify user has admin access to the family
    if (validatedData.account_scope === 'joint' && validatedData.family_id) {
      const { isAdmin } = await verifyFamilyAccess(user.id, validatedData.family_id)
      if (!isAdmin) {
        throw new Error('Only family admins can change accounts to joint scope')
      }
    }

    // Prepare update data with proper ownership assignment
    const updatePayload: AccountUpdate = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    }

    // Handle ownership changes based on scope
    if (validatedData.account_scope === 'joint') {
      updatePayload.user_id = null
      updatePayload.family_id = validatedData.family_id
    } else if (validatedData.account_scope === 'personal') {
      updatePayload.user_id = user.id
      updatePayload.family_id = null
    }

    const { data: updatedAccount, error } = await supabase
      .from('accounts')
      .update(updatePayload)
      .eq('id', account_id)
      .select(`
        *,
        families!accounts_family_id_fkey(id, name)
      `)
      .single()

    if (error) throw error

    // Add family information to response
    const enhancedAccount = {
      ...updatedAccount,
      family_name: updatedAccount.families?.name || null,
    }

    return createUpdatedResponse(
      enhancedAccount,
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

    // Verify user has access to this account (personal or family)
    await verifyAccountAccess(user.id, account_id)

    // Get account details for response message
    const { data: existingAccount, error: fetchError } = await supabase
      .from('accounts')
      .select('id, name, account_scope, family_id')
      .eq('id', account_id)
      .single()

    if (fetchError || !existingAccount) {
      throw new Error('Account not found or access denied')
    }

    // For joint accounts, verify user has admin access to modify
    if (existingAccount.account_scope === 'joint' && existingAccount.family_id) {
      const { isAdmin } = await verifyFamilyAccess(user.id, existingAccount.family_id)
      if (!isAdmin) {
        throw new Error('Only family admins can delete joint accounts')
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

    if (error) throw error

    return createDeletedResponse(
      `Account "${existingAccount.name}" deactivated successfully.`
    )
  } catch (error) {
    return handleApiError(error)
  }
} 