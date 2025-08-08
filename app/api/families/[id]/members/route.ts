import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '../../../utils/auth'
import { handleApiError } from '../../../utils/error-handler'
import { 
  createSuccessResponse 
} from '../../../utils/response'
import { verifyFamilyAccess } from '../../../utils/family-auth'

/**
 * GET /api/families/[id]/members
 * Get family members (requires family membership)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const resolvedParams = await params
    const familyId = resolvedParams.id
    
    // Verify user is a family member
    const { isMember } = await verifyFamilyAccess(user.id, familyId)
    if (!isMember) {
      throw new Error('Access denied. You must be a family member to view this information.')
    }
    
    const supabase = await createClient()

    // Get family members with emails using SECURITY DEFINER function
    const { data: members, error } = await supabase
      .rpc('get_family_members_with_emails', {
        p_family_id: familyId
      })

    if (error) throw error

    // Format members data (the function already returns the correct structure)
    const formattedMembers = members.map(member => ({
      id: member.id,
      user_id: member.user_id,
      email: member.email,
      role: member.role,
      joined_at: member.joined_at
    }))

    return createSuccessResponse(
      formattedMembers,
      `Retrieved ${formattedMembers.length} family members successfully`
    )
  } catch (error) {
    return handleApiError(error)
  }
}