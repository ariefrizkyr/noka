import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '../../../../utils/auth'
import { handleApiError } from '../../../../utils/error-handler'
import { 
  createDeletedResponse 
} from '../../../../utils/response'
import { requireFamilyAdmin } from '../../../../utils/family-auth'

/**
 * DELETE /api/families/[id]/members/[userId]
 * Remove member from family (admins only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const user = await requireAuth()
    const resolvedParams = await params
    const familyId = resolvedParams.id
    const userIdToRemove = resolvedParams.userId
    
    // Verify user is a family admin
    await requireFamilyAdmin(user.id, familyId)
    
    const supabase = await createClient()

    // Check if the user being removed exists and is a family member
    const { data: memberToRemove, error: fetchError } = await supabase
      .from('family_members')
      .select('id, role')
      .eq('family_id', familyId)
      .eq('user_id', userIdToRemove)
      .single()

    if (fetchError || !memberToRemove) {
      throw new Error('Family member not found')
    }

    // Prevent removing the family creator (if they are the last admin)
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('created_by')
      .eq('id', familyId)
      .single()

    if (familyError) throw familyError

    // Check if this is the family creator
    if (family.created_by === userIdToRemove) {
      throw new Error('Cannot remove the family creator. Transfer ownership first or delete the family.')
    }

    // Check if removing this admin would leave no admins
    if (memberToRemove.role === 'admin') {
      const { data: adminCount, error: countError } = await supabase
        .from('family_members')
        .select('id', { count: 'exact' })
        .eq('family_id', familyId)
        .eq('role', 'admin')

      if (countError) throw countError

      if ((adminCount || []).length <= 1) {
        throw new Error('Cannot remove the last admin. Promote another member to admin first.')
      }
    }

    // Prevent self-removal
    if (userIdToRemove === user.id) {
      throw new Error('You cannot remove yourself from the family. Use the leave family option instead.')
    }

    // Remove the family member
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('family_id', familyId)
      .eq('user_id', userIdToRemove)

    if (error) throw error

    return createDeletedResponse(
      'Family member removed successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}