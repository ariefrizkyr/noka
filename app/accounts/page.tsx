"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Plus } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useApiData } from "@/hooks/use-api-data";
import { formatCurrency } from "@/lib/currency-utils";
import { getAccountTypeInfo } from "@/lib/account-utils";
import { useCurrencySettings } from "@/hooks/use-currency-settings";

import { Account } from "@/types/common";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountsPage() {
  const { currency, loading: currencyLoading } = useCurrencySettings();
  const { data: accounts, loading: accountsLoading } = useApiData<Account[]>(
    "/api/accounts",
    {
      listenToEvents: ["transactionUpdated"],
    },
  );

  // Group accounts by type
  const groupAccountsByType = (accounts: Account[]) => {
    const grouped = accounts.reduce(
      (acc, account) => {
        const type = account.type;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(account);
        return acc;
      },
      {} as Record<string, Account[]>,
    );

    return grouped;
  };

  // Define the order of account types
  const accountTypeOrder = [
    "bank_account",
    "credit_card",
    "investment_account",
  ];

  // Combined loading state
  const loading = currencyLoading || accountsLoading;

  if (loading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            {/* Loading skeleton for summary cards */}
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            </div>

            {/* Loading skeleton for tabs */}
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const groupedAccounts = accounts ? groupAccountsByType(accounts) : {};

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Accounts</h1>
            </div>
          </div>
        </div>

        {/* Accounts List Grouped by Type */}
        <div className="space-y-8">
          {accountTypeOrder.map((accountType) => {
            const accountsOfType = groupedAccounts[accountType];
            if (!accountsOfType || accountsOfType.length === 0) {
              return null;
            }

            return (
              <div key={accountType} className="space-y-4">
                {/* Section Title */}
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {getAccountTypeInfo(accountType).pluralLabel}
                  </h2>
                  <span className="rounded-sm bg-gray-50 px-2 py-1 text-xs text-gray-400">
                    {accountsOfType.length}
                  </span>
                </div>

                {/* Accounts Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {accountsOfType.map((account) => (
                    <Card
                      key={account.id}
                      className="transition-shadow hover:shadow-md"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`rounded-full p-2 ${getAccountTypeInfo(account.type).iconBgColor} ${getAccountTypeInfo(account.type).iconTextColor}`}
                            >
                              {(() => {
                                const Icon = getAccountTypeInfo(
                                  account.type,
                                ).icon;
                                return <Icon className="h-4 w-4" />;
                              })()}
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {account.name}
                              </CardTitle>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex w-full items-center">
                            <span className="text-sm text-gray-600">
                              Balance
                            </span>
                          </div>
                          <div className="flex w-full items-center">
                            <span
                              className={`font-semibold ${
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
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {(!accounts || accounts.length === 0) && (
          <Card className="py-12 text-center">
            <CardContent>
              <Wallet className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No Accounts Yet
              </h3>
              <p className="mb-6 text-gray-600">
                Add your first financial account to start tracking your finances
              </p>
              <Link href="/settings?tab=accounts">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
