"use client";

import { format } from "date-fns";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const config = TRANSACTION_TYPE_CONFIG[transaction.type];
  const Icon = config.icon;

  const getTransactionDisplay = () => {
    switch (transaction.type) {
      case "income":
      case "expense":
        return {
          primaryText: transaction.categories?.name || "Unknown Category",
          secondaryText: transaction.accounts?.name || "Unknown Account",
          icon: transaction.categories?.icon,
          accountType: transaction.accounts?.type,
        };
      case "transfer":
        return {
          primaryText: `${transaction.from_accounts?.name} → ${transaction.to_accounts?.name}`,
          secondaryText: transaction.investment_categories?.name || "Transfer",
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
  const showActions = onEdit || onDelete;

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
  );
}
