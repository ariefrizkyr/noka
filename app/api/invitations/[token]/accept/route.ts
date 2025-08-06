import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '../../../utils/auth'
import { handleApiError } from '../../../utils/error-handler'
import { 
  createSuccessResponse 
} from '../../../utils/response'
import { TablesInsert } from '@/types/database'

type FamilyMemberInsert = TablesInsert<'family_members'>

/**
 * PUT /api/invitations/[token]/accept
 * Accept family invitation
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

    // Find and validate the invitation (include email check in query for security)
    const { data: invitation, error: invitationError } = await supabase
      .from('family_invitations')
      .select(`
        id,
        family_id,
        email,
        role,
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

    // Get family name
    const { data: family } = await supabase
      .from('families')
      .select('name')
      .eq('id', invitation.family_id)
      .single()

    // Check if user is already a family member
    const { data: existingMember } = await supabase
      .from('family_members')
      .select('id')
      .eq('family_id', invitation.family_id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      throw new Error('You are already a member of this family')
    }

    // Add user as family member
    const newMember: FamilyMemberInsert = {
      family_id: invitation.family_id,
      user_id: user.id,
      role: invitation.role,
    }

    const { error: memberError } = await supabase
      .from('family_members')
      .insert(newMember)

    if (memberError) throw memberError

    // Update invitation status to accepted
    const { error: updateError } = await supabase
      .from('family_invitations')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitation.id)

    if (updateError) throw updateError

    return createSuccessResponse(
      { 
        family_id: invitation.family_id,
        family_name: family?.name || null,
        role: invitation.role
      },
      'Family invitation accepted successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}