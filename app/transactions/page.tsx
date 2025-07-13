"use client";

import { useState, useEffect } from "react";
import { Receipt } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog";
import { MainLayout } from "@/components/layout/main-layout";
import { useTransactions } from "@/hooks/use-transactions";
import type { TransactionWithRelations } from "@/types/common";

export default function TransactionsPage() {
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionWithRelations | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingTransaction, setDeletingTransaction] =
    useState<TransactionWithRelations | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Use transactions hook for loading state
  const { loading } = useTransactions({ autoFetch: false });

  // Listen for transaction updates from the FAB in main layout
  useEffect(() => {
    const handleTransactionUpdated = () => {
      setRefreshKey((prev) => prev + 1);
    };

    window.addEventListener("transactionUpdated", handleTransactionUpdated);
    return () => {
      window.removeEventListener(
        "transactionUpdated",
        handleTransactionUpdated,
      );
    };
  }, []);

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
    // Force refresh of transaction list
    setRefreshKey((prev) => prev + 1);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteDialog(false);
    setDeletingTransaction(null);
    // Force refresh of transaction list
    setRefreshKey((prev) => prev + 1);
  };

  const getEditFormDefaultValues = () => {
    if (!editingTransaction) return undefined;

    return {
      type: editingTransaction.type,
      amount: editingTransaction.amount,
      transaction_date: new Date(editingTransaction.transaction_date),
      description: editingTransaction.description || "",
      account_id: editingTransaction.accounts?.id,
      category_id: editingTransaction.categories?.id,
      from_account_id: editingTransaction.from_accounts?.id,
      to_account_id: editingTransaction.to_accounts?.id,
      investment_category_id: editingTransaction.investment_categories?.id,
    };
  };

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
          key={refreshKey}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </div>

      {/* Edit Transaction Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm
            mode="edit"
            transactionId={editingTransaction?.id}
            defaultValues={getEditFormDefaultValues()}
            onSuccess={handleTransactionSuccess}
            onCancel={() => {
              setShowEditForm(false);
              setEditingTransaction(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Transaction Dialog */}
      <DeleteTransactionDialog
        transaction={deletingTransaction}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onSuccess={handleDeleteSuccess}
      />
    </MainLayout>
  );
}
