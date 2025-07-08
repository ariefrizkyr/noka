"use client"

import { formatCurrency } from '@/lib/currency-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

interface FinancialSummaryProps {
  currency?: string;
  className?: string;
}

export function FinancialSummary({ currency = 'IDR', className }: FinancialSummaryProps) {
  const { financialSummary, quickStats, loading, error } = useDashboardSummary();

  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
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
            <div className="text-center text-red-600">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!financialSummary) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              No financial data available for this period.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const periodStart = financialSummary.period_start ? new Date(financialSummary.period_start) : new Date();
  const periodEnd = financialSummary.period_end ? new Date(financialSummary.period_end) : new Date();
  
  // Determine trend indicators
  const isPositiveSavings = financialSummary.net_savings > 0;
  const savingsRate = quickStats?.savings_rate || 0;

  // Format period display
  const periodDisplay = `${format(periodStart, 'MMM d')} - ${format(periodEnd, 'MMM d, yyyy')}`;

  const summaryCards = [
    {
      title: "Total Income",
      value: financialSummary.total_income,
      icon: ArrowUpRight,
      color: "text-green-600",
      bgColor: "bg-green-50",
      currency: currency,
    },
    {
      title: "Total Expenses", 
      value: financialSummary.total_expenses,
      icon: ArrowDownRight,
      color: "text-red-600",
      bgColor: "bg-red-50",
      currency: currency,
    },
    {
      title: "Net Savings",
      value: financialSummary.net_savings,
      icon: isPositiveSavings ? TrendingUp : TrendingDown,
      color: isPositiveSavings ? "text-green-600" : "text-red-600",
      bgColor: isPositiveSavings ? "bg-green-50" : "bg-red-50",
      currency: currency,
      badge: `${savingsRate.toFixed(1)}%`,
    },
    {
      title: "Net Worth",
      value: quickStats?.net_worth || 0,
      icon: Wallet,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      currency: currency,
    },
  ];

  return (
    <div className={className}>
      {/* Period Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Financial Overview</h2>
            <p className="text-sm text-gray-600">
              Period: {periodDisplay}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(card.value, { currency: card.currency })}
                    </div>
                    {card.badge && (
                      <Badge variant="outline" className="mt-1">
                        {card.badge}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}