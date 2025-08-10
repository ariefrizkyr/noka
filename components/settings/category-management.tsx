"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Receipt,
  TrendingUp,
  Target,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Category, GroupedCategoriesWithFamily, CategoryFormData } from "@/types/common";
import { useApiData } from "@/hooks/use-api-data";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { formatCurrency } from "@/lib/currency-utils";
import { CategoryForm } from "./category-form";
import { CategoryDeleteDialog } from "./category-delete-dialog";

interface CategoryManagementProps {
  userCurrency: string;
}

export function CategoryManagement({ userCurrency }: CategoryManagementProps) {
  const isMobile = useIsMobile();
  const {
    data: categoriesData,
    loading,
    refetch,
  } = useApiData<{ grouped: GroupedCategoriesWithFamily }>("/api/categories");
  const categories = categoriesData?.grouped;

  const {
    isAddOpen,
    isEditOpen,
    isDeleteOpen,
    editingItem,
    deleteDialogState,
    openAddDialog,
    closeAddDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    setSelectedReassignId,
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCrudDialog<Category>("/api/categories", {
    entityName: "Category",
    onRefresh: refetch,
    checkTransactionsEndpoint: (id: string) =>
      `/api/transactions?category_id=${id}&limit=1`,
  });

  const [addFormType, setAddFormType] = useState<
    "expense" | "income" | "investment"
  >("expense");

  const getCategoryTypeInfo = (type: string) => {
    switch (type) {
      case "expense":
        return {
          label: "Expense Category",
          pluralLabel: "Expense Categories",
          badgeColor: "bg-red-100 text-red-800",
          icon: Receipt,
          description: "Track spending and set budgets",
        };
      case "income":
        return {
          label: "Income Category",
          pluralLabel: "Income Categories",
          badgeColor: "bg-green-100 text-green-800",
          icon: TrendingUp,
          description: "Track income sources",
        };
      case "investment":
        return {
          label: "Investment Category",
          pluralLabel: "Investment Categories",
          badgeColor: "bg-blue-100 text-blue-800",
          icon: Target,
          description: "Track investments and set targets",
        };
      default:
        return {
          label: "Other Category",
          pluralLabel: "Other Categories",
          badgeColor: "bg-gray-100 text-gray-800",
          icon: Receipt,
          description: "",
        };
    }
  };

  const formatBudget = (amount: number | null, frequency: string | null) => {
    if (!amount || !frequency) return "No budget set";

    const formatFrequency = (freq: string) => {
      switch (freq) {
        case "weekly":
          return "Weekly";
        case "monthly":
          return "Monthly";
        case "one_time":
          return "One Time";
        default:
          return freq;
      }
    };

    return `${formatCurrency(amount, { currency: userCurrency })} ${formatFrequency(frequency)}`;
  };

  const handleAddNew = (
    type: "expense" | "income" | "investment" = "expense",
  ) => {
    setAddFormType(type);
    openAddDialog();
  };

  const handleFormSubmit = async (formData: CategoryFormData) => {
    const payload = {
      name: formData.name,
      type: formData.type,
      icon: formData.icon,
      budget_amount: formData.budget_amount
        ? (typeof formData.budget_amount === "number" 
           ? formData.budget_amount 
           : parseFloat(formData.budget_amount))
        : null,
      budget_frequency: formData.budget_frequency || null,
      is_shared: formData.is_shared || false,
      family_id: formData.family_id || undefined,
    };

    if (editingItem) {
      await handleUpdate(payload);
    } else {
      await handleCreate(payload);
    }
  };

  const getInitialFormData = (): CategoryFormData => {
    if (editingItem) {
      return {
        name: editingItem.name,
        type: editingItem.type,
        icon: editingItem.icon || "📁",
        budget_amount: editingItem.budget_amount?.toString() || "",
        budget_frequency: editingItem.budget_frequency || "",
        is_shared: editingItem.is_shared || false,
        family_id: editingItem.family_id || undefined,
      };
    }

    return {
      name: "",
      type: addFormType,
      icon: "📁",
      budget_amount: "",
      budget_frequency: "",
      is_shared: false,
      family_id: undefined,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const categoryTypes = ["expense", "income", "investment"] as const;

  return (
    <div className="space-y-6">
      <Button onClick={() => handleAddNew()} className="w-full gap-2">
        <Plus className="h-4 w-4" />
        Add New
      </Button>

      {categoryTypes.map((type) => {
        const typeInfo = getCategoryTypeInfo(type);
        const typeCategories = categories?.[type] || [];
        const Icon = typeInfo.icon;

        return (
          <div key={type}>
            <div className="flex w-full items-center justify-between">
              <Badge className={`${typeInfo.badgeColor} mb-3`}>
                <Icon className="mr-0.5 h-4 w-4" />
                {typeInfo.pluralLabel}
              </Badge>
            </div>
            {typeCategories.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Icon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p>No {typeInfo.pluralLabel.toLowerCase()} found.</p>
                <p className="mb-3 text-sm">{typeInfo.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleAddNew(type)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First {typeInfo.label}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {typeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                        <span className="text-lg">{category.icon || "📁"}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{category.name}</h4>
                          {category.is_shared && category.family_name && (
                            <Badge
                              variant="outline"
                              className="border-purple-300 bg-purple-100 text-xs text-purple-700"
                            >
                              {category.family_name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatBudget(
                            category.budget_amount,
                            category.budget_frequency,
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          openDeleteDialog(category, typeCategories)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Add Category Sheet */}
      <Sheet open={isAddOpen} onOpenChange={closeAddDialog}>
        <SheetContent 
          side={isMobile ? "bottom" : "right"}
          className={`${
            isMobile
              ? "h-[90vh] w-full rounded-t-lg"
              : "h-full w-[600px] max-w-[90vw]"
          } flex flex-col p-0`}
        >
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>Add New Category</SheetTitle>
          </SheetHeader>
          <div className={`flex-1 ${isMobile ? "overflow-y-auto p-3" : "p-6"}`}>
            <CategoryForm
              data={getInitialFormData()}
              loading={isCreating}
              onSubmit={handleFormSubmit}
              onCancel={closeAddDialog}
              userCurrency={userCurrency}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Category Sheet */}
      <Sheet open={isEditOpen} onOpenChange={closeEditDialog}>
        <SheetContent 
          side={isMobile ? "bottom" : "right"}
          className={`${
            isMobile
              ? "h-[90vh] w-full rounded-t-lg"
              : "h-full w-[600px] max-w-[90vw]"
          } flex flex-col p-0`}
        >
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>Edit Category</SheetTitle>
          </SheetHeader>
          <div className={`flex-1 ${isMobile ? "overflow-y-auto p-3" : "p-6"}`}>
            <CategoryForm
              data={getInitialFormData()}
              loading={isUpdating}
              onSubmit={handleFormSubmit}
              onCancel={closeEditDialog}
              isEdit={true}
              userCurrency={userCurrency}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <CategoryDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={closeDeleteDialog}
        deleteState={deleteDialogState}
        onReassignChange={setSelectedReassignId}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
}
