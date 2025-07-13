/**
 * Custom hook for fetching and managing accounts
 * Replaces inline API fetching in components
 */

import { useMemo } from "react";
import { useApiData } from "./use-api-data";
import type { Account, AccountType } from "@/types/common";

interface UseAccountsOptions {
  filterByType?: AccountType | AccountType[] | string;
  includeInactive?: boolean;
}

interface UseAccountsReturn {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  refetch: () => void;

  // Convenience functions
  getAccountById: (id: string) => Account | undefined;
  getAccountsByType: (type: AccountType) => Account[];
  groupedAccounts: Record<AccountType, Account[]>;
}

export function useAccounts(
  options: UseAccountsOptions = {},
): UseAccountsReturn {
  const { filterByType, includeInactive = false } = options;

  // Fetch all accounts using existing useApiData hook
  const {
    data: allAccounts = [],
    loading,
    error,
    refetch,
  } = useApiData<Account[]>("/api/accounts", {
    listenToEvents: ["transactionUpdated"],
  });

  // Filter and process accounts
  const accounts = useMemo(() => {
    // Handle null/undefined case
    if (!allAccounts || !Array.isArray(allAccounts)) {
      return [];
    }

    let filtered = allAccounts;

    // Filter by active status
    if (!includeInactive) {
      filtered = filtered.filter((account) => account.is_active);
    }

    // Filter by account type
    if (filterByType) {
      if (typeof filterByType === "string") {
        // Handle comma-separated types (e.g., "bank_account,credit_card")
        if (filterByType.includes(",")) {
          const allowedTypes = filterByType.split(",") as AccountType[];
          filtered = filtered.filter((account) =>
            allowedTypes.includes(account.type),
          );
        } else {
          filtered = filtered.filter(
            (account) => account.type === filterByType,
          );
        }
      } else if (Array.isArray(filterByType)) {
        filtered = filtered.filter((account) =>
          filterByType.includes(account.type),
        );
      } else {
        filtered = filtered.filter((account) => account.type === filterByType);
      }
    }

    return filtered;
  }, [allAccounts, filterByType, includeInactive]);

  // Convenience function to get account by ID
  const getAccountById = useMemo(() => {
    return (id: string) => {
      if (!allAccounts || !Array.isArray(allAccounts)) {
        return undefined;
      }
      return allAccounts.find((account) => account.id === id);
    };
  }, [allAccounts]);

  // Convenience function to get accounts by type
  const getAccountsByType = useMemo(() => {
    return (type: AccountType) =>
      accounts.filter((account) => account.type === type);
  }, [accounts]);

  // Group accounts by type
  const groupedAccounts = useMemo(() => {
    return accounts.reduce(
      (acc, account) => {
        const type = account.type;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(account);
        return acc;
      },
      {} as Record<AccountType, Account[]>,
    );
  }, [accounts]);

  return {
    accounts,
    loading,
    error: error ? "Failed to load accounts" : null,
    refetch,
    getAccountById,
    getAccountsByType,
    groupedAccounts,
  };
}

// Specialized hooks for common use cases
export function useBankAndCreditAccounts() {
  return useAccounts({
    filterByType: "bank_account,credit_card",
  });
}

export function useInvestmentAccounts() {
  return useAccounts({
    filterByType: "investment_account",
  });
}

export function useActiveAccounts() {
  return useAccounts({
    includeInactive: false,
  });
}
