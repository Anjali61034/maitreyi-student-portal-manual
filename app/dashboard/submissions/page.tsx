import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default async function SubmissionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, achievements(name, category, max_points)")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Submissions</h1>
        <p className="text-muted-foreground">View and track all your achievement submissions</p>
      </div>

      {submissions && submissions.length > 0 ? (
        <div className="grid gap-4">
          {submissions.map((submission: any) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{submission.title}</CardTitle>
                    <CardDescription>
                      {submission.achievements?.name} • {submission.achievements?.category}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      submission.status === "approved"
                        ? "default"
                        : submission.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {submission.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-sm">{submission.description}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Achievement Date</p>
                    <p className="text-sm font-medium">{format(new Date(submission.achievement_date), "PPP")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted On</p>
                    <p className="text-sm font-medium">{format(new Date(submission.created_at), "PPP")}</p>
                  </div>
                  {submission.points_awarded && (
                    <div>
                      <p className="text-sm text-muted-foreground">Points Awarded</p>
                      <p className="text-sm font-medium">
                        {submission.points_awarded} / {submission.achievements?.max_points}
                      </p>
                    </div>
                  )}
                </div>

                {submission.admin_remarks && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Admin Remarks</p>
                    <p className="text-sm bg-muted p-3 rounded-md">{submission.admin_remarks}</p>
                  </div>
                )}

                {submission.proof_file_name && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Proof Document</p>
                    <p className="text-sm font-medium">{submission.proof_file_name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No submissions yet</p>
            <p className="text-sm text-muted-foreground mt-2">Start by submitting your achievements!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
