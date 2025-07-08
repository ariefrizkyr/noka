"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetOverview } from "./budget-overview";
import { InvestmentOverview } from "./investment-overview";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/hooks/use-dashboard";
import { TrendingDown, TrendingUp } from "lucide-react";

interface DashboardTabsProps {
  currency?: string;
  className?: string;
  defaultTab?: string;
}

export function DashboardTabs({
  currency = "IDR",
  className,
  defaultTab = "expenses",
}: DashboardTabsProps) {
  const { budgetProgress, investmentProgress, recentTransactions, loading } =
    useDashboard();

  // Calculate tab indicators
  const expenseTabIndicators = {
    total: budgetProgress.length,
    overBudget: budgetProgress.filter((b) => b.progress_percentage > 100)
      .length,
    warning: budgetProgress.filter(
      (b) => b.progress_percentage > 80 && b.progress_percentage <= 100,
    ).length,
  };

  const investmentTabIndicators = {
    total: investmentProgress.length,
    completed: investmentProgress.filter((i) => i.progress_percentage >= 100)
      .length,
    onTrack: investmentProgress.filter(
      (i) => i.progress_percentage >= 50 && i.progress_percentage < 100,
    ).length,
  };

  return (
    <div className={className}>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            <span className="hidden sm:inline">Expenses</span>
            {!loading && expenseTabIndicators.total > 0 && (
              <Badge variant="secondary" className="ml-1">
                {expenseTabIndicators.total}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger value="investments" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Investments</span>
            {!loading && investmentTabIndicators.total > 0 && (
              <Badge variant="secondary" className="ml-1">
                {investmentTabIndicators.total}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Expense Tab */}
        <TabsContent value="expenses" className="space-y-6">
          {/* Budget Overview Component */}
          <BudgetOverview currency={currency} showAllCategories={true} />
        </TabsContent>

        {/* Investment Tab */}
        <TabsContent value="investments" className="space-y-6">
          {/* Investment Overview Component */}
          <InvestmentOverview currency={currency} showAllCategories={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
