import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '../utils/auth'
import { handleApiError } from '../utils/error-handler'
import { 
  createSuccessResponse, 
  createCreatedResponse 
} from '../utils/response'
import { 
  validateRequestBody, 
  createFamilySchema
} from '../utils/validation'
import { TablesInsert } from '@/types/database'

type FamilyInsert = TablesInsert<'families'>
type FamilyMemberInsert = TablesInsert<'family_members'>

/**
 * GET /api/families
 * Get user's families
 */
export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: familyMembers, error } = await supabase
      .from('family_members')
      .select(`
        role,
        joined_at,
        family_id
      `)
      .eq('user_id', user.id)
      .order('joined_at', { ascending: true })

    if (error) throw error

    // Get family details
    const familyIds = familyMembers.map(fm => fm.family_id)
    const { data: families } = await supabase
      .from('families')
      .select('id, name, created_by, created_at, updated_at')
      .in('id', familyIds)

    const familyMap = new Map(families?.map(f => [f.id, f]) || [])

    const formattedFamilies = familyMembers.map(fm => {
      const family = familyMap.get(fm.family_id)
      return {
        id: family?.id || fm.family_id,
        name: family?.name || 'Unknown Family',
        created_by: family?.created_by || null,
        created_at: family?.created_at || null,
        updated_at: family?.updated_at || null,
        user_role: fm.role,
        joined_at: fm.joined_at
      }
    })

    return createSuccessResponse(
      formattedFamilies,
      `Retrieved ${formattedFamilies.length} families successfully`
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/families
 * Create a new family and automatically add creator as admin
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const familyData = await validateRequestBody(request, createFamilySchema)
    const supabase = await createClient()

    // Create family record
    const newFamily: FamilyInsert = {
      name: familyData.name,
      created_by: user.id,
    }

    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert(newFamily)
      .select()
      .single()

    if (familyError) throw familyError

    // Add creator as admin member
    const newMember: FamilyMemberInsert = {
      family_id: family.id,
      user_id: user.id,
      role: 'admin',
    }

    const { error: memberError } = await supabase
      .from('family_members')
      .insert(newMember)

    if (memberError) {
      // If member creation fails, cleanup the family record
      await supabase
        .from('families')
        .delete()
        .eq('id', family.id)
      
      throw memberError
    }

    return createCreatedResponse(
      {
        ...family,
        user_role: 'admin',
        joined_at: new Date().toISOString(),
        member_count: 1
      },
      'Family created successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}