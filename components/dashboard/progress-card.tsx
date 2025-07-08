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
  frequency?: "weekly" | "monthly" | "one_time";
  currency?: string;
  className?: string;
  type?: "budget" | "investment";
  period?: {
    start: string;
    end: string;
  };
}

export function ProgressCard({
  title,
  icon,
  currentAmount,
  targetAmount,
  percentage,
  frequency = "monthly",
  currency = "IDR",
  className,
  type = "budget",
  period,
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

  // Get frequency display
  const getFrequencyDisplay = () => {
    switch (frequency) {
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "one_time":
        return "One-time Goal";
      default:
        return "";
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
    // <Card className={cn("relative overflow-hidden", className)}>
    //   <CardHeader className="pb-3">
    //     <div className="flex items-center justify-between">
    //       <div className="flex items-center gap-2">
    //         {icon && <span className="text-lg">{icon}</span>}
    //         <CardTitle className="text-sm font-medium text-gray-900">
    //           {title}
    //         </CardTitle>
    //       </div>
    //       <Badge variant={statusBadge.variant} className="text-xs">
    //         {statusBadge.text}
    //       </Badge>
    //     </div>
    //     {frequency !== "one_time" && (
    //       <p className="text-xs text-gray-500">{getFrequencyDisplay()}</p>
    //     )}
    //   </CardHeader>

    //   <CardContent className="space-y-4">
    //     {/* Progress Bar */}
    //     <div className="space-y-2">
    //       <div className="flex items-center justify-between text-xs text-gray-600">
    //         <span>Progress</span>
    //         <span>{Math.min(percentage, 100).toFixed(1)}%</span>
    //       </div>
    //       <div className="relative">
    //         <Progress value={Math.min(percentage, 100)} className="h-2" />
    //         {percentage > 100 && (
    //           <div
    //             className="absolute top-0 left-0 h-2 rounded-full bg-red-500 opacity-50"
    //             style={{ width: `${Math.min(percentage - 100, 100)}%` }}
    //           />
    //         )}
    //       </div>
    //     </div>

    //     {/* Amount Details */}
    //     <div className="space-y-2">
    //       <div className="flex items-center justify-between">
    //         <span className="text-sm text-gray-600">
    //           {type === "budget" ? "Spent" : "Invested"}
    //         </span>
    //         <span className="text-sm font-medium">
    //           {formatCurrency(currentAmount, { currency })}
    //         </span>
    //       </div>

    //       <div className="flex items-center justify-between">
    //         <span className="text-sm text-gray-600">
    //           {type === "budget" ? "Budget" : "Target"}
    //         </span>
    //         <span className="text-sm font-medium">
    //           {formatCurrency(targetAmount, { currency })}
    //         </span>
    //       </div>

    //       <div className="flex items-center justify-between border-t pt-2">
    //         <span className="text-sm font-medium text-gray-900">
    //           {type === "budget" ? "Remaining" : "To Go"}
    //         </span>
    //         <span
    //           className={cn(
    //             "text-sm font-bold",
    //             type === "budget"
    //               ? remainingAmount >= 0
    //                 ? "text-green-600"
    //                 : "text-red-600"
    //               : "text-blue-600",
    //           )}
    //         >
    //           {type === "budget" && remainingAmount < 0 ? "-" : ""}
    //           {formatCurrency(Math.abs(remainingAmount), { currency })}
    //         </span>
    //       </div>
    //     </div>

    //     {/* Period Information */}
    //     {period && frequency !== "one_time" && (
    //       <div className="border-t pt-2 text-xs text-gray-500">
    //         Period: {new Date(period.start).toLocaleDateString()} -{" "}
    //         {new Date(period.end).toLocaleDateString()}
    //       </div>
    //     )}

    //     {/* Special indicators */}
    //     {type === "budget" && percentage > 100 && (
    //       <div className="rounded-md border border-red-200 bg-red-50 p-2">
    //         <p className="text-xs text-red-800">
    //           Over budget by{" "}
    //           {formatCurrency(Math.abs(remainingAmount), { currency })}
    //         </p>
    //       </div>
    //     )}

    //     {type === "investment" && percentage >= 100 && (
    //       <div className="rounded-md border border-green-200 bg-green-50 p-2">
    //         <p className="text-xs text-green-800">
    //           🎉 Goal achieved!{" "}
    //           {frequency === "one_time"
    //             ? "Target completed"
    //             : "Monthly target reached"}
    //         </p>
    //       </div>
    //     )}
    //   </CardContent>
    // </Card>
  );
}
