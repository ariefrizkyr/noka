import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '../../../../utils/auth'
import { handleApiError } from '../../../../utils/error-handler'
import { createSuccessResponse } from '../../../../utils/response'
import { requireFamilyAdmin } from '../../../../utils/family-auth'

/**
 * PUT /api/invitations/[id]/cancel
 * Cancel a pending invitation (admins only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const resolvedParams = await params
    const invitationId = resolvedParams.id
    
    const supabase = await createClient()

    // First get the invitation to verify permissions
    const { data: invitation, error: fetchError } = await supabase
      .from('family_invitations')
      .select('id, family_id, status')
      .eq('id', invitationId)
      .single()

    if (fetchError) throw fetchError
    if (!invitation) {
      throw new Error('Invitation not found')
    }

    // Verify user is a family admin for this invitation's family
    await requireFamilyAdmin(user.id, invitation.family_id)

    // Check if invitation can be cancelled
    if (invitation.status !== 'pending') {
      throw new Error('Only pending invitations can be cancelled')
    }

    // Delete the invitation
    const { error: deleteError } = await supabase
      .from('family_invitations')
      .delete()
      .eq('id', invitationId)

    if (deleteError) throw deleteError

    return createSuccessResponse(
      { id: invitationId },
      'Invitation cancelled successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}