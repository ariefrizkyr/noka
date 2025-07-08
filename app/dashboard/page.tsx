'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { 
  FinancialSummary, 
  DashboardTabs 
} from '@/components/dashboard';
import { useCurrencySettings } from '@/hooks/use-currency-settings';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { currency, loading: currencyLoading } = useCurrencySettings();

  if (currencyLoading) {
    return (
      <MainLayout>
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="space-y-6">
            {/* Loading skeleton for header */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            
            {/* Loading skeleton for summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Loading skeleton for tabs */}
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {/* Financial Summary Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <FinancialSummary 
              currency={currency} 
              className="p-6"
            />
          </div>

          {/* Dashboard Tabs Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <DashboardTabs 
                currency={currency}
                defaultTab="expenses"
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}