"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useCategories } from "@/hooks/use-categories"
import { formatBudgetAmount } from "@/lib/currency-utils"
import { CATEGORY_TYPE_CONFIG, SELECTOR_PLACEHOLDERS, CURRENCY_DEFAULTS } from "@/lib/constants"
import type { CategoryType } from "@/types/common"

interface CategorySelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  filterByType?: CategoryType
  disabled?: boolean
  error?: string
  className?: string
  currency?: string
}

export function CategorySelector({
  value,
  onValueChange,
  placeholder = SELECTOR_PLACEHOLDERS.CATEGORY,
  filterByType,
  disabled = false,
  error,
  className,
  currency = CURRENCY_DEFAULTS.DEFAULT_CURRENCY,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false)

  // Use the centralized categories hook
  const { 
    loading, 
    error: fetchError,
    groupedCategories,
    getCategoryById 
  } = useCategories({ 
    filterByType,
    includeInactive: false 
  })

  const selectedCategory = getCategoryById(value || '')

  if (loading) {
    return <Skeleton className={cn("h-10 w-full", className)} />
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground",
              error && "border-red-500"
            )}
            disabled={disabled}
          >
            {selectedCategory ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {selectedCategory.icon && (
                  <span className="text-sm">{selectedCategory.icon}</span>
                )}
                <Badge
                  variant="secondary"
                  className={cn("text-xs", CATEGORY_TYPE_CONFIG[selectedCategory.type].color)}
                >
                  {CATEGORY_TYPE_CONFIG[selectedCategory.type].label}
                </Badge>
                <span className="truncate">{selectedCategory.name}</span>
                {selectedCategory.budget_amount && selectedCategory.budget_frequency && (
                  <span className="text-sm text-muted-foreground ml-auto">
                    {formatBudgetAmount(selectedCategory.budget_amount, selectedCategory.budget_frequency, currency)}
                  </span>
                )}
              </div>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search categories..." />
            <CommandList>
              {fetchError ? (
                <CommandEmpty>{fetchError}</CommandEmpty>
              ) : Object.keys(groupedCategories).length === 0 ? (
                <CommandEmpty>No categories found.</CommandEmpty>
              ) : (
                Object.entries(groupedCategories).map(([type, typeCategories]) => (
                  <CommandGroup key={type} heading={CATEGORY_TYPE_CONFIG[type as CategoryType].label}>
                    {typeCategories.map((category) => (
                      <CommandItem
                        key={category.id}
                        value={`${category.name} ${category.type}`}
                        onSelect={() => {
                          onValueChange(category.id)
                          setOpen(false)
                        }}
                        className="flex items-center gap-2 py-2"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === category.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {category.icon && (
                            <span className="text-sm">{category.icon}</span>
                          )}
                          <Badge
                            variant="secondary"
                            className={cn("text-xs", CATEGORY_TYPE_CONFIG[category.type].color)}
                          >
                            {CATEGORY_TYPE_CONFIG[category.type].label}
                          </Badge>
                          <span className="truncate">{category.name}</span>
                          {category.budget_amount && category.budget_frequency && (
                            <span className="text-sm text-muted-foreground ml-auto">
                              {formatBudgetAmount(category.budget_amount, category.budget_frequency, currency)}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}