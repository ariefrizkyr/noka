'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ApiOptions {
  dependencies?: any[];
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useApiData<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const {
    dependencies = [],
    onSuccess,
    onError,
    showErrorToast = true,
    showSuccessToast = false,
    successMessage = 'Data loaded successfully'
  } = options;

  const fetchData = useCallback(async () => {
    if (!endpoint) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result.data || result);
      
      if (onSuccess) {
        onSuccess(result.data || result);
      }
      
      if (showSuccessToast) {
        toast.success(successMessage);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      
      if (onError) {
        onError(error);
      }
      
      if (showErrorToast) {
        toast.error(error.message);
      }
      
      console.error('API fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, router, onSuccess, onError, showErrorToast, showSuccessToast, successMessage]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

export function useApiMutation<TData = any, TVariables = any>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  options: ApiOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const {
    onSuccess,
    onError,
    showErrorToast = true,
    showSuccessToast = true,
    successMessage = 'Operation completed successfully'
  } = options;

  const mutate = useCallback(async (variables?: TVariables): Promise<TData | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: variables ? JSON.stringify(variables) : undefined,
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return null;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${method.toLowerCase()}`);
      }

      const result = await response.json();
      const data = result.data || result;

      if (onSuccess) {
        onSuccess(data);
      }

      if (showSuccessToast) {
        toast.success(successMessage);
      }

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);

      if (onError) {
        onError(error);
      }

      if (showErrorToast) {
        toast.error(error.message);
      }

      console.error('API mutation error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint, method, router, onSuccess, onError, showErrorToast, showSuccessToast, successMessage]);

  return {
    mutate,
    loading,
    error,
  };
}