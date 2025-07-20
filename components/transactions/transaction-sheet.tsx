"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TransactionForm } from "./transaction-form";
import { MobileAmountInput } from "./mobile-amount-input";
import { useIsMobile } from "@/hooks/use-mobile";

type TransactionFormSchema = {
  type: "income" | "expense" | "transfer";
  amount: number;
  transaction_date: Date;
  description?: string;
  account_id?: string;
  category_id?: string;
  from_account_id?: string;
  to_account_id?: string;
  investment_category_id?: string;
};

interface TransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (transaction: unknown) => void;
  defaultValues?: Partial<TransactionFormSchema>;
  mode?: "create" | "edit";
  transactionId?: string;
  currency?: string;
  title?: string;
}

export function TransactionSheet({
  open,
  onOpenChange,
  onSuccess,
  defaultValues,
  mode = "create",
  transactionId,
  currency = "IDR",
  title,
}: TransactionSheetProps) {
  const isMobile = useIsMobile();
  const [showMobileAmountInput, setShowMobileAmountInput] = useState(mode !== "edit");
  const [prefilledAmount, setPrefilledAmount] = useState<number | undefined>(
    defaultValues?.amount,
  );

  // Reset mobile flow state when sheet opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      // Reset mobile flow when closing
      setShowMobileAmountInput(true);
      setPrefilledAmount(undefined);
    } else if (newOpen && mode === "edit") {
      // For edit mode, skip mobile amount input and go directly to form
      setShowMobileAmountInput(false);
    }
  };

  const handleAmountContinue = (amount: number) => {
    setPrefilledAmount(amount);
    setShowMobileAmountInput(false);
  };

  const handleFormCancel = () => {
    if (isMobile && mode === "create") {
      // On mobile create mode, go back to amount input
      setShowMobileAmountInput(true);
      setPrefilledAmount(undefined);
    } else {
      // On desktop or edit mode, close the sheet
      onOpenChange(false);
    }
  };

  const handleFormSuccess = (transaction: unknown) => {
    onOpenChange(false);
    onSuccess?.(transaction);
  };

  // Determine sheet side and size based on device and content
  const getSheetSide = () => {
    if (isMobile) {
      return "bottom";
    }
    return "right";
  };

  // Get appropriate title
  const getTitle = () => {
    if (title) return title;

    if (mode === "edit") {
      return "Edit Transaction";
    }

    if (isMobile && showMobileAmountInput) {
      return "Amount";
    }

    return "Add Transaction";
  };

  // Determine if header should be visible
  const shouldShowHeader = () => {
    if (mode === "edit") return true; // Always show for edit mode
    if (!isMobile) return true; // Always show on desktop
    return !showMobileAmountInput; // Mobile create: show when not on amount input
  };

  // Get content area styling
  const getContentAreaClassName = () => {
    // Desktop: always p-6
    if (!isMobile) return "p-6";
    
    // Mobile amount input: no padding (handles own layout)
    if (isMobile && showMobileAmountInput && mode !== "edit") return "";
    
    // Mobile form (both create and edit): p-3 with scroll
    return "overflow-y-auto p-3";
  };

  // Determine what to show inside the sheet
  const renderContent = () => {
    // Desktop: always show full form
    if (!isMobile) {
      return (
        <TransactionForm
          mode={mode}
          transactionId={transactionId}
          defaultValues={defaultValues}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          currency={currency}
          prefilledAmount={prefilledAmount}
        />
      );
    }

    // Mobile edit mode: show full form (will get mobile styling from content area)
    if (mode === "edit") {
      return (
        <TransactionForm
          mode={mode}
          transactionId={transactionId}
          defaultValues={defaultValues}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          currency={currency}
          prefilledAmount={prefilledAmount}
        />
      );
    }

    // Mobile create mode: show amount input first, then form
    if (showMobileAmountInput) {
      return (
        <MobileAmountInput
          currency={currency}
          onContinue={handleAmountContinue}
          initialAmount={prefilledAmount}
        />
      );
    }

    // Mobile create mode: show form with prefilled amount
    return (
      <TransactionForm
        mode={mode}
        transactionId={transactionId}
        defaultValues={defaultValues}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
        currency={currency}
        prefilledAmount={prefilledAmount}
      />
    );
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side={getSheetSide()}
        className={` ${
          isMobile
            ? "h-[90vh] w-full rounded-t-lg"
            : "h-full w-[600px] max-w-[90vw]"
        } flex flex-col p-0`}
      >
        {/* Always include header for accessibility, but hide visually on mobile amount input */}
        <SheetHeader
          className={shouldShowHeader() ? "border-b px-6 py-4" : "sr-only"}
        >
          <SheetTitle>{getTitle()}</SheetTitle>
        </SheetHeader>

        {/* Content area */}
        <div className={`flex-1 ${getContentAreaClassName()}`}>
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
