import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '../../utils/auth'
import { handleApiError } from '../../utils/error-handler'
import { 
  createUpdatedResponse, 
  createDeletedResponse 
} from '../../utils/response'
import { 
  validateRequestBody, 
  updateFamilySchema
} from '../../utils/validation'
import { requireFamilyAdmin } from '../../utils/family-auth'

/**
 * PUT /api/families/[id]
 * Update family (admins only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const resolvedParams = await params
    const familyId = resolvedParams.id
    
    // Verify user is a family admin
    await requireFamilyAdmin(user.id, familyId)
    
    const updateData = await validateRequestBody(request, updateFamilySchema)
    const supabase = await createClient()

    const { data: updatedFamily, error } = await supabase
      .from('families')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', familyId)
      .select()
      .single()

    if (error) throw error

    return createUpdatedResponse(
      updatedFamily,
      'Family updated successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/families/[id]
 * Delete family (creator only)
 * This will cascade delete all related family_members and family_invitations
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const resolvedParams = await params
    const familyId = resolvedParams.id
    const supabase = await createClient()

    // Verify user is the family creator
    const { data: family, error: fetchError } = await supabase
      .from('families')
      .select('name, created_by')
      .eq('id', familyId)
      .single()

    if (fetchError || !family || family.created_by !== user.id) {
      throw new Error('Family not found or access denied. Only the family creator can delete the family.')
    }

    // Delete the family (this will cascade to family_members and family_invitations)
    const { error } = await supabase
      .from('families')
      .delete()
      .eq('id', familyId)
      .eq('created_by', user.id)

    if (error) throw error

    return createDeletedResponse(
      `Family "${family.name}" deleted successfully`
    )
  } catch (error) {
    return handleApiError(error)
  }
}