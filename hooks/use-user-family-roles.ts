import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'

export interface UserFamilyRoles {
  roles: Record<string, 'admin' | 'member'>
  families: Record<string, { name: string }>
  count: number
}

export interface UseUserFamilyRolesReturn {
  familyRoles: UserFamilyRoles | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  isAdminInFamily: (familyId: string | null | undefined) => boolean
  isMemberInFamily: (familyId: string | null | undefined) => boolean
  getUserRoleInFamily: (familyId: string | null | undefined) => 'admin' | 'member' | null
}

export function useUserFamilyRoles(): UseUserFamilyRolesReturn {
  const [familyRoles, setFamilyRoles] = useState<UserFamilyRoles | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchFamilyRoles = useCallback(async () => {
    if (!user) {
      setFamilyRoles(null)
      setLoading(false)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/families/user-roles')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch family roles')
      }

      setFamilyRoles(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch family roles')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchFamilyRoles()
  }, [fetchFamilyRoles])

  // Helper function to check if user is admin in a specific family
  const isAdminInFamily = useCallback((familyId: string | null | undefined): boolean => {
    if (!familyId || !familyRoles?.roles) return false
    return familyRoles.roles[familyId] === 'admin'
  }, [familyRoles])

  // Helper function to check if user is member (admin or regular member) in a family
  const isMemberInFamily = useCallback((familyId: string | null | undefined): boolean => {
    if (!familyId || !familyRoles?.roles) return false
    return familyId in familyRoles.roles
  }, [familyRoles])

  // Helper function to get user's specific role in a family
  const getUserRoleInFamily = useCallback((familyId: string | null | undefined): 'admin' | 'member' | null => {
    if (!familyId || !familyRoles?.roles) return null
    return familyRoles.roles[familyId] || null
  }, [familyRoles])

  return {
    familyRoles,
    loading,
    error,
    refetch: fetchFamilyRoles,
    isAdminInFamily,
    isMemberInFamily,
    getUserRoleInFamily,
  }
}