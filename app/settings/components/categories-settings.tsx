'use client';

import { Loader2 } from 'lucide-react';
import { useCurrencySettings } from '@/hooks/use-currency-settings';
import { CategoryManagement } from '@/components/settings/category-management';

export default function CategoriesSettings() {
  const { currency, loading } = useCurrencySettings();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return <CategoryManagement userCurrency={currency} />;
}