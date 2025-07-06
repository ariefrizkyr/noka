/**
 * Custom hook for fetching and managing categories
 * Replaces inline API fetching in components
 */

import { useMemo } from 'react';
import { useApiData } from './use-api-data';
import type { Category, CategoryType } from '@/types/common';

interface UseCategoriesOptions {
  filterByType?: CategoryType | CategoryType[];
  includeInactive?: boolean;
}

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  
  // Convenience functions
  getCategoryById: (id: string) => Category | undefined;
  getCategoriesByType: (type: CategoryType) => Category[];
  groupedCategories: Record<CategoryType, Category[]>;
}

export function useCategories(options: UseCategoriesOptions = {}): UseCategoriesReturn {
  const { 
    filterByType, 
    includeInactive = false 
  } = options;

  // Fetch all categories using existing useApiData hook
  // Note: API returns { data: { categories: Category[] } }
  const { 
    data: apiResponse, 
    loading, 
    error, 
    refetch 
  } = useApiData<{ categories: Category[] }>('/api/categories');

  const allCategories = apiResponse?.categories || [];

  // Filter and process categories
  const categories = useMemo(() => {
    let filtered = allCategories;

    // Filter by active status
    if (!includeInactive) {
      filtered = filtered.filter(category => category.is_active);
    }

    // Filter by category type
    if (filterByType) {
      if (Array.isArray(filterByType)) {
        filtered = filtered.filter(category => filterByType.includes(category.type));
      } else {
        filtered = filtered.filter(category => category.type === filterByType);
      }
    }

    return filtered;
  }, [allCategories, filterByType, includeInactive]);

  // Convenience function to get category by ID
  const getCategoryById = useMemo(() => {
    return (id: string) => {
      if (!allCategories || !Array.isArray(allCategories)) {
        return undefined;
      }
      return allCategories.find(category => category.id === id);
    };
  }, [allCategories]);

  // Convenience function to get categories by type
  const getCategoriesByType = useMemo(() => {
    return (type: CategoryType) => categories.filter(category => category.type === type);
  }, [categories]);

  // Group categories by type
  const groupedCategories = useMemo(() => {
    return categories.reduce((acc, category) => {
      const type = category.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(category);
      return acc;
    }, {} as Record<CategoryType, Category[]>);
  }, [categories]);

  return {
    categories,
    loading,
    error: error ? 'Failed to load categories' : null,
    refetch,
    getCategoryById,
    getCategoriesByType,
    groupedCategories,
  };
}

// Specialized hooks for common use cases
export function useExpenseCategories() {
  return useCategories({
    filterByType: 'expense'
  });
}

export function useIncomeCategories() {
  return useCategories({
    filterByType: 'income'
  });
}

export function useInvestmentCategories() {
  return useCategories({
    filterByType: 'investment'
  });
}

export function useActiveCategories() {
  return useCategories({
    includeInactive: false
  });
}