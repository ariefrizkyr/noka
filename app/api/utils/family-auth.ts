import { createClient } from '@/lib/supabase/server'

export interface FamilyAccessResult {
  isMember: boolean;
  isAdmin: boolean;
  role: 'admin' | 'member' | null;
}

/**
 * Verify if a user has access to a family and return their role
 */
export async function verifyFamilyAccess(
  userId: string,
  familyId: string,
): Promise<FamilyAccessResult> {
  const supabase = await createClient()
  
  const { data: membership, error } = await supabase
    .from('family_members')
    .select('role')
    .eq('user_id', userId)
    .eq('family_id', familyId)
    .single()

  if (error || !membership) {
    return { isMember: false, isAdmin: false, role: null }
  }

  return {
    isMember: true,
    isAdmin: membership.role === 'admin',
    role: membership.role
  }
}

/**
 * Require admin access to a family
 * Throws an error if user is not an admin
 */
export async function requireFamilyAdmin(userId: string, familyId: string): Promise<void> {
  const { isAdmin } = await verifyFamilyAccess(userId, familyId)
  
  if (!isAdmin) {
    throw new Error('Admin access required for this family')
  }
}

/**
 * Get all family IDs that a user is a member of
 */
export async function getUserFamilyIds(userId: string): Promise<string[]> {
  const supabase = await createClient()
  
  const { data: memberships, error } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', userId)

  if (error) return []
  
  return memberships.map(m => m.family_id)
}

/**
 * Get user's role in a specific family
 */
export async function getUserRoleInFamily(
  userId: string,
  familyId: string
): Promise<'admin' | 'member' | null> {
  const { role } = await verifyFamilyAccess(userId, familyId)
  return role
}

/**
 * Verify if user has access to a specific account (personal or family)
 */
export async function verifyAccountAccess(userId: string, accountId: string): Promise<void> {
  const supabase = await createClient()
  
  const { data: account, error } = await supabase
    .from('accounts')
    .select('user_id, family_id, account_scope')
    .eq('id', accountId)
    .single()

  if (error || !account) {
    throw new Error('Account not found')
  }

  // Check if it's a personal account owned by the user
  if (account.account_scope === 'personal' && account.user_id === userId) {
    return
  }

  // Check if it's a joint account and user is a family member
  if (account.account_scope === 'joint' && account.family_id) {
    const { isMember } = await verifyFamilyAccess(userId, account.family_id)
    if (isMember) {
      return
    }
  }

  throw new Error('Access denied to this account')
}

/**
 * Verify if user has access to a specific category (personal or shared)
 */
export async function verifyCategoryAccess(userId: string, categoryId: string): Promise<void> {
  const supabase = await createClient()
  
  const { data: category, error } = await supabase
    .from('categories')
    .select('user_id, family_id, is_shared')
    .eq('id', categoryId)
    .single()

  if (error || !category) {
    throw new Error('Category not found')
  }

  // Check if it's a personal category owned by the user
  if (!category.is_shared && category.user_id === userId) {
    return
  }

  // Check if it's a shared category and user is a family member
  if (category.is_shared && category.family_id) {
    const { isMember } = await verifyFamilyAccess(userId, category.family_id)
    if (isMember) {
      return
    }
  }

  throw new Error('Access denied to this category')
}