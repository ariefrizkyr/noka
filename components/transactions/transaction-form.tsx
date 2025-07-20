"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSelector } from "./account-selector";
import { CategorySelector } from "./category-selector";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransactionForm } from "@/hooks/use-transaction-mutations";
import {
  FORM_LIMITS,
  DATE_FORMATS,
  CURRENCY_DEFAULTS,
  ACCOUNT_FILTER_OPTIONS,
} from "@/lib/constants";
import type { TransactionFormData } from "@/types/common";

// Validation schema based on existing API validation
const transactionSchema = z
  .object({
    type: z.enum(["income", "expense", "transfer"] as const),
    amount: z
      .number()
      .positive("Amount must be positive")
      .max(FORM_LIMITS.AMOUNT_MAX),
    transaction_date: z.date(),
    description: z.string().max(FORM_LIMITS.DESCRIPTION_MAX_LENGTH).optional(),

    // For income/expense
    account_id: z.string().uuid().optional(),
    category_id: z.string().uuid().optional(),

    // For transfers
    from_account_id: z.string().uuid().optional(),
    to_account_id: z.string().uuid().optional(),
    investment_category_id: z.string().uuid().optional(),
  })
  .refine(
    (data) => {
      // Validation logic matching the API
      if (data.type === "transfer") {
        return data.from_account_id && data.to_account_id;
      }
      return data.account_id && data.category_id;
    },
    {
      message:
        "Transfer requires both from and to accounts. Income/expense requires account and category.",
    },
  );

type TransactionFormSchema = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSuccess?: (transaction: unknown) => void;
  onCancel?: () => void;
  defaultValues?: Partial<TransactionFormSchema>;
  mode?: "create" | "edit";
  transactionId?: string;
  currency?: string;
  prefilledAmount?: number;
}

