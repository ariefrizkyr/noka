"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressCard } from './progress-card';
import { useInvestmentOverview } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { PiggyBank } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface InvestmentOverviewProps {
  currency?: string;
  className?: string;
  showAllCategories?: boolean;
}

export function InvestmentOverview({ 
  currency = 'IDR', 
  className,
  showAllCategories = false 
}: InvestmentOverviewProps) {
  const { investmentOverview, investmentProgress, loading, error } = useInvestmentOverview();

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

  if (!investmentOverview || investmentProgress.length === 0) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <PiggyBank className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Investment Goals
              </h3>
              <p className="text-gray-600 mb-4">
                Create investment categories and set targets to track your financial goals.
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

  // Separate monthly and one-time goals from investment progress data
  const monthlyGoals = investmentProgress.filter(investment => investment.target_frequency === 'monthly');
  const oneTimeGoals = investmentProgress.filter(investment => investment.target_frequency === 'one_time');

  return (
    <div className={className}>

      {/* Monthly Investment Goals */}
      {monthlyGoals.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Investment Goals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Long-term Investment Goals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>
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