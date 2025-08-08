"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ProgressCard } from "./progress-card";
import { useInvestmentOverview } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { PiggyBank } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency-utils";

interface InvestmentOverviewProps {
  currency?: string;
  className?: string;
  showAllCategories?: boolean;
}

export function InvestmentOverview({
  currency = "IDR",
  className,
  showAllCategories = false,
}: InvestmentOverviewProps) {
  const { investmentOverview, investmentProgress, loading, error } =
    useInvestmentOverview();

  if (loading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={className}>
              <div className="flex flex-row rounded-lg border border-zinc-100 bg-white p-2">
                {/* Column 1: 33% width, content aligned left. */}
                <div className="flex w-2/6 items-start justify-start">
                  <div className="text-left">
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>

                {/* Column 2: 33% width, content aligned right. */}
                <div className="flex w-2/6 items-start justify-end">
                  <div className="text-right">
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>

                {/* Column 3: 33% width, content aligned right. */}
                <div className="flex w-2/6 items-start justify-end">
                  <div className="text-right">
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
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

  if (!investmentOverview || investmentProgress.length === 0) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <PiggyBank className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No Investment Goals
              </h3>
              <p className="mb-4 text-gray-600">
                Create investment categories and set targets to track your
                financial goals.
              </p>
              <Link href="/settings">
                <Button>Set Up Investment Goals</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const monthlyGoals = investmentProgress.filter(
    (investment) => investment.target_frequency === "monthly",
  );
  const oneTimeGoals = investmentProgress.filter(
    (investment) => investment.target_frequency === "one_time",
  );

  const today = new Date();

  // Calculate monthly days left only when monthly goals exist
  let monthlyDaysLeft = 0;
  if (monthlyGoals.length > 0) {
    const monthlyPeriodEnd = new Date(monthlyGoals[0].period_end);

    // Validate the date
    if (!isNaN(monthlyPeriodEnd.getTime())) {
      const differenceInMs = monthlyPeriodEnd.getTime() - today.getTime();
      monthlyDaysLeft = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));
    }
  }

  // Calculate sums for monthly investment goals
  const monthlyTargetedSum = monthlyGoals.reduce(
    (sum, investment) => sum + investment.target_amount,
    0,
  );
  const monthlyInvestedSum = monthlyGoals.reduce(
    (sum, investment) => sum + investment.invested_amount,
    0,
  );

  // Calculate sums for one-time investment goals
  const oneTimeTargetedSum = oneTimeGoals.reduce(
    (sum, investment) => sum + investment.target_amount,
    0,
  );
  const oneTimeInvestedSum = oneTimeGoals.reduce(
    (sum, investment) => sum + investment.invested_amount,
    0,
  );

  return (
    <div className={className}>
      {/* Monthly Investment Goals */}
      {monthlyGoals.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-row rounded-lg border border-zinc-100 bg-white p-2">
            {/* Column 1: 33% width, content aligned left. */}
            <div className="flex w-2/6 items-start justify-start">
              <div className="text-left">
                <span className="text-xs text-gray-400 sm:text-sm">
                  Monthly
                </span>
                <br />
                <span className="text-xs font-medium text-gray-800 sm:text-sm">
                  {monthlyDaysLeft} days left
                </span>
              </div>
            </div>

            {/* Column 2: 33% width, content aligned right. */}
            <div className="flex w-2/6 items-start justify-end">
              <div className="text-right">
                <span className="text-xs text-gray-400 sm:text-sm">
                  Targeted
                </span>
                <br />
                <span className="text-xs font-medium whitespace-nowrap text-gray-800 sm:text-sm">
                  {formatCurrency(monthlyTargetedSum, { currency })}
                </span>
              </div>
            </div>

            {/* Column 3: 33% width, content aligned right. */}
            <div className="flex w-2/6 items-start justify-end">
              <div className="text-right">
                <span className="text-xs text-gray-400 sm:text-sm">
                  Invested
                </span>
                <br />
                <span className="text-xs font-medium whitespace-nowrap text-gray-800 sm:text-sm">
                  {formatCurrency(monthlyInvestedSum, { currency })}
                </span>
              </div>
            </div>
          </div>

          {monthlyGoals
            .slice(0, showAllCategories ? undefined : 6)
            .map((investment) => (
              <ProgressCard
                key={investment.category_id}
                title={investment.category_name}
                icon={investment.category_icon}
                currentAmount={investment.invested_amount}
                targetAmount={investment.target_amount}
                percentage={investment.progress_percentage}
                currency={currency}
                type="investment"
                isShared={investment.is_shared}
                familyName={investment.family_name}
                memberContributions={investment.member_contributions || []}
              />
            ))}
          {!showAllCategories && monthlyGoals.length > 6 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                View All {monthlyGoals.length} Monthly Goals
              </Button>
            </div>
          )}
        </div>
      )}

      {/* One-time Investment Goals */}
      {oneTimeGoals.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-row rounded-lg border border-zinc-100 bg-white p-2">
            {/* Column 1: 33% width, content aligned left. */}
            <div className="flex w-2/6 items-start justify-start">
              <div className="text-left">
                <span className="text-xs text-gray-400 sm:text-sm">
                  One-time
                </span>
                <br />
                <span className="text-xs font-medium text-gray-800 sm:text-sm">
                  All time
                </span>
              </div>
            </div>

            {/* Column 2: 33% width, content aligned right. */}
            <div className="flex w-2/6 items-start justify-end">
              <div className="text-right">
                <span className="text-xs text-gray-400 sm:text-sm">
                  Targeted
                </span>
                <br />
                <span className="text-xs font-medium whitespace-nowrap text-gray-800 sm:text-sm">
                  {formatCurrency(oneTimeTargetedSum, { currency })}
                </span>
              </div>
            </div>

            {/* Column 3: 33% width, content aligned right. */}
            <div className="flex w-2/6 items-start justify-end">
              <div className="text-right">
                <span className="text-xs text-gray-400 sm:text-sm">
                  Invested
                </span>
                <br />
                <span className="text-xs font-medium whitespace-nowrap text-gray-800 sm:text-sm">
                  {formatCurrency(oneTimeInvestedSum, { currency })}
                </span>
              </div>
            </div>
          </div>
          {oneTimeGoals
            .slice(0, showAllCategories ? undefined : 6)
            .map((investment) => (
              <ProgressCard
                key={investment.category_id}
                title={investment.category_name}
                icon={investment.category_icon}
                currentAmount={investment.invested_amount}
                targetAmount={investment.target_amount}
                percentage={investment.progress_percentage}
                currency={currency}
                type="investment"
                isShared={investment.is_shared}
                familyName={investment.family_name}
                memberContributions={investment.member_contributions || []}
              />
            ))}
          {!showAllCategories && oneTimeGoals.length > 6 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                View All {oneTimeGoals.length} Long-term Goals
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
