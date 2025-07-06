"use client"

import { useState } from "react"
import { ChevronsUpDown } from "lucide-react"
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
import { useAccounts } from "@/hooks/use-accounts"
import { formatAccountBalance } from "@/lib/currency-utils"
import { ACCOUNT_TYPE_CONFIG, SELECTOR_PLACEHOLDERS, CURRENCY_DEFAULTS } from "@/lib/constants"
import type { AccountType } from "@/types/common"

interface AccountSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  filterByType?: AccountType | string
  disabled?: boolean
  error?: string
  className?: string
  currency?: string
}

export function AccountSelector({
  value,
  onValueChange,
  placeholder = SELECTOR_PLACEHOLDERS.ACCOUNT,
  filterByType,
  disabled = false,
  error,
  className,
  currency = CURRENCY_DEFAULTS.DEFAULT_CURRENCY,
}: AccountSelectorProps) {
  const [open, setOpen] = useState(false)

  // Use the centralized accounts hook
  const { 
    loading, 
    error: fetchError,
    groupedAccounts,
    getAccountById 
  } = useAccounts({ 
    filterByType,
    includeInactive: false 
  })

  const selectedAccount = getAccountById(value || '')

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
            {selectedAccount ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Badge
                  variant="secondary"
                  className={cn("text-xs", ACCOUNT_TYPE_CONFIG[selectedAccount.type].color)}
                >
                  {ACCOUNT_TYPE_CONFIG[selectedAccount.type].shortLabel}
                </Badge>
                <span className="truncate">{selectedAccount.name}</span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {formatAccountBalance(selectedAccount.current_balance, selectedAccount.type, currency)}
                </span>
              </div>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search accounts..." />
            <CommandList>
              {fetchError ? (
                <CommandEmpty>{fetchError}</CommandEmpty>
              ) : Object.keys(groupedAccounts).length === 0 ? (
                <CommandEmpty>No accounts found.</CommandEmpty>
              ) : (
                Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
                  <CommandGroup key={type} heading={ACCOUNT_TYPE_CONFIG[type as AccountType].label}>
                    {typeAccounts.map((account) => (
                      <CommandItem
                        key={account.id}
                        value={`${account.name} ${account.type}`}
                        onSelect={() => {
                          onValueChange(account.id)
                          setOpen(false)
                        }}
                        className="flex items-center gap-2 py-2"
                      >
                        {/* <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === account.id ? "opacity-100" : "opacity-0"
                          )}
                        /> */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {/* <Badge
                            variant="secondary"
                            className={cn("text-xs", ACCOUNT_TYPE_CONFIG[account.type].color)}
                          >
                            {ACCOUNT_TYPE_CONFIG[account.type].shortLabel}
                          </Badge> */}
                          <span className="truncate">{account.name}</span>
                          <span className="text-sm text-muted-foreground ml-auto">
                            {formatAccountBalance(account.current_balance, account.type, currency)}
                          </span>
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