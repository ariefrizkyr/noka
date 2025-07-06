"use client"

import { formatCurrency } from '@/lib/currency-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressCard } from './progress-card';
import { useBudgetOverview, useDashboard } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';
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
  const { quickStats } = useDashboard();

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

  // Overview stats
  const overviewStats = [
    {
      title: "Total Budget",
      value: budgetOverview.total_budget,
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Spent",
      value: budgetOverview.total_spent,
      icon: (budgetOverview?.budget_utilization || 0) > 100 ? AlertTriangle : CheckCircle,
      color: (budgetOverview?.budget_utilization || 0) > 100 ? "text-red-600" : "text-green-600",
      bgColor: (budgetOverview?.budget_utilization || 0) > 100 ? "bg-red-50" : "bg-green-50",
      badge: `${(budgetOverview?.budget_utilization || 0).toFixed(1)}%`,
    },
    {
      title: "Remaining",
      value: budgetOverview.remaining_budget,
      icon: Clock,
      color: (budgetOverview?.remaining_budget || 0) > 0 ? "text-green-600" : "text-red-600",
      bgColor: (budgetOverview?.remaining_budget || 0) > 0 ? "bg-green-50" : "bg-red-50",
    },
  ];

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget Overview</h2>
          <p className="text-sm text-gray-600">
            Track your spending against your budget categories
          </p>
        </div>
        <div className="flex gap-2">
          {(budgetOverview?.categories_over_budget || 0) > 0 && (
            <Badge variant="destructive">
              {budgetOverview?.categories_over_budget || 0} over budget
            </Badge>
          )}
          <Badge variant="outline">
            {budgetProgress.length} categories
          </Badge>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stat.value, { currency })}
                </div>
                {stat.badge && (
                  <Badge variant="outline" className="mt-1">
                    {stat.badge}
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

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

      {/* Budget Health Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-blue-900">Budget Health Score</h4>
              <p className="text-sm text-blue-700">
                {(quickStats?.budget_health || 0) > 70 
                  ? "Excellent budget management! You're staying within your limits."
                  : (quickStats?.budget_health || 0) > 40
                  ? "Good progress, but watch your spending in some categories."
                  : "Several categories need attention. Consider adjusting your budgets or spending."
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-900">
                {(quickStats?.budget_health || 0).toFixed(0)}%
              </div>
              <div className="text-sm text-blue-700">Health Score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}