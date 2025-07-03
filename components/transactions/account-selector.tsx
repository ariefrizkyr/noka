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

interface Account {
  id: string
  name: string
  type: "bank_account" | "credit_card" | "investment_account"
  current_balance: number
  is_active: boolean
}

interface AccountSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  filterByType?: "bank_account" | "credit_card" | "investment_account" | "bank_account,credit_card"
  disabled?: boolean
  error?: string
  className?: string
}

const accountTypeLabels = {
  bank_account: "Bank Account",
  credit_card: "Credit Card", 
  investment_account: "Investment Account",
}

const accountTypeColors = {
  bank_account: "bg-blue-100 text-blue-800",
  credit_card: "bg-orange-100 text-orange-800",
  investment_account: "bg-green-100 text-green-800",
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function AccountSelector({
  value,
  onValueChange,
  placeholder = "Select account...",
  filterByType,
  disabled = false,
  error,
  className,
}: AccountSelectorProps) {
  const [open, setOpen] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Fetch accounts from API
  useEffect(() => {
    async function fetchAccounts() {
      try {
        setLoading(true)
        const response = await fetch("/api/accounts")
        
        if (!response.ok) {
          throw new Error("Failed to fetch accounts")
        }
        
        const data = await response.json()
        setAccounts(data.data || [])
        setFetchError(null)
      } catch (err) {
        console.error("Error fetching accounts:", err)
        setFetchError("Failed to load accounts")
        setAccounts([])
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  // Filter accounts based on type
  const filteredAccounts = accounts.filter((account) => {
    if (!account.is_active) return false
    
    if (!filterByType) return true
    
    if (filterByType.includes(",")) {
      const allowedTypes = filterByType.split(",") as Array<Account["type"]>
      return allowedTypes.includes(account.type)
    }
    
    return account.type === filterByType
  })

  // Group accounts by type
  const groupedAccounts = filteredAccounts.reduce((acc, account) => {
    const type = account.type
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(account)
    return acc
  }, {} as Record<Account["type"], Account[]>)

  const selectedAccount = accounts.find((account) => account.id === value)

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
                  className={cn("text-xs", accountTypeColors[selectedAccount.type])}
                >
                  {accountTypeLabels[selectedAccount.type]}
                </Badge>
                <span className="truncate">{selectedAccount.name}</span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {formatCurrency(selectedAccount.current_balance)}
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
                  <CommandGroup key={type} heading={accountTypeLabels[type as Account["type"]]}>
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
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === account.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Badge
                            variant="secondary"
                            className={cn("text-xs", accountTypeColors[account.type])}
                          >
                            {accountTypeLabels[account.type]}
                          </Badge>
                          <span className="truncate">{account.name}</span>
                          <span className="text-sm text-muted-foreground ml-auto">
                            {formatCurrency(account.current_balance)}
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