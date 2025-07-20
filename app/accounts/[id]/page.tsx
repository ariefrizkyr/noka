"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionSheet } from "@/components/transactions/transaction-sheet";
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog";
import { MainLayout } from "@/components/layout/main-layout";
import { useApiData } from "@/hooks/use-api-data";
import { useTransactions } from "@/hooks/use-transactions";
import { useCurrencySettings } from "@/hooks/use-currency-settings";
import { formatCurrency } from "@/lib/currency-utils";
import { getAccountTypeInfo } from "@/lib/account-utils";
import type { Account, TransactionWithRelations } from "@/types/common";

export default function AccountTransactionsPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;

  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionWithRelations | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingTransaction, setDeletingTransaction] =
    useState<TransactionWithRelations | null>(null);

  // Fetch all accounts and find the specific one
  const { data: accounts, loading: accountLoading } = useApiData<Account[]>(
    "/api/accounts",
    {
      listenToEvents: ["transactionUpdated"],
    },
  );

  // Find the specific account
  const account = accounts?.find(acc => acc.id === accountId);

  // Use currency settings hook
  const { currency, loading: currencyLoading } = useCurrencySettings();

  // Use transactions hook for loading state
  const { loading: transactionsLoading } = useTransactions({
    autoFetch: false,
  });

  // Combined loading state
  const loading = currencyLoading || transactionsLoading || accountLoading;

  const handleEditTransaction = (transaction: TransactionWithRelations) => {
    setEditingTransaction(transaction);
    setShowEditForm(true);
  };

  const handleDeleteTransaction = (transaction: TransactionWithRelations) => {
    setDeletingTransaction(transaction);
    setShowDeleteDialog(true);
  };

  const handleTransactionSuccess = () => {
    setShowEditForm(false);
    setEditingTransaction(null);
    // Transaction list will auto-refresh via event system
  };

  const handleDeleteSuccess = () => {
    setShowDeleteDialog(false);
    setDeletingTransaction(null);
    // Transaction list will auto-refresh via event system
  };

  const handleBackClick = () => {
    router.push("/accounts");
  };

  // Memoize defaultValues to prevent unnecessary object recreation
  const editFormDefaultValues = useMemo(() => {
    if (!editingTransaction) {
      return undefined;
    }

    const defaultValues = {
      type: editingTransaction.type,
      amount: editingTransaction.amount,
      transaction_date: new Date(editingTransaction.transaction_date),
      description: editingTransaction.description || "",
      account_id: editingTransaction.account_id || undefined,
      category_id: editingTransaction.category_id || undefined,
      from_account_id: editingTransaction.from_account_id || undefined,
      to_account_id: editingTransaction.to_account_id || undefined,
      investment_category_id:
        editingTransaction.investment_category_id || undefined,
    };

    return defaultValues;
  }, [editingTransaction]);

  if (loading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Account Info Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction List Skeleton */}
          <div className="space-y-4">
            {/* Filter Bar Skeleton */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <Skeleton className="h-10 w-full sm:w-64" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Cards Skeleton */}
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!account) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Account Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The account you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={handleBackClick} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Accounts
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const accountTypeInfo = getAccountTypeInfo(account.type);

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBackClick}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Account Transactions
              </h1>
            </div>
          </div>
        </div>

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

        {/* Transaction List with Account Filter */}
        <TransactionList
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          defaultFilters={{ account_id: accountId }}
          hiddenFilters={['account_id']}
          lockedFilters={{ account_id: accountId }}
          currency={currency}
        />
      </div>

      {/* Edit Transaction Sheet */}
      <TransactionSheet
        open={showEditForm}
        onOpenChange={setShowEditForm}
        mode="edit"
        transactionId={editingTransaction?.id}
        defaultValues={editFormDefaultValues}
        onSuccess={handleTransactionSuccess}
        currency={currency}
        title="Edit Transaction"
      />

      {/* Delete Transaction Dialog */}
      <DeleteTransactionDialog
        transaction={deletingTransaction}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onSuccess={handleDeleteSuccess}
        currency={currency}
      />
    </MainLayout>
  );
}