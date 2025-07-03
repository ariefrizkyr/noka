import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Plus, TrendingUp, CreditCard, Building } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function AccountsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  // Get user accounts with balances
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank_account':
        return <Building className="h-5 w-5" />;
      case 'credit_card':
        return <CreditCard className="h-5 w-5" />;
      case 'investment_account':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'bank_account':
        return 'Bank Account';
      case 'credit_card':
        return 'Credit Card';
      case 'investment_account':
        return 'Investment Account';
      default:
        return type;
    }
  };

  const totalBalance = accounts?.reduce((sum, account) => {
    // For credit cards, negative balance is good (less debt)
    if (account.type === 'credit_card') {
      return sum - account.current_balance;
    }
    return sum + account.current_balance;
  }, 0) || 0;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-6 h-6 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Accounts
                </h1>
              </div>
              <p className="text-gray-600">
                Manage your financial accounts and view balances
              </p>
            </div>
            <Link href="/settings?tab=accounts">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Total Balance Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Net Worth</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(totalBalance)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Accounts List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts?.map((account) => (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {getAccountTypeLabel(account.type)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Balance</span>
                    <span className={`font-semibold ${
                      account.type === 'credit_card' 
                        ? account.current_balance < 0 ? 'text-red-600' : 'text-green-600'
                        : account.current_balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(account.current_balance)}
                    </span>
                  </div>
                  
                  {account.type === 'credit_card' && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Credit Limit</span>
                      <span className="text-sm text-gray-900">
                        {formatCurrency(account.credit_limit || 0)}
                      </span>
                    </div>
                  )}

                  {account.description && (
                    <p className="text-xs text-gray-500 mt-2">
                      {account.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {(!accounts || accounts.length === 0) && (
          <Card className="text-center py-12">
            <CardContent>
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Accounts Yet
              </h3>
              <p className="text-gray-600 mb-6">
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