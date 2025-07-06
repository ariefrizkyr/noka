/**
 * Custom hook for transaction CRUD operations
 * Centralizes create, update, delete operations with loading states
 */

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import type { TransactionWithRelations, TransactionFormData } from '@/types/common';

interface CreateTransactionData {
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  transaction_date: Date;
  description?: string;
  account_id?: string;
  category_id?: string;
  from_account_id?: string;
  to_account_id?: string;
  investment_category_id?: string;
}

interface UpdateTransactionData extends CreateTransactionData {
  transaction_id: string;
}

interface DeleteTransactionData {
  transaction_id: string;
}

interface UseTransactionMutationsOptions {
  onSuccess?: (transaction?: any) => void;
  onError?: (error: string) => void;
}

interface UseTransactionMutationsReturn {
  // Create
  createTransaction: (data: CreateTransactionData) => Promise<TransactionWithRelations | null>;
  isCreating: boolean;
  createError: string | null;
  
  // Update
  updateTransaction: (data: UpdateTransactionData) => Promise<TransactionWithRelations | null>;
  isUpdating: boolean;
  updateError: string | null;
  
  // Delete
  deleteTransaction: (data: DeleteTransactionData) => Promise<boolean>;
  isDeleting: boolean;
  deleteError: string | null;
  
  // Combined states
  isLoading: boolean;
  error: string | null;
  clearErrors: () => void;
}

export function useTransactionMutations(
  options: UseTransactionMutationsOptions = {}
): UseTransactionMutationsReturn {
  const { onSuccess, onError } = options;

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Error states
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Create transaction
  const createTransaction = useCallback(async (data: CreateTransactionData) => {
    try {
      setIsCreating(true);
      setCreateError(null);

      // Format the data for API
      const payload = {
        type: data.type,
        amount: data.amount,
        transaction_date: format(data.transaction_date, 'yyyy-MM-dd'),
        ...(data.description && { description: data.description }),
        ...(data.account_id && { account_id: data.account_id }),
        ...(data.category_id && { category_id: data.category_id }),
        ...(data.from_account_id && { from_account_id: data.from_account_id }),
        ...(data.to_account_id && { to_account_id: data.to_account_id }),
        ...(data.investment_category_id && { investment_category_id: data.investment_category_id }),
      };

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create transaction');
      }

      const result = await response.json();
      onSuccess?.(result.data);
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create transaction';
      setCreateError(errorMessage);
      onError?.(errorMessage);
      console.error('Error creating transaction:', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [onSuccess, onError]);

  // Update transaction
  const updateTransaction = useCallback(async (data: UpdateTransactionData) => {
    try {
      setIsUpdating(true);
      setUpdateError(null);

      // Format the data for API
      const { transaction_id, ...updateData } = data;
      const payload = {
        transaction_id,
        type: updateData.type,
        amount: updateData.amount,
        transaction_date: format(updateData.transaction_date, 'yyyy-MM-dd'),
        ...(updateData.description && { description: updateData.description }),
        ...(updateData.account_id && { account_id: updateData.account_id }),
        ...(updateData.category_id && { category_id: updateData.category_id }),
        ...(updateData.from_account_id && { from_account_id: updateData.from_account_id }),
        ...(updateData.to_account_id && { to_account_id: updateData.to_account_id }),
        ...(updateData.investment_category_id && { investment_category_id: updateData.investment_category_id }),
      };

      const response = await fetch('/api/transactions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update transaction');
      }

      const result = await response.json();
      onSuccess?.(result.data);
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update transaction';
      setUpdateError(errorMessage);
      onError?.(errorMessage);
      console.error('Error updating transaction:', err);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [onSuccess, onError]);

  // Delete transaction
  const deleteTransaction = useCallback(async (data: DeleteTransactionData) => {
    try {
      setIsDeleting(true);
      setDeleteError(null);

      const response = await fetch('/api/transactions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: data.transaction_id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete transaction');
      }

      onSuccess?.();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
      setDeleteError(errorMessage);
      onError?.(errorMessage);
      console.error('Error deleting transaction:', err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [onSuccess, onError]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setCreateError(null);
    setUpdateError(null);
    setDeleteError(null);
  }, []);

  // Combined states
  const isLoading = isCreating || isUpdating || isDeleting;
  const error = createError || updateError || deleteError;

  return {
    // Create
    createTransaction,
    isCreating,
    createError,
    
    // Update
    updateTransaction,
    isUpdating,
    updateError,
    
    // Delete
    deleteTransaction,
    isDeleting,
    deleteError,
    
    // Combined states
    isLoading,
    error,
    clearErrors,
  };
}

// Helper hook that combines transaction mutations with form data transformation
export function useTransactionForm(options: UseTransactionMutationsOptions = {}) {
  const mutations = useTransactionMutations(options);

  const submitTransaction = useCallback(async (
    formData: TransactionFormData,
    mode: 'create' | 'edit' = 'create',
    transactionId?: string
  ) => {
    const data = {
      type: formData.type,
      amount: parseFloat(formData.amount.toString()),
      transaction_date: formData.transaction_date,
      description: formData.description,
      account_id: formData.account_id,
      category_id: formData.category_id,
      from_account_id: formData.from_account_id,
      to_account_id: formData.to_account_id,
      investment_category_id: formData.investment_category_id,
    };

    if (mode === 'edit' && transactionId) {
      return mutations.updateTransaction({
        ...data,
        transaction_id: transactionId,
      });
    } else {
      return mutations.createTransaction(data);
    }
  }, [mutations]);

  return {
    ...mutations,
    submitTransaction,
  };
}