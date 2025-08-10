import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '../../../utils/auth'
import { handleApiError } from '../../../utils/error-handler'
import { createSuccessResponse } from '../../../utils/response'
import { requireFamilyAdmin } from '../../../utils/family-auth'

/**
 * GET /api/families/[id]/invitations
 * Get all pending invitations for a family (admins only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const resolvedParams = await params
    const familyId = resolvedParams.id
    
    // Verify user is a family admin
    await requireFamilyAdmin(user.id, familyId)
    
    const supabase = await createClient()

    // Fetch all pending invitations for the family that haven't expired
    const { data: invitations, error } = await supabase
      .from('family_invitations')
      .select(`
        id,
        email,
        role,
        token,
        expires_at,
        status,
        created_at,
        invited_by
      `)
      .eq('family_id', familyId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    return createSuccessResponse(
      invitations || [],
      'Family invitations retrieved successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}