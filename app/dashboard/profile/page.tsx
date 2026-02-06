import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button" // Make sure you have this
import Link from "next/link" // Import Link
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // If profile row is completely missing (shouldn't happen due to trigger, but just in case)
  if (!profile) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Profile Not Found</h1>
        <p>Please contact support or try logging out and back in.</p>
      </div>
    )
  }

  // Check if critical fields are missing
  const isProfileIncomplete = !profile.student_id || !profile.department

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">View your account information</p>
      </div>

      {/* ALERT: Show this if profile is incomplete */}
      {isProfileIncomplete ? (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">Action Required</CardTitle>
            <CardDescription className="text-red-600 dark:text-red-300">
              Your profile is incomplete. You must update your Student ID and Department before submitting achievements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Create a file at app/dashboard/profile/edit/page.tsx for this link to work */}
            <Button asChild>
              <Link href="/dashboard/profile/edit">Complete My Profile Now</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✓ Your profile is complete and verified.
            </p>
          </CardContent>
        </Card>
      )}

      {/* PROFILE DETAILS */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <p className="text-sm font-medium">{profile.full_name || "N/A"}</p>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-sm font-medium">{profile.email}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Student ID</Label>
              <p className="text-sm font-medium">{profile.student_id || "N/A"}</p>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <p className="text-sm font-medium">{profile.department || "N/A"}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Year of Study</Label>
              <p className="text-sm font-medium">{profile.year_of_study ? `Year ${profile.year_of_study}` : "N/A"}</p>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <p className="text-sm font-medium">{profile.phone || "N/A"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Account Type</Label>
            <p className="text-sm font-medium capitalize">{profile.role || "Student"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}