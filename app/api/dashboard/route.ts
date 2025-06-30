import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '../utils/auth'
import { handleApiError } from '../utils/error-handler'
import { createSuccessResponse } from '../utils/response'
import { Database } from '@/types/database'

type FinancialSummary = Database['public']['Functions']['get_financial_summary']['Returns'][0]
type BudgetProgress = Database['public']['Functions']['get_budget_progress']['Returns'][0]
type InvestmentProgress = Database['public']['Functions']['get_investment_progress']['Returns'][0]

/**
 * GET /api/dashboard
 * Fetch aggregated dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Execute all dashboard queries in parallel
    const [
      { data: financialSummary, error: financialError },
      { data: budgetProgress, error: budgetError },
      { data: investmentProgress, error: investmentError },
      { data: accounts, error: accountsError },
      { data: recentTransactions, error: transactionsError }
    ] = await Promise.all([
      // Get financial summary
      supabase.rpc('get_financial_summary', { p_user_id: user.id }),
      
      // Get budget progress
      supabase.rpc('get_budget_progress', { p_user_id: user.id }),
      
      // Get investment progress
      supabase.rpc('get_investment_progress', { p_user_id: user.id }),
      
      // Get accounts with balances
      supabase
        .from('accounts')
        .select('id, name, type, current_balance, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('current_balance', { ascending: false }),
      
      // Get recent transactions
      supabase
        .from('transactions')
        .select(`
          id,
          amount,
          type,
          transaction_date,
          description,
          accounts!transactions_account_id_fkey(name, type),
          categories!transactions_category_id_fkey(name, type, icon),
          from_accounts:accounts!transactions_from_account_id_fkey(name, type),
          to_accounts:accounts!transactions_to_account_id_fkey(name, type)
        `)
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10)
    ])

    // Check for errors
    if (financialError) throw financialError
    if (budgetError) throw budgetError
    if (investmentError) throw investmentError
    if (accountsError) throw accountsError
    if (transactionsError) throw transactionsError

    // Calculate additional metrics
    const totalBalance = accounts?.reduce((sum, account) => sum + account.current_balance, 0) || 0
    
    // Get current financial summary (most recent period)
    const currentPeriodSummary = financialSummary?.[0] || {
      total_income: 0,
      total_expenses: 0,
      net_savings: 0,
      period_start: new Date().toISOString().split('T')[0],
      period_end: new Date().toISOString().split('T')[0],
    }

    // Calculate budget totals
    const budgetTotals = {
      total_budget: budgetProgress?.reduce((sum: number, budget: BudgetProgress) => sum + (budget.budget_amount || 0), 0) || 0,
      total_spent: budgetProgress?.reduce((sum: number, budget: BudgetProgress) => sum + (budget.spent_amount || 0), 0) || 0,
      categories_over_budget: budgetProgress?.filter((budget: BudgetProgress) => 
        budget.progress_percentage > 100
      ).length || 0,
    }

    // Calculate investment totals
    const investmentTotals = {
      total_target: investmentProgress?.reduce((sum: number, investment: InvestmentProgress) => sum + (investment.target_amount || 0), 0) || 0,
      total_invested: investmentProgress?.reduce((sum: number, investment: InvestmentProgress) => sum + (investment.invested_amount || 0), 0) || 0,
      average_progress: investmentProgress?.length > 0 
        ? investmentProgress.reduce((sum: number, investment: InvestmentProgress) => sum + (investment.progress_percentage || 0), 0) / investmentProgress.length
        : 0,
    }

    // Group accounts by type
    const accountsByType = accounts?.reduce((acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = []
      }
      acc[account.type].push(account)
      return acc
    }, {} as Record<string, typeof accounts>) || {}

    // Calculate account type totals
    const accountTypeTotals = Object.entries(accountsByType).map(([type, accountsOfType]) => ({
      type,
      count: accountsOfType.length,
      total_balance: accountsOfType.reduce((sum, account) => sum + account.current_balance, 0),
    }))

    const dashboardData = {
      // Financial Overview
      financial_summary: {
        current_period: currentPeriodSummary,
        total_balance: totalBalance,
        account_type_totals: accountTypeTotals,
      },
      
      // Budget Overview
      budget_overview: {
        ...budgetTotals,
        remaining_budget: budgetTotals.total_budget - budgetTotals.total_spent,
        budget_utilization: budgetTotals.total_budget > 0 
          ? (budgetTotals.total_spent / budgetTotals.total_budget) * 100 
          : 0,
        categories: budgetProgress || [],
      },
      
      // Investment Overview
      investment_overview: {
        ...investmentTotals,
        remaining_to_invest: investmentTotals.total_target - investmentTotals.total_invested,
        categories: investmentProgress || [],
      },
      
      // Accounts Summary
      accounts_summary: {
        total_accounts: accounts?.length || 0,
        total_balance: totalBalance,
        by_type: accountsByType,
        accounts: accounts || [],
      },
      
      // Recent Activity
      recent_activity: {
        transactions: recentTransactions || [],
        transaction_count: recentTransactions?.length || 0,
      },
      
      // Quick Stats
      quick_stats: {
        net_worth: totalBalance,
        monthly_income: currentPeriodSummary.total_income,
        monthly_expenses: currentPeriodSummary.total_expenses,
        monthly_savings: currentPeriodSummary.net_savings,
        savings_rate: currentPeriodSummary.total_income > 0 
          ? (currentPeriodSummary.net_savings / currentPeriodSummary.total_income) * 100 
          : 0,
        budget_health: budgetTotals.total_budget > 0 
          ? Math.max(0, 100 - (budgetTotals.total_spent / budgetTotals.total_budget) * 100)
          : 100,
      },
    }

    return createSuccessResponse(
      dashboardData,
      'Dashboard data retrieved successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
} 