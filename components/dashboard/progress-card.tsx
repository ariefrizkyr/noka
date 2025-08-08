"use client";

import { formatCurrency } from "@/lib/currency-utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  icon?: string;
  currentAmount: number;
  targetAmount: number;
  percentage: number;
  currency?: string;
  className?: string;
  type?: "budget" | "investment";
  isShared?: boolean;
  familyName?: string;
}

export function ProgressCard({
  title,
  icon,
  currentAmount,
  targetAmount,
  percentage,
  currency = "IDR",
  className,
  type = "budget",
  isShared = false,
  familyName,
}: ProgressCardProps) {
  // Get status badge
  const getStatusBadge = () => {
    if (type === "budget") {
      if (percentage <= 50)
        return {
          className: "bg-green-50 text-green-600" as const,
        };
      if (percentage <= 75)
        return {
          className: "bg-yellow-50 text-yellow-600" as const,
        };
      if (percentage <= 100)
        return {
          className: "bg-red-50 text-red-600" as const,
        };
      return {
        className: "bg-red-50 text-red-600" as const,
      };
    } else {
      if (percentage >= 100)
        return { className: "bg-green-50 text-green-600" as const };
      if (percentage >= 50)
        return { className: "bg-yellow-50 text-yellow-600" as const };
      return { className: "bg-red-50 text-red-600" as const };
    }
  };

  const remainingAmount = targetAmount - currentAmount;
  const statusBadge = getStatusBadge();

  return (
    <div className={className}>
      <div className="flex flex-row p-2">
        <div className="flex w-2/6 items-start justify-start">
          <div className="text-left">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-md mr-1">{icon}</span>
              <span className="text-xs font-medium text-gray-800 sm:text-sm">
                {title}
              </span>
              {isShared && (
                <Badge
                  variant="outline"
                  className="border-blue-300 bg-blue-50 text-xs text-blue-700 px-1 py-0"
                >
                  Shared
                </Badge>
              )}
            </div>
            {isShared && familyName && (
              <div className="text-xs text-blue-600">
                Family: {familyName}
              </div>
            )}
          </div>
        </div>

        <div className="flex w-2/6 items-start justify-end">
          <div className="text-right">
            <span className="text-xs font-medium whitespace-nowrap text-gray-800 sm:text-sm">
              {formatCurrency(targetAmount, { currency })}
            </span>
          </div>
        </div>

        <div className="flex w-2/6 items-start justify-end">
          <div className="text-right">
            <Badge className={cn(statusBadge.className, "text-xs sm:text-sm")}>
              {type === "budget"
                ? formatCurrency(remainingAmount, { currency })
                : formatCurrency(currentAmount, { currency })}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
