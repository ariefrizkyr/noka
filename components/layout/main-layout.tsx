"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transactions/transaction-form";
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

      {/* Add Transaction Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          {currencyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-gray-600">Loading currency settings...</span>
            </div>
          ) : (
            <TransactionForm
              mode="create"
              currency={currency}
              onSuccess={handleTransactionSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
