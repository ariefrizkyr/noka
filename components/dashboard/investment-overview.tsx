"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressCard } from "./progress-card";
import { useInvestmentOverview } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { PiggyBank } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  const monthlyPeriodEnd = new Date(monthlyGoals[0].period_end);

  const differenceInMonths = monthlyPeriodEnd.getTime() - today.getTime();

  const monthlyDaysLeft = Math.ceil(differenceInMonths / (1000 * 60 * 60 * 24));

  return (
    <div className={className}>
      {/* Monthly Investment Goals */}
      {monthlyGoals.length > 0 && (
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
                <span className="text-xs text-gray-400">Targeted</span>
                <br />
                <span className="text-xs whitespace-nowrap text-gray-800">
                  {/* TODO: replace with dynamic sum of all monthly target */}
                  Rp 1.000.000
                </span>
              </div>
            </div>

            {/* Column 3: 33% width, content aligned right. */}
            <div className="flex w-2/6 items-start justify-end">
              <div className="text-right">
                <span className="text-xs text-gray-400">Invested</span>
                <br />
                <span className="text-xs whitespace-nowrap text-gray-800">
                  {/* TODO: replace with dynamic sum of all monthly invested amount */}
                  Rp 2.500.000
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  frequency="monthly"
                  currency={currency}
                  type="investment"
                  period={{
                    start: investment.period_start,
                    end: investment.period_end,
                  }}
                />
              ))}
          </div>
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
                <span className="text-xs text-gray-400">One-time</span>
                <br />
                <span className="text-xs text-gray-800">All time</span>
              </div>
            </div>

            {/* Column 2: 33% width, content aligned right. */}
            <div className="flex w-2/6 items-start justify-end">
              <div className="text-right">
                <span className="text-xs text-gray-400">Targeted</span>
                <br />
                <span className="text-xs whitespace-nowrap text-gray-800">
                  {/* TODO: replace with dynamic sum of all all-time target */}
                  Rp 1.000.000
                </span>
              </div>
            </div>

            {/* Column 3: 33% width, content aligned right. */}
            <div className="flex w-2/6 items-start justify-end">
              <div className="text-right">
                <span className="text-xs text-gray-400">Invested</span>
                <br />
                <span className="text-xs whitespace-nowrap text-gray-800">
                  {/* TODO: replace with dynamic sum of all all-time invested amount */}
                  Rp 2.500.000
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
                frequency="one_time"
                currency={currency}
                type="investment"
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
