"use client"

import { formatCurrency } from '@/lib/currency-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressCard } from './progress-card';
import { useInvestmentOverview } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Target, Award, PiggyBank } from 'lucide-react';
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

  // Overview stats
  const overviewStats = [
    {
      title: "Total Target",
      value: investmentOverview.total_target,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Invested",
      value: investmentOverview.total_invested,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      badge: `${(investmentOverview?.average_progress || 0).toFixed(1)}%`,
    },
    {
      title: "Remaining",
      value: investmentOverview.remaining_to_invest,
      icon: PiggyBank,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Investment Overview</h2>
          <p className="text-sm text-gray-600">
            Track progress towards your financial goals
          </p>
        </div>
        <div className="flex gap-2">
          {investmentProgress.filter(inv => (inv.progress_percentage || 0) >= 100).length > 0 && (
            <Badge variant="default">
              {investmentProgress.filter(inv => (inv.progress_percentage || 0) >= 100).length} completed
            </Badge>
          )}
          <Badge variant="outline">
            {investmentProgress.length} goals
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

      {/* Investment Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-green-900">Completion Rate</h4>
                <p className="text-sm text-green-700">
                  {(investmentOverview?.investment_completion_rate || 0) > 75 
                    ? "Excellent progress! You're on track with your goals."
                    : (investmentOverview?.investment_completion_rate || 0) > 50
                    ? "Good progress! Keep up the momentum."
                    : "Early stages. Consider increasing your investment contributions."
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-900">
                  {(investmentOverview?.investment_completion_rate || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-green-700">Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-purple-900">Goal Status</h4>
                <div className="space-y-1 text-sm text-purple-700">
                  <div>{investmentOverview?.categories_completed || 0} completed</div>
                  <div>{investmentOverview?.categories_on_track || 0} on track</div>
                  <div>{investmentOverview?.categories_starting || 0} starting</div>
                </div>
              </div>
              <div className="text-right">
                <Award className="h-8 w-8 text-purple-600" />
                <div className="text-sm text-purple-700 mt-1">
                  {investmentOverview?.total_categories || 0} goals
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}