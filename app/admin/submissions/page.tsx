import { SubmissionsTable } from "@/components/submissions-table"
import { createClient } from "@/lib/supabase/server"

export default async function AdminSubmissionsPage() {
  const supabase = await createClient()

  // 1. Check User (Optional, for debugging)
  const { data: user } = await supabase.auth.getUser()
  console.log("[v0] Admin submissions - User ID:", user.user?.id)

  // 2. Fetch Submissions
  // FIXED: Removed 'department' from profiles select.
  // UPDATED: Added 'stream' and 'course_name' for better context.
  // REMOVED: 'achievements' join as it is likely unused or causing errors with your current schema.
  const { data: submissions, error } = await supabase
    .from("submissions")
    .select(`
      *,
      student:profiles!student_id(full_name, student_id, stream, course_name, year_of_study),
      reviewer:profiles!reviewed_by(full_name)
    `)
    .order("created_at", { ascending: false })

  // 3. Log Results
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