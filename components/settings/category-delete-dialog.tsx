'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Category, DeleteDialogState } from '@/types/common';

interface CategoryDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  deleteState: DeleteDialogState<Category>;
  onReassignChange: (categoryId: string) => void;
  onConfirm: () => void;
  loading: boolean;
}

export function CategoryDeleteDialog({
  isOpen,
  onOpenChange,
  deleteState,
  onReassignChange,
  onConfirm,
  loading
}: CategoryDeleteDialogProps) {
  const { item, reassignOptions, selectedReassignId, hasTransactions, checkingTransactions } = deleteState;

  const canDelete = !checkingTransactions && 
    (!hasTransactions || 
     (hasTransactions && reassignOptions.length > 0 && selectedReassignId) ||
     (hasTransactions && reassignOptions.length === 0));

  const shouldShowReassignment = !checkingTransactions && hasTransactions && reassignOptions.length > 0;
  const shouldShowNoOptions = !checkingTransactions && hasTransactions && reassignOptions.length === 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{item?.name}&quot;?
          </AlertDialogDescription>
          
          <div className="space-y-4 mt-4">
            {checkingTransactions && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking for existing transactions...
              </div>
            )}
            
            {shouldShowReassignment && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-orange-600">
                  This category has existing transactions. Select a category to reassign them to:
                </div>
                <Select 
                  value={selectedReassignId} 
                  onValueChange={onReassignChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category for reassignment" />
                  </SelectTrigger>
                  <SelectContent>
                    {reassignOptions.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {shouldShowNoOptions && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="text-sm text-red-600">
                  Cannot delete this category because it has existing transactions and there are no other categories of the same type to reassign them to. Please create another category first.
                </div>
              </div>
            )}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            disabled={loading || !canDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Category'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}