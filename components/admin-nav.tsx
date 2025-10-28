"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Award, FileText, Home, LogOut, Trophy, Users } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface AdminNavProps {
  profile: {
    full_name: string
    email: string
    role: string
  }
  isOpen: boolean
}

export function AdminNav({ profile, isOpen }: AdminNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/submissions", label: "Review Submissions", icon: FileText },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/merit", label: "Merit Evaluation", icon: Trophy },
    { href: "/admin/achievements", label: "Achievements", icon: Award },
  ]

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-background transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Admin Portal</h2>
          <p className="text-sm text-muted-foreground mt-1">{profile.full_name}</p>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start gap-3" size="sm">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-4">
          <Button variant="ghost" className="w-full justify-start gap-3" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  )
}
