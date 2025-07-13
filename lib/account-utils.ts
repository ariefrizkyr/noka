import { Building, CreditCard, TrendingUp, Wallet } from "lucide-react";

export interface AccountTypeInfo {
  label: string;
  pluralLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string; // For badges (bg + text)
  iconBgColor: string; // For icon background
  iconTextColor: string; // For icon text
}

export const getAccountTypeInfo = (type: string): AccountTypeInfo => {
  switch (type) {
    case "bank_account":
      return {
        label: "Bank Account",
        pluralLabel: "Bank Accounts",
        icon: Building,
        badgeColor: "bg-blue-100 text-blue-800",
        iconBgColor: "bg-blue-100",
        iconTextColor: "text-blue-600",
      };
    case "credit_card":
      return {
        label: "Credit Card",
        pluralLabel: "Credit Cards",
        icon: CreditCard,
        badgeColor: "bg-orange-100 text-orange-800",
        iconBgColor: "bg-orange-100",
        iconTextColor: "text-orange-600",
      };
    case "investment_account":
      return {
        label: "Investment Account",
        pluralLabel: "Investment Accounts",
        icon: TrendingUp,
        badgeColor: "bg-green-100 text-green-800",
        iconBgColor: "bg-green-100",
        iconTextColor: "text-green-600",
      };
    default:
      return {
        label: "Account",
        pluralLabel: "Accounts",
        icon: Wallet,
        badgeColor: "bg-gray-100 text-gray-800",
        iconBgColor: "bg-gray-100",
        iconTextColor: "text-gray-600",
      };
  }
};
