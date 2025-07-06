/**
 * Main dashboard hook that orchestrates all dashboard data
 * Provides comprehensive dashboard data with proper caching and error handling
 */

import { useMemo } from 'react';
import { useApiData } from './use-api-data';
import type { 
  Account,
  TransactionWithRelations 
} from '@/types/common';
import type { Database } from '@/types/database';

type BudgetProgress = Database['public']['Functions']['get_budget_progress']['Returns'][0];
type InvestmentProgress = Database['public']['Functions']['get_investment_progress']['Returns'][0];

// Dashboard data types based on the existing API structure
interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  net_savings: number;
  period_start: string;
  period_end: string;
}

interface AccountTypeTotals {
  type: string;
  count: number;
  total_balance: number;
}

interface DashboardData {
  financial_summary: {
    current_period: FinancialSummary;
    total_balance: number;
    account_type_totals: AccountTypeTotals[];
  };
  budget_overview: {
    total_budget: number;
    total_spent: number;
    remaining_budget: number;
    budget_utilization: number;
    categories_over_budget: number;
    categories: BudgetProgress[];
  };
  investment_overview: {
    total_target: number;
    total_invested: number;
    remaining_to_invest: number;
    average_progress: number;
    categories_completed: number;
    categories_on_track: number;
    categories_starting: number;
    total_categories: number;
    investment_completion_rate: number;
    categories: InvestmentProgress[];
  };
  accounts_summary: {
    total_accounts: number;
    total_balance: number;
    by_type: Record<string, Account[]>;
    accounts: Account[];
  };
  recent_activity: {
    transactions: TransactionWithRelations[];
    transaction_count: number;
  };
  quick_stats: {
    net_worth: number;
    monthly_income: number;
    monthly_expenses: number;
    monthly_savings: number;
    savings_rate: number;
    budget_health: number;
  };
}

interface UseDashboardOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  
  // Convenience accessors
  financialSummary: FinancialSummary | null;
  budgetProgress: BudgetProgress[];
  investmentProgress: InvestmentProgress[];
  recentTransactions: TransactionWithRelations[];
  quickStats: DashboardData['quick_stats'] | null;
  accounts: Account[];
  
  // Helper functions
  getBudgetByCategory: (categoryId: string) => BudgetProgress | undefined;
  getInvestmentByCategory: (categoryId: string) => InvestmentProgress | undefined;
  getAccountsByType: (type: string) => Account[];
}

export function useDashboard(options: UseDashboardOptions = {}): UseDashboardReturn {
  const { autoRefresh = true } = options;

  // Fetch comprehensive dashboard data
  const { 
    data: dashboardData, 
    loading, 
    error, 
    refetch 
  } = useApiData<DashboardData>('/api/dashboard', {
    showErrorToast: true,
    showSuccessToast: false,
  });

  // Memoized convenience accessors
  const financialSummary = useMemo(() => {
    return dashboardData?.financial_summary?.current_period || null;
  }, [dashboardData]);

  const budgetProgress = useMemo(() => {
    return dashboardData?.budget_overview?.categories || [];
  }, [dashboardData]);

  const investmentProgress = useMemo(() => {
    return dashboardData?.investment_overview?.categories || [];
  }, [dashboardData]);

  const recentTransactions = useMemo(() => {
    return dashboardData?.recent_activity?.transactions || [];
  }, [dashboardData]);

  const quickStats = useMemo(() => {
    return dashboardData?.quick_stats || null;
  }, [dashboardData]);

  const accounts = useMemo(() => {
    return dashboardData?.accounts_summary?.accounts || [];
  }, [dashboardData]);

  // Helper functions
  const getBudgetByCategory = useMemo(() => {
    return (categoryId: string) => {
      return budgetProgress.find(budget => budget.category_id === categoryId);
    };
  }, [budgetProgress]);

  const getInvestmentByCategory = useMemo(() => {
    return (categoryId: string) => {
      return investmentProgress.find(investment => investment.category_id === categoryId);
    };
  }, [investmentProgress]);

  const getAccountsByType = useMemo(() => {
    return (type: string) => {
      return dashboardData?.accounts_summary?.by_type?.[type] || [];
    };
  }, [dashboardData]);

  return {
    data: dashboardData,
    loading,
    error: error ? 'Failed to load dashboard data' : null,
    refetch,
    
    // Convenience accessors
    financialSummary,
    budgetProgress,
    investmentProgress,
    recentTransactions,
    quickStats,
    accounts,
    
    // Helper functions
    getBudgetByCategory,
    getInvestmentByCategory,
    getAccountsByType,
  };
}

// Specialized hooks for specific dashboard sections
export function useDashboardSummary() {
  const { financialSummary, quickStats, loading, error, refetch } = useDashboard();
  
  return {
    financialSummary,
    quickStats,
    loading,
    error,
    refetch,
  };
}

export function useBudgetOverview() {
  const { data, budgetProgress, getBudgetByCategory, loading, error, refetch } = useDashboard();
  
  const budgetOverview = useMemo(() => {
    return data?.budget_overview || null;
  }, [data]);

  return {
    budgetOverview,
    budgetProgress,
    getBudgetByCategory,
    loading,
    error,
    refetch,
  };
}

export function useInvestmentOverview() {
  const { data, investmentProgress, getInvestmentByCategory, loading, error, refetch } = useDashboard();
  
  const investmentOverview = useMemo(() => {
    return data?.investment_overview || null;
  }, [data]);

  return {
    investmentOverview,
    investmentProgress,
    getInvestmentByCategory,
    loading,
    error,
    refetch,
  };
}

export function useAccountsOverview() {
  const { data, accounts, getAccountsByType, loading, error, refetch } = useDashboard();
  
  const accountsOverview = useMemo(() => {
    return data?.accounts_summary || null;
  }, [data]);

  return {
    accountsOverview,
    accounts,
    getAccountsByType,
    loading,
    error,
    refetch,
  };
}