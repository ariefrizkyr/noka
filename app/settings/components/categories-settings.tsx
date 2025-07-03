'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmojiPicker from '@/components/ui/emoji-picker';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income' | 'investment';
  icon: string | null;
  budget_amount: number | null;
  budget_frequency: 'weekly' | 'monthly' | 'one_time' | null;
  is_active: boolean;
}

interface GroupedCategories {
  expense: Category[];
  income: Category[];
  investment: Category[];
}

interface CategoryFormData {
  name: string;
  type: 'expense' | 'income' | 'investment';
  icon: string;
  budget_amount: string;
  budget_frequency: 'weekly' | 'monthly' | 'one_time' | '';
}

export default function CategoriesSettings() {
  const [categories, setCategories] = useState<GroupedCategories | null>(null);
  const [loading, setLoading] = useState(true);
  const [userCurrency, setUserCurrency] = useState('USD');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    type: 'expense',
    icon: '📁',
    budget_amount: '',
    budget_frequency: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    category: Category | null;
    reassignOptions: Category[];
    selectedReassignCategory: string;
    hasTransactions: boolean;
    checkingTransactions: boolean;
  }>({
    isOpen: false,
    category: null,
    reassignOptions: [],
    selectedReassignCategory: '',
    hasTransactions: false,
    checkingTransactions: false,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch categories and user settings in parallel
      const [categoriesResponse, settingsResponse] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/settings')
      ]);

      if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
      if (!settingsResponse.ok) throw new Error('Failed to fetch settings');

      const [categoriesData, settingsData] = await Promise.all([
        categoriesResponse.json(),
        settingsResponse.json()
      ]);

      setCategories(categoriesData.data.grouped);
      setUserCurrency(settingsData.data.currency_code || 'USD');
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data = await response.json();
      setCategories(data.data.grouped);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const getCategoryTypeColor = (type: string) => {
    switch (type) {
      case 'expense':
        return 'bg-red-100 text-red-800';
      case 'income':
        return 'bg-green-100 text-green-800';
      case 'investment':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBudget = (amount: number | null, frequency: string | null) => {
    if (!amount || !frequency) return 'No budget set';
    
    // Get currency symbol
    const currencySymbols: Record<string, string> = {
      'USD': '$',
      'IDR': 'Rp',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'AUD': 'A$',
      'CAD': 'C$',
      'SGD': 'S$',
    };
    const symbol = currencySymbols[userCurrency] || '$';
    
    // Format frequency
    const formatFrequency = (freq: string) => {
      switch (freq) {
        case 'weekly': return 'Weekly';
        case 'monthly': return 'Monthly';
        case 'one_time': return 'One Time';
        default: return freq;
      }
    };
    
    return `${symbol}${amount.toLocaleString()} ${formatFrequency(frequency)}`;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      icon: '📁',
      budget_amount: '',
      budget_frequency: '',
    });
  };

  const handleAddNew = (type: 'expense' | 'income' | 'investment') => {
    resetForm();
    setFormData(prev => ({ ...prev, type }));
    setIsAddDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon || '📁',
      budget_amount: category.budget_amount?.toString() || '',
      budget_frequency: category.budget_frequency || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = async (isEdit = false) => {
    setFormLoading(true);
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        icon: formData.icon,
        budget_amount: formData.budget_amount ? parseFloat(formData.budget_amount) : null,
        budget_frequency: formData.budget_frequency || null,
      };

      let response;
      if (isEdit && editingCategory) {
        response = await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category_id: editingCategory.id, ...payload }),
        });
      } else {
        response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save category');
      }

      toast.success(isEdit ? 'Category updated successfully' : 'Category created successfully');
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = async (category: Category) => {
    if (!categories) return;
    
    // Get other categories of the same type for reassignment
    const reassignOptions = categories[category.type].filter(c => c.id !== category.id);
    
    // Set initial state and show dialog
    setDeleteDialogState({
      isOpen: true,
      category,
      reassignOptions,
      selectedReassignCategory: '',
      hasTransactions: false,
      checkingTransactions: true,
    });

    // Check if category has transactions
    try {
      const response = await fetch(`/api/transactions?category_id=${category.id}&limit=1`);
      if (response.ok) {
        const data = await response.json();
        const hasTransactions = data.data && data.data.transactions && data.data.transactions.length > 0;
        
        setDeleteDialogState(prev => ({
          ...prev,
          hasTransactions,
          checkingTransactions: false,
        }));
      } else {
        throw new Error('Failed to check transactions');
      }
    } catch (error) {
      console.error('Error checking transactions:', error);
      // If we can't check, assume there might be transactions for safety
      setDeleteDialogState(prev => ({
        ...prev,
        hasTransactions: true,
        checkingTransactions: false,
      }));
    }
  };

  const handleDelete = async () => {
    if (!deleteDialogState.category) return;

    setFormLoading(true);
    try {
      const payload: { category_id: string; new_category_id?: string } = {
        category_id: deleteDialogState.category.id,
      };

      if (deleteDialogState.selectedReassignCategory) {
        payload.new_category_id = deleteDialogState.selectedReassignCategory;
      }

      const response = await fetch('/api/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      toast.success('Category deleted successfully');
      setDeleteDialogState({
        isOpen: false,
        category: null,
        reassignOptions: [],
        selectedReassignCategory: '',
        hasTransactions: false,
        checkingTransactions: false,
      });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete category');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Manage your income, expense, and investment categories. Set budgets and targets to track your financial goals.
        </p>
      </div>

      {categories && Object.entries(categories).map(([type, categoryList]) => (
        <Card key={type}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge className={getCategoryTypeColor(type)}>
                {type.charAt(0).toUpperCase() + type.slice(1)} Categories
              </Badge>
              <span className="text-sm font-normal text-gray-500">
                ({categoryList.length} categories)
              </span>
            </CardTitle>
            <Button 
              size="sm" 
              onClick={() => handleAddNew(type as 'expense' | 'income' | 'investment')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New
            </Button>
          </CardHeader>
          <CardContent>
            {categoryList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No {type} categories found.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => handleAddNew(type as 'expense' | 'income' | 'investment')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First {type.charAt(0).toUpperCase() + type.slice(1)} Category
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {categoryList.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg">
                        {category.icon || '📁'}
                      </div>
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-gray-500">
                          {formatBudget(category.budget_amount, category.budget_frequency)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteClick(category)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={() => handleSubmit(false)}
            onCancel={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}
            loading={formLoading}
            isEdit={false}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={() => handleSubmit(true)}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setEditingCategory(null);
              resetForm();
            }}
            loading={formLoading}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteDialogState.isOpen} 
        onOpenChange={(isOpen) => setDeleteDialogState(prev => ({ ...prev, isOpen }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteDialogState.category?.name}&quot;?
            </AlertDialogDescription>
            
            <div className="space-y-4 mt-4">
              {deleteDialogState.checkingTransactions && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking for existing transactions...
                </div>
              )}
              
              {!deleteDialogState.checkingTransactions && deleteDialogState.hasTransactions && deleteDialogState.reassignOptions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-orange-600">
                    This category has existing transactions. Select a category to reassign them to:
                  </div>
                  <Select 
                    value={deleteDialogState.selectedReassignCategory} 
                    onValueChange={(value) => setDeleteDialogState(prev => ({ 
                      ...prev, 
                      selectedReassignCategory: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category for reassignment" />
                    </SelectTrigger>
                    <SelectContent>
                      {deleteDialogState.reassignOptions.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!deleteDialogState.checkingTransactions && deleteDialogState.hasTransactions && deleteDialogState.reassignOptions.length === 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="text-sm text-red-600">
                    Cannot delete this category because it has existing transactions and there are no other categories of the same type to reassign them to. Please create another category first.
                  </div>
                </div>
              )}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={formLoading || deleteDialogState.checkingTransactions || (deleteDialogState.hasTransactions && deleteDialogState.reassignOptions.length === 0) || (deleteDialogState.hasTransactions && !deleteDialogState.selectedReassignCategory)}
              className="bg-red-600 hover:bg-red-700"
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Category'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Category Form Component
interface CategoryFormProps {
  formData: CategoryFormData;
  setFormData: React.Dispatch<React.SetStateAction<CategoryFormData>>;
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
  isEdit: boolean;
}

function CategoryForm({ formData, setFormData, onSubmit, onCancel, loading, isEdit }: CategoryFormProps) {
  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getBudgetFrequenciesForCategory = (categoryType: 'expense' | 'income' | 'investment') => {
    switch (categoryType) {
      case 'expense':
        return [
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
        ];
      case 'investment':
        return [
          { value: 'monthly', label: 'Monthly' },
          { value: 'one_time', label: 'One Time' },
        ];
      default:
        return []; // No budget frequencies for income categories
    }
  };

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
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="investment">Investment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Icon</Label>
        <EmojiPicker
          value={formData.icon}
          onEmojiSelect={(emoji) => handleInputChange('icon', emoji)}
          placeholder="📁"
        />
      </div>

      {formData.type !== 'income' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="budget_amount">
              {formData.type === 'expense' ? 'Budget Amount' : 'Target Amount'}
            </Label>
            <Input
              id="budget_amount"
              type="number"
              value={formData.budget_amount}
              onChange={(e) => handleInputChange('budget_amount', e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget_frequency">Frequency</Label>
            <Select 
              value={formData.budget_frequency} 
              onValueChange={(value) => handleInputChange('budget_frequency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {getBudgetFrequenciesForCategory(formData.type).map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          onClick={onSubmit} 
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