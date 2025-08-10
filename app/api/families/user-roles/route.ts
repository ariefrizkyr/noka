import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '../../utils/auth'
import { handleApiError } from '../../utils/error-handler'
import { createSuccessResponse } from '../../utils/response'

/**
 * GET /api/families/user-roles
 * Get user's roles across all families they belong to
 */
export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get user's family memberships with roles
    const { data: memberships, error } = await supabase
      .from('family_members')
      .select(`
        family_id,
        role,
        families!inner(
          id,
          name
        )
      `)
      .eq('user_id', user.id)

    if (error) throw error

    // Transform to { familyId: role } format for easy lookup
    const familyRoles: Record<string, 'admin' | 'member'> = {}
    const familyDetails: Record<string, { name: string }> = {}

    if (memberships) {
      memberships.forEach(membership => {
        familyRoles[membership.family_id] = membership.role as 'admin' | 'member'
        familyDetails[membership.family_id] = {
          name: (membership.families as { name?: string })?.name || 'Unknown Family'
        }
      })
    }

    return createSuccessResponse(
      {
        roles: familyRoles,
        families: familyDetails,
        count: Object.keys(familyRoles).length
      },
      `Retrieved roles for ${Object.keys(familyRoles).length} families`
    )
  } catch (error) {
    return handleApiError(error)
  }
}