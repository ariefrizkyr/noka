"use client";

import { useState, useMemo } from "react";
import { Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionSheet } from "@/components/transactions/transaction-sheet";
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog";
import { MainLayout } from "@/components/layout/main-layout";
import { useTransactions } from "@/hooks/use-transactions";
import { useCurrencySettings } from "@/hooks/use-currency-settings";
import type { TransactionWithRelations } from "@/types/common";

export default function TransactionsPage() {
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionWithRelations | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingTransaction, setDeletingTransaction] =
    useState<TransactionWithRelations | null>(null);

  // Use currency settings hook
  const { currency, loading: currencyLoading } = useCurrencySettings();

  // Use transactions hook for loading state
  const { loading: transactionsLoading } = useTransactions({
    autoFetch: false,
  });

  // Combined loading state
  const loading = currencyLoading || transactionsLoading;

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>

          {/* Transaction List Skeleton */}
          <div className="space-y-4">
            {/* Filter/Search Bar Skeleton */}
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
              {/* Date Group Header */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>

              {/* Transaction Cards */}
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

              {/* Another Date Group */}
              <div className="mt-6 flex items-center gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>

              {/* More Transaction Cards */}
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index + 5}>
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

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <TransactionList
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
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
