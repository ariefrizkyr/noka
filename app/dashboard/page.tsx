'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Wallet, Tags, Settings, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { toast } from 'sonner';

interface UserSettings {
  currency_code: string;
  financial_month_start_day: number;
}


export default function DashboardPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [accountCount, setAccountCount] = useState<number>(0);
  const [categoryCount, setCategoryCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch all data in parallel
      const [settingsResponse, accountsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/accounts'),
        fetch('/api/categories')
      ]);

      if (!settingsResponse.ok || !accountsResponse.ok || !categoriesResponse.ok) {
        if (settingsResponse.status === 401 || accountsResponse.status === 401 || categoriesResponse.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch dashboard data');
      }

      const [settingsData, accountsData, categoriesData] = await Promise.all([
        settingsResponse.json(),
        accountsResponse.json(),
        categoriesResponse.json()
      ]);

      setSettings(settingsData.data);
      setAccountCount((accountsData.data || []).length);
      setCategoryCount((categoriesData.data || []).length);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <MainLayout>
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to Noka!
              </h1>
            </div>
            <Link href="/settings">
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </Link>
          </div>
          <p className="text-gray-600">
            Congratulations! You&apos;ve successfully completed your setup. Here&apos;s your financial overview:
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
            <div className="text-2xl font-bold">{accountCount}</div>
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
            <div className="text-2xl font-bold">{categoryCount}</div>
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
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Settings className="w-3 h-3 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Manage Your Settings</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Customize your currency, financial periods, and manage your accounts and categories.
                </p>
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Open Settings
                  </Button>
                </Link>
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
    </MainLayout>
  );
} 