export function TransactionForm({
  onSuccess,
  onCancel,
  defaultValues,
  mode = "create",
  transactionId,
  currency = CURRENCY_DEFAULTS.DEFAULT_CURRENCY,
  prefilledAmount,
}: TransactionFormProps) {
  // Use centralized transaction mutations hook
  const {
    submitTransaction,
    isLoading,
    error: submitError,
    clearErrors,
  } = useTransactionForm({
    onSuccess,
  });

  // Use centralized accounts hook for fetching account details
  const { getAccountById } = useAccounts();

  const form = useForm<TransactionFormSchema>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      transaction_date: new Date(),
      amount: prefilledAmount || 0,
      description: "",
      // Merge defaultValues appropriately based on mode
      ...defaultValues,
      // Ensure prefilledAmount takes precedence over defaultValues.amount
      ...(prefilledAmount && { amount: prefilledAmount }),
    },
  });

  const watchedType = form.watch("type");
  const watchedToAccountId = form.watch("to_account_id");
  const watchedAmount = form.watch("amount");
  const watchedAccountId = form.watch("account_id");
  const watchedCategoryId = form.watch("category_id");
  const watchedFromAccountId = form.watch("from_account_id");
  const watchedInvestmentCategoryId = form.watch("investment_category_id");

  // Track previous transaction type to detect actual changes
  const prevTypeRef = useRef<string | undefined>(undefined);

  // Get account details using centralized hook
  const toAccount = getAccountById(watchedToAccountId || "");

  // Reset form with defaultValues when they change in edit mode
  useEffect(() => {

    if (mode === "edit" && defaultValues) {
      
      const resetData = {
        type: defaultValues.type || "expense",
        transaction_date: new Date(),
        amount: 0,
        description: "",
        ...defaultValues,
      };
      
      
      form.reset(resetData);
      
    } else {
    }
  }, [mode, defaultValues, form]);

  // Handle prefilledAmount changes (for mobile flow)
  useEffect(() => {
    if (prefilledAmount && prefilledAmount > 0) {
      form.setValue("amount", prefilledAmount);
    }
  }, [prefilledAmount, form]);

  // Reset form fields when transaction type changes (but not on initial mount)
  useEffect(() => {
    // Skip reset on initial mount - preserve existing values from defaultValues
    if (prevTypeRef.current === undefined) {
      prevTypeRef.current = watchedType;
      return;
    }
    
    // Only reset when type actually changes from previous value
    if (prevTypeRef.current !== watchedType) {
      // Reset incompatible fields when transaction type changes
      if (watchedType === "transfer") {
        form.setValue("account_id", undefined);
        form.setValue("category_id", "");
      } else {
        form.setValue("from_account_id", undefined);
        form.setValue("to_account_id", undefined);
        form.setValue("investment_category_id", undefined);
        // Always clear category when switching between income and expense
        form.setValue("category_id", "");
      }
    }
    
    // Update previous type for next comparison
    prevTypeRef.current = watchedType;
  }, [watchedType, form]);

  const onSubmit = async (data: TransactionFormSchema) => {
    clearErrors();

    // Transform form data to match API format
    const formData: TransactionFormData = {
      type: data.type,
      amount: data.amount.toString(),
      transaction_date: data.transaction_date,
      description: data.description,
      account_id: data.account_id,
      category_id: data.category_id,
      from_account_id: data.from_account_id,
      to_account_id: data.to_account_id,
      investment_category_id: data.investment_category_id,
    };

    const result = await submitTransaction(formData, mode, transactionId);

    // Dispatch event to notify other components about transaction update
    if (result) {
      window.dispatchEvent(new Event("transactionUpdated"));
    }

    // Reset form if creating new transaction and submission was successful
    if (mode === "create" && result) {
      form.reset({
        type: data.type, // Keep the same type
        transaction_date: new Date(),
        amount: 0,
        description: "",
      });
    }
  };

  const showInvestmentCategory =
    watchedType === "transfer" && toAccount?.type === "investment_account";

  // Check if all required fields are filled
  const isFormValid = () => {
    // Amount must be greater than 0
    if (!watchedAmount || watchedAmount <= 0) return false;
    
    if (watchedType === "transfer") {
      // Transfer requires from and to accounts
      if (!watchedFromAccountId || !watchedToAccountId) return false;
      
      // If transferring to investment account, investment category is required
      if (showInvestmentCategory && !watchedInvestmentCategoryId) return false;
    } else {
      // Income/expense requires account and category
      if (!watchedAccountId || !watchedCategoryId) return false;
    }
    
    return true;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Transaction Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Type</FormLabel>
              <FormControl>
                <Tabs value={field.value} onValueChange={field.onChange}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="income">Income</TabsTrigger>
                    <TabsTrigger value="expense">Expense</TabsTrigger>
                    <TabsTrigger value="transfer">Transfer</TabsTrigger>
                  </TabsList>
                </Tabs>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <CurrencyInput
                  currency={currency}
                  value={field.value}
                  onChange={(_, numericValue) => {
                    field.onChange(numericValue);
                  }}
                  placeholder="0"
                />
              </FormControl>
              <FormDescription>
                Enter the transaction amount in {currency}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date */}
        <FormField
          control={form.control}
          name="transaction_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        format(field.value, DATE_FORMATS.FILTER_DISPLAY)
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditional Fields based on Transaction Type */}
        {watchedType === "transfer" ? (
          <>
            {/* From Account */}
            <FormField
              control={form.control}
              name="from_account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Account</FormLabel>
                  <FormControl>
                    <AccountSelector
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select source account..."
                      filterByType={ACCOUNT_FILTER_OPTIONS.TRANSFER_FROM}
                      error={form.formState.errors.from_account_id?.message}
                      currency={currency}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* To Account */}
            <FormField
              control={form.control}
              name="to_account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Account</FormLabel>
                  <FormControl>
                    <AccountSelector
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select destination account..."
                      error={form.formState.errors.to_account_id?.message}
                      currency={currency}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Investment Category (shown only for investment accounts) */}
            {showInvestmentCategory && (
              <FormField
                control={form.control}
                name="investment_category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Category</FormLabel>
                    <FormControl>
                      <CategorySelector
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select investment category..."
                        filterByType="investment"
                        error={
                          form.formState.errors.investment_category_id?.message
                        }
                        currency={currency}
                      />
                    </FormControl>
                    <FormDescription>
                      Required when transferring to an investment account
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        ) : (
          <>
            {/* Account (for income/expense) */}
            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <FormControl>
                    <AccountSelector
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select account..."
                      error={form.formState.errors.account_id?.message}
                      currency={currency}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category (for income/expense) */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <CategorySelector
                      key={`category-${watchedType}`}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select category..."
                      filterByType={
                        watchedType === "income" ? "income" : "expense"
                      }
                      error={form.formState.errors.category_id?.message}
                      currency={currency}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add a note about this transaction..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Error Message */}
        {submitError && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
            {submitError}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading || !isFormValid()}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "edit" ? "Update Transaction" : "Add Transaction"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
