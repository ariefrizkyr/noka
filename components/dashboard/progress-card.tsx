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
            <span className="text-md mr-1">{icon}</span>
            <span className="text-sm font-medium text-gray-800">{title}</span>
          </div>
        </div>

        <div className="flex w-2/6 items-start justify-end">
          <div className="text-right">
            <span className="text-xs font-medium whitespace-nowrap text-gray-800">
              {formatCurrency(targetAmount, { currency })}
            </span>
          </div>
        </div>

        <div className="flex w-2/6 items-start justify-end">
          <div className="text-right">
            <Badge className={cn(statusBadge.className, "text-xs")}>
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
