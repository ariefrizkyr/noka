"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProgressCard } from "./progress-card";
import { useBudgetOverview } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BudgetOverviewProps {
  currency?: string;
  className?: string;
  showAllCategories?: boolean;
}

export function BudgetOverview({
  currency = "IDR",
  className,
  showAllCategories = false,
}: BudgetOverviewProps) {
  const { budgetOverview, budgetProgress, loading, error } =
    useBudgetOverview();

  if (loading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="mb-2 h-8 w-24" />
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
              <DollarSign className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No Budget Categories
              </h3>
              <p className="mb-4 text-gray-600">
                Set up budget categories to track your spending and stay on
                target.
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
  const weeklyBudgets = budgetProgress.filter(
    (b) => b.budget_frequency === "weekly",
  );
  const monthlyBudgets = budgetProgress.filter(
    (b) => b.budget_frequency === "monthly",
  );
  const oneTimeBudgets = budgetProgress.filter(
    (b) => b.budget_frequency === "one_time",
  );

  const today = new Date();
  const weeklyPeriodEnd = new Date(weeklyBudgets[0].period_end);
  const monthlyPeriodEnd = new Date(monthlyBudgets[0].period_end);

  const differenceInWeeks = weeklyPeriodEnd.getTime() - today.getTime();
  const differenceInMonths = monthlyPeriodEnd.getTime() - today.getTime();

  const weeklyDaysLeft = Math.ceil(differenceInWeeks / (1000 * 60 * 60 * 24));
  const monthlyDaysLeft = Math.ceil(differenceInMonths / (1000 * 60 * 60 * 24));

  return (
    <div className={className}>
      {/* Weekly Budgets */}
      {weeklyBudgets.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-row rounded-lg border border-zinc-100 bg-white p-2">
            {/* Column 1: 33% width, content aligned left. */}
            <div className="flex w-2/6 items-start justify-start">
              <div className="text-left">
                <span className="text-xs text-gray-400">Weekly</span>
                <br />
                <span className="text-xs text-gray-800">
                  {weeklyDaysLeft} days left
                </span>
              </div>
            </div>

            {/* Column 2: 33% width, content aligned right. */}
            <div className="flex w-2/6 items-start justify-end">
              <div className="text-right">
                <span className="text-xs text-gray-400">Budgeted</span>
                <br />
                <span className="text-xs whitespace-nowrap text-gray-800">
                  {/* TODO: replace with dynamic sum of all weekly budgets */}
                  Rp 1.000.000
                </span>
              </div>
            </div>

            {/* Column 3: 33% width, content aligned right. */}
            <div className="flex w-2/6 items-start justify-end">
              <div className="text-right">
                <span className="text-xs text-gray-400">Remaining</span>
                <br />
                <span className="text-xs whitespace-nowrap text-gray-800">
                  {/* TODO: replace with dynamic sum of all weekly remaining budgets */}
                  Rp 2.500.000
                </span>
              </div>
            </div>
          </div>

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
      )}

      {/* Monthly Budgets */}
      {monthlyBudgets.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-row rounded-lg border border-zinc-100 bg-white p-2">
            {/* Column 1: 33% width, content aligned left. */}
            <div className="flex w-2/6 items-start justify-start">
              <div className="text-left">
                <span className="text-xs text-gray-400">Monthly</span>
                <br />
                <span className="text-xs text-gray-800">
                  {monthlyDaysLeft} days left
                </span>
              </div>
            </div>

            {/* Column 2: 33% width, content aligned right. */}
            <div className="flex w-2/6 items-start justify-end">
              <div className="text-right">
                <span className="text-xs text-gray-400">Budgeted</span>
                <br />
                <span className="text-xs whitespace-nowrap text-gray-800">
                  {/* TODO: replace with dynamic sum of all monthly budgets */}
                  Rp 1.000.000
                </span>
              </div>
            </div>

            {/* Column 3: 33% width, content aligned right. */}
            <div className="flex w-2/6 items-start justify-end">
              <div className="text-right">
                <span className="text-xs text-gray-400">Remaining</span>
                <br />
                <span className="text-xs whitespace-nowrap text-gray-800">
                  {/* TODO: replace with dynamic sum of all monthly remaining budgets */}
                  Rp 2.500.000
                </span>
              </div>
            </div>
          </div>
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
        <div className="mb-4">
          <div className="flex flex-row rounded-lg border border-zinc-100 bg-white p-2">
            {/* Column 1: 33% width, content aligned left. */}
            <div className="flex w-2/6 items-start justify-start">
              <div className="text-left">
                <span className="text-xs text-gray-400">One-time</span>
                <br />
                <span className="text-xs text-gray-800">All time</span>
              </div>
            </div>

            {/* Column 2: 33% width, content aligned right. */}
            <div className="flex w-2/6 items-start justify-end">
              <div className="text-right">
                <span className="text-xs text-gray-400">Budgeted</span>
                <br />
                <span className="text-xs whitespace-nowrap text-gray-800">
                  {/* TODO: replace with dynamic sum of all all-time budgets */}
                  Rp 1.000.000
                </span>
              </div>
            </div>

            {/* Column 3: 33% width, content aligned right. */}
            <div className="flex w-2/6 items-start justify-end">
              <div className="text-right">
                <span className="text-xs text-gray-400">Remaining</span>
                <br />
                <span className="text-xs whitespace-nowrap text-gray-800">
                  {/* TODO: replace with dynamic sum of all all-time remaining budgets */}
                  Rp 2.500.000
                </span>
              </div>
            </div>
          </div>
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
      )}
    </div>
  );
}
