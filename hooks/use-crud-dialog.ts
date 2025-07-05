'use client';

import { useState, useCallback } from 'react';
import { useApiMutation } from './use-api-data';

interface CrudDialogState<T> {
  isAddOpen: boolean;
  isEditOpen: boolean;
  isDeleteOpen: boolean;
  editingItem: T | null;
  deletingItem: T | null;
}

interface CrudDialogOptions {
  entityName: string;
  onRefresh?: () => void;
  deleteEndpoint?: string;
  checkTransactionsEndpoint?: (id: string) => string;
}

interface DeleteDialogState<T> {
  item: T | null;
  reassignOptions: T[];
  selectedReassignId: string;
  hasTransactions: boolean;
  checkingTransactions: boolean;
}

export function useCrudDialog<T extends { id: string; name: string }>(
  endpoint: string,
  options: CrudDialogOptions
) {
  const { entityName, onRefresh, deleteEndpoint, checkTransactionsEndpoint } = options;

  // Dialog states
  const [dialogState, setDialogState] = useState<CrudDialogState<T>>({
    isAddOpen: false,
    isEditOpen: false,
    isDeleteOpen: false,
    editingItem: null,
    deletingItem: null,
  });

  const [deleteDialogState, setDeleteDialogState] = useState<DeleteDialogState<T>>({
    item: null,
    reassignOptions: [],
    selectedReassignId: '',
    hasTransactions: false,
    checkingTransactions: false,
  });

  // API mutations
  const createMutation = useApiMutation(endpoint, 'POST', {
    successMessage: `${entityName} created successfully`,
    onSuccess: () => {
      closeAddDialog();
      if (onRefresh) onRefresh();
    }
  });

  const updateMutation = useApiMutation(endpoint, 'PUT', {
    successMessage: `${entityName} updated successfully`,
    onSuccess: () => {
      closeEditDialog();
      if (onRefresh) onRefresh();
    }
  });

  const deleteMutation = useApiMutation(deleteEndpoint || endpoint, 'DELETE', {
    successMessage: `${entityName} deleted successfully`,
    onSuccess: () => {
      closeDeleteDialog();
      if (onRefresh) onRefresh();
    }
  });

  // Dialog actions
  const openAddDialog = useCallback(() => {
    setDialogState(prev => ({ ...prev, isAddOpen: true }));
  }, []);

  const closeAddDialog = useCallback(() => {
    setDialogState(prev => ({ 
      ...prev, 
      isAddOpen: false, 
      editingItem: null 
    }));
  }, []);

  const openEditDialog = useCallback((item: T) => {
    setDialogState(prev => ({ 
      ...prev, 
      isEditOpen: true, 
      editingItem: item 
    }));
  }, []);

  const closeEditDialog = useCallback(() => {
    setDialogState(prev => ({ 
      ...prev, 
      isEditOpen: false, 
      editingItem: null 
    }));
  }, []);

  const openDeleteDialog = useCallback(async (item: T, allItems: T[] = []) => {
    setDialogState(prev => ({ ...prev, isDeleteOpen: true, deletingItem: item }));
    
    // Filter out the item being deleted for reassignment options
    const reassignOptions = allItems.filter(i => i.id !== item.id);
    
    setDeleteDialogState({
      item,
      reassignOptions,
      selectedReassignId: '',
      hasTransactions: false,
      checkingTransactions: true,
    });

    // Check for transactions if endpoint is provided
    if (checkTransactionsEndpoint) {
      try {
        const response = await fetch(checkTransactionsEndpoint(item.id));
        if (response.ok) {
          const data = await response.json();
          const hasTransactions = data.data && 
            data.data.transactions && 
            data.data.transactions.length > 0;
          
          setDeleteDialogState(prev => ({
            ...prev,
            hasTransactions,
            checkingTransactions: false,
          }));
        } else {
          throw new Error('Failed to check transactions');
        }
      } catch (error) {
        console.error('Error checking transactions:', error);
        // Assume there might be transactions for safety
        setDeleteDialogState(prev => ({
          ...prev,
          hasTransactions: true,
          checkingTransactions: false,
        }));
      }
    } else {
      setDeleteDialogState(prev => ({
        ...prev,
        checkingTransactions: false,
      }));
    }
  }, [checkTransactionsEndpoint]);

  const closeDeleteDialog = useCallback(() => {
    setDialogState(prev => ({ 
      ...prev, 
      isDeleteOpen: false, 
      deletingItem: null 
    }));
    setDeleteDialogState({
      item: null,
      reassignOptions: [],
      selectedReassignId: '',
      hasTransactions: false,
      checkingTransactions: false,
    });
  }, []);

  const setSelectedReassignId = useCallback((id: string) => {
    setDeleteDialogState(prev => ({ ...prev, selectedReassignId: id }));
  }, []);

  // CRUD operations
  const handleCreate = useCallback((data: any) => {
    return createMutation.mutate(data);
  }, [createMutation]);

  const handleUpdate = useCallback((data: any) => {
    if (!dialogState.editingItem) return;
    
    const payload = {
      [`${entityName.toLowerCase()}_id`]: dialogState.editingItem.id,
      ...data
    };
    
    return updateMutation.mutate(payload);
  }, [updateMutation, dialogState.editingItem, entityName]);

  const handleDelete = useCallback(() => {
    if (!deleteDialogState.item) return;

    const payload: any = {
      [`${entityName.toLowerCase()}_id`]: deleteDialogState.item.id,
    };

    if (deleteDialogState.selectedReassignId) {
      payload[`new_${entityName.toLowerCase()}_id`] = deleteDialogState.selectedReassignId;
    }

    return deleteMutation.mutate(payload);
  }, [deleteMutation, deleteDialogState, entityName]);

  return {
    // Dialog states
    isAddOpen: dialogState.isAddOpen,
    isEditOpen: dialogState.isEditOpen,
    isDeleteOpen: dialogState.isDeleteOpen,
    editingItem: dialogState.editingItem,
    deletingItem: dialogState.deletingItem,

    // Delete dialog specific state
    deleteDialogState,
    setSelectedReassignId,

    // Dialog actions
    openAddDialog,
    closeAddDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,

    // CRUD operations
    handleCreate,
    handleUpdate,
    handleDelete,

    // Loading states
    isCreating: createMutation.loading,
    isUpdating: updateMutation.loading,
    isDeleting: deleteMutation.loading,

    // For backward compatibility
    formLoading: createMutation.loading || updateMutation.loading || deleteMutation.loading,
  };
}