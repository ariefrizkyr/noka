"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { TransactionSheet } from "@/components/transactions/transaction-sheet";
import { useCurrencySettings } from "@/hooks/use-currency-settings";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [showAddForm, setShowAddForm] = useState(false);
  const { currency, loading: currencyLoading } = useCurrencySettings();

  // Define pages where FAB should be shown
  const fabPages = ["/dashboard", "/accounts", "/transactions"];
  const showFAB = fabPages.includes(pathname);

  // Consistent FAB configuration across all pages
  const fabConfig = {
    icon: <Plus className="h-6 w-6" />,
    label: "Add Transaction",
    onClick: () => setShowAddForm(true),
  };

  const handleTransactionSuccess = () => {
    setShowAddForm(false);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("transactionUpdated"));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main content with padding for bottom nav */}
      <main className="pb-20">{children}</main>

      {/* Floating Action Button */}
      {showFAB && (
        <FloatingActionButton
          onClick={fabConfig.onClick}
          icon={fabConfig.icon}
          label={fabConfig.label}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Add Transaction Sheet */}
      {!currencyLoading && (
        <TransactionSheet
          open={showAddForm}
          onOpenChange={setShowAddForm}
          mode="create"
          currency={currency}
          onSuccess={handleTransactionSuccess}
          title="Add New Transaction"
        />
      )}
    </div>
  );
}
