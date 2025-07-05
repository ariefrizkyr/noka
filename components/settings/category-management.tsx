'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Category, GroupedCategories, CategoryFormData } from '@/types/common';
import { useApiData } from '@/hooks/use-api-data';
import { useCrudDialog } from '@/hooks/use-crud-dialog';
import { formatCurrency } from '@/lib/currency-utils';
import { CategoryForm } from './category-form';
import { CategoryDeleteDialog } from './category-delete-dialog';

interface CategoryManagementProps {
  userCurrency: string;
}

export function CategoryManagement({ userCurrency }: CategoryManagementProps) {
  const { data: categoriesData, loading, refetch } = useApiData<{ grouped: GroupedCategories }>('/api/categories');
  const categories = categoriesData?.grouped;

  const {
    isAddOpen,
    isEditOpen,
    isDeleteOpen,
    editingItem,
    deleteDialogState,
    openAddDialog,
    closeAddDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    setSelectedReassignId,
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCrudDialog<Category>('/api/categories', {
    entityName: 'Category',
    onRefresh: refetch,
    checkTransactionsEndpoint: (id: string) => `/api/transactions?category_id=${id}&limit=1`,
  });

  const [addFormType, setAddFormType] = useState<'expense' | 'income' | 'investment'>('expense');

  const getCategoryTypeInfo = (type: string) => {
    switch (type) {
      case 'expense':
        return {
          label: 'Expense Categories',
          color: 'bg-red-100 text-red-800',
          description: 'Track spending and set budgets',
        };
      case 'income':
        return {
          label: 'Income Categories',
          color: 'bg-green-100 text-green-800',
          description: 'Track income sources',
        };
      case 'investment':
        return {
          label: 'Investment Categories',
          color: 'bg-blue-100 text-blue-800',
          description: 'Track investments and set targets',
        };
      default:
        return {
          label: 'Other Categories',
          color: 'bg-gray-100 text-gray-800',
          description: '',
        };
    }
  };

  const formatBudget = (amount: number | null, frequency: string | null) => {
    if (!amount || !frequency) return 'No budget set';
    
    const formatFrequency = (freq: string) => {
      switch (freq) {
        case 'weekly': return 'Weekly';
        case 'monthly': return 'Monthly';
        case 'one_time': return 'One Time';
        default: return freq;
      }
    };
    
    return `${formatCurrency(amount, { currency: userCurrency })} ${formatFrequency(frequency)}`;
  };

  const handleAddNew = (type: 'expense' | 'income' | 'investment') => {
    setAddFormType(type);
    openAddDialog();
  };

  const handleFormSubmit = async (formData: CategoryFormData) => {
    const payload = {
      name: formData.name,
      type: formData.type,
      icon: formData.icon,
      budget_amount: formData.budget_amount ? parseFloat(formData.budget_amount) : null,
      budget_frequency: formData.budget_frequency || null,
    };

    if (editingItem) {
      await handleUpdate(payload);
    } else {
      await handleCreate(payload);
    }
  };

  const getInitialFormData = (): CategoryFormData => {
    if (editingItem) {
      return {
        name: editingItem.name,
        type: editingItem.type,
        icon: editingItem.icon || '📁',
        budget_amount: editingItem.budget_amount?.toString() || '',
        budget_frequency: editingItem.budget_frequency || '',
      };
    }
    
    return {
      name: '',
      type: addFormType,
      icon: '📁',
      budget_amount: '',
      budget_frequency: '',
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const categoryTypes = ['expense', 'income', 'investment'] as const;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Organize your transactions with custom categories. Set budgets for expenses and targets for investments.
        </p>
      </div>

      {categoryTypes.map((type) => {
        const typeInfo = getCategoryTypeInfo(type);
        const typeCategories = categories?.[type] || [];

        return (
          <Card key={type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge className={typeInfo.color}>
                  {typeInfo.label}
                </Badge>
                <span className="text-sm font-normal text-gray-500">
                  ({typeCategories.length} categories)
                </span>
              </CardTitle>
              <Button 
                size="sm" 
                onClick={() => handleAddNew(type)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New
              </Button>
            </CardHeader>
            <CardContent>
              {typeCategories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-3">📁</div>
                  <p>No {typeInfo.label.toLowerCase()} found.</p>
                  <p className="text-sm mb-3">{typeInfo.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => handleAddNew(type)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First {typeInfo.label.slice(0, -11)}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {typeCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{category.icon || '📁'}</div>
                        <div>
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-sm text-gray-500">
                            {formatBudget(category.budget_amount, category.budget_frequency)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openDeleteDialog(category, typeCategories)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Add Category Dialog */}
      <Dialog open={isAddOpen} onOpenChange={closeAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            data={getInitialFormData()}
            loading={isCreating}
            onSubmit={handleFormSubmit}
            onCancel={closeAddDialog}
            userCurrency={userCurrency}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditOpen} onOpenChange={closeEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            data={getInitialFormData()}
            loading={isUpdating}
            onSubmit={handleFormSubmit}
            onCancel={closeEditDialog}
            isEdit={true}
            userCurrency={userCurrency}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <CategoryDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={closeDeleteDialog}
        deleteState={deleteDialogState}
        onReassignChange={setSelectedReassignId}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
}