'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Loader2, Wallet, CreditCard, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface Account {
  id: string;
  name: string;
  type: 'bank_account' | 'credit_card' | 'investment_account';
  initial_balance: number;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface GroupedAccounts {
  bank_account: Account[];
  credit_card: Account[];
  investment_account: Account[];
}

interface AccountFormData {
  name: string;
  type: 'bank_account' | 'credit_card' | 'investment_account';
  initial_balance: string;
}

export default function AccountsSettings() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCurrency, setUserCurrency] = useState('USD');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    type: 'bank_account',
    initial_balance: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    account: Account | null;
    reassignOptions: Account[];
    selectedReassignAccount: string;
    hasTransactions: boolean;
    checkingTransactions: boolean;
  }>({
    isOpen: false,
    account: null,
    reassignOptions: [],
    selectedReassignAccount: '',
    hasTransactions: false,
    checkingTransactions: false,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch accounts and user settings in parallel
      const [accountsResponse, settingsResponse] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/settings')
      ]);

      if (!accountsResponse.ok) throw new Error('Failed to fetch accounts');
      if (!settingsResponse.ok) throw new Error('Failed to fetch settings');

      const [accountsData, settingsData] = await Promise.all([
        accountsResponse.json(),
        settingsResponse.json()
      ]);

      setAccounts(accountsData.data);
      setUserCurrency(settingsData.data.currency_code || 'USD');
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      if (!response.ok) throw new Error('Failed to fetch accounts');
      
      const data = await response.json();
      setAccounts(data.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts');
    }
  };

  const groupAccountsByType = (accounts: Account[]): GroupedAccounts => {
    return accounts.reduce((acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = [];
      }
      acc[account.type].push(account);
      return acc;
    }, {} as GroupedAccounts);
  };

  const getAccountTypeInfo = (type: string) => {
    switch (type) {
      case 'bank_account':
        return {
          label: 'Bank Accounts',
          icon: Wallet,
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

  const formatBalance = (balance: number, accountType: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userCurrency,
    });

    // For credit cards, show debt as positive
    if (accountType === 'credit_card' && balance > 0) {
      return `-${formatter.format(Math.abs(balance))}`;
    }

    return formatter.format(balance);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'bank_account',
      initial_balance: '',
    });
  };

  const handleAddNew = (type: 'bank_account' | 'credit_card' | 'investment_account') => {
    resetForm();
    setFormData(prev => ({ ...prev, type }));
    setIsAddDialogOpen(true);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      initial_balance: account.initial_balance.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = async (isEdit = false) => {
    setFormLoading(true);
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        initial_balance: parseFloat(formData.initial_balance) || 0,
      };

      let response;
      if (isEdit && editingAccount) {
        response = await fetch('/api/accounts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_id: editingAccount.id, name: payload.name }),
        });
      } else {
        response = await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save account');
      }

      toast.success(isEdit ? 'Account updated successfully' : 'Account created successfully');
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      setEditingAccount(null);
      resetForm();
      fetchAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save account');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = async (account: Account) => {
    // Get other accounts of the same type for reassignment
    const reassignOptions = accounts.filter(a => a.type === account.type && a.id !== account.id);
    
    // Set initial state and show dialog
    setDeleteDialogState({
      isOpen: true,
      account,
      reassignOptions,
      selectedReassignAccount: '',
      hasTransactions: false,
      checkingTransactions: true,
    });

    // Check if account has transactions
    try {
      const response = await fetch(`/api/transactions?account_id=${account.id}&limit=1`);
      if (response.ok) {
        const data = await response.json();
        const hasTransactions = data.data && data.data.transactions && data.data.transactions.length > 0;
        
        setDeleteDialogState(prev => ({
          ...prev,
          hasTransactions,
          checkingTransactions: false,
        }));
      } else {
        throw new Error('Failed to check transactions');
      }
    } catch (error) {
      console.error('Error checking transactions:', error);
      // If we can't check, assume there might be transactions for safety
      setDeleteDialogState(prev => ({
        ...prev,
        hasTransactions: true,
        checkingTransactions: false,
      }));
    }
  };

  const handleDelete = async () => {
    if (!deleteDialogState.account) return;

    setFormLoading(true);
    try {
      const payload: { account_id: string; new_account_id?: string } = {
        account_id: deleteDialogState.account.id,
      };

      if (deleteDialogState.selectedReassignAccount) {
        payload.new_account_id = deleteDialogState.selectedReassignAccount;
      }

      const response = await fetch('/api/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      toast.success('Account deleted successfully');
      setDeleteDialogState({
        isOpen: false,
        account: null,
        reassignOptions: [],
        selectedReassignAccount: '',
        hasTransactions: false,
        checkingTransactions: false,
      });
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const groupedAccounts = groupAccountsByType(accounts);
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
                              {formatBalance(account.current_balance, account.type)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(account)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteClick(account)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                        </AlertDialog>
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
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
          </DialogHeader>
          <AccountForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={() => handleSubmit(false)}
            onCancel={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}
            loading={formLoading}
            isEdit={false}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <AccountForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={() => handleSubmit(true)}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setEditingAccount(null);
              resetForm();
            }}
            loading={formLoading}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteDialogState.isOpen} 
        onOpenChange={(isOpen) => setDeleteDialogState(prev => ({ ...prev, isOpen }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>Are you sure you want to delete &quot;{deleteDialogState.account?.name}&quot;?</p>
              
              {deleteDialogState.checkingTransactions && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking for existing transactions...
                </div>
              )}
              
              {!deleteDialogState.checkingTransactions && deleteDialogState.hasTransactions && deleteDialogState.reassignOptions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-orange-600">
                    This account has existing transactions. Select an account to reassign them to:
                  </p>
                  <Select 
                    value={deleteDialogState.selectedReassignAccount} 
                    onValueChange={(value) => setDeleteDialogState(prev => ({ 
                      ...prev, 
                      selectedReassignAccount: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account for reassignment" />
                    </SelectTrigger>
                    <SelectContent>
                      {deleteDialogState.reassignOptions.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!deleteDialogState.checkingTransactions && deleteDialogState.hasTransactions && deleteDialogState.reassignOptions.length === 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">
                    Cannot delete this account because it has existing transactions and there are no other accounts of the same type to reassign them to. Please create another account first.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={formLoading || deleteDialogState.checkingTransactions || (deleteDialogState.hasTransactions && deleteDialogState.reassignOptions.length === 0) || (deleteDialogState.hasTransactions && !deleteDialogState.selectedReassignAccount)}
              className="bg-red-600 hover:bg-red-700"
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Account Form Component
interface AccountFormProps {
  formData: AccountFormData;
  setFormData: React.Dispatch<React.SetStateAction<AccountFormData>>;
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
  isEdit: boolean;
}

function AccountForm({ formData, setFormData, onSubmit, onCancel, loading, isEdit }: AccountFormProps) {
  const handleInputChange = (field: keyof AccountFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Account Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter account name (e.g., 'BCA Savings', 'Visa Credit Card')"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Account Type</Label>
        <Select 
          value={formData.type} 
          onValueChange={(value) => handleInputChange('type', value)}
          disabled={isEdit}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank_account">Bank Account</SelectItem>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="investment_account">Investment Account</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="initial_balance">Initial Balance</Label>
          <Input
            id="initial_balance"
            type="number"
            value={formData.initial_balance}
            onChange={(e) => handleInputChange('initial_balance', e.target.value)}
            placeholder="Enter initial balance"
          />
          <p className="text-sm text-gray-500">
            {formData.type === 'credit_card' 
              ? 'Enter the current debt amount (positive number for debt)'
              : 'Enter the current balance in this account'
            }
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={loading || !formData.name}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEdit ? 'Update Account' : 'Create Account'
          )}
        </Button>
      </div>
    </div>
  );
}