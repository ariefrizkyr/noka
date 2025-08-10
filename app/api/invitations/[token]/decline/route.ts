import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '../../../utils/auth'
import { handleApiError } from '../../../utils/error-handler'
import { createSuccessResponse } from '../../../utils/response'

/**
 * PUT /api/invitations/[token]/decline
 * Decline family invitation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const user = await requireAuth()
    const resolvedParams = await params
    const token = resolvedParams.token
    const supabase = await createClient()

    // Find and validate the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('family_invitations')
      .select(`
        id,
        family_id,
        email,
        status,
        expires_at
      `)
      .eq('token', token)
      .eq('email', user.email)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (invitationError || !invitation) {
      throw new Error('Invalid or expired invitation')
    }

    // Get family name separately
    const { data: family } = await supabase
      .from('families')
      .select('name')
      .eq('id', invitation.family_id)
      .single()

    // Update invitation status to declined
    const { error: updateError } = await supabase
      .from('family_invitations')
      .update({
        status: 'declined',
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitation.id)

    if (updateError) throw updateError

    return createSuccessResponse(
      { 
        family_id: invitation.family_id,
        family_name: family?.name || null
      },
      'Family invitation declined successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}