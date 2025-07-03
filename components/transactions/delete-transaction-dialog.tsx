"use client"

import { useState } from "react"
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

interface Transaction {
  id: string
  type: "income" | "expense" | "transfer"
  amount: number
  description?: string
  transaction_date: string
  
  // For income/expense
  accounts?: {
    id: string
    name: string
    type: "bank_account" | "credit_card" | "investment_account"
  }
  categories?: {
    id: string
    name: string
    type: "expense" | "income" | "investment"
    icon?: string
  }
  
  // For transfers
  from_accounts?: {
    id: string
    name: string
    type: "bank_account" | "credit_card" | "investment_account"
  }
  to_accounts?: {
    id: string
    name: string
    type: "bank_account" | "credit_card" | "investment_account"
  }
  investment_categories?: {
    id: string
    name: string
    type: "investment"
    icon?: string
  }
}

interface DeleteTransactionDialogProps {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

const transactionTypeConfig = {
  income: {
    color: "bg-green-100 text-green-800",
    label: "Income",
  },
  expense: {
    color: "bg-red-100 text-red-800", 
    label: "Expense",
  },
  transfer: {
    color: "bg-blue-100 text-blue-800",
    label: "Transfer",
  },
}

export function DeleteTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onSuccess,
}: DeleteTransactionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!transaction) return null

  const config = transactionTypeConfig[transaction.type]

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
    try {
      setIsDeleting(true)
      setError(null)

      const response = await fetch("/api/transactions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_id: transaction.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete transaction")
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      console.error("Error deleting transaction:", err)
      setError(err instanceof Error ? err.message : "Failed to delete transaction")
    } finally {
      setIsDeleting(false)
    }
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
                <Badge variant="secondary" className={config.color}>
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
                  {format(new Date(transaction.transaction_date), "MMM dd, yyyy")}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {formatCurrency(transaction.amount)}
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