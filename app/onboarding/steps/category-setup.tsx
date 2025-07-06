'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Category as BaseCategory, CategoryType, BudgetFrequency } from '@/types/common'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EmojiPicker from '@/components/ui/emoji-picker'
import { Tags, Target, Plus, X } from 'lucide-react'

interface CategorySetupStepProps {
  onNext: () => void
  onPrevious: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

interface Category {
  id: string
  name: string
  type: CategoryType
  icon: string
  budget_amount?: number
  budget_frequency?: BudgetFrequency
}

const categoryTypes = [
  { value: 'expense', label: 'Expense Category', description: 'Track spending and set budgets' },
  { value: 'income', label: 'Income Category', description: 'Track income sources' },
  { value: 'investment', label: 'Investment Category', description: 'Track investments and set targets' },
]

const expenseBudgetFrequencies = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

const investmentBudgetFrequencies = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'one_time', label: 'One-time Goal' },
]

const currencies = {
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
}

const defaultCategories = {
  expense: [
    { name: 'Food & Dining', icon: '🍔' },
    { name: 'Transportation', icon: '🚗' },
    { name: 'Shopping', icon: '🛒' },
    { name: 'Entertainment', icon: '🎬' },
  ],
  income: [
    { name: 'Salary', icon: '💰' },
    { name: 'Freelance', icon: '💼' },
  ],
  investment: [
    { name: 'Emergency Fund', icon: '🏦' },
    { name: 'Retirement Fund', icon: '📈' },
  ]
}

