import { NewSubmissionForm } from "@/components/new-submission-form"
import { createClient } from "@/lib/supabase/server"

export default async function NewSubmissionPage() {
  const supabase = await createClient()

  const { data: achievements } = await supabase.from("achievements").select("*").order("category", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Submission</h1>
        <p className="text-muted-foreground">Submit your achievements for merit evaluation</p>
      </div>

      <NewSubmissionForm achievements={achievements || []} />
    </div>
  )
}
