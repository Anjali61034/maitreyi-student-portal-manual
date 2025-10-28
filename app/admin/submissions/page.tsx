import { SubmissionsTable } from "@/components/submissions-table"
import { createClient } from "@/lib/supabase/server"

export default async function AdminSubmissionsPage() {
  const supabase = await createClient()

  const { data: user } = await supabase.auth.getUser()
  console.log("[v0] Admin submissions - User ID:", user.user?.id)
  console.log("[v0] Admin submissions - User metadata:", user.user?.user_metadata)

  const { data: submissions, error } = await supabase
    .from("submissions")
    .select(`
      *,
      student:profiles!student_id(full_name, student_id, department),
      reviewer:profiles!reviewed_by(full_name),
      achievements(name, category, max_points)
    `)
    .order("created_at", { ascending: false })

  console.log("[v0] Admin submissions - Query result:", {
    submissionsCount: submissions?.length || 0,
    error: error?.message || null,
    errorDetails: error,
  })

  if (error) {
    console.error("[v0] Admin submissions - Error fetching submissions:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Review Submissions</h1>
        <p className="text-muted-foreground">Review and approve student achievement submissions</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">Error loading submissions: {error.message}</p>
        </div>
      )}

      <SubmissionsTable submissions={submissions || []} />
    </div>
  )
}
