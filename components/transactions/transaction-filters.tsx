"use client"

import { useState } from "react"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AccountSelector } from "./account-selector"
import { CategorySelector } from "./category-selector"

export interface TransactionFilters {
  start_date?: Date
  end_date?: Date
  account_id?: string
  category_id?: string
  type?: "income" | "expense" | "transfer"
}

interface TransactionFiltersProps {
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
  className?: string
}

export function TransactionFilters({
  filters,
  onFiltersChange,
  className,
}: TransactionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof TransactionFilters, value: string | Date | null) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilter = (key: keyof TransactionFilters) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const getActiveFiltersCount = () => {
    return Object.keys(filters).filter(key => filters[key as keyof TransactionFilters] !== undefined).length
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className={className}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        <CollapsibleContent className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Date Range - Start Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.start_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.start_date ? format(filters.start_date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.start_date}
                        onSelect={(date) => updateFilter("start_date", date)}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {filters.start_date && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter("start_date")}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Date Range - End Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.end_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.end_date ? format(filters.end_date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.end_date}
                        onSelect={(date) => updateFilter("end_date", date)}
                        disabled={(date) => {
                          if (filters.start_date) {
                            return date < filters.start_date || date > new Date()
                          }
                          return date > new Date()
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {filters.end_date && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter("end_date")}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Transaction Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={filters.type || ""}
                    onValueChange={(value) => updateFilter("type", value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  {filters.type && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter("type")}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Account Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account</label>
                  <AccountSelector
                    value={filters.account_id}
                    onValueChange={(value) => updateFilter("account_id", value || undefined)}
                    placeholder="All accounts"
                  />
                  {filters.account_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter("account_id")}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <CategorySelector
                    value={filters.category_id}
                    onValueChange={(value) => updateFilter("category_id", value || undefined)}
                    placeholder="All categories"
                  />
                  {filters.category_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter("category_id")}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Active Filters Summary */}
              {activeFiltersCount > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    
                    {filters.start_date && (
                      <Badge variant="secondary" className="gap-1">
                        From: {format(filters.start_date, "MMM dd")}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => clearFilter("start_date")} 
                        />
                      </Badge>
                    )}
                    
                    {filters.end_date && (
                      <Badge variant="secondary" className="gap-1">
                        To: {format(filters.end_date, "MMM dd")}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => clearFilter("end_date")} 
                        />
                      </Badge>
                    )}
                    
                    {filters.type && (
                      <Badge variant="secondary" className="gap-1">
                        Type: {filters.type}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => clearFilter("type")} 
                        />
                      </Badge>
                    )}
                    
                    {filters.account_id && (
                      <Badge variant="secondary" className="gap-1">
                        Account filtered
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => clearFilter("account_id")} 
                        />
                      </Badge>
                    )}
                    
                    {filters.category_id && (
                      <Badge variant="secondary" className="gap-1">
                        Category filtered
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => clearFilter("category_id")} 
                        />
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}