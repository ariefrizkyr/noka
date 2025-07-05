'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmojiPicker from '@/components/ui/emoji-picker';
import { Loader2 } from 'lucide-react';
import { CategoryFormData, FormComponentProps } from '@/types/common';

interface CategoryFormProps extends FormComponentProps<CategoryFormData> {
  userCurrency: string;
}

export function CategoryForm({ 
  data, 
  loading, 
  onSubmit, 
  onCancel, 
  isEdit = false,
  userCurrency 
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>(data);

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'IDR': 'Rp',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'AUD': 'A$',
      'CAD': 'C$',
      'SGD': 'S$',
    };
    return symbols[currency] || '$';
  };

  const getBudgetFrequencyOptions = (type: string) => {
    switch (type) {
      case 'expense':
        return [
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
        ];
      case 'investment':
        return [
          { value: 'monthly', label: 'Monthly' },
          { value: 'one_time', label: 'One-time Goal' },
        ];
      default:
        return [];
    }
  };

  const shouldShowBudget = formData.type === 'expense' || formData.type === 'investment';
  const budgetOptions = getBudgetFrequencyOptions(formData.type);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter category name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Category Type</Label>
        <Select 
          value={formData.type} 
          onValueChange={(value) => handleInputChange('type', value)}
          disabled={isEdit}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense Category</SelectItem>
            <SelectItem value="income">Income Category</SelectItem>
            <SelectItem value="investment">Investment Category</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          {formData.type === 'expense' && 'Track spending and set budgets'}
          {formData.type === 'income' && 'Track income sources'}
          {formData.type === 'investment' && 'Track investments and set targets'}
        </p>
      </div>

      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="flex items-center gap-3">
          <div className="text-2xl">{formData.icon}</div>
          <EmojiPicker
            value={formData.icon}
            onEmojiSelect={(emoji: string) => handleInputChange('icon', emoji)}
          />
        </div>
      </div>

      {shouldShowBudget && (
        <>
          <div className="space-y-2">
            <Label htmlFor="budget_amount">
              {formData.type === 'expense' ? 'Budget Amount' : 'Investment Target'}
            </Label>
            <div className="relative">
              <Input
                id="budget_amount"
                type="number"
                value={formData.budget_amount}
                onChange={(e) => handleInputChange('budget_amount', e.target.value)}
                placeholder={`Enter amount in ${userCurrency}`}
                className="pl-8"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {getCurrencySymbol(userCurrency)}
              </span>
            </div>
          </div>

          {budgetOptions.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="budget_frequency">
                {formData.type === 'expense' ? 'Budget Period' : 'Target Period'}
              </Label>
              <Select 
                value={formData.budget_frequency} 
                onValueChange={(value) => handleInputChange('budget_frequency', value)}
              >
                <SelectTrigger>
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
          disabled={loading || !formData.name}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEdit ? 'Update Category' : 'Create Category'
          )}
        </Button>
      </div>
    </div>
  );
}