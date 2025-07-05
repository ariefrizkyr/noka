'use client';

import { useApiData } from './use-api-data';
import { UserSettings } from '@/types/common';

/**
 * Hook to get user currency settings
 * Fetches from /api/settings and provides currency code with fallback
 */
export function useCurrencySettings() {
  const { data: settings, loading, error } = useApiData<UserSettings>('/api/settings');
  
  return {
    currency: settings?.currency_code || 'IDR',
    loading,
    error,
    settings
  };
}