"use client"

import { Trash2, Loader2 } from "lucide-react"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useTransactionMutations } from "@/hooks/use-transaction-mutations"
import { formatTransactionAmount } from "@/lib/currency-utils"
import { TRANSACTION_TYPE_CONFIG, DATE_FORMATS, CURRENCY_DEFAULTS } from "@/lib/constants"
import type { TransactionWithRelations } from "@/types/common"

interface DeleteTransactionDialogProps {
  transaction: TransactionWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  currency?: string
}


export function DeleteTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onSuccess,
  currency = CURRENCY_DEFAULTS.DEFAULT_CURRENCY,
}: DeleteTransactionDialogProps) {
  // Use centralized transaction mutations hook
  const { deleteTransaction, isLoading: isDeleting, error, clearErrors } = useTransactionMutations({
    onSuccess: () => {
      onSuccess?.()
      onOpenChange(false)
    },
  })

  if (!transaction) return null

  const config = TRANSACTION_TYPE_CONFIG[transaction.type]

  const getTransactionDisplay = () => {
    switch (transaction.type) {
      case "income":
      case "expense":
        return {
          primaryText: transaction.categories?.name || "Unknown Category",
          secondaryText: transaction.accounts?.name || "Unknown Account",
          icon: transaction.categories?.icon,
        }
      case "transfer":
        return {
          primaryText: `${transaction.from_accounts?.name} → ${transaction.to_accounts?.name}`,
          secondaryText: transaction.investment_categories?.name || "Transfer",
          icon: transaction.investment_categories?.icon,
        }
      default:
        return {
          primaryText: "Unknown Transaction",
          secondaryText: "",
          icon: undefined,
        }
    }
  }

  const display = getTransactionDisplay()

  const handleDelete = async () => {
    clearErrors()
    await deleteTransaction(transaction.id)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <Trash2 className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the transaction
                and reverse its effects on account balances.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Transaction Preview */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {display.icon && (
                  <span className="text-sm">{display.icon}</span>
                )}
                <Badge variant="secondary" className={config.badge}>
                  {config.label}
                </Badge>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {display.primaryText}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {display.secondaryText}
                </p>
                {transaction.description && (
                  <p className="text-sm text-gray-500 truncate">
                    {transaction.description}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  {format(new Date(transaction.transaction_date), DATE_FORMATS.DISPLAY)}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {formatTransactionAmount(transaction.amount, transaction.type, currency)}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Transaction
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}