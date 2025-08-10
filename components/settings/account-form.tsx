"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/auth-context";
import { AccountFormData, FormComponentProps } from "@/types/common";

interface AccountFormProps extends FormComponentProps<AccountFormData> {
  userCurrency: string;
}

interface UserFamily {
  id: string;
  name: string;
  user_role: 'admin' | 'member';
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
  const [families, setFamilies] = useState<UserFamily[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState(false);
  const { user } = useAuth();

  const handleInputChange = (field: keyof AccountFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  // Load user's families on mount
  useEffect(() => {
    const loadFamilies = async () => {
      if (!user) return;
      
      try {
        setLoadingFamilies(true);
        const response = await fetch('/api/families');
        if (response.ok) {
          const result = await response.json();
          setFamilies(result.data || []);
        }
      } catch (error) {
        console.error('Error loading families:', error);
      } finally {
        setLoadingFamilies(false);
      }
    };

    loadFamilies();
  }, [user]);

  // Handle scope change and reset family selection when switching to personal
  const handleScopeChange = (scope: string) => {
    const newScope = scope as 'personal' | 'joint';
    setFormData(prev => ({
      ...prev,
      account_scope: newScope,
      family_id: newScope === 'personal' ? undefined : prev.family_id
    }));
  };

  // Get admin families for joint account creation
  const adminFamilies = families.filter(f => f.user_role === 'admin');

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

      <div className="space-y-3">
        <Label>Account Scope</Label>
        <RadioGroup
          value={formData.account_scope || 'personal'}
          onValueChange={handleScopeChange}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="personal" id="personal" />
            <Label htmlFor="personal" className="font-normal cursor-pointer">
              Personal Account
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="joint" id="joint" />
            <Label htmlFor="joint" className="font-normal cursor-pointer">
              Joint Account (Family)
            </Label>
          </div>
        </RadioGroup>
        <p className="text-sm text-gray-500">
          {formData.account_scope === 'joint' ? (
            adminFamilies.length > 0 ? (
              "Only family administrators can create joint accounts"
            ) : (
              "You must be an admin of a family to create joint accounts"
            )
          ) : (
            "Personal accounts are only visible to you"
          )}
        </p>
      </div>

      {formData.account_scope === 'joint' && (
        <div className="space-y-2">
          <Label htmlFor="family">Family</Label>
          <Select
            value={formData.family_id || ''}
            onValueChange={(value) => handleInputChange('family_id', value)}
            disabled={loadingFamilies || adminFamilies.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue 
                placeholder={loadingFamilies ? "Loading families..." : "Select family"} 
              />
            </SelectTrigger>
            <SelectContent>
              {adminFamilies.map((family) => (
                <SelectItem key={family.id} value={family.id}>
                  {family.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {adminFamilies.length === 0 && !loadingFamilies && (
            <p className="text-sm text-amber-600">
              You must be an admin of a family to create joint accounts
            </p>
          )}
        </div>
      )}

      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="initial_balance">Initial Balance</Label>
          <CurrencyInput
            id="initial_balance"
            currency={userCurrency}
            value={formData.initial_balance}
            onChange={(displayValue, numericValue) => {
              handleInputChange("initial_balance", numericValue);
            }}
            placeholder="Enter initial balance"
          />
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
        <Button 
          onClick={handleSubmit} 
          disabled={
            loading || 
            !formData.name || 
            (formData.account_scope === 'joint' && (!formData.family_id || adminFamilies.length === 0))
          }
        >
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
