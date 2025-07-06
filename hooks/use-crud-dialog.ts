'use client';

import { useState, useCallback, useEffect } from 'react';
import { useApiMutation, useApiData } from './use-api-data';
import { DeleteDialogState } from '@/types/common';

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

  // Delete dialog state for complex delete operations
  const [deleteDialogState, setDeleteDialogState] = useState<DeleteDialogState<T>>({
    item: null,
    reassignOptions: [],
    selectedReassignId: '',
    hasTransactions: false,
    checkingTransactions: false,
  });

  // API call to check transactions when delete dialog opens
  const transactionCheckUrl = deleteDialogState.item && checkTransactionsEndpoint 
    ? checkTransactionsEndpoint(deleteDialogState.item.id)
    : null;
  
  const { data: transactionCheckData, loading: checkingTransactions } = useApiData(
    transactionCheckUrl,
    { enabled: !!transactionCheckUrl }
  );

  // Update delete dialog state when transaction check completes
  useEffect(() => {
    if (deleteDialogState.item && !checkingTransactions && transactionCheckData !== undefined) {
      const hasTransactions = transactionCheckData?.transactions?.length > 0;
      setDeleteDialogState(prev => ({
        ...prev,
        hasTransactions,
        checkingTransactions: false,
      }));
    }
  }, [transactionCheckData, checkingTransactions, deleteDialogState.item]);

  // Update checking state when loading starts
  useEffect(() => {
    setDeleteDialogState(prev => ({
      ...prev,
      checkingTransactions,
    }));
  }, [checkingTransactions]);


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

  const openDeleteDialog = useCallback((item: T, reassignOptions: T[] = []) => {
    setDialogState(prev => ({ ...prev, isDeleteOpen: true, deletingItem: item }));
    setDeleteDialogState({
      item,
      reassignOptions,
      selectedReassignId: '',
      hasTransactions: false,
      checkingTransactions: !!checkTransactionsEndpoint,
    });
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

  // Delete dialog functions
  const setSelectedReassignId = useCallback((reassignId: string) => {
    setDeleteDialogState(prev => ({
      ...prev,
      selectedReassignId: reassignId,
    }));
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
    if (!dialogState.deletingItem) return;

    const payload: any = {
      [`${entityName.toLowerCase()}_id`]: dialogState.deletingItem.id,
    };

    // Include reassignment information if needed
    if (deleteDialogState.hasTransactions && deleteDialogState.selectedReassignId) {
      payload.reassign_to_id = deleteDialogState.selectedReassignId;
    }

    return deleteMutation.mutate(payload);
  }, [deleteMutation, dialogState.deletingItem, entityName, deleteDialogState.hasTransactions, deleteDialogState.selectedReassignId]);

  return {
    // Dialog states
    isAddOpen: dialogState.isAddOpen,
    isEditOpen: dialogState.isEditOpen,
    isDeleteOpen: dialogState.isDeleteOpen,
    editingItem: dialogState.editingItem,
    deleteItem: dialogState.deletingItem,

    // Delete dialog state
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