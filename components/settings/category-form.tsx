"use client";

import { useState } from "react";
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
import { CategoryFormData, FormComponentProps } from "@/types/common";

interface CategoryFormProps extends FormComponentProps<CategoryFormData> {
  userCurrency: string;
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

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
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
                handleInputChange("budget_amount", numericValue.toString());
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
        <Button onClick={handleSubmit} disabled={loading || !formData.name}>
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
