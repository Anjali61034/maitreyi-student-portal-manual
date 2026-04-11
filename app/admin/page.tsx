import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, FileText, Users, XCircle } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get statistics
  const { data: allSubmissions } = await supabase.from("submissions").select("*")
  const { data: students } = await supabase.from("profiles").select("*").eq("role", "student")

  const totalSubmissions = allSubmissions?.length || 0
  const pendingSubmissions = allSubmissions?.filter((s) => s.status === "pending").length || 0
  const approvedSubmissions = allSubmissions?.filter((s) => s.status === "approved").length || 0
  const rejectedSubmissions = allSubmissions?.filter((s) => s.status === "rejected").length || 0
  const totalStudents = students?.length || 0

  // Get recent submissions
  const { data: recentSubmissions } = await supabase
    .from("submissions")
    .select("*, profiles(full_name, student_id), achievements(name, category)")
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of student achievements and submissions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
