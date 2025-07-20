'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Account } from '@/types/common';

interface AccountDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  onConfirm: () => void;
  loading: boolean;
}

export function AccountDeleteDialog({
  isOpen,
  onOpenChange,
  account,
  onConfirm,
  loading
}: AccountDeleteDialogProps) {
  const isMobile = useIsMobile();
  
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
          <SheetTitle>Delete Account</SheetTitle>
          <SheetDescription>
            Are you sure you want to delete &quot;{account?.name}&quot;?
          </SheetDescription>
        </SheetHeader>
        
        <div className={isMobile ? "p-3" : "p-6"}>
          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="text-sm text-yellow-700">
                This account will be deactivated. Any existing transactions will remain unchanged and continue to reference this account for historical accuracy.
              </div>
            </div>
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
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}