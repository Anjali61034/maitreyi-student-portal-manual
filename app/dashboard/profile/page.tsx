import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">View your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <p className="text-sm font-medium">{profile.full_name}</p>
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
            <p className="text-sm font-medium capitalize">{profile.role}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
