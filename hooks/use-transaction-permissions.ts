import { useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useUserFamilyRoles } from './use-user-family-roles'
import type { TransactionWithRelations } from '@/types/common'

export interface UseTransactionPermissionsReturn {
  canEditTransaction: (transaction: TransactionWithRelations) => boolean
  canDeleteTransaction: (transaction: TransactionWithRelations) => boolean
  getTransactionFamilyId: (transaction: TransactionWithRelations) => string | null
  loading: boolean
}

/**
 * Hook to determine user permissions for transaction operations
 * 
 * Users can edit/delete transactions if:
 * 1. They logged the transaction themselves, OR
 * 2. They are an admin in the family context of the transaction
 */
export function useTransactionPermissions(): UseTransactionPermissionsReturn {
  const { user } = useAuth()
  const { isAdminInFamily, loading: familyRolesLoading } = useUserFamilyRoles()

  /**
   * Extract family ID from transaction context
   * Checks accounts, categories, and investment categories for family associations
   */
  const getTransactionFamilyId = useMemo(() => {
    return (transaction: TransactionWithRelations): string | null => {
      // Check account family context for income/expense transactions
      if (transaction.accounts?.family?.id) {
        return transaction.accounts.family.id
      }

      // Note: from_accounts and to_accounts don't include family info in current interface
      // We'll check if accounts involved in transfers are joint accounts via account_scope
      // If they're joint accounts, we need to determine family context differently

      // Check category family context
      if (transaction.categories?.family?.id) {
        return transaction.categories.family.id
      }

      // Check investment category family context
      if (transaction.investment_categories?.family?.id) {
        return transaction.investment_categories.family.id
      }

      // No family context found - this is a personal transaction
      return null
    }
  }, [])

  /**
   * Check if user can edit a specific transaction
   */
  const canEditTransaction = useMemo(() => {
    return (transaction: TransactionWithRelations): boolean => {
      if (!user) return false

      // If no logged_by_user_id, nobody can edit (legacy data protection)
      if (!transaction.logged_by_user_id) return false

      // User logged the transaction themselves
      if (transaction.logged_by_user_id === user.id) return true

      // Check if user is admin in the family context of this transaction
      const familyId = getTransactionFamilyId(transaction)
      if (familyId && isAdminInFamily(familyId)) return true

      // For transactions involving joint accounts (transfers), check if any involved account is joint
      // This is a simplified check - in a full implementation, we'd need to fetch family info for these accounts
      const isJointAccountTransaction = 
        transaction.accounts?.account_scope === 'joint' ||
        transaction.from_accounts?.account_scope === 'joint' ||
        transaction.to_accounts?.account_scope === 'joint'
      
      // If it involves joint accounts but we can't determine family context from categories/accounts,
      // we still require the user to be the one who logged it for security
      if (isJointAccountTransaction && !familyId) {
        return false // Only allow editing if user logged it (already checked above)
      }

      return false
    }
  }, [user, isAdminInFamily, getTransactionFamilyId])

  /**
   * Check if user can delete a specific transaction
   * Same logic as edit for now, but kept separate for future flexibility
   */
  const canDeleteTransaction = useMemo(() => {
    return (transaction: TransactionWithRelations): boolean => {
      // For now, delete permissions are the same as edit permissions
      return canEditTransaction(transaction)
    }
  }, [canEditTransaction])

  return {
    canEditTransaction,
    canDeleteTransaction,
    getTransactionFamilyId,
    loading: familyRolesLoading,
  }
}