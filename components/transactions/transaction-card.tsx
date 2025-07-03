"use client"

import { format } from "date-fns"
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, MoreVertical, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Transaction {
  id: string
  type: "income" | "expense" | "transfer"
  amount: number
  description?: string
  transaction_date: string
  created_at: string
  updated_at: string
  
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

interface TransactionCardProps {
  transaction: Transaction
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
  className?: string
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
    icon: ArrowUpRight,
    color: "text-green-600",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    badge: "bg-green-100 text-green-800",
  },
  expense: {
    icon: ArrowDownLeft,
    color: "text-red-600",
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    badge: "bg-red-100 text-red-800",
  },
  transfer: {
    icon: ArrowLeftRight,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    badge: "bg-blue-100 text-blue-800",
  },
}

const accountTypeLabels = {
  bank_account: "Bank",
  credit_card: "Credit Card",
  investment_account: "Investment",
}

export function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  className,
}: TransactionCardProps) {
  const config = transactionTypeConfig[transaction.type]
  const Icon = config.icon

  const getTransactionDisplay = () => {
    switch (transaction.type) {
      case "income":
      case "expense":
        return {
          primaryText: transaction.categories?.name || "Unknown Category",
          secondaryText: transaction.accounts?.name || "Unknown Account",
          icon: transaction.categories?.icon,
          accountType: transaction.accounts?.type,
        }
      case "transfer":
        return {
          primaryText: `${transaction.from_accounts?.name} → ${transaction.to_accounts?.name}`,
          secondaryText: transaction.investment_categories?.name || "Transfer",
          icon: transaction.investment_categories?.icon,
          accountType: undefined,
        }
      default:
        return {
          primaryText: "Unknown Transaction",
          secondaryText: "",
          icon: undefined,
          accountType: undefined,
        }
    }
  }

  const display = getTransactionDisplay()
  const showActions = onEdit || onDelete

  return (
    <Card className={cn("transition-colors hover:bg-gray-50", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Icon and details */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Transaction type icon */}
            <div className={cn("p-2 rounded-full", config.bgColor)}>
              <Icon className={cn("h-4 w-4", config.iconColor)} />
            </div>

            {/* Transaction details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {display.icon && (
                  <span className="text-sm">{display.icon}</span>
                )}
                <p className="font-medium text-gray-900 truncate">
                  {display.primaryText}
                </p>
                <Badge variant="secondary" className={cn("text-xs ml-auto", config.badge)}>
                  {transaction.type}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="truncate">{display.secondaryText}</span>
                {display.accountType && (
                  <>
                    <span>•</span>
                    <span className="text-xs">
                      {accountTypeLabels[display.accountType]}
                    </span>
                  </>
                )}
              </div>
              
              {transaction.description && (
                <p className="text-sm text-gray-500 truncate mt-1">
                  {transaction.description}
                </p>
              )}
              
              <p className="text-xs text-gray-400 mt-1">
                {format(new Date(transaction.transaction_date), "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          {/* Right side - Amount and actions */}
          <div className="flex items-center gap-2 ml-4">
            <div className="text-right">
              <p className={cn("font-semibold", config.color)}>
                {transaction.type === "expense" ? "-" : "+"}
                {formatCurrency(transaction.amount)}
              </p>
            </div>

            {/* Actions menu */}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={() => onEdit(transaction)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(transaction)}
                      className="cursor-pointer text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}