export default function CategorySetupStep({
  onNext,
  onPrevious,
  isFirstStep,
}: CategorySetupStepProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeTab, setActiveTab] = useState<CategoryType>('expense')
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as CategoryType,
    icon: '',
    budget_amount: '',
    budget_frequency: '' as BudgetFrequency | ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [userCurrency, setUserCurrency] = useState('IDR')
  const { user } = useAuth()

  // Load user's currency setting and existing categories
  useEffect(() => {
    async function loadUserData() {
      if (!user) return
      
      try {
        // Load currency settings
        const settingsResponse = await fetch('/api/settings')
        if (settingsResponse.ok) {
          const settingsResult = await settingsResponse.json()
          if (settingsResult.data?.currency_code) {
            setUserCurrency(settingsResult.data.currency_code)
          }
        }

        // Load existing categories
        const categoriesResponse = await fetch('/api/categories')
        if (categoriesResponse.ok) {
          const categoriesResult = await categoriesResponse.json()
          if (categoriesResult.data?.categories) {
            // Transform API categories to match local interface
            const existingCategories = categoriesResult.data.categories.map((cat: BaseCategory) => ({
              id: cat.id,
              name: cat.name,
              type: cat.type,
              icon: cat.icon || '📂',
              budget_amount: cat.budget_amount,
              budget_frequency: cat.budget_frequency,
            }))
            setCategories(existingCategories)
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadUserData()
  }, [user])

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    const currencyInfo = currencies[userCurrency as keyof typeof currencies] || currencies.USD
    return `${currencyInfo.symbol}${amount.toLocaleString()}`
  }

  // Helper function to get valid budget frequencies for category type
  const getBudgetFrequenciesForCategory = (categoryType: CategoryType) => {
    switch (categoryType) {
      case 'expense':
        return expenseBudgetFrequencies
      case 'investment':
        return investmentBudgetFrequencies
      default:
        return [] // No budget frequencies for income categories
    }
  }

  const addDefaultCategories = (type: CategoryType) => {
    const defaults = defaultCategories[type].map(cat => ({
      id: `default-${type}-${Date.now()}-${Math.random()}`,
      name: cat.name,
      type,
      icon: cat.icon,
    }))
    setCategories(prev => [...prev, ...defaults])
  }

  const addCustomCategory = () => {
    if (!newCategory.name.trim() || !newCategory.icon) {
      setError('Please enter a category name and select an emoji')
      return
    }

    const category: Category = {
      id: `custom-${Date.now()}-${Math.random()}`,
      name: newCategory.name.trim(),
      type: newCategory.type,
      icon: newCategory.icon,
    }

    // Add budget/target if specified
    if (newCategory.budget_amount && newCategory.budget_frequency) {
      const amount = parseFloat(newCategory.budget_amount)
      if (!isNaN(amount) && amount > 0) {
        category.budget_amount = amount
        category.budget_frequency = newCategory.budget_frequency
      }
    }

    setCategories(prev => [...prev, category])
    setNewCategory({
      name: '',
      type: activeTab,
      icon: '',
      budget_amount: '',
      budget_frequency: ''
    })
    setError('')
  }

  const removeCategory = async (id: string) => {
    // If it's a new category (temp ID), just remove from state
    if (id.startsWith('default-') || id.startsWith('custom-')) {
      setCategories(prev => prev.filter(cat => cat.id !== id))
      return
    }

    // If it's an existing category, delete from database
    try {
      setError('') // Clear any previous errors
      const response = await fetch('/api/categories', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category_id: id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete category')
      }

      // Remove from state on successful deletion
      setCategories(prev => prev.filter(cat => cat.id !== id))
    } catch (error) {
      console.error('Error deleting category:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete category')
    }
  }

  const handleNext = async () => {
    if (categories.length === 0) {
      setError('Please add at least one category to continue')
      return
    }

    // Filter out categories that are already in the database (have real IDs, not temporary ones)
    const newCategories = categories.filter(cat => 
      cat.id.startsWith('default-') || cat.id.startsWith('custom-')
    )

    try {
      setIsLoading(true)
      setError('')

      // Create only new categories via API
      const promises = newCategories.map(async (category) => {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: category.name,
            type: category.type,
            icon: category.icon,
            budget_amount: category.budget_amount || null,
            budget_frequency: category.budget_frequency || null,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Failed to create category: ${category.name}`)
        }

        return response.json()
      })

      if (promises.length > 0) {
        await Promise.all(promises)
      }
      onNext()
    } catch (error) {
      console.error('Error creating categories:', error)
      setError(error instanceof Error ? error.message : 'Failed to create categories')
    } finally {
      setIsLoading(false)
    }
  }

  const categoriesByType = categories.filter(cat => cat.type === activeTab)

  if (isLoadingData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
          <Tags className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {categories.length > 0 ? 'Manage Categories & Goals' : 'Create Categories & Set Goals'}
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          {categories.length > 0 
            ? 'You can add more categories or continue with your existing ones. Set budgets for expenses or targets for investments to track your progress.'
            : 'Organize your finances with categories. Set budgets for expenses or targets for investments to track your progress.'
          }
        </p>
      </div>

      {/* Category Type Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => {
        const newTab = value as typeof activeTab
        setActiveTab(newTab)
        
        // Clear budget frequency if it's not valid for the new category type
        const validFrequencies = getBudgetFrequenciesForCategory(newTab)
        const currentFrequency = newCategory.budget_frequency
        
        if (currentFrequency && !validFrequencies.some(freq => freq.value === currentFrequency)) {
          setNewCategory(prev => ({ ...prev, budget_frequency: '', type: newTab }))
        } else {
          setNewCategory(prev => ({ ...prev, type: newTab }))
        }
      }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expense">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="investment">Investments</TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        {categoryTypes.map((type) => (
          <TabsContent key={type.value} value={type.value} className="space-y-4">
            {/* Quick Add Default Categories */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">{type.label}</h4>
                    <p className="text-sm text-blue-700">{type.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addDefaultCategories(type.value as CategoryType)}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Common
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Custom Category Form */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h4 className="font-medium text-gray-900">Add Custom Category</h4>
                
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-2">
                    <EmojiPicker
                      value={newCategory.icon}
                      onEmojiSelect={(emoji) => setNewCategory(prev => ({ ...prev, icon: emoji }))}
                    />
                  </div>
                  <div className="col-span-10">
                    <Input
                      placeholder="Category name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value, type: activeTab }))}
                    />
                  </div>
                </div>

                {/* Budget/Target Settings for Expense & Investment */}
                {(activeTab === 'expense' || activeTab === 'investment') && (
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder={activeTab === 'expense' ? 'Budget amount' : 'Target amount'}
                      value={newCategory.budget_amount}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, budget_amount: e.target.value }))}
                    />
                    <Select 
                      value={newCategory.budget_frequency} 
                      onValueChange={(value) => setNewCategory(prev => ({ ...prev, budget_frequency: value as BudgetFrequency }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {getBudgetFrequenciesForCategory(activeTab).map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button onClick={addCustomCategory} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </CardContent>
            </Card>

            {/* Added Categories */}
            {categoriesByType.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Your {type.label} ({categoriesByType.length})
                  </h4>
                  <div className="space-y-2">
                    {categoriesByType.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{category.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900">{category.name}</p>
                            {category.budget_amount && (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {category.budget_frequency}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  {formatCurrency(category.budget_amount)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCategory(category.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Summary */}
      {categories.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-600" />
              <h4 className="font-medium text-green-900">Categories Summary</h4>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="font-medium text-green-900">
                  {categories.filter(c => c.type === 'expense').length}
                </p>
                <p className="text-green-700">Expense</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-green-900">
                  {categories.filter(c => c.type === 'income').length}
                </p>
                <p className="text-green-700">Income</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-green-900">
                  {categories.filter(c => c.type === 'investment').length}
                </p>
                <p className="text-green-700">Investment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          disabled={categories.length === 0 || isLoading}
        >
          {isLoading ? 'Completing Setup...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  )
}