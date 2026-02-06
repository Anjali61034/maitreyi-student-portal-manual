import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, CheckCircle, Clock, FileText } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get submission statistics
  const { data: submissions } = await supabase.from("submissions").select("*").eq("student_id", user.id)

  const totalSubmissions = submissions?.length || 0
  const pendingSubmissions = submissions?.filter((s) => s.status === "pending").length || 0
  const approvedSubmissions = submissions?.filter((s) => s.status === "approved").length || 0
  const totalPoints =
    submissions?.filter((s) => s.status === "approved").reduce((sum, s) => sum + (s.points_awarded || 0), 0) || 0

  // Get recent submissions
  const { data: recentSubmissions } = await supabase
    .from("submissions")
    .select("*, achievements(name, category)")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your achievement overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Your latest achievement submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSubmissions && recentSubmissions.length > 0 ? (
            <div className="space-y-4">
              {recentSubmissions.map((submission: any) => (
                <div key={submission.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <p className="font-medium">{submission.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {submission.achievements?.name} • {submission.achievements?.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        submission.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : submission.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {submission.status}
                    </span>
                    {submission.points_awarded && (
                      <p className="text-sm text-muted-foreground mt-1">{submission.points_awarded} points</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No submissions yet. Start by submitting your achievements!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
