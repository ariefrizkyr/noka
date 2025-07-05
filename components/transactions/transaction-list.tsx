"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { format } from "date-fns"
import { Loader2, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TransactionCard } from "./transaction-card"
import { TransactionFilters, type TransactionFilters as TransactionFiltersType } from "./transaction-filters"

interface Transaction {
  id: string
  type: "income" | "expense" | "transfer"
  amount: number
  description?: string
  transaction_date: string
  created_at: string
  updated_at: string
  
  // For income/expense
  accounts?: {
    id: string
    name: string
    type: "bank_account" | "credit_card" | "investment_account"
  }
  categories?: {
    id: string
    name: string
    type: "expense" | "income" | "investment"
    icon?: string
  }
  
  // For transfers
  from_accounts?: {
    id: string
    name: string
    type: "bank_account" | "credit_card" | "investment_account"
  }
  to_accounts?: {
    id: string
    name: string
    type: "bank_account" | "credit_card" | "investment_account"
  }
  investment_categories?: {
    id: string
    name: string
    type: "investment"
    icon?: string
  }
}

interface TransactionListResponse {
  transactions: Transaction[]
  pagination: {
    limit: number
    offset: number
    count: number
    total_count: number
    has_more: boolean
    next_offset: number | null
  }
}

interface TransactionListProps {
  onAddTransaction?: () => void
  onEditTransaction?: (transaction: Transaction) => void
  onDeleteTransaction?: (transaction: Transaction) => void
  defaultFilters?: TransactionFiltersType
  className?: string
}

export function TransactionList({
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  defaultFilters = {},
  className,
}: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TransactionFiltersType>(defaultFilters)
  const [pagination, setPagination] = useState<TransactionListResponse["pagination"] | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const observerTarget = useRef<HTMLDivElement>(null)

  // Build query parameters from filters
  const buildQueryParams = useCallback((currentFilters: TransactionFiltersType, offset = 0) => {
    const params = new URLSearchParams()
    
    if (currentFilters.start_date) {
      params.append("start_date", format(currentFilters.start_date, "yyyy-MM-dd"))
    }
    if (currentFilters.end_date) {
      params.append("end_date", format(currentFilters.end_date, "yyyy-MM-dd"))
    }
    if (currentFilters.account_id) {
      params.append("account_id", currentFilters.account_id)
    }
    if (currentFilters.category_id) {
      params.append("category_id", currentFilters.category_id)
    }
    if (currentFilters.type) {
      params.append("type", currentFilters.type)
    }
    
    params.append("limit", "20")
    params.append("offset", offset.toString())
    
    return params.toString()
  }, [])

  // Fetch transactions
  const fetchTransactions = useCallback(async (
    currentFilters: TransactionFiltersType, 
    offset = 0, 
    append = false
  ) => {
    try {
      if (offset === 0) {
        setLoading(true)
        setError(null)
      } else {
        setLoadingMore(true)
      }

      const queryString = buildQueryParams(currentFilters, offset)
      const response = await fetch(`/api/transactions?${queryString}`)

      if (!response.ok) {
        throw new Error("Failed to fetch transactions")
      }

      const result = await response.json()
      const data: TransactionListResponse = result.data
      
      if (append) {
        setTransactions(prev => [...prev, ...data.transactions])
      } else {
        setTransactions(data.transactions)
      }
      
      setPagination(data.pagination)
      setHasMore(data.pagination.has_more)
      setError(null)
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setError(err instanceof Error ? err.message : "Failed to load transactions")
      if (offset === 0) {
        setTransactions([])
        setPagination(null)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [buildQueryParams])

  // Load more transactions for infinite scroll
  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && pagination?.next_offset !== null && pagination?.next_offset !== undefined) {
      fetchTransactions(filters, pagination.next_offset, true)
    }
  }, [hasMore, loadingMore, pagination?.next_offset, filters, fetchTransactions])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadingMore, loadMore])

  // Fetch transactions when filters change
  useEffect(() => {
    fetchTransactions(filters, 0, false)
  }, [filters, fetchTransactions])

  // Handle filter changes
  const handleFiltersChange = (newFilters: TransactionFiltersType) => {
    setFilters(newFilters)
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = format(new Date(transaction.transaction_date), "yyyy-MM-dd")
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(transaction)
    return groups
  }, {} as Record<string, Transaction[]>)

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
            onFiltersChange={handleFiltersChange}
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
                    {format(new Date(date), "EEEE, MMMM dd, yyyy")}
                  </h3>
                  <div className="space-y-2">
                    {groupedTransactions[date].map((transaction) => (
                      <TransactionCard
                        key={transaction.id}
                        transaction={transaction}
                        onEdit={onEditTransaction}
                        onDelete={onDeleteTransaction}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Infinite scroll trigger */}
              <div ref={observerTarget} className="h-4">
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