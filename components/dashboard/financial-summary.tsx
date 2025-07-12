"use client";

import { formatCurrency } from "@/lib/currency-utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { format } from "date-fns";
import { useDashboardSummary } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

interface FinancialSummaryProps {
  currency?: string;
  className?: string;
}

export function FinancialSummary({
  currency = "IDR",
  className,
}: FinancialSummaryProps) {
  const { financialSummary, quickStats, loading, error } =
    useDashboardSummary();

  if (loading) {
    return (
      <div className={className}>
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="h-4 w-24" />
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

  const periodStart = financialSummary.period_start
    ? new Date(financialSummary.period_start)
    : new Date();
  const periodEnd = financialSummary.period_end
    ? new Date(financialSummary.period_end)
    : new Date();

  // Determine trend indicators
  const isPositiveSavings = financialSummary.net_savings > 0;
  const savingsRate = quickStats?.savings_rate || 0;

  // Format period display
  const periodDisplay = `${format(periodStart, "MMM d")} - ${format(periodEnd, "MMM d, yyyy")}`;

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
      title: "Remaining",
      value: financialSummary.net_savings,
      icon: isPositiveSavings ? TrendingUp : TrendingDown,
      color: isPositiveSavings ? "text-green-600" : "text-red-600",
      bgColor: isPositiveSavings ? "bg-green-50" : "bg-red-50",
      currency: currency,
      badge: `${savingsRate.toFixed(1)}%`,
    },
  ];

  return (
    <div className={className}>
      {/* Period Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-l font-bold text-gray-900">
              Financial Overview
            </h2>
            <p className="text-sm text-gray-600">Period: {periodDisplay}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-rows-3 gap-2">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          const isLastItem = index === summaryCards.length - 1;
          return (
            <div
              key={index}
              className={`row-span-1 ${isLastItem ? "border-t border-gray-100 pt-2" : ""}`}
            >
              <div className="flex flex-row">
                <div className="flex w-4/6 items-start justify-start">
                  <div className="flex items-center space-x-1">
                    <div className={`rounded-full p-1 ${card.bgColor}`}>
                      <Icon className={`h-3 w-3 ${card.color}`} />
                    </div>
                    <span className="text-sm font-medium">{card.title}</span>
                  </div>
                </div>
                <div className="flex w-2/6 items-start justify-end">
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      {formatCurrency(card.value, { currency: card.currency })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
