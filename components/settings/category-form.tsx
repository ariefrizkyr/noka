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
import EmojiPicker from "@/components/ui/emoji-picker";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/auth-context";
import { CategoryFormData, FormComponentProps } from "@/types/common";

interface CategoryFormProps extends FormComponentProps<CategoryFormData> {
  userCurrency: string;
}

interface UserFamily {
  id: string;
  name: string;
  user_role: 'admin' | 'member';
}

export function CategoryForm({
  data,
  loading,
  onSubmit,
  onCancel,
  isEdit = false,
  userCurrency,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>(data);
  const [families, setFamilies] = useState<UserFamily[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState(false);
  const { user } = useAuth();

  const handleInputChange = (field: keyof CategoryFormData, value: string | number) => {
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
  const handleScopeChange = (shared: string) => {
    const isShared = shared === 'true';
    setFormData(prev => ({
      ...prev,
      is_shared: isShared,
      family_id: isShared ? prev.family_id : undefined
    }));
  };


  const getBudgetFrequencyOptions = (type: string) => {
    switch (type) {
      case "expense":
        return [
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
        ];
      case "investment":
        return [
          { value: "monthly", label: "Monthly" },
          { value: "one_time", label: "One-time Goal" },
        ];
      default:
        return [];
    }
  };

  const shouldShowBudget =
    formData.type === "expense" || formData.type === "investment";
  const budgetOptions = getBudgetFrequencyOptions(formData.type);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <div className="flex items-center gap-2">
          {/* Icon selector section */}
          <EmojiPicker
            value={formData.icon}
            onEmojiSelect={(emoji: string) => handleInputChange("icon", emoji)}
          />

          {/* Category name input */}
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter category name"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Category Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleInputChange("type", value)}
          disabled={isEdit}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense Category</SelectItem>
            <SelectItem value="income">Income Category</SelectItem>
            <SelectItem value="investment">Investment Category</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          {formData.type === "expense" && "Track spending and set budgets"}
          {formData.type === "income" && "Track income sources"}
          {formData.type === "investment" &&
            "Track investments and set targets"}
        </p>
      </div>

      <div className="space-y-3">
        <Label>Category Scope</Label>
        <RadioGroup
          value={formData.is_shared ? 'true' : 'false'}
          onValueChange={handleScopeChange}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="personal-cat" />
            <Label htmlFor="personal-cat" className="font-normal cursor-pointer">
              Personal Category
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="shared-cat" />
            <Label htmlFor="shared-cat" className="font-normal cursor-pointer">
              Shared Category (Family)
            </Label>
          </div>
        </RadioGroup>
        <p className="text-sm text-gray-500">
          {formData.is_shared ? (
            families.length > 0 ? (
              "Shared categories are visible to all family members"
            ) : (
              "You must be part of a family to create shared categories"
            )
          ) : (
            "Personal categories are only visible to you"
          )}
        </p>
      </div>

      {formData.is_shared && (
        <div className="space-y-2">
          <Label htmlFor="family-cat">Family</Label>
          <Select
            value={formData.family_id || ''}
            onValueChange={(value) => handleInputChange('family_id', value)}
            disabled={loadingFamilies || families.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue 
                placeholder={loadingFamilies ? "Loading families..." : "Select family"} 
              />
            </SelectTrigger>
            <SelectContent>
              {families.map((family) => (
                <SelectItem key={family.id} value={family.id}>
                  {family.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {families.length === 0 && !loadingFamilies && (
            <p className="text-sm text-amber-600">
              You must be part of a family to create shared categories
            </p>
          )}
        </div>
      )}

      {shouldShowBudget && (
        <>
          <div className="space-y-2">
            <Label htmlFor="budget_amount">
              {formData.type === "expense"
                ? "Budget Amount"
                : "Investment Target"}
            </Label>
            <CurrencyInput
              id="budget_amount"
              currency={userCurrency}
              value={formData.budget_amount}
              onChange={(displayValue, numericValue) => {
                handleInputChange("budget_amount", numericValue);
              }}
              placeholder={`Enter amount in ${userCurrency}`}
            />
          </div>

          {budgetOptions.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="budget_frequency">
                {formData.type === "expense"
                  ? "Budget Period"
                  : "Target Period"}
              </Label>
              <Select
                value={formData.budget_frequency}
                onValueChange={(value) =>
                  handleInputChange("budget_frequency", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {budgetOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
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
            (formData.is_shared && (!formData.family_id || families.length === 0))
          }
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : isEdit ? (
            "Update Category"
          ) : (
            "Create Category"
          )}
        </Button>
      </div>
    </div>
  );
}
