import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get total submissions count efficiently
  const { count: totalSubmissions } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })

  // Get total students
  const { data: students } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")

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
        <p className="text-muted-foreground">
          Overview of student achievements and submissions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Total Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {totalStudents}
            </div>
          </CardContent>
        </Card>

        {/* Total Submissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {totalSubmissions || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
