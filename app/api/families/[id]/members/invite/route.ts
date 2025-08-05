import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '../../../../utils/auth'
import { handleApiError } from '../../../../utils/error-handler'
import { 
  createCreatedResponse 
} from '../../../../utils/response'
import { 
  validateRequestBody, 
  inviteMemberSchema
} from '../../../../utils/validation'
import { requireFamilyAdmin } from '../../../../utils/family-auth'
import { TablesInsert } from '@/types/database'

type FamilyInvitationInsert = TablesInsert<'family_invitations'>

/**
 * POST /api/families/[id]/members/invite
 * Invite new member (admins only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const resolvedParams = await params
    const familyId = resolvedParams.id
    
    // Verify user is a family admin
    await requireFamilyAdmin(user.id, familyId)
    
    const inviteData = await validateRequestBody(request, inviteMemberSchema)
    const supabase = await createClient()

    // Note: We'll check for existing membership when the invitation is accepted
    // For now, we allow duplicate invitations to the same email

    // Check if there's already a pending invitation for this email
    const { data: existingInvitation } = await supabase
      .from('family_invitations')
      .select('id')
      .eq('family_id', familyId)
      .eq('email', inviteData.email)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (existingInvitation) {
      throw new Error('There is already a pending invitation for this email address')
    }

    // Generate secure invitation token
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    const newInvitation: FamilyInvitationInsert = {
      family_id: familyId,
      email: inviteData.email,
      role: inviteData.role || 'member',
      token,
      invited_by: user.id,
      expires_at: expiresAt.toISOString(),
      status: 'pending'
    }

    const { data: invitation, error } = await supabase
      .from('family_invitations')
      .insert(newInvitation)
      .select(`
        id,
        email,
        role,
        token,
        expires_at,
        status,
        created_at
      `)
      .single()

    if (error) throw error

    // Get family name separately
    const { data: family } = await supabase
      .from('families')
      .select('name')
      .eq('id', familyId)
      .single()

    // TODO: Send invitation email
    // await sendInvitationEmail(invitation)

    return createCreatedResponse(
      {
        ...invitation,
        family_name: family?.name || null
      },
      'Family invitation sent successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}