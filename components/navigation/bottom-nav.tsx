"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, Wallet, Receipt, Settings, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const navItems = [
  {
    href: "/dashboard",
    label: "Home",
    icon: Home,
  },
  {
    href: "/accounts",
    label: "Accounts", 
    icon: Wallet,
  },
  {
    href: "/transactions",
    label: "Transactions",
    icon: Receipt,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [loadingPath, setLoadingPath] = useState<string | null>(null)
  const [optimisticActive, setOptimisticActive] = useState<string | null>(null)

  // Reset loading state when pathname changes
  useEffect(() => {
    if (loadingPath && pathname === loadingPath) {
      setLoadingPath(null)
      setOptimisticActive(null)
    }
  }, [pathname, loadingPath])

  const handleNavigation = (href: string) => {
    if (href === pathname) return // Don't navigate if already on the page
    
    setLoadingPath(href)
    setOptimisticActive(href)
    router.push(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isOptimisticActive = optimisticActive === item.href
          const isLoading = loadingPath === item.href
          const showAsActive = isActive || isOptimisticActive
          
          return (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              disabled={isLoading}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                showAsActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50",
                isLoading && "opacity-75"
              )}
            >
              <div className="relative">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                ) : (
                  <Icon className={cn("h-5 w-5", showAsActive && "text-blue-600")} />
                )}
              </div>
              <span className={cn("font-medium", showAsActive && "text-blue-600")}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}