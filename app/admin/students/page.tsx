import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function AdminStudentsPage() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("full_name", { ascending: true })

  // Get submission counts for each student
  const studentsWithStats = await Promise.all(
    (students || []).map(async (student) => {
      const { data: submissions } = await supabase.from("submissions").select("*").eq("student_id", student.id)

      const totalSubmissions = submissions?.length || 0
      const approvedSubmissions = submissions?.filter((s) => s.status === "approved").length || 0
      const totalPoints =
        submissions?.filter((s) => s.status === "approved").reduce((sum, s) => sum + (s.points_awarded || 0), 0) || 0

      return {
        ...student,
        totalSubmissions,
        approvedSubmissions,
        totalPoints,
      }
    }),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-muted-foreground">View all registered students and their achievements</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {studentsWithStats.map((student) => (
              <div key={student.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{student.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {student.student_id} • {student.department || "N/A"} • Year {student.year_of_study || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                  <Badge variant="outline">{student.totalPoints} points</Badge>
                </div>

                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Submissions:</span>{" "}
                    <span className="font-medium">{student.totalSubmissions}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Approved:</span>{" "}
                    <span className="font-medium">{student.approvedSubmissions}</span>
                  </div>
                </div>
              </div>
            ))}

            {studentsWithStats.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No students registered yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
