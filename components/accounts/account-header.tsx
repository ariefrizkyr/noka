"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency-utils";
import { getAccountTypeInfo } from "@/lib/account-utils";
import type { Account } from "@/types/common";

interface AccountHeaderProps {
  account: Account;
  currency?: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function AccountHeader({
  account,
  currency,
  onBack,
  showBackButton = true,
}: AccountHeaderProps) {
  const accountTypeInfo = getAccountTypeInfo(account.type);

  return (
    <div className="space-y-4">
      {/* Back Button */}
      {showBackButton && onBack && (
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Account Transactions
            </h1>
          </div>
        </div>
      )}

      {/* Account Information Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-full p-3 ${accountTypeInfo.iconBgColor} ${accountTypeInfo.iconTextColor}`}
              >
                {(() => {
                  const Icon = accountTypeInfo.icon;
                  return <Icon className="h-6 w-6" />;
                })()}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {account.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {accountTypeInfo.label}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Current Balance</p>
              <p
                className={`text-lg font-semibold ${
                  account.type === "credit_card"
                    ? account.current_balance > 0
                      ? "text-red-600"
                      : "text-green-600"
                    : account.current_balance >= 0
                      ? "text-green-600"
                      : "text-red-600"
                }`}
              >
                {formatCurrency(account.current_balance, {
                  currency: currency,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}