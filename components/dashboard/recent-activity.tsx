"use client"

import { formatCurrency } from '@/lib/currency-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { TRANSACTION_TYPE_CONFIG } from '@/lib/constants';
import { format } from 'date-fns';
import Link from 'next/link';
import { Activity, ArrowRight } from 'lucide-react';

interface RecentActivityProps {
  currency?: string;
  className?: string;
  limit?: number;
}

export function RecentActivity({ 
  currency = 'IDR', 
  className,
  limit = 10 
}: RecentActivityProps) {
  const { recentTransactions, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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

  if (!recentTransactions || recentTransactions.length === 0) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Recent Activity
              </h3>
              <p className="text-gray-600 mb-4">
                Start recording transactions to see your recent financial activity.
              </p>
              <Link href="/transactions">
                <Button>Add Transaction</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayedTransactions = recentTransactions.slice(0, limit);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <Badge variant="outline">
              {recentTransactions.length} transactions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayedTransactions.map((transaction) => {
              const config = TRANSACTION_TYPE_CONFIG[transaction.type];
              const Icon = config.icon;
              
              // Format transaction display based on type
              const getTransactionDisplay = () => {
                switch (transaction.type) {
                  case 'income':
                    return {
                      title: transaction.categories?.name || 'Income',
                      subtitle: `to ${transaction.accounts?.name}`,
                      amount: transaction.amount,
                      isPositive: true,
                    };
                  case 'expense':
                    return {
                      title: transaction.categories?.name || 'Expense',
                      subtitle: `from ${transaction.accounts?.name}`,
                      amount: transaction.amount,
                      isPositive: false,
                    };
                  case 'transfer':
                    return {
                      title: 'Transfer',
                      subtitle: `${transaction.from_accounts?.name} → ${transaction.to_accounts?.name}`,
                      amount: transaction.amount,
                      isPositive: null, // neutral for transfers
                    };
                  default:
                    return {
                      title: 'Transaction',
                      subtitle: '',
                      amount: transaction.amount,
                      isPositive: null,
                    };
                }
              };

              const display = getTransactionDisplay();
              const transactionDate = new Date(transaction.transaction_date);

              return (
                <div key={transaction.id} className="flex items-center space-x-3 py-2">
                  {/* Transaction Icon */}
                  <div className={`p-2 rounded-full ${config.bgColor}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {display.title}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {transaction.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="truncate">{display.subtitle}</span>
                      <span>•</span>
                      <span>{format(transactionDate, 'MMM d')}</span>
                    </div>
                    {transaction.description && (
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {transaction.description}
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      display.isPositive === true 
                        ? 'text-green-600' 
                        : display.isPositive === false 
                        ? 'text-red-600' 
                        : 'text-gray-900'
                    }`}>
                      {display.isPositive === true && '+'}
                      {display.isPositive === false && '-'}
                      {formatCurrency(Math.abs(display.amount), currency)}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* View All Link */}
            {recentTransactions.length > limit && (
              <div className="pt-4 border-t">
                <Link href="/transactions">
                  <Button variant="outline" className="w-full gap-2">
                    View All Transactions
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-2">
                <Link href="/transactions">
                  <Button variant="outline" size="sm" className="w-full">
                    View All
                  </Button>
                </Link>
                <Link href="/transactions">
                  <Button size="sm" className="w-full">
                    Add Transaction
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}