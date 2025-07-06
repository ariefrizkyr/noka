import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '../../utils/auth'
import { handleApiError } from '../../utils/error-handler'
import { createSuccessResponse } from '../../utils/response'

/**
 * GET /api/dashboard/summary
 * Fetch financial summary for current period
 */
export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get financial summary using database function
    const { data: financialSummary, error: financialError } = await supabase
      .rpc('get_financial_summary', { p_user_id: user.id })

    if (financialError) throw financialError

    // Get current period summary (most recent period)
    const currentPeriodSummary = financialSummary?.[0] || {
      total_income: 0,
      total_expenses: 0,
      net_savings: 0,
      period_start: new Date().toISOString().split('T')[0],
      period_end: new Date().toISOString().split('T')[0],
    }

    // Calculate additional summary metrics
    const summaryData = {
      current_period: currentPeriodSummary,
      savings_rate: currentPeriodSummary.total_income > 0 
        ? (currentPeriodSummary.net_savings / currentPeriodSummary.total_income) * 100 
        : 0,
      period_start: currentPeriodSummary.period_start,
      period_end: currentPeriodSummary.period_end,
    }

    return createSuccessResponse(
      summaryData,
      'Financial summary retrieved successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}