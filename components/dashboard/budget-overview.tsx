"use client"

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ProgressCard } from './progress-card';
import { useBudgetOverview, useDashboard } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface BudgetOverviewProps {
  currency?: string;
  className?: string;
  showAllCategories?: boolean;
}

export function BudgetOverview({ 
  currency = 'IDR', 
  className,
  showAllCategories = false 
}: BudgetOverviewProps) {
  const { budgetOverview, budgetProgress, loading, error } = useBudgetOverview();

  if (loading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!budgetOverview || budgetProgress.length === 0) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Budget Categories
              </h3>
              <p className="text-gray-600 mb-4">
                Set up budget categories to track your spending and stay on target.
              </p>
              <Link href="/settings">
                <Button>Set Up Budgets</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group categories by frequency
  const weeklyBudgets = budgetProgress.filter(b => b.budget_frequency === 'weekly');
  const monthlyBudgets = budgetProgress.filter(b => b.budget_frequency === 'monthly');
  const oneTimeBudgets = budgetProgress.filter(b => b.budget_frequency === 'one_time');

  return (
    <div className={className}>
      {/* Weekly Budgets */}
      {weeklyBudgets.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Budgets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyBudgets
              .slice(0, showAllCategories ? undefined : 6)
              .map((budget) => (
              <ProgressCard
                key={budget.category_id}
                title={budget.category_name}
                icon={budget.category_icon}
                currentAmount={budget.spent_amount}
                targetAmount={budget.budget_amount}
                percentage={budget.progress_percentage}
                frequency="weekly"
                currency={currency}
                type="budget"
                period={{
                  start: budget.period_start,
                  end: budget.period_end,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Monthly Budgets */}
      {monthlyBudgets.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Budgets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlyBudgets
              .slice(0, showAllCategories ? undefined : 6)
              .map((budget) => (
              <ProgressCard
                key={budget.category_id}
                title={budget.category_name}
                icon={budget.category_icon}
                currentAmount={budget.spent_amount}
                targetAmount={budget.budget_amount}
                percentage={budget.progress_percentage}
                frequency="monthly"
                currency={currency}
                type="budget"
                period={{
                  start: budget.period_start,
                  end: budget.period_end,
                }}
              />
            ))}
          </div>
          {!showAllCategories && monthlyBudgets.length > 6 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                View All {monthlyBudgets.length} Monthly Budgets
              </Button>
            </div>
          )}
        </div>
      )}

      {/* One-time Budgets */}
      {oneTimeBudgets.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">One-time Budgets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {oneTimeBudgets.map((budget) => (
              <ProgressCard
                key={budget.category_id}
                title={budget.category_name}
                icon={budget.category_icon}
                currentAmount={budget.spent_amount}
                targetAmount={budget.budget_amount}
                percentage={budget.progress_percentage}
                frequency="one_time"
                currency={currency}
                type="budget"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}