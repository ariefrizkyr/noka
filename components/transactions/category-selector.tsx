"use client"

import { useEffect, useState } from "react"
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

interface Category {
  id: string
  name: string
  type: "expense" | "income" | "investment"
  icon?: string
  budget_amount?: number
  budget_frequency?: "weekly" | "monthly" | "one_time"
  is_active: boolean
}

interface CategorySelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  filterByType?: "expense" | "income" | "investment"
  disabled?: boolean
  error?: string
  className?: string
}

const categoryTypeLabels = {
  expense: "Expense",
  income: "Income",
  investment: "Investment",
}

const categoryTypeColors = {
  expense: "bg-red-100 text-red-800",
  income: "bg-green-100 text-green-800",
  investment: "bg-blue-100 text-blue-800",
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function CategorySelector({
  value,
  onValueChange,
  placeholder = "Select category...",
  filterByType,
  disabled = false,
  error,
  className,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Fetch categories from API
  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const response = await fetch("/api/categories")
        
        if (!response.ok) {
          throw new Error("Failed to fetch categories")
        }
        
        const data = await response.json()
        setCategories(data.data?.categories || [])
        setFetchError(null)
      } catch (err) {
        console.error("Error fetching categories:", err)
        setFetchError("Failed to load categories")
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Filter categories based on type
  const filteredCategories = categories.filter((category) => {
    if (!category.is_active) return false
    
    if (!filterByType) return true
    
    return category.type === filterByType
  })

  // Group categories by type
  const groupedCategories = filteredCategories.reduce((acc, category) => {
    const type = category.type
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(category)
    return acc
  }, {} as Record<Category["type"], Category[]>)

  const selectedCategory = categories.find((category) => category.id === value)

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
                  className={cn("text-xs", categoryTypeColors[selectedCategory.type])}
                >
                  {categoryTypeLabels[selectedCategory.type]}
                </Badge>
                <span className="truncate">{selectedCategory.name}</span>
                {selectedCategory.budget_amount && (
                  <span className="text-sm text-muted-foreground ml-auto">
                    {formatCurrency(selectedCategory.budget_amount)}/{selectedCategory.budget_frequency}
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
                  <CommandGroup key={type} heading={categoryTypeLabels[type as Category["type"]]}>
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
                            className={cn("text-xs", categoryTypeColors[category.type])}
                          >
                            {categoryTypeLabels[category.type]}
                          </Badge>
                          <span className="truncate">{category.name}</span>
                          {category.budget_amount && (
                            <span className="text-sm text-muted-foreground ml-auto">
                              {formatCurrency(category.budget_amount)}/{category.budget_frequency}
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