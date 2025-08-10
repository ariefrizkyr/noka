"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/currency-utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

interface MemberContribution {
  user_id: string;
  user_email: string;
  contribution_amount: number;
  percentage: number;
}

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
  memberContributions?: MemberContribution[];
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
  memberContributions = [],
}: ProgressCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasContributions = memberContributions.length > 0 && isShared;
  const showExpandable = hasContributions && memberContributions.length > 1;
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
      <div 
        className={cn(
          "flex flex-row p-2",
          showExpandable && "cursor-pointer hover:bg-gray-50 transition-colors"
        )}
        onClick={() => showExpandable && setIsExpanded(!isExpanded)}
      >
        <div className="flex w-2/6 items-start justify-start">
          <div className="text-left">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-md mr-1">{icon}</span>
              <span className="text-xs font-medium text-gray-800 sm:text-sm">
                {title}
              </span>
              {isShared && familyName && (
                <Badge
                  variant="outline"
                  className="border-blue-300 bg-blue-50 text-xs text-blue-700 px-1 py-0"
                >
                  {familyName}
                </Badge>
              )}
              {showExpandable && (
                <div className="ml-1 transition-transform duration-200">
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-gray-500" />
                  )}
                </div>
              )}
            </div>
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
      
      {/* Member Contributions Breakdown */}
      {isExpanded && hasContributions && (
        <div className="border-t border-gray-100 bg-gray-50/50">
          <div className="px-4 py-3">
            <div className="text-xs font-medium text-gray-600 mb-2">Member Contributions</div>
            <div className="space-y-2">
              {memberContributions.map((contribution) => {
                const contributionAmount = type === "budget" 
                  ? contribution.contribution_amount 
                  : contribution.contribution_amount;
                
                return (
                  <div key={contribution.user_id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-gray-700">
                        {contribution.user_email}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-800">
                        {formatCurrency(contributionAmount, { currency })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {contribution.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
