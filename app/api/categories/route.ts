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
  createCategorySchema, 
  updateCategorySchema,
  deleteCategorySchema 
} from '../utils/validation'
import { Tables, TablesInsert, TablesUpdate } from '@/types/database'

type Category = Tables<'categories'>
type CategoryInsert = TablesInsert<'categories'>
type CategoryUpdate = TablesUpdate<'categories'>

/**
 * GET /api/categories
 * Fetch user categories
 */
export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('type', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error

    // Group categories by type for easier frontend consumption
    const groupedCategories = {
      expense: categories.filter(cat => cat.type === 'expense'),
      income: categories.filter(cat => cat.type === 'income'),
      investment: categories.filter(cat => cat.type === 'investment'),
    }

    return createSuccessResponse(
      {
        categories,
        grouped: groupedCategories,
        total: categories.length,
      },
      `Retrieved ${categories.length} categories successfully`
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/categories
 * Create new category
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const categoryData = await validateRequestBody(request, createCategorySchema)
    const supabase = await createClient()

    const newCategory: CategoryInsert = {
      ...categoryData,
      user_id: user.id,
    }

    const { data: category, error } = await supabase
      .from('categories')
      .insert(newCategory)
      .select()
      .single()

    if (error) throw error

    return createCreatedResponse(
      category,
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

    // Verify the category belongs to the user
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingCategory) {
      throw new Error('Category not found or access denied')
    }

    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', category_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return createUpdatedResponse(
      updatedCategory,
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

    // Verify the category belongs to the user
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', category_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingCategory) {
      throw new Error('Category not found or access denied')
    }

    // Check if category is being used in transactions
    const { data: transactionsUsingCategory, error: transactionError } = await supabase
      .from('transactions')
      .select('id, type')
      .or(`category_id.eq.${category_id},investment_category_id.eq.${category_id}`)
      .eq('user_id', user.id)

    if (transactionError) throw transactionError

    const hasTransactions = transactionsUsingCategory && transactionsUsingCategory.length > 0

    // If category has transactions, new_category_id is required
    if (hasTransactions && !new_category_id) {
      throw new Error(`Cannot delete category "${existingCategory.name}" because it has ${transactionsUsingCategory.length} associated transactions. Please provide new_category_id to reassign transactions.`)
    }

    // If new_category_id is provided, verify it belongs to the user and is active
    if (new_category_id) {
      const { data: newCategory, error: newCategoryError } = await supabase
        .from('categories')
        .select('id, name, type, is_active')
        .eq('id', new_category_id)
        .eq('user_id', user.id)
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
          .eq('user_id', user.id)

        if (updateCategoryError) throw updateCategoryError

        // Update transactions where this category is the investment category
        const { error: updateInvestmentCategoryError } = await supabase
          .from('transactions')
          .update({
            investment_category_id: new_category_id,
            updated_at: new Date().toISOString(),
          })
          .eq('investment_category_id', category_id)
          .eq('user_id', user.id)

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
      .eq('user_id', user.id)

    if (error) throw error

    const responseMessage = hasTransactions && new_category_id
      ? `Category "${existingCategory.name}" deactivated successfully. ${transactionsUsingCategory.length} transactions reassigned to new category.`
      : `Category "${existingCategory.name}" deactivated successfully.`

    return createDeletedResponse(responseMessage)
  } catch (error) {
    return handleApiError(error)
  }
} 