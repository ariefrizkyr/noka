"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { FinancialSummary, DashboardTabs } from "@/components/dashboard";
import { useCurrencySettings } from "@/hooks/use-currency-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const { currency, loading: currencyLoading } = useCurrencySettings();

  if (currencyLoading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            {/* Loading skeleton for header */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>

            {/* Loading skeleton for summary cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="mb-2 h-4 w-20" />
                    <Skeleton className="mb-2 h-8 w-24" />
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
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          {/* Financial Summary Section */}
          <div className="rounded-lg border bg-white shadow-sm">
            <FinancialSummary currency={currency} className="p-6" />
          </div>

          {/* Dashboard Tabs Section */}
          <DashboardTabs currency={currency} defaultTab="expenses" />
        </div>
      </div>
    </MainLayout>
  );
}
