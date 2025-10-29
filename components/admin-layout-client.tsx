"use client"

import type React from "react"

import { useState } from "react"
import { AdminNav } from "./admin-nav"
import { Button } from "./ui/button"
import { Menu } from "lucide-react"

interface AdminLayoutClientProps {
  profile: any
  children: React.ReactNode
}

export function AdminLayoutClient({ profile, children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen">
      <AdminNav profile={profile} isOpen={sidebarOpen} />

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
