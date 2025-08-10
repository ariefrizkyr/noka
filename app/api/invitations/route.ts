import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '../utils/auth'
import { handleApiError } from '../utils/error-handler'
import { 
  createSuccessResponse 
} from '../utils/response'

/**
 * GET /api/invitations
 * Get user's pending family invitations
 */
export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: invitations, error } = await supabase
      .from('family_invitations')
      .select(`
        id,
        token,
        role,
        status,
        expires_at,
        created_at,
        family_id,
        invited_by
      `)
      .eq('email', user.email)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get family names for each invitation
    const familyIds = [...new Set(invitations.map(inv => inv.family_id))]
    const { data: families } = await supabase
      .from('families')
      .select('id, name')
      .in('id', familyIds)

    const familyMap = new Map(families?.map(f => [f.id, f.name]) || [])

    const formattedInvitations = invitations.map(invitation => ({
      id: invitation.id,
      token: invitation.token,
      role: invitation.role,
      status: invitation.status,
      expires_at: invitation.expires_at,
      created_at: invitation.created_at,
      family_id: invitation.family_id,
      family_name: familyMap.get(invitation.family_id) || null,
      invited_by_id: invitation.invited_by
    }))

    return createSuccessResponse(
      formattedInvitations,
      `Retrieved ${formattedInvitations.length} pending invitations successfully`
    )
  } catch (error) {
    return handleApiError(error)
  }
}