/**
 * Custom hook for fetching and managing transactions with pagination
 * Replaces complex inline logic in transaction-list component
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import type { 
  TransactionWithRelations, 
  TransactionFilters, 
  TransactionListResponse 
} from '@/types/common';
import { DEFAULT_PAGINATION } from '@/lib/constants';

interface UseTransactionsOptions {
  defaultFilters?: TransactionFilters;
  limit?: number;
  autoFetch?: boolean;
}

interface UseTransactionsReturn {
  // Data
  transactions: TransactionWithRelations[];
  pagination: TransactionListResponse['pagination'] | null;
  groupedTransactions: Record<string, TransactionWithRelations[]>;
  
  // States
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  
  // Filters
  filters: TransactionFilters;
  setFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;
  
  // Actions
  refetch: () => void;
  loadMore: () => void;
  refresh: () => void;
}

export function useTransactions(options: UseTransactionsOptions = {}): UseTransactionsReturn {
  const {
    defaultFilters = {},
    limit = DEFAULT_PAGINATION.LIMIT,
    autoFetch = true
  } = options;

  // State
  const [transactions, setTransactions] = useState<TransactionWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters);
  const [pagination, setPagination] = useState<TransactionListResponse['pagination'] | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Build query parameters from filters
  const buildQueryParams = useCallback((currentFilters: TransactionFilters, offset = 0) => {
    const params = new URLSearchParams();
    
    if (currentFilters.start_date) {
      params.append('start_date', format(currentFilters.start_date, 'yyyy-MM-dd'));
    }
    if (currentFilters.end_date) {
      params.append('end_date', format(currentFilters.end_date, 'yyyy-MM-dd'));
    }
    if (currentFilters.account_id) {
      params.append('account_id', currentFilters.account_id);
    }
    if (currentFilters.category_id) {
      params.append('category_id', currentFilters.category_id);
    }
    if (currentFilters.type) {
      params.append('type', currentFilters.type);
    }
    
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    return params.toString();
  }, [limit]);

  // Fetch transactions
  const fetchTransactions = useCallback(async (
    currentFilters: TransactionFilters, 
    offset = 0, 
    append = false
  ) => {
    try {
      if (offset === 0) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const queryString = buildQueryParams(currentFilters, offset);
      const response = await fetch(`/api/transactions?${queryString}`);

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const result = await response.json();
      const data: TransactionListResponse = result.data;
      
      if (append) {
        setTransactions(prev => [...prev, ...data.transactions]);
      } else {
        setTransactions(data.transactions);
      }
      
      setPagination(data.pagination);
      setHasMore(data.pagination.has_more);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
      if (offset === 0) {
        setTransactions([]);
        setPagination(null);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildQueryParams]);

  // Load more transactions for infinite scroll
  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && pagination?.next_offset !== null && pagination?.next_offset !== undefined) {
      fetchTransactions(filters, pagination.next_offset, true);
    }
  }, [hasMore, loadingMore, pagination?.next_offset, filters, fetchTransactions]);

  // Refetch with current filters
  const refetch = useCallback(() => {
    fetchTransactions(filters, 0, false);
  }, [filters, fetchTransactions]);

  // Refresh - reset to first page
  const refresh = useCallback(() => {
    setTransactions([]);
    setPagination(null);
    setHasMore(true);
    fetchTransactions(filters, 0, false);
  }, [filters, fetchTransactions]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Update filters
  const handleSetFilters = useCallback((newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setTransactions([]); // Clear existing data
    setPagination(null);
    setHasMore(true);
  }, []);

  // Fetch transactions when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchTransactions(filters, 0, false);
    }
  }, [filters, fetchTransactions, autoFetch]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    return transactions.reduce((groups, transaction) => {
      const date = format(new Date(transaction.transaction_date), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as Record<string, TransactionWithRelations[]>);
  }, [transactions]);

  return {
    // Data
    transactions,
    pagination,
    groupedTransactions,
    
    // States
    loading,
    loadingMore,
    error,
    hasMore,
    
    // Filters
    filters,
    setFilters: handleSetFilters,
    clearFilters,
    
    // Actions
    refetch,
    loadMore,
    refresh,
  };
}

// Hook for infinite scroll behavior
export function useTransactionInfiniteScroll(
  loadMore: () => void,
  hasMore: boolean,
  loadingMore: boolean
) {
  const observerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    
    return () => observer.disconnect();
  }, [loadMore, hasMore, loadingMore]);

  return observerRef;
}