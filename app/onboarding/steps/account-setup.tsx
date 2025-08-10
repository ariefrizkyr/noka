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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
  account_scope?: 'personal' | 'joint';
  family_id?: string;
}

interface UserFamily {
  id: string;
  name: string;
  user_role: 'admin' | 'member';
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
    initial_balance: 0,
    account_scope: "personal" as 'personal' | 'joint',
    family_id: "",
  });
  const [families, setFamilies] = useState<UserFamily[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<{
    name: string;
    type: string;
    initial_balance: string | number;
    account_scope: 'personal' | 'joint';
    family_id: string;
  } | null>(null);
  const { user } = useAuth();
  const { currency: userCurrency } = useCurrencySettings();

  // Check for onboarding family context
  const onboardingFamilyId = typeof window !== 'undefined' 
    ? sessionStorage.getItem("onboardingFamilyId") 
    : null;

  // Load existing accounts and families
  useEffect(() => {
    async function loadUserData() {
      if (!user) return;

      try {
        setLoadingFamilies(true);
        // Load existing accounts and families in parallel
        const [accountsResponse, familiesResponse] = await Promise.all([
          fetch("/api/accounts"),
          fetch("/api/families")
        ]);
        
        // Handle accounts
        if (accountsResponse.ok) {
          const result = await accountsResponse.json();
          if (result.data) {
            // Transform API accounts to match local interface
            const existingAccounts = result.data.map((acc: BaseAccount) => ({
              id: acc.id,
              name: acc.name,
              type: acc.type,
              initial_balance: acc.initial_balance || 0,
              current_balance: acc.current_balance,
              isNew: false,
              account_scope: acc.account_scope || 'personal',
              family_id: acc.family_id
            }));
            setAccounts(existingAccounts);
          }
        }

        // Handle families
        if (familiesResponse.ok) {
          const familiesResult = await familiesResponse.json();
          setFamilies(familiesResult.data || []);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoadingData(false);
        setLoadingFamilies(false);
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
      typeof newAccount.initial_balance !== "number"
    ) {
      setError("Please fill in all fields");
      return;
    }

    // Validate joint account requirements
    if (newAccount.account_scope === 'joint') {
      const adminFamilies = families.filter(f => f.user_role === 'admin');
      if (adminFamilies.length === 0 && !onboardingFamilyId) {
        setError("You must be an admin of a family to create joint accounts");
        return;
      }
      if (!newAccount.family_id && !onboardingFamilyId) {
        setError("Please select a family for the joint account");
        return;
      }
    }

    const balance = newAccount.initial_balance;
    if (typeof balance !== "number" || isNaN(balance)) {
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
      account_scope: newAccount.account_scope,
      family_id: newAccount.account_scope === 'joint' 
        ? (onboardingFamilyId || newAccount.family_id) 
        : undefined,
    };

    setAccounts((prev) => [...prev, account]);
    setNewAccount({
      name: "",
      type: "",
      initial_balance: 0,
      account_scope: "personal",
      family_id: "",
    });
    setError("");
  };

  const startEditingAccount = (account: Account) => {
    setEditingAccountId(account.id);
    setEditingAccount({
      name: account.name,
      type: account.type,
      initial_balance: account.initial_balance,
      account_scope: account.account_scope || 'personal',
      family_id: account.family_id || "",
    });
  };

  const cancelEditingAccount = () => {
    setEditingAccountId(null);
    setEditingAccount(null);
    setError("");
  };

  const saveAccountEdit = async () => {
    if (!editingAccountId || !editingAccount) return;

    const account = accounts.find((acc) => acc.id === editingAccountId);
    if (!account) return;

    // Validate input
    if (!editingAccount.name.trim() || !editingAccount.type) {
      setError("Please fill in all required fields");
      return;
    }

    const balance = typeof editingAccount.initial_balance === "number" 
      ? editingAccount.initial_balance 
      : parseFloat(editingAccount.initial_balance);
    if (isNaN(balance)) {
      setError("Please enter a valid balance amount");
      return;
    }

    // Validate joint account requirements
    if (editingAccount.account_scope === 'joint') {
      const adminFamilies = families.filter(f => f.user_role === 'admin');
      if (adminFamilies.length === 0 && !onboardingFamilyId) {
        setError("You must be an admin of a family to create joint accounts");
        return;
      }
      if (!editingAccount.family_id && !onboardingFamilyId) {
        setError("Please select a family for the joint account");
        return;
      }
    }

    // Check for duplicate account names (excluding current account)
    if (
      accounts.some(
        (acc) =>
          acc.id !== editingAccountId &&
          acc.name.toLowerCase() === editingAccount.name.trim().toLowerCase(),
      )
    ) {
      setError("Account name already exists");
      return;
    }

    try {
      setError("");

      // If it's a new account, just update state
      if (account.isNew) {
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === editingAccountId
              ? {
                  ...acc,
                  name: editingAccount.name.trim(),
                  type: editingAccount.type as
                    | "bank_account"
                    | "credit_card"
                    | "investment_account",
                  initial_balance: balance,
                  account_scope: editingAccount.account_scope,
                  family_id: editingAccount.account_scope === 'joint' 
                    ? (onboardingFamilyId || editingAccount.family_id) 
                    : undefined,
                }
              : acc,
          ),
        );
      } else {
        // If it's an existing account, update via API
        const response = await fetch("/api/accounts", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            account_id: editingAccountId,
            name: editingAccount.name.trim(),
            type: editingAccount.type,
            initial_balance: balance,
            account_scope: editingAccount.account_scope,
            family_id: editingAccount.account_scope === 'joint' 
              ? (onboardingFamilyId || editingAccount.family_id)
              : null,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update account");
        }

        // Update state on successful update
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === editingAccountId
              ? {
                  ...acc,
                  name: editingAccount.name.trim(),
                  type: editingAccount.type as
                    | "bank_account"
                    | "credit_card"
                    | "investment_account",
                  initial_balance: balance,
                  account_scope: editingAccount.account_scope,
                  family_id: editingAccount.account_scope === 'joint' 
                    ? (onboardingFamilyId || editingAccount.family_id) 
                    : undefined,
                }
              : acc,
          ),
        );
      }

      cancelEditingAccount();
    } catch (error) {
      console.error("Error updating account:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update account",
      );
    }
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
            account_scope: account.account_scope,
            family_id: account.account_scope === 'joint' 
              ? (onboardingFamilyId || account.family_id)
              : account.family_id,
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
                      initial_balance: numericValue,
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

            {/* Account Scope */}
            <div>
              <Label className="block mb-2 text-sm font-medium text-gray-700">
                Account Scope
              </Label>
              <RadioGroup
                value={newAccount.account_scope}
                onValueChange={(value) => {
                  const scope = value as 'personal' | 'joint';
                  setNewAccount(prev => ({
                    ...prev,
                    account_scope: scope,
                    family_id: scope === 'personal' ? '' : prev.family_id
                  }));
                }}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal" id="personal-onboard" />
                  <Label htmlFor="personal-onboard" className="font-normal cursor-pointer text-sm">
                    Personal Account
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="joint" id="joint-onboard" />
                  <Label htmlFor="joint-onboard" className="font-normal cursor-pointer text-sm">
                    Joint Account (Family)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Family Selection for Joint Accounts */}
            {newAccount.account_scope === 'joint' && !onboardingFamilyId && (
              <div>
                <Label className="block mb-2 text-sm font-medium text-gray-700">
                  Family
                </Label>
                <Select
                  value={newAccount.family_id}
                  onValueChange={(value) => 
                    setNewAccount(prev => ({ ...prev, family_id: value }))
                  }
                  disabled={loadingFamilies}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue 
                      placeholder={loadingFamilies ? "Loading families..." : "Select family"} 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {families
                      .filter(f => f.user_role === 'admin')
                      .map((family) => (
                        <SelectItem key={family.id} value={family.id}>
                          {family.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {families.filter(f => f.user_role === 'admin').length === 0 && (
                  <p className="mt-1 text-sm text-amber-600">
                    You must be an admin of a family to create joint accounts
                  </p>
                )}
              </div>
            )}

            {/* Family Auto-Assignment Info */}
            {newAccount.account_scope === 'joint' && onboardingFamilyId && (
              <div>
                <Label className="block mb-2 text-sm font-medium text-gray-700">
                  Family
                </Label>
                <div className="rounded-md border border-green-200 bg-green-50 p-3">
                  <p className="text-sm text-green-700">
                    ✓ Joint account will be assigned to your new family
                  </p>
                </div>
              </div>
            )}

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
                const isEditing = editingAccountId === account.id;
                
                if (isEditing) {
                  return (
                    <div
                      key={account.id}
                      className="rounded-lg border border-blue-300 bg-blue-50 p-3"
                    >
                      <div className="space-y-3">
                        {/* Account Name */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Account Name
                          </Label>
                          <Input
                            value={editingAccount?.name || ""}
                            onChange={(e) =>
                              setEditingAccount((prev) => 
                                prev ? { ...prev, name: e.target.value } : null
                              )
                            }
                            className="mt-1"
                          />
                        </div>

                        {/* Account Type */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Account Type
                          </Label>
                          <Select
                            value={editingAccount?.type || ""}
                            onValueChange={(value) =>
                              setEditingAccount((prev) => 
                                prev ? { ...prev, type: value } : null
                              )
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {accountTypes.map((type) => {
                                const TypeIcon = type.icon;
                                return (
                                  <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-3">
                                      <TypeIcon className="h-4 w-4" />
                                      <span>{type.label}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Current Balance */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Current Balance
                          </Label>
                          <CurrencyInput
                            currency={userCurrency}
                            value={editingAccount?.initial_balance || ""}
                            onChange={(displayValue, numericValue) => {
                              setEditingAccount((prev) => 
                                prev ? { ...prev, initial_balance: numericValue } : null
                              );
                            }}
                            className="mt-1"
                          />
                        </div>

                        {/* Account Scope */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Account Scope
                          </Label>
                          <RadioGroup
                            value={editingAccount?.account_scope || "personal"}
                            onValueChange={(value) => {
                              const scope = value as 'personal' | 'joint';
                              setEditingAccount((prev) => 
                                prev ? {
                                  ...prev,
                                  account_scope: scope,
                                  family_id: scope === 'personal' ? '' : prev.family_id
                                } : null
                              );
                            }}
                            className="mt-1 flex flex-row space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="personal" id={`personal-edit-${account.id}`} />
                              <Label htmlFor={`personal-edit-${account.id}`} className="text-sm">
                                Personal
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="joint" id={`joint-edit-${account.id}`} />
                              <Label htmlFor={`joint-edit-${account.id}`} className="text-sm">
                                Joint
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Family Selection for Joint Accounts */}
                        {editingAccount?.account_scope === 'joint' && !onboardingFamilyId && (
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Family
                            </Label>
                            <Select
                              value={editingAccount?.family_id || ""}
                              onValueChange={(value) => 
                                setEditingAccount((prev) => 
                                  prev ? { ...prev, family_id: value } : null
                                )
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select family" />
                              </SelectTrigger>
                              <SelectContent>
                                {families
                                  .filter(f => f.user_role === 'admin')
                                  .map((family) => (
                                    <SelectItem key={family.id} value={family.id}>
                                      {family.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Edit Actions */}
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEditingAccount}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={saveAccountEdit}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={account.id}
                    className={`flex items-center justify-between rounded-lg p-3 cursor-pointer transition-colors ${
                      isExisting
                        ? "border border-green-200 bg-green-50 hover:bg-green-100"
                        : "border border-gray-200 bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => startEditingAccount(account)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-5 w-5 ${
                          isExisting ? "text-green-600" : "text-gray-600"
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
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
                          {account.account_scope === 'joint' && (
                            <Badge
                              variant="outline"
                              className="border-purple-300 bg-purple-100 text-xs text-purple-700"
                            >
                              Joint
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="capitalize">
                            {account.type.replace("_", " ")}
                          </span>
                          {account.account_scope === 'joint' && account.family_id && (
                            <span className="text-purple-600">
                              • {families.find(f => f.id === account.family_id)?.name || 'Family'}
                            </span>
                          )}
                        </div>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAccount(account.id);
                        }}
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
