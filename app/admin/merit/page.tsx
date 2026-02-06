import { MeritEvaluationForm } from "@/components/merit-evaluation-form"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminMeritPage() {
  const supabase = await createClient()

  // Get recent merit evaluations
  const { data: recentEvaluations } = await supabase
    .from("merit_evaluations")
    .select("*, profiles(full_name, student_id)")
    .order("evaluation_date", { ascending: false })
    .limit(20)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Merit Evaluation</h1>
        <p className="text-muted-foreground">Generate merit rankings for students</p>
      </div>

      <MeritEvaluationForm />

      <Card>
        <CardHeader>
          <CardTitle>Recent Evaluations</CardTitle>
          <CardDescription>Latest merit evaluations generated</CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvaluations && recentEvaluations.length > 0 ? (
            <div className="space-y-3">
              {recentEvaluations.map((evaluation: any) => (
                <div key={evaluation.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{evaluation.profiles.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {evaluation.profiles.student_id} • {evaluation.academic_year}
                      {/* Removed semester display */}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Rank #{evaluation.rank}</p>
                    <p className="text-sm text-muted-foreground">{evaluation.total_points} points</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No evaluations generated yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}