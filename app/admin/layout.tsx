import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminLayoutClient } from "@/components/admin-layout-client"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  console.log("[v0] Admin layout - User ID:", user.id)
  console.log("[v0] Admin layout - User metadata:", user.user_metadata)

  // Get user profile
  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  console.log("[v0] Admin layout - Profile:", { profile, profileError })

  // Check role from profile or fallback to user metadata
  const userRole = profile?.role || user.user_metadata?.role

  console.log("[v0] Admin layout - Determined role:", userRole)

  if (!userRole || userRole !== "admin") {
    console.log("[v0] Admin layout - Access denied, redirecting to login")
    redirect("/auth/login")
  }

  return <AdminLayoutClient profile={profile || { full_name: user.email, role: "admin" }}>{children}</AdminLayoutClient>
}
