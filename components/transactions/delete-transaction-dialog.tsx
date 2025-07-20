"use client";

import { Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTransactionMutations } from "@/hooks/use-transaction-mutations";
import { formatTransactionAmount } from "@/lib/currency-utils";
import {
  TRANSACTION_TYPE_CONFIG,
  DATE_FORMATS,
  CURRENCY_DEFAULTS,
} from "@/lib/constants";
import type { TransactionWithRelations } from "@/types/common";

interface DeleteTransactionDialogProps {
  transaction: TransactionWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  currency?: string;
}

export function DeleteTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onSuccess,
  currency = CURRENCY_DEFAULTS.DEFAULT_CURRENCY,
}: DeleteTransactionDialogProps) {
  const isMobile = useIsMobile();

  // Use centralized transaction mutations hook
  const {
    deleteTransaction,
    isLoading: isDeleting,
    error,
    clearErrors,
  } = useTransactionMutations({
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
    },
  });

  if (!transaction) return null;

  const config = TRANSACTION_TYPE_CONFIG[transaction.type];

  const getTransactionDisplay = () => {
    switch (transaction.type) {
      case "income":
      case "expense":
        return {
          primaryText: transaction.categories?.name || "Unknown Category",
          secondaryText: transaction.accounts?.name || "Unknown Account",
          icon: transaction.categories?.icon,
        };
      case "transfer":
        return {
          primaryText: `${transaction.from_accounts?.name} → ${transaction.to_accounts?.name}`,
          secondaryText: transaction.investment_categories?.name || "Transfer",
          icon: transaction.investment_categories?.icon,
        };
      default:
        return {
          primaryText: "Unknown Transaction",
          secondaryText: "",
          icon: undefined,
        };
    }
  };

  const display = getTransactionDisplay();

  const handleDelete = async () => {
    clearErrors();
    await deleteTransaction({ transaction_id: transaction.id });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={`${
          isMobile
            ? "h-auto w-full rounded-t-lg"
            : "h-auto w-[500px] max-w-[90vw]"
        } flex flex-col p-0`}
      >
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <Trash2 className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <SheetTitle>Delete Transaction</SheetTitle>
              <SheetDescription>
                This action cannot be undone. This will permanently delete the
                transaction and reverse its effects on account balances.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className={isMobile ? "p-3" : "p-6"}>
          {/* Transaction Preview */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex items-center gap-2">
                  {display.icon && (
                    <span className="text-sm">{display.icon}</span>
                  )}
                  <Badge variant="secondary" className={config.badge}>
                    {config.label}
                  </Badge>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">
                    {display.primaryText}
                  </p>
                  <p className="truncate text-sm text-gray-500">
                    {display.secondaryText}
                  </p>
                  {transaction.description && (
                    <p className="truncate text-sm text-gray-500">
                      {transaction.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {format(
                      new Date(transaction.transaction_date),
                      DATE_FORMATS.DISPLAY,
                    )}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatTransactionAmount(
                    transaction.amount,
                    transaction.type,
                    currency,
                  )}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Transaction
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
