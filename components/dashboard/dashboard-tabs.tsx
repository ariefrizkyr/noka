"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { BudgetOverview } from './budget-overview';
import { InvestmentOverview } from './investment-overview';
import { DashboardCharts } from './dashboard-charts';
import { RecentActivity } from './recent-activity';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/hooks/use-dashboard';
import { TrendingDown, TrendingUp, BarChart3, Activity } from 'lucide-react';

interface DashboardTabsProps {
  currency?: string;
  className?: string;
  defaultTab?: string;
}

export function DashboardTabs({ 
  currency = 'IDR', 
  className,
  defaultTab = 'expenses' 
}: DashboardTabsProps) {
  const { budgetProgress, investmentProgress, recentTransactions, loading } = useDashboard();

  // Calculate tab indicators
  const expenseTabIndicators = {
    total: budgetProgress.length,
    overBudget: budgetProgress.filter(b => b.progress_percentage > 100).length,
    warning: budgetProgress.filter(b => b.progress_percentage > 80 && b.progress_percentage <= 100).length,
  };

  const investmentTabIndicators = {
    total: investmentProgress.length,
    completed: investmentProgress.filter(i => i.progress_percentage >= 100).length,
    onTrack: investmentProgress.filter(i => i.progress_percentage >= 50 && i.progress_percentage < 100).length,
  };

  return (
    <div className={className}>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
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

          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>

          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
            {!loading && recentTransactions.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {recentTransactions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Expense Tab */}
        <TabsContent value="expenses" className="space-y-6">
          {/* Tab Overview */}
          <Card className="bg-gradient-to-r from-red-50 to-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Budget Management</h3>
                  <p className="text-sm text-red-700">
                    Monitor your spending against budgets across all categories
                  </p>
                </div>
                <div className="flex gap-2">
                  {expenseTabIndicators.overBudget > 0 && (
                    <Badge variant="destructive">
                      {expenseTabIndicators.overBudget} over budget
                    </Badge>
                  )}
                  {expenseTabIndicators.warning > 0 && (
                    <Badge variant="secondary">
                      {expenseTabIndicators.warning} warning
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {expenseTabIndicators.total} categories
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Overview Component */}
          <BudgetOverview currency={currency} showAllCategories={true} />
        </TabsContent>

        {/* Investment Tab */}
        <TabsContent value="investments" className="space-y-6">
          {/* Tab Overview */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Investment Goals</h3>
                  <p className="text-sm text-green-700">
                    Track progress towards your financial goals and investments
                  </p>
                </div>
                <div className="flex gap-2">
                  {investmentTabIndicators.completed > 0 && (
                    <Badge variant="default">
                      {investmentTabIndicators.completed} completed
                    </Badge>
                  )}
                  {investmentTabIndicators.onTrack > 0 && (
                    <Badge variant="secondary">
                      {investmentTabIndicators.onTrack} on track
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {investmentTabIndicators.total} goals
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Overview Component */}
          <InvestmentOverview currency={currency} showAllCategories={true} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Tab Overview */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Financial Analytics</h3>
                  <p className="text-sm text-blue-700">
                    Visualize your spending patterns and account distributions
                  </p>
                </div>
                <Badge variant="outline">
                  Charts & Insights
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Charts Component */}
          <DashboardCharts currency={currency} />
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          {/* Tab Overview */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">Recent Activity</h3>
                  <p className="text-sm text-purple-700">
                    Review your latest transactions and financial activity
                  </p>
                </div>
                <Badge variant="outline">
                  {recentTransactions.length} recent transactions
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Component - Show more transactions in this tab */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivity currency={currency} limit={15} />
            
            {/* Quick Stats for Activity Tab */}
            <Card>
              <CardContent className="pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Transactions</span>
                    <Badge variant="outline">{recentTransactions.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Income Transactions</span>
                    <Badge variant="default">
                      {recentTransactions.filter(t => t.type === 'income').length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Expense Transactions</span>
                    <Badge variant="destructive">
                      {recentTransactions.filter(t => t.type === 'expense').length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Transfer Transactions</span>
                    <Badge variant="secondary">
                      {recentTransactions.filter(t => t.type === 'transfer').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}