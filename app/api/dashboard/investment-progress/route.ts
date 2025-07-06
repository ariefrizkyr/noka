import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '../../utils/auth'
import { handleApiError } from '../../utils/error-handler'
import { createSuccessResponse } from '../../utils/response'
import { Database } from '@/types/database'

type InvestmentProgress = Database['public']['Functions']['get_investment_progress']['Returns'][0]

/**
 * GET /api/dashboard/investment-progress
 * Fetch investment progress for all investment categories
 */
export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get investment progress using database function
    const { data: investmentProgress, error: investmentError } = await supabase
      .rpc('get_investment_progress', { p_user_id: user.id })

    if (investmentError) throw investmentError

    // Calculate investment totals and metrics
    const investmentTotals = {
      total_target: investmentProgress?.reduce((sum: number, investment: InvestmentProgress) => 
        sum + (investment.target_amount || 0), 0) || 0,
      total_invested: investmentProgress?.reduce((sum: number, investment: InvestmentProgress) => 
        sum + (investment.invested_amount || 0), 0) || 0,
      average_progress: investmentProgress?.length > 0 
        ? investmentProgress.reduce((sum: number, investment: InvestmentProgress) => 
            sum + (investment.progress_percentage || 0), 0) / investmentProgress.length
        : 0,
      categories_completed: investmentProgress?.filter((investment: InvestmentProgress) => 
        investment.progress_percentage >= 100).length || 0,
      categories_on_track: investmentProgress?.filter((investment: InvestmentProgress) => 
        investment.progress_percentage >= 50 && investment.progress_percentage < 100).length || 0,
      categories_starting: investmentProgress?.filter((investment: InvestmentProgress) => 
        investment.progress_percentage < 50).length || 0,
    }

    // Separate monthly and one-time goals
    const monthlyGoals = investmentProgress?.filter((investment: InvestmentProgress) => 
      investment.target_frequency === 'monthly') || []
    const oneTimeGoals = investmentProgress?.filter((investment: InvestmentProgress) => 
      investment.target_frequency === 'one_time') || []

    const investmentOverview = {
      ...investmentTotals,
      remaining_to_invest: investmentTotals.total_target - investmentTotals.total_invested,
      investment_completion_rate: investmentTotals.total_target > 0 
        ? (investmentTotals.total_invested / investmentTotals.total_target) * 100 
        : 0,
      categories: investmentProgress || [],
      monthly_goals: monthlyGoals,
      one_time_goals: oneTimeGoals,
      total_categories: investmentProgress?.length || 0,
      monthly_goals_count: monthlyGoals.length,
      one_time_goals_count: oneTimeGoals.length,
    }

    return createSuccessResponse(
      investmentOverview,
      'Investment progress retrieved successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}