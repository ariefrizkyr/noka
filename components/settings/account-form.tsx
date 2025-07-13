"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { AccountFormData, FormComponentProps } from "@/types/common";
import { getCurrencySymbol } from "@/lib/currency-utils";

interface AccountFormProps extends FormComponentProps<AccountFormData> {
  userCurrency: string;
}

export function AccountForm({
  data,
  loading,
  onSubmit,
  onCancel,
  isEdit = false,
  userCurrency,
}: AccountFormProps) {
  const [formData, setFormData] = useState<AccountFormData>(data);

  const handleInputChange = (field: keyof AccountFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Account Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Enter account name (e.g., 'BCA Savings', 'Visa Credit Card')"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Account Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleInputChange("type", value)}
          disabled={isEdit}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank_account">Bank Account</SelectItem>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="investment_account">
              Investment Account
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="initial_balance">Initial Balance</Label>
          <div className="relative">
            <Input
              id="initial_balance"
              type="number"
              value={formData.initial_balance}
              onChange={(e) =>
                handleInputChange("initial_balance", e.target.value)
              }
              placeholder="Enter initial balance"
              className="pl-8"
            />
            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
              {getCurrencySymbol(userCurrency)}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {formData.type === "credit_card"
              ? "Enter the current debt amount (positive number for debt)"
              : "Enter the current balance in this account"}
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading || !formData.name}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : isEdit ? (
            "Update Account"
          ) : (
            "Create Account"
          )}
        </Button>
      </div>
    </div>
  );
}
