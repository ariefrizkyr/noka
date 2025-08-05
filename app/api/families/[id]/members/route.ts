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

    // Get family members with user information
    const { data: members, error } = await supabase
      .from('family_members')
      .select(`
        id,
        role,
        joined_at,
        user_id
      `)
      .eq('family_id', familyId)
      .order('joined_at', { ascending: true })

    if (error) throw error

    // Note: In production, you might want to store user emails in a user_profiles table
    // For now, we'll return without email and let the frontend handle it
    const formattedMembers = members.map(member => ({
      id: member.id,
      user_id: member.user_id,
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