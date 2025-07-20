'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
  const { item, reassignOptions, selectedReassignId, hasTransactions, checkingTransactions } = deleteState;

  const canDelete = !checkingTransactions && 
    (!hasTransactions || 
     (hasTransactions && reassignOptions.length > 0 && selectedReassignId) ||
     (hasTransactions && reassignOptions.length === 0));

  const shouldShowReassignment = !checkingTransactions && hasTransactions && reassignOptions.length > 0;
  const shouldShowNoOptions = !checkingTransactions && hasTransactions && reassignOptions.length === 0;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className={`${
          isMobile
            ? "h-auto w-full rounded-t-lg"
            : "h-auto w-[500px] max-w-[90vw]"
        } flex flex-col p-0`}
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>Delete Category</SheetTitle>
          <SheetDescription>
            Are you sure you want to delete &quot;{item?.name}&quot;?
          </SheetDescription>
        </SheetHeader>
        
        <div className={isMobile ? "p-3" : "p-6"}>
          <div className="space-y-4">
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
          
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
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
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}