"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, Filter, X, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AccountSelector } from "./account-selector";
import { CategorySelector } from "./category-selector";
import { SELECTOR_PLACEHOLDERS } from "@/lib/constants";
import type { TransactionFilters } from "@/types/common";

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  className?: string;
  currency?: string;
  hiddenFilters?: Array<keyof TransactionFilters>;
  lockedFilters?: TransactionFilters;
}

export function TransactionFilters({
  filters,
  onFiltersChange,
  className,
  currency,
  hiddenFilters = [],
  lockedFilters = {},
}: TransactionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);

  // Sync local filters with props when they change externally
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateLocalFilter = (
    key: keyof TransactionFilters,
    value: string | Date | null,
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearLocalFilter = (key: keyof TransactionFilters) => {
    const newFilters = { ...localFilters };
    delete newFilters[key];
    setLocalFilters(newFilters);
  };

  const clearAllLocalFilters = () => {
    setLocalFilters(lockedFilters);
  };

  const resetLocalFilters = () => {
    setLocalFilters(filters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const getActiveFiltersCount = (filtersToCount: TransactionFilters) => {
    return Object.keys(filtersToCount).filter(
      (key) => {
        const filterKey = key as keyof TransactionFilters;
        return (
          filtersToCount[filterKey] !== undefined &&
          !hiddenFilters.includes(filterKey)
        );
      },
    ).length;
  };

  const hasUnappliedChanges = () => {
    return JSON.stringify(localFilters) !== JSON.stringify(filters);
  };

  const activeFiltersCount = getActiveFiltersCount(filters);
  const localFiltersCount = getActiveFiltersCount(localFilters);
  const hasChanges = hasUnappliedChanges();

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
              {hasChanges && (
                <Badge variant="destructive" className="ml-1">
                  {localFiltersCount}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onFiltersChange(lockedFilters);
                setLocalFilters(lockedFilters);
              }}
              className="text-muted-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        <CollapsibleContent className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Date Range Picker */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !localFilters.start_date &&
                            !localFilters.end_date &&
                            "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {localFilters.start_date && localFilters.end_date
                          ? `${format(localFilters.start_date, "PPP")} - ${format(localFilters.end_date, "PPP")}`
                          : localFilters.start_date
                            ? `${format(localFilters.start_date, "PPP")} - Select end date`
                            : localFilters.end_date
                              ? `Select start date - ${format(localFilters.end_date, "PPP")}`
                              : "Select date range"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={{
                          from: localFilters.start_date || undefined,
                          to: localFilters.end_date || undefined,
                        }}
                        onSelect={(range) => {
                          updateLocalFilter("start_date", range?.from ?? null);
                          updateLocalFilter("end_date", range?.to ?? null);
                        }}
                        disabled={(date) => date > new Date()}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  {(localFilters.start_date || localFilters.end_date) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        clearLocalFilter("start_date");
                        clearLocalFilter("end_date");
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Clear Range
                    </Button>
                  )}
                </div>

                {/* Transaction Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={localFilters.type || "all"}
                    onValueChange={(value) =>
                      updateLocalFilter("type", value === "all" ? null : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={SELECTOR_PLACEHOLDERS.TYPE_FILTER}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  {localFilters.type && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearLocalFilter("type")}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Account Filter */}
                {!hiddenFilters.includes('account_id') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Account</label>
                    <AccountSelector
                      value={localFilters.account_id}
                      onValueChange={(value) =>
                        updateLocalFilter("account_id", value || null)
                      }
                      placeholder={SELECTOR_PLACEHOLDERS.ACCOUNT_FILTER}
                      currency={currency}
                    />
                    {localFilters.account_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearLocalFilter("account_id")}
                        className="h-6 px-2 text-xs"
                      >
                        <X className="mr-1 h-3 w-3" />
                        Clear
                      </Button>
                    )}
                  </div>
                )}

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <CategorySelector
                    value={localFilters.category_id}
                    onValueChange={(value) =>
                      updateLocalFilter("category_id", value || null)
                    }
                    placeholder={SELECTOR_PLACEHOLDERS.CATEGORY_FILTER}
                    currency={currency}
                  />
                  {localFilters.category_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearLocalFilter("category_id")}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-between gap-2 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllLocalFilters}
                    disabled={localFiltersCount === 0}
                    className="text-muted-foreground"
                  >
                    Clear all
                  </Button>
                  {hasChanges && (
                    <Badge variant="outline" className="text-xs">
                      {localFiltersCount} unsaved changes
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetLocalFilters}
                    disabled={!hasChanges}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={applyFilters}
                    disabled={!hasChanges}
                    className="gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
