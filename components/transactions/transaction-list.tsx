"use client"

import { format } from "date-fns"
import { Loader2, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TransactionCard } from "./transaction-card"
import { TransactionFilters } from "./transaction-filters"
import { useTransactions, useTransactionInfiniteScroll } from "@/hooks/use-transactions"
import { DATE_FORMATS } from "@/lib/constants"
import type { TransactionWithRelations, TransactionFilters as TransactionFiltersType } from "@/types/common"

interface TransactionListProps {
  onAddTransaction?: () => void
  onEditTransaction?: (transaction: TransactionWithRelations) => void
  onDeleteTransaction?: (transaction: TransactionWithRelations) => void
  defaultFilters?: TransactionFiltersType
  className?: string
  currency?: string
}

export function TransactionList({
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  defaultFilters = {},
  className,
  currency,
}: TransactionListProps) {
  // Use our centralized transactions hook
  const {
    transactions,
    pagination,
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
  })

  // Setup infinite scroll observer
  const observerRef = useTransactionInfiniteScroll(loadMore, hasMore, loadingMore)

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  if (loading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-20 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                {pagination?.total_count ? (
                  <>Showing {transactions.length} of {pagination.total_count} transactions</>
                ) : (
                  "No transactions found"
                )}
              </CardDescription>
            </div>
            {onAddTransaction && (
              <Button onClick={onAddTransaction} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            )}
          </div>

          {/* Filters */}
          <TransactionFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {transactions.length === 0 && !loading ? (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No transactions found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {Object.keys(filters).length > 0 
                  ? "Try adjusting your filters or add a new transaction."
                  : "Get started by adding your first transaction."
                }
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
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
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
                <p className="text-center text-sm text-gray-500 py-4">
                  You've reached the end of your transaction history.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}