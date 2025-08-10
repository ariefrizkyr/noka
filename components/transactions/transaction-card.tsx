"use client";

import { format } from "date-fns";
import { MoreVertical, Edit, Trash2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTransactionAmountWithStyle } from "@/lib/currency-utils";
import {
  TRANSACTION_TYPE_CONFIG,
  ACCOUNT_TYPE_CONFIG,
  DATE_FORMATS,
  CURRENCY_DEFAULTS,
} from "@/lib/constants";
import { useTransactionPermissions } from "@/hooks/use-transaction-permissions";
import type { TransactionWithRelations } from "@/types/common";

interface TransactionCardProps {
  transaction: TransactionWithRelations;
  onEdit?: (transaction: TransactionWithRelations) => void;
  onDelete?: (transaction: TransactionWithRelations) => void;
  className?: string;
  currency?: string;
}

export function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  className,
  currency = CURRENCY_DEFAULTS.DEFAULT_CURRENCY,
}: TransactionCardProps) {
  const { user } = useAuth();
  const { canEditTransaction, canDeleteTransaction } = useTransactionPermissions();
  const config = TRANSACTION_TYPE_CONFIG[transaction.type];
  const Icon = config.icon;

  const getTransactionDisplay = () => {
    switch (transaction.type) {
      case "income":
      case "expense":
        // Enhanced category name fallback for joint account transactions
        let categoryName = "Unknown Category";
        
        if (transaction.categories?.name) {
          categoryName = transaction.categories.name;
        } else if (
          // Check if this is a joint account transaction that might have enhanced category data
          (transaction.accounts?.account_scope === 'joint' || 
           transaction.from_accounts?.account_scope === 'joint' ||
           transaction.to_accounts?.account_scope === 'joint') &&
          transaction.category_id
        ) {
          // For joint account transactions, category names should now be available
          // If still showing "Unknown Category", it might be a personal category from another user
          categoryName = "Unknown Category";
        }
        
        return {
          primaryText: categoryName,
          secondaryText: transaction.accounts?.name || "Unknown Account",
          icon: transaction.categories?.icon,
          accountType: transaction.accounts?.type,
        };
      case "transfer":
        // Enhanced investment category name fallback for joint account transactions
        let investmentCategoryName = "Transfer";
        
        if (transaction.investment_categories?.name) {
          investmentCategoryName = transaction.investment_categories.name;
        } else if (
          // Check if this is a joint account transfer that might have enhanced category data
          (transaction.from_accounts?.account_scope === 'joint' ||
           transaction.to_accounts?.account_scope === 'joint') &&
          transaction.investment_category_id
        ) {
          // For joint account transfers, investment category names should now be available
          investmentCategoryName = "Transfer";
        }
        
        return {
          primaryText: `${transaction.from_accounts?.name} → ${transaction.to_accounts?.name}`,
          secondaryText: investmentCategoryName,
          icon: transaction.investment_categories?.icon,
          accountType: undefined,
        };
      default:
        return {
          primaryText: "Unknown Transaction",
          secondaryText: "",
          icon: undefined,
          accountType: undefined,
        };
    }
  };

  const display = getTransactionDisplay();
  
  // Determine if user can perform actions based on permissions
  const userCanEdit = canEditTransaction(transaction);
  const userCanDelete = canDeleteTransaction(transaction);
  
  // Show actions only if user has permissions and handlers are provided
  const showActions = (onEdit && userCanEdit) || (onDelete && userCanDelete);

  // Show attribution only for family transactions where someone else logged the transaction
  const showAttribution = 
    transaction.logged_by_user && 
    user && 
    transaction.logged_by_user.id !== user.id &&
    (
      // Check for joint accounts (income/expense)
      transaction.accounts?.account_scope === 'joint' ||
      // Check for shared categories (income/expense) 
      transaction.categories?.is_shared ||
      // Check for joint accounts in transfers (from_account)
      transaction.from_accounts?.account_scope === 'joint' ||
      // Check for joint accounts in transfers (to_account)  
      transaction.to_accounts?.account_scope === 'joint' ||
      // Check for shared investment categories
      transaction.investment_categories?.is_shared
    );

  return (
    <Card className={cn("transition-colors hover:bg-gray-50", className)}>
      <CardContent>
        <div className="flex items-center justify-between">
          {/* Left side - Icon and details */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {/* Transaction type icon */}
            <div className={cn("rounded-full p-2", config.bgColor)}>
              <Icon className={cn("h-4 w-4", config.iconColor)} />
            </div>

            {/* Transaction details */}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                {display.icon && (
                  <span className="text-sm">{display.icon}</span>
                )}
                <p className="truncate font-medium text-gray-900">
                  {display.primaryText}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="truncate">{display.secondaryText}</span>
                {display.accountType && (
                  <>
                    <span>•</span>
                    <span className="text-xs">
                      {ACCOUNT_TYPE_CONFIG[display.accountType].shortLabel}
                    </span>
                  </>
                )}
              </div>

              {transaction.description && (
                <p className="mt-1 truncate text-sm text-gray-500">
                  {transaction.description}
                </p>
              )}

              <p className="mt-1 text-xs text-gray-400">
                {format(
                  new Date(transaction.transaction_date),
                  DATE_FORMATS.DISPLAY,
                )}
              </p>

              {/* Transaction attribution */}
              {showAttribution && (
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  <User className="h-3 w-3" />
                  <span>Logged by {transaction.logged_by_user?.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Amount and actions */}
          <div className="ml-4 flex items-center gap-2">
            <div className="text-right">
              <p
                className={cn(
                  "font-semibold",
                  formatTransactionAmountWithStyle(
                    transaction.amount,
                    transaction.type,
                    currency,
                  ).colorClass,
                )}
              >
                {
                  formatTransactionAmountWithStyle(
                    transaction.amount,
                    transaction.type,
                    currency,
                  ).formatted
                }
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
                  {onEdit && userCanEdit && (
                    <DropdownMenuItem
                      onClick={() => onEdit(transaction)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && userCanDelete && (
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
  );
}
