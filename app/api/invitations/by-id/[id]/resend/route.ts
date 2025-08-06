import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '../../../../utils/auth'
import { handleApiError } from '../../../../utils/error-handler'
import { createSuccessResponse } from '../../../../utils/response'
import { requireFamilyAdmin } from '../../../../utils/family-auth'
import { sendInvitationEmail } from '@/lib/email/invitation-service'

/**
 * POST /api/invitations/[id]/resend
 * Resend a pending invitation email (admins only)
 */
export async function POST(
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
      .select(`
        id,
        family_id,
        email,
        role,
        token,
        expires_at,
        status
      `)
      .eq('id', invitationId)
      .single()

    if (fetchError) throw fetchError
    if (!invitation) {
      throw new Error('Invitation not found')
    }

    // Verify user is a family admin for this invitation's family
    await requireFamilyAdmin(user.id, invitation.family_id)

    // Check if invitation can be resent
    if (invitation.status !== 'pending') {
      throw new Error('Only pending invitations can be resent')
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) <= new Date()) {
      throw new Error('Cannot resend expired invitation. Please create a new one.')
    }

    // Get family name and inviter info
    const { data: family } = await supabase
      .from('families')
      .select('name')
      .eq('id', invitation.family_id)
      .single()

    // Get inviter information from current user session
    const inviterProfile = {
      email: user.email || 'unknown@example.com',
      full_name: user.user_metadata?.full_name || null
    }

    // Send invitation email
    try {
      await sendInvitationEmail(
        {
          ...invitation,
          families: { name: family?.name || 'Unknown Family' }
        },
        inviterProfile || undefined
      );
    } catch (emailError) {
      console.error('Failed to resend invitation email:', emailError);
      throw new Error('Failed to resend invitation email');
    }

    return createSuccessResponse(
      {
        id: invitationId,
        email: invitation.email,
        family_name: family?.name || null
      },
      'Invitation resent successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}