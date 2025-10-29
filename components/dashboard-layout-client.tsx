"use client"

import type React from "react"

import { useState } from "react"
import { DashboardNav } from "./dashboard-nav"
import { Button } from "./ui/button"
import { Menu } from "lucide-react"

interface DashboardLayoutClientProps {
  profile: any
  children: React.ReactNode
}

export function DashboardLayoutClient({ profile, children }: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen">
      <DashboardNav profile={profile} isOpen={sidebarOpen} />

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col lg:pl-64">
        <header className="sticky top-0 z-20 border-b bg-background px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto bg-muted/40">
          <div className="container mx-auto py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
