import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Wallet, Tags, Settings } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  // Get user settings and basic data
  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { count: accountCount } = await supabase
    .from('accounts')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('is_active', true);

  const { count: categoryCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('is_active', true);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to Noka!
          </h1>
        </div>
        <p className="text-gray-600">
          Congratulations! You've successfully completed your setup. Here's your financial overview:
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currency</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings?.currency_code || 'USD'}</div>
            <p className="text-xs text-muted-foreground">
              Financial month starts on day {settings?.financial_month_start_day || 1}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accounts</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Financial accounts set up
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Expense & investment categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Start Recording Transactions</h4>
                <p className="text-sm text-gray-600">
                  Add your first income, expense, or transfer to begin tracking your finances.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-green-600">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Monitor Your Progress</h4>
                <p className="text-sm text-gray-600">
                  Track your spending against budgets and watch your investment goals progress.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-purple-600">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Customize & Expand</h4>
                <p className="text-sm text-gray-600">
                  Add more accounts, refine categories, and adjust budgets as your needs evolve.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Development Note */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Development Note:</strong> This is the beginning of your Noka dashboard. 
          More features like transaction management, budget tracking, and financial insights will be added in subsequent phases.
        </p>
      </div>
    </div>
  );
} 