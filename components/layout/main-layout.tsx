"use client"

import { ReactNode } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content with padding for bottom nav */}
      <main className="pb-20">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}