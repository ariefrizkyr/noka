import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '../../utils/auth'
import { handleApiError } from '../../utils/error-handler'
import { createSuccessResponse } from '../../utils/response'
import { Database } from '@/types/database'

type BudgetProgress = Database['public']['Functions']['get_budget_progress']['Returns'][0]

/**
 * GET /api/dashboard/budget-progress
 * Fetch budget progress for all expense categories
 */
export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get budget progress using database function
    const { data: budgetProgress, error: budgetError } = await supabase
      .rpc('get_budget_progress', { p_user_id: user.id })

    if (budgetError) throw budgetError

    // Calculate budget totals and metrics
    const budgetTotals = {
      total_budget: budgetProgress?.reduce((sum: number, budget: BudgetProgress) => 
        sum + (budget.budget_amount || 0), 0) || 0,
      total_spent: budgetProgress?.reduce((sum: number, budget: BudgetProgress) => 
        sum + (budget.spent_amount || 0), 0) || 0,
      categories_over_budget: budgetProgress?.filter((budget: BudgetProgress) => 
        budget.progress_percentage > 100).length || 0,
      categories_on_track: budgetProgress?.filter((budget: BudgetProgress) => 
        budget.progress_percentage <= 80).length || 0,
      categories_warning: budgetProgress?.filter((budget: BudgetProgress) => 
        budget.progress_percentage > 80 && budget.progress_percentage <= 100).length || 0,
    }

    const budgetOverview = {
      ...budgetTotals,
      remaining_budget: budgetTotals.total_budget - budgetTotals.total_spent,
      budget_utilization: budgetTotals.total_budget > 0 
        ? (budgetTotals.total_spent / budgetTotals.total_budget) * 100 
        : 0,
      budget_health: budgetTotals.total_budget > 0 
        ? Math.max(0, 100 - (budgetTotals.total_spent / budgetTotals.total_budget) * 100)
        : 100,
      categories: budgetProgress || [],
      total_categories: budgetProgress?.length || 0,
    }

    return createSuccessResponse(
      budgetOverview,
      'Budget progress retrieved successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}