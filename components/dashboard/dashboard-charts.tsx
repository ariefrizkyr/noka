"use client"

import { formatCurrency } from '@/lib/currency-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useMemo } from 'react';

interface DashboardChartsProps {
  currency?: string;
  className?: string;
}

// Color palette for charts
const COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#EC4899', // pink
  '#6B7280', // gray
];

export function DashboardCharts({ currency = 'IDR', className }: DashboardChartsProps) {
  const { data, budgetProgress, accounts, loading, error } = useDashboard();

  const chartData = useMemo(() => {
    if (!data || !budgetProgress) return null;

    // Budget vs Actual spending data
    const budgetActualData = budgetProgress.map((budget, index) => ({
      name: budget.category_name,
      budgeted: budget.budget_amount,
      spent: budget.spent_amount,
      fill: COLORS[index % COLORS.length],
    }));

    // Category spending breakdown (pie chart data)
    const categorySpendingData = budgetProgress
      .filter(budget => budget.spent_amount > 0)
      .map((budget, index) => ({
        name: budget.category_name,
        value: budget.spent_amount,
        percentage: data.budget_overview.total_spent > 0 
          ? (budget.spent_amount / data.budget_overview.total_spent) * 100 
          : 0,
        fill: COLORS[index % COLORS.length],
      }));

    // Account balance breakdown
    const accountBalanceData = Object.entries(data.accounts_summary.by_type || {}).map(([type, accountsOfType], index) => ({
      name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: accountsOfType.reduce((sum, account) => sum + account.current_balance, 0),
      count: accountsOfType.length,
      fill: COLORS[index % COLORS.length],
    }));

    return {
      budgetActualData,
      categorySpendingData,
      accountBalanceData,
    };
  }, [data, budgetProgress]);

  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !chartData) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Unable to load chart data
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Custom tooltip for currency formatting
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value, currency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom pie chart tooltip
  const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; percentage: number; fill: string } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p style={{ color: payload[0].color }}>
            Amount: {formatCurrency(data.value, currency)}
          </p>
          <p className="text-gray-600">
            {data.percentage?.toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Actual Spending */}
        {chartData.budgetActualData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Budget vs Actual Spending
                <Badge variant="outline">
                  {chartData.budgetActualData.length} categories
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.budgetActualData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value, currency, true)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="budgeted" fill="#3B82F6" name="Budgeted" />
                  <Bar dataKey="spent" fill="#EF4444" name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Category Spending Breakdown */}
        {chartData.categorySpendingData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Spending by Category
                <Badge variant="outline">
                  Total: {formatCurrency(
                    chartData.categorySpendingData.reduce((sum, item) => sum + item.value, 0), 
                    currency, 
                    true
                  )}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.categorySpendingData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.categorySpendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Account Balance Breakdown */}
        {chartData.accountBalanceData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Account Balances by Type
                <Badge variant="outline">
                  {accounts.length} accounts
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.accountBalanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value, currency, true)}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string, props: { payload: { count: number } }) => [
                      formatCurrency(value, currency),
                      `Total Balance (${props.payload.count} accounts)`
                    ]}
                    labelFormatter={(label) => `Account Type: ${label}`}
                  />
                  <Bar dataKey="value" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Budget Health Overview */}
        {data?.budget_overview && (
          <Card>
            <CardHeader>
              <CardTitle>Budget Health Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Budget Utilization</span>
                  <Badge variant={data.budget_overview.budget_utilization > 100 ? "destructive" : "default"}>
                    {data.budget_overview.budget_utilization.toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Categories Over Budget</div>
                    <div className="text-lg font-semibold text-red-600">
                      {data.budget_overview.categories_over_budget}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">On Track Categories</div>
                    <div className="text-lg font-semibold text-green-600">
                      {data.budget_overview.categories_on_track || 0}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span>Total Budget</span>
                    <span className="font-medium">
                      {formatCurrency(data.budget_overview.total_budget, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span>Total Spent</span>
                    <span className="font-medium">
                      {formatCurrency(data.budget_overview.total_spent, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1 font-semibold">
                    <span>Remaining</span>
                    <span className={data.budget_overview.remaining_budget >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(data.budget_overview.remaining_budget, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}