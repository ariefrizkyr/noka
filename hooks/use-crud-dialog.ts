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
}

export function useCrudDialog<T extends { id: string; name: string }>(
  endpoint: string,
  options: CrudDialogOptions
) {
  const { entityName, onRefresh, deleteEndpoint } = options;

  // Dialog states
  const [dialogState, setDialogState] = useState<CrudDialogState<T>>({
    isAddOpen: false,
    isEditOpen: false,
    isDeleteOpen: false,
    editingItem: null,
    deletingItem: null,
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

  const openDeleteDialog = useCallback((item: T) => {
    setDialogState(prev => ({ ...prev, isDeleteOpen: true, deletingItem: item }));
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDialogState(prev => ({ 
      ...prev, 
      isDeleteOpen: false, 
      deletingItem: null 
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

    const payload = {
      [`${entityName.toLowerCase()}_id`]: dialogState.deletingItem.id,
    };

    return deleteMutation.mutate(payload);
  }, [deleteMutation, dialogState.deletingItem, entityName]);

  return {
    // Dialog states
    isAddOpen: dialogState.isAddOpen,
    isEditOpen: dialogState.isEditOpen,
    isDeleteOpen: dialogState.isDeleteOpen,
    editingItem: dialogState.editingItem,
    deleteItem: dialogState.deletingItem,

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