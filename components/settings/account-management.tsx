"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Account, AccountFormData } from "@/types/common";
import { useApiData } from "@/hooks/use-api-data";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { formatAccountBalance } from "@/lib/currency-utils";
import { getAccountTypeInfo } from "@/lib/account-utils";
import { AccountForm } from "./account-form";
import { AccountDeleteDialog } from "./account-delete-dialog";

interface AccountManagementProps {
  userCurrency: string;
}

export function AccountManagement({ userCurrency }: AccountManagementProps) {
  const isMobile = useIsMobile();
  const {
    data: accounts,
    loading,
    refetch,
  } = useApiData<Account[]>("/api/accounts");

  const {
    isAddOpen,
    isEditOpen,
    isDeleteOpen,
    editingItem,
    deleteItem,
    openAddDialog,
    closeAddDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCrudDialog<Account>("/api/accounts", {
    entityName: "Account",
    onRefresh: refetch,
  });

  const [addFormType, setAddFormType] = useState<
    "bank_account" | "credit_card" | "investment_account"
  >("bank_account");

  const groupAccountsByType = (accounts: Account[]) => {
    return accounts.reduce(
      (acc, account) => {
        if (!acc[account.type]) {
          acc[account.type] = [];
        }
        acc[account.type].push(account);
        return acc;
      },
      {} as Record<string, Account[]>,
    );
  };

  const handleAddNew = (
    type:
      | "bank_account"
      | "credit_card"
      | "investment_account" = "bank_account",
  ) => {
    setAddFormType(type);
    openAddDialog();
  };

  const handleFormSubmit = async (formData: AccountFormData) => {
    const payload = {
      name: formData.name,
      type: formData.type,
      initial_balance: parseFloat(formData.initial_balance) || 0,
    };

    if (editingItem) {
      // For edit, only send name
      await handleUpdate({ name: payload.name });
    } else {
      await handleCreate(payload);
    }
  };

  const getInitialFormData = (): AccountFormData => {
    if (editingItem) {
      return {
        name: editingItem.name,
        type: editingItem.type,
        initial_balance: editingItem.initial_balance.toString(),
      };
    }

    return {
      name: "",
      type: addFormType,
      initial_balance: "",
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const groupedAccounts = groupAccountsByType(accounts || []);
  const accountTypes = [
    "bank_account",
    "credit_card",
    "investment_account",
  ] as const;

  return (
    <div className="space-y-6">
      <Button onClick={() => handleAddNew()} className="w-full gap-2">
        <Plus className="h-4 w-4" />
        Add New
      </Button>
      {accountTypes.map((type) => {
        const typeInfo = getAccountTypeInfo(type);
        const typeAccounts = groupedAccounts[type] || [];
        const Icon = typeInfo.icon;

        return (
          <div key={type}>
            <div className="flex w-full items-center justify-between">
              <Badge className={`${typeInfo.badgeColor} mb-3`}>
                <Icon className="mr-0.5 h-4 w-4" />
                {typeInfo.pluralLabel}
              </Badge>
            </div>
            {typeAccounts.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Icon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p>No {typeInfo.pluralLabel.toLowerCase()} found.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleAddNew(type)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First {typeInfo.label}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {typeAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{account.name}</h4>
                        <p className="text-xs text-gray-500">
                          Balance: <br />
                          <span className="font-medium">
                            {formatAccountBalance(
                              account.current_balance,
                              account.type,
                              userCurrency,
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(account)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteDialog(account)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Add Account Sheet */}
      <Sheet open={isAddOpen} onOpenChange={closeAddDialog}>
        <SheetContent 
          side={isMobile ? "bottom" : "right"}
          className={`${
            isMobile
              ? "h-[90vh] w-full rounded-t-lg"
              : "h-full w-[600px] max-w-[90vw]"
          } flex flex-col p-0`}
        >
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>Add New Account</SheetTitle>
          </SheetHeader>
          <div className={`flex-1 ${isMobile ? "overflow-y-auto p-3" : "p-6"}`}>
            <AccountForm
              data={getInitialFormData()}
              loading={isCreating}
              onSubmit={handleFormSubmit}
              onCancel={closeAddDialog}
              userCurrency={userCurrency}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Account Sheet */}
      <Sheet open={isEditOpen} onOpenChange={closeEditDialog}>
        <SheetContent 
          side={isMobile ? "bottom" : "right"}
          className={`${
            isMobile
              ? "h-[90vh] w-full rounded-t-lg"
              : "h-full w-[600px] max-w-[90vw]"
          } flex flex-col p-0`}
        >
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>Edit Account</SheetTitle>
          </SheetHeader>
          <div className={`flex-1 ${isMobile ? "overflow-y-auto p-3" : "p-6"}`}>
            <AccountForm
              data={getInitialFormData()}
              loading={isUpdating}
              onSubmit={handleFormSubmit}
              onCancel={closeEditDialog}
              isEdit={true}
              userCurrency={userCurrency}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AccountDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={closeDeleteDialog}
        account={deleteItem}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
}
