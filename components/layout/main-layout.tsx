"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transactions/transaction-form";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [showAddForm, setShowAddForm] = useState(false);

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
    <div className="min-h-screen bg-gray-50">
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
          <TransactionForm
            mode="create"
            onSuccess={handleTransactionSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
