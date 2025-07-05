'use client';

import { Loader2 } from 'lucide-react';
import { useCurrencySettings } from '@/hooks/use-currency-settings';
import { AccountManagement } from '@/components/settings/account-management';

export default function AccountsSettings() {
  const { currency, loading } = useCurrencySettings();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return <AccountManagement userCurrency={currency} />;
}