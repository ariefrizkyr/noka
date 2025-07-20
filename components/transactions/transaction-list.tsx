"use client";

import { format } from "date-fns";
import { Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TransactionCard } from "./transaction-card";
import { TransactionFilters } from "./transaction-filters";
import {
  useTransactions,
  useTransactionInfiniteScroll,
} from "@/hooks/use-transactions";
import { DATE_FORMATS } from "@/lib/constants";
import type {
  TransactionWithRelations,
  TransactionFilters as TransactionFiltersType,
} from "@/types/common";

interface TransactionListProps {
  onAddTransaction?: () => void;
  onEditTransaction?: (transaction: TransactionWithRelations) => void;
  onDeleteTransaction?: (transaction: TransactionWithRelations) => void;
  defaultFilters?: TransactionFiltersType;
  className?: string;
  currency?: string;
  hiddenFilters?: Array<keyof TransactionFiltersType>;
  lockedFilters?: TransactionFiltersType;
}

export function TransactionList({
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  defaultFilters = {},
  className,
  currency,
  hiddenFilters = [],
  lockedFilters = {},
}: TransactionListProps) {
  // Use our centralized transactions hook
  const {
    transactions,
    groupedTransactions,
    loading,
    loadingMore,
    error,
    hasMore,
    filters,
    setFilters,
    loadMore,
  } = useTransactions({
    defaultFilters,
    autoFetch: true,
  });

  // Setup infinite scroll observer
  const observerRef = useTransactionInfiniteScroll(
    loadMore,
    hasMore,
    loadingMore,
  );

  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  if (loading) {
    return (
      <div className={className}>
        <div className="space-y-6">
          {/* Loading skeleton for header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="h-16 w-full" />
          </div>

          {/* Loading skeleton for transactions */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        {/* Filters */}
        <TransactionFilters 
          filters={filters} 
          onFiltersChange={setFilters}
          hiddenFilters={hiddenFilters}
          lockedFilters={lockedFilters}
        />
      </div>

      {/* Content */}
      <div>
        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {transactions.length === 0 && !loading ? (
          <div className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No transactions found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {Object.keys(filters).length > 0
                ? "Try adjusting your filters or add a new transaction."
                : "Get started by adding your first transaction."}
            </p>
            {onAddTransaction && (
              <Button onClick={onAddTransaction} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date}>
                <h3 className="mb-3 text-sm font-medium text-gray-500">
                  {format(new Date(date), DATE_FORMATS.DISPLAY_LONG)}
                </h3>
                <div className="space-y-2">
                  {groupedTransactions[date].map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      onEdit={onEditTransaction}
                      onDelete={onDeleteTransaction}
                      currency={currency}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Infinite scroll trigger */}
            <div ref={observerRef} className="h-4">
              {loadingMore && (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </div>

            {/* Load more button as fallback */}
            {hasMore && !loadingMore && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={loadMore}>
                  Load More
                </Button>
              </div>
            )}

            {!hasMore && transactions.length > 0 && (
              <p className="py-4 text-center text-sm text-gray-500">
                You've reached the end of your transaction history.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
