"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCurrencySettings } from "@/hooks/use-currency-settings";
import { Account as BaseAccount } from "@/types/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  CreditCard,
  TrendingUp,
  Building,
  Plus,
  X,
  Target,
} from "lucide-react";

interface AccountSetupStepProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

interface Account {
  id: string;
  name: string;
  type: "bank_account" | "credit_card" | "investment_account";
  initial_balance: number;
  current_balance?: number;
  isNew?: boolean;
}

const accountTypes = [
  {
    value: "bank_account",
    label: "Bank Account",
    description: "Checking, savings, or other bank accounts",
    icon: Building,
    example: "BCA Checking, Mandiri Savings",
  },
  {
    value: "credit_card",
    label: "Credit Card",
    description: "Credit cards and lines of credit",
    icon: CreditCard,
    example: "Visa, Mastercard, AMEX",
  },
  {
    value: "investment_account",
    label: "Investment Account",
    description: "Investment portfolios and funds",
    icon: TrendingUp,
    example: "Mutual funds, Stock portfolio",
  },
];

const currencies = {
  IDR: { symbol: "Rp", name: "Indonesian Rupiah" },
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
};

export default function AccountSetupStep({
  onNext,
  onPrevious,
  isFirstStep,
}: AccountSetupStepProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "",
    initial_balance: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const { currency: userCurrency } = useCurrencySettings();

  // Load existing accounts
  useEffect(() => {
    async function loadUserData() {
      if (!user) return;

      try {
        // Load existing accounts
        const response = await fetch("/api/accounts");
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            // Transform API accounts to match local interface
            const existingAccounts = result.data.map((acc: BaseAccount) => ({
              id: acc.id,
              name: acc.name,
              type: acc.type,
              initial_balance: acc.initial_balance || 0,
              current_balance: acc.current_balance,
              isNew: false,
            }));
            setAccounts(existingAccounts);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadUserData();
  }, [user]);

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    const currencyInfo =
      currencies[userCurrency as keyof typeof currencies] || currencies.USD;
    return `${currencyInfo.symbol}${amount.toLocaleString()}`;
  };

  const addCustomAccount = () => {
    if (
      !newAccount.name.trim() ||
      !newAccount.type ||
      !newAccount.initial_balance
    ) {
      setError("Please fill in all fields");
      return;
    }

    const balance = parseFloat(newAccount.initial_balance);
    if (isNaN(balance)) {
      setError("Please enter a valid balance amount");
      return;
    }

    // Check for duplicate account names
    if (
      accounts.some(
        (acc) =>
          acc.name.toLowerCase() === newAccount.name.trim().toLowerCase(),
      )
    ) {
      setError("Account name already exists");
      return;
    }

    const account: Account = {
      id: `account-${Date.now()}-${Math.random()}`,
      name: newAccount.name.trim(),
      type: newAccount.type as
        | "bank_account"
        | "credit_card"
        | "investment_account",
      initial_balance: balance,
      isNew: true,
    };

    setAccounts((prev) => [...prev, account]);
    setNewAccount({
      name: "",
      type: "",
      initial_balance: "",
    });
    setError("");
  };

  const removeAccount = async (id: string) => {
    const account = accounts.find((acc) => acc.id === id);
    if (!account) return;

    // If it's a new account (client-only), just remove from state
    if (account.isNew) {
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
      return;
    }

    // If it's an existing account, delete from database
    try {
      setError(""); // Clear any previous errors
      const response = await fetch("/api/accounts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ account_id: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete account");
      }

      // Remove from state on successful deletion
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    } catch (error) {
      console.error("Error deleting account:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete account",
      );
    }
  };

  const handleNext = async () => {
    if (accounts.length === 0) {
      setError("Please add at least one account to continue");
      return;
    }

    // Filter out accounts that are already in the database (existing accounts)
    const newAccounts = accounts.filter((acc) => acc.isNew);

    try {
      setIsLoading(true);
      setError("");

      // Create only new accounts via API
      const promises = newAccounts.map(async (account) => {
        const response = await fetch("/api/accounts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: account.name,
            type: account.type,
            initial_balance: account.initial_balance,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Failed to create account: ${account.name}`,
          );
        }

        return response.json();
      });

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      // Mark step 2 as completed
      const stepResponse = await fetch("/api/onboarding", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: 2,
          completed: true,
        }),
      });

      if (!stepResponse.ok) {
        const errorData = await stepResponse.json();
        throw new Error(errorData.message || "Failed to update step progress");
      }

      onNext();
    } catch (error) {
      console.error("Error creating accounts:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create accounts",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const getAccountTypeIcon = (type: string) => {
    const accountType = accountTypes.find((t) => t.value === type);
    return accountType ? accountType.icon : Wallet;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
          <Wallet className="h-8 w-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {accounts.length > 0
            ? "Manage Your Accounts"
            : "Create Your First Account"}
        </h2>
        <p className="mx-auto max-w-md text-gray-600">
          {accounts.length > 0
            ? "Add your financial accounts to start tracking your money. You can add more accounts later in the settings."
            : "Add your primary financial account to start tracking your money. You can add more accounts later in the settings."}
        </p>
      </div>

      {/* Account Creation Form */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <h4 className="font-medium text-gray-900">Add Account</h4>

          <div className="space-y-4">
            {/* Account Name */}
            <div>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  Account Name
                </span>
                <Input
                  type="text"
                  placeholder="e.g., BCA Checking, Mandiri Savings"
                  value={newAccount.name}
                  onChange={(e) =>
                    setNewAccount((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full"
                />
              </label>
            </div>

            {/* Account Type */}
            <div>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  Account Type
                </span>
                <Select
                  value={newAccount.type}
                  onValueChange={(value) =>
                    setNewAccount((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </label>
            </div>

            {/* Initial Balance */}
            <div>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  Current Balance
                </span>
                <CurrencyInput
                  currency={userCurrency}
                  value={newAccount.initial_balance}
                  onChange={(displayValue, numericValue) => {
                    setNewAccount((prev) => ({
                      ...prev,
                      initial_balance: numericValue.toString(),
                    }))
                  }}
                  placeholder="0"
                  className="w-full"
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Enter your current account balance. For credit cards, enter 0 if
                no outstanding balance.
              </p>
            </div>

            <Button onClick={addCustomAccount} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Added Accounts */}
      {accounts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="mb-3 font-medium text-gray-900">
              Your Accounts ({accounts.length})
            </h4>
            <div className="space-y-2">
              {accounts.map((account) => {
                const Icon = getAccountTypeIcon(account.type);
                const isExisting = !account.isNew;
                return (
                  <div
                    key={account.id}
                    className={`flex items-center justify-between rounded-lg p-3 ${
                      isExisting
                        ? "border border-green-200 bg-green-50"
                        : "border border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-5 w-5 ${
                          isExisting ? "text-green-600" : "text-gray-600"
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {account.name}
                          </p>
                          {isExisting && (
                            <Badge
                              variant="outline"
                              className="border-green-300 bg-green-100 text-xs text-green-700"
                            >
                              Existing
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 capitalize">
                          {account.type.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(
                            account.current_balance || account.initial_balance,
                          )}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAccount(account.id)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Summary */}
      {accounts.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-green-900">Accounts Summary</h4>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="font-medium text-green-900">
                  {accounts.filter((a) => a.type === "bank_account").length}
                </p>
                <p className="text-green-700">Bank</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-green-900">
                  {accounts.filter((a) => a.type === "credit_card").length}
                </p>
                <p className="text-green-700">Credit</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-green-900">
                  {
                    accounts.filter((a) => a.type === "investment_account")
                      .length
                  }
                </p>
                <p className="text-green-700">Investment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Card className="border-dashed bg-gray-50">
        <CardContent className="p-4">
          <h4 className="mb-2 font-medium text-gray-900">💡 Quick Tips</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>
              • Use descriptive names like "BCA Checking" or "CIMB Savings"
            </li>
            <li>• You can add multiple accounts of the same type</li>
            <li>• Credit card balances represent what you owe</li>
            <li>• Investment accounts track your portfolio value</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstStep || isLoading}
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={accounts.length === 0 || isLoading}
        >
          {isLoading ? "Creating Accounts..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
