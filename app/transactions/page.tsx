"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TransactionList } from "@/components/transactions/transaction-list"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog"
import { MainLayout } from "@/components/layout/main-layout"

interface Transaction {
  id: string
  type: "income" | "expense" | "transfer"
  amount: number
  description?: string
  transaction_date: string
  created_at: string
  updated_at: string
  
  // For income/expense
  accounts?: {
    id: string
    name: string
    type: "bank_account" | "credit_card" | "investment_account"
  }
  categories?: {
    id: string
    name: string
    type: "expense" | "income" | "investment"
    icon?: string
  }
  
  // For transfers
  from_accounts?: {
    id: string
    name: string
    type: "bank_account" | "credit_card" | "investment_account"
  }
  to_accounts?: {
    id: string
    name: string
    type: "bank_account" | "credit_card" | "investment_account"
  }
  investment_categories?: {
    id: string
    name: string
    type: "investment"
    icon?: string
  }
}

export default function TransactionsPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAddTransaction = () => {
    setShowAddForm(true)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowEditForm(true)
  }

  const handleDeleteTransaction = (transaction: Transaction) => {
    setDeletingTransaction(transaction)
    setShowDeleteDialog(true)
  }

  const handleTransactionSuccess = () => {
    setShowAddForm(false)
    setShowEditForm(false)
    setEditingTransaction(null)
    // Force refresh of transaction list
    setRefreshKey(prev => prev + 1)
  }

  const handleDeleteSuccess = () => {
    setShowDeleteDialog(false)
    setDeletingTransaction(null)
    // Force refresh of transaction list
    setRefreshKey(prev => prev + 1)
  }

  const getEditFormDefaultValues = () => {
    if (!editingTransaction) return undefined

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
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
              <p className="text-gray-600 mt-2">
                View and manage all your financial transactions
              </p>
            </div>
            <Button onClick={handleAddTransaction} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </div>

      {/* Transaction List */}
      <TransactionList
        key={refreshKey}
        onAddTransaction={handleAddTransaction}
        onEditTransaction={handleEditTransaction}
        onDeleteTransaction={handleDeleteTransaction}
      />

      {/* Add Transaction Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm
            mode="create"
            onSuccess={handleTransactionSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm
            mode="edit"
            transactionId={editingTransaction?.id}
            defaultValues={getEditFormDefaultValues()}
            onSuccess={handleTransactionSuccess}
            onCancel={() => {
              setShowEditForm(false)
              setEditingTransaction(null)
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
      </div>
    </MainLayout>
  )
}