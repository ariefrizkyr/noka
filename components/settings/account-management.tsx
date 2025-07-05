'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Loader2, Wallet, CreditCard, TrendingUp, Building } from 'lucide-react';
import { Account, AccountFormData, AccountTypeInfo } from '@/types/common';
import { useApiData } from '@/hooks/use-api-data';
import { useCrudDialog } from '@/hooks/use-crud-dialog';
import { formatAccountBalance } from '@/lib/currency-utils';
import { AccountForm } from './account-form';
import { AccountDeleteDialog } from './account-delete-dialog';

interface AccountManagementProps {
  userCurrency: string;
}

export function AccountManagement({ userCurrency }: AccountManagementProps) {
  const { data: accounts, loading, refetch } = useApiData<Account[]>('/api/accounts');

  const {
    isAddOpen,
    isEditOpen,
    isDeleteOpen,
    editingItem,
    deleteDialogState,
    openAddDialog,
    closeAddDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    setSelectedReassignId,
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCrudDialog<Account>('/api/accounts', {
    entityName: 'Account',
    onRefresh: refetch,
    checkTransactionsEndpoint: (id: string) => `/api/transactions?account_id=${id}&limit=1`,
  });

  const [addFormType, setAddFormType] = useState<'bank_account' | 'credit_card' | 'investment_account'>('bank_account');

  const getAccountTypeInfo = (type: string): AccountTypeInfo => {
    switch (type) {
      case 'bank_account':
        return {
          label: 'Bank Accounts',
          icon: Building,
          color: 'bg-blue-100 text-blue-800',
        };
      case 'credit_card':
        return {
          label: 'Credit Cards',
          icon: CreditCard,
          color: 'bg-orange-100 text-orange-800',
        };
      case 'investment_account':
        return {
          label: 'Investment Accounts',
          icon: TrendingUp,
          color: 'bg-green-100 text-green-800',
        };
      default:
        return {
          label: 'Other Accounts',
          icon: Wallet,
          color: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const groupAccountsByType = (accounts: Account[]) => {
    return accounts.reduce((acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = [];
      }
      acc[account.type].push(account);
      return acc;
    }, {} as Record<string, Account[]>);
  };

  const handleAddNew = (type: 'bank_account' | 'credit_card' | 'investment_account') => {
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
      name: '',
      type: addFormType,
      initial_balance: '',
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const groupedAccounts = groupAccountsByType(accounts || []);
  const accountTypes = ['bank_account', 'credit_card', 'investment_account'] as const;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Manage your financial accounts. Add bank accounts, credit cards, and investment accounts to track your finances.
        </p>
      </div>

      {accountTypes.map((type) => {
        const typeInfo = getAccountTypeInfo(type);
        const typeAccounts = groupedAccounts[type] || [];
        const Icon = typeInfo.icon;

        return (
          <Card key={type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge className={typeInfo.color}>
                  <Icon className="w-4 h-4 mr-1" />
                  {typeInfo.label}
                </Badge>
                <span className="text-sm font-normal text-gray-500">
                  ({typeAccounts.length} accounts)
                </span>
              </CardTitle>
              <Button 
                size="sm" 
                onClick={() => handleAddNew(type)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New
              </Button>
            </CardHeader>
            <CardContent>
              {typeAccounts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No {typeInfo.label.toLowerCase()} found.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => handleAddNew(type)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First {typeInfo.label.slice(0, -1)}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {typeAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{account.name}</h4>
                          <p className="text-sm text-gray-500">
                            Current Balance: <span className="font-medium">
                              {formatAccountBalance(account.current_balance, account.type, userCurrency)}
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
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openDeleteDialog(account, typeAccounts)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Add Account Dialog */}
      <Dialog open={isAddOpen} onOpenChange={closeAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
          </DialogHeader>
          <AccountForm
            data={getInitialFormData()}
            loading={isCreating}
            onSubmit={handleFormSubmit}
            onCancel={closeAddDialog}
            userCurrency={userCurrency}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={isEditOpen} onOpenChange={closeEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <AccountForm
            data={getInitialFormData()}
            loading={isUpdating}
            onSubmit={handleFormSubmit}
            onCancel={closeEditDialog}
            isEdit={true}
            userCurrency={userCurrency}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AccountDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={closeDeleteDialog}
        deleteState={deleteDialogState}
        onReassignChange={setSelectedReassignId}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
}