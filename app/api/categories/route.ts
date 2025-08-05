import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '../utils/auth'
import { handleApiError } from '../utils/error-handler'
import { 
  createSuccessResponse, 
  createCreatedResponse, 
  createUpdatedResponse, 
  createDeletedResponse 
} from '../utils/response'
import { 
  validateRequestBody, 
  createCategorySchemaEnhanced, 
  updateCategorySchema,
  deleteCategorySchema 
} from '../utils/validation'
import { 
  verifyCategoryAccess, 
  verifyFamilyAccess, 
  getUserFamilyIds 
} from '../utils/family-auth'
import { TablesInsert } from '@/types/database'

// type Category = Tables<'categories'>
type CategoryInsert = TablesInsert<'categories'>
// type CategoryUpdate = TablesUpdate<'categories'>

/**
 * GET /api/categories
 * Fetch user categories (both personal and shared)
 */
export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get user's family IDs
    const familyIds = await getUserFamilyIds(user.id)

    // Build query to get both personal and shared categories
    let query = supabase
      .from('categories')
      .select(`
        *,
        families!categories_family_id_fkey(id, name)
      `)
      .eq('is_active', true)

    // Add conditions for personal OR shared categories
    if (familyIds.length > 0) {
      query = query.or(`user_id.eq.${user.id},family_id.in.(${familyIds.join(',')})`)
    } else {
      query = query.eq('user_id', user.id)
    }

    const { data: categories, error } = await query
      .order('type', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error

    // Transform the response to include family information
    const enhancedCategories = categories.map(category => ({
      ...category,
      family_name: category.families?.name || null,
    }))

    // Group categories by type for easier frontend consumption
    const groupedCategories = {
      expense: enhancedCategories.filter(cat => cat.type === 'expense'),
      income: enhancedCategories.filter(cat => cat.type === 'income'),
      investment: enhancedCategories.filter(cat => cat.type === 'investment'),
    }

    return createSuccessResponse(
      {
        categories: enhancedCategories,
        grouped: groupedCategories,
        total: enhancedCategories.length,
      },
      `Retrieved ${enhancedCategories.length} categories successfully`
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/categories
 * Create new category (personal or shared)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const categoryData = await validateRequestBody(request, createCategorySchemaEnhanced)
    const supabase = await createClient()

    // For shared categories, verify user has admin access to the family
    if (categoryData.is_shared && categoryData.family_id) {
      const { isAdmin } = await verifyFamilyAccess(user.id, categoryData.family_id)
      if (!isAdmin) {
        throw new Error('Only family admins can create shared categories')
      }
    }

    const newCategory: CategoryInsert = {
      ...categoryData,
      user_id: !categoryData.is_shared ? user.id : null,
      family_id: categoryData.is_shared ? categoryData.family_id : null,
    }

    const { data: category, error } = await supabase
      .from('categories')
      .insert(newCategory)
      .select(`
        *,
        families!categories_family_id_fkey(id, name)
      `)
      .single()

    if (error) throw error

    // Add family information to response
    const enhancedCategory = {
      ...category,
      family_name: category.families?.name || null,
    }

    return createCreatedResponse(
      enhancedCategory,
      'Category created successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/categories
 * Update category (requires category_id in request body)
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    
    // Extract category_id from body
    const { category_id, ...updateData } = body
    
    if (!category_id) {
      throw new Error('category_id is required')
    }

    // Validate the update data
    const validatedData = updateCategorySchema.parse(updateData)
    const supabase = await createClient()

    // Verify user has access to this category (personal or shared)
    await verifyCategoryAccess(user.id, category_id)

    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', category_id)
      .select(`
        *,
        families!categories_family_id_fkey(id, name)
      `)
      .single()

    if (error) throw error

    // Add family information to response
    const enhancedCategory = {
      ...updatedCategory,
      family_name: updatedCategory.families?.name || null,
    }

    return createUpdatedResponse(
      enhancedCategory,
      'Category updated successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/categories
 * Deactivate category and optionally reassign transactions to new category
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    const deleteData = await validateRequestBody(request, deleteCategorySchema)
    const { category_id, new_category_id } = deleteData
    
    const supabase = await createClient()

    // Verify user has access to this category (personal or shared)
    await verifyCategoryAccess(user.id, category_id)

    // Get category details for response message and permissions check
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('id, name, is_shared, family_id')
      .eq('id', category_id)
      .single()

    if (fetchError || !existingCategory) {
      throw new Error('Category not found or access denied')
    }

    // For shared categories, verify user has admin access to modify
    if (existingCategory.is_shared && existingCategory.family_id) {
      const { isAdmin } = await verifyFamilyAccess(user.id, existingCategory.family_id)
      if (!isAdmin) {
        throw new Error('Only family admins can delete shared categories')
      }
    }

    // Get user's family IDs for transaction queries
    const familyIds = await getUserFamilyIds(user.id)

    // Check if category is being used in transactions (considering both personal and family transactions)
    let transactionQuery = supabase
      .from('transactions')
      .select('id, type')
      .or(`category_id.eq.${category_id},investment_category_id.eq.${category_id}`)

    // Filter transactions by user access (personal or family)
    if (familyIds.length > 0) {
      transactionQuery = transactionQuery.or(`user_id.eq.${user.id},account_id.in.(select id from accounts where family_id in (${familyIds.join(',')}))`)
    } else {
      transactionQuery = transactionQuery.eq('user_id', user.id)
    }

    const { data: transactionsUsingCategory, error: transactionError } = await transactionQuery

    if (transactionError) throw transactionError

    const hasTransactions = transactionsUsingCategory && transactionsUsingCategory.length > 0

    // If category has transactions, new_category_id is required
    if (hasTransactions && !new_category_id) {
      throw new Error(`Cannot delete category "${existingCategory.name}" because it has ${transactionsUsingCategory.length} associated transactions. Please provide new_category_id to reassign transactions.`)
    }

    // If new_category_id is provided, verify user has access and it's active
    if (new_category_id) {
      await verifyCategoryAccess(user.id, new_category_id)

      const { data: newCategory, error: newCategoryError } = await supabase
        .from('categories')
        .select('id, name, type, is_active')
        .eq('id', new_category_id)
        .single()

      if (newCategoryError || !newCategory) {
        throw new Error('New category not found or access denied')
      }

      if (!newCategory.is_active) {
        throw new Error('Cannot reassign transactions to an inactive category')
      }

      // Update transactions to use the new category
      if (hasTransactions) {
        // Update transactions where this category is the main category
        const { error: updateCategoryError } = await supabase
          .from('transactions')
          .update({
            category_id: new_category_id,
            updated_at: new Date().toISOString(),
          })
          .eq('category_id', category_id)

        if (updateCategoryError) throw updateCategoryError

        // Update transactions where this category is the investment category
        const { error: updateInvestmentCategoryError } = await supabase
          .from('transactions')
          .update({
            investment_category_id: new_category_id,
            updated_at: new Date().toISOString(),
          })
          .eq('investment_category_id', category_id)

        if (updateInvestmentCategoryError) throw updateInvestmentCategoryError
      }
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('categories')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', category_id)

    if (error) throw error

    const responseMessage = hasTransactions && new_category_id
      ? `Category "${existingCategory.name}" deactivated successfully. ${transactionsUsingCategory.length} transactions reassigned to new category.`
      : `Category "${existingCategory.name}" deactivated successfully.`

    return createDeletedResponse(responseMessage)
  } catch (error) {
    return handleApiError(error)
  }
} 