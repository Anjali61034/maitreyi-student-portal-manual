import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, CheckCircle, Clock, FileText } from "lucide-react"
import { format } from "date-fns/format"

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

  // REMOVED: Fetch for recentSubmissions as the card is deleted

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

      {/* --- INSTRUCTIONS CARD --- */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Instructions for Filling Progress Card</CardTitle>
          <CardDescription>Important guidelines for submitting your achievements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          
          {/* Text Instructions */}
          <ol className="list-decimal pl-5 space-y-2">
            <li className="leading-relaxed">
              Each student has to fill details of all of activities she has been a part of, in whatever capacity, from <strong>January to December</strong> of each calendar year.
            </li>
            <li className="leading-relaxed">
              Activities are segregated into categories. Each category has a code. Write the <strong>activity code</strong> each time you make an entry in the card.
            </li>
            <li className="leading-relaxed">
              You must attach a valid copy of the proof of each activity mentioned in the card.
            </li>
          </ol>

          {/* Activity Codes Table */}
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-3 font-semibold border-r">Code</th>
                  <th className="p-3 font-semibold border-r">Activity Category</th>
                  <th className="p-3 font-semibold border-r">What it covers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 border-r font-mono text-blue-700">ECA</td>
                  <td className="p-3 border-r">Extra Curricular Activity</td>
                  <td className="p-3">All non-academic activities, events organised, attended, participated in.</td>
                </tr>
                <tr>
                  <td className="p-3 border-r font-mono text-blue-700">AER</td>
                  <td className="p-3 border-r">Academic Engagement and Research</td>
                  <td className="p-3">Academic papers presented or published. Details of seminars, conferences, workshops organized or participated in newspaper articles chapters or any other publication, creative or academic, or research projects undertaken.</td>
                </tr>
                <tr>
                  <td className="p-3 border-r font-mono text-blue-700">OA</td>
                  <td className="p-3 border-r">Outreach Activities</td>
                  <td className="p-3">Social outreach activities, work with an NGO or NSS events organized or participated in.</td>
                </tr>
                <tr>
                  <td className="p-3 border-r font-mono text-blue-700">SP</td>
                  <td className="p-3 border-r">Sports</td>
                  <td className="p-3">Participation or position held in any sports event or competition.</td>
                </tr>
                <tr>
                  <td className="p-3 border-r font-mono text-blue-700">NCC</td>
                  <td className="p-3 border-r">National Cadet Corps</td>
                  <td className="p-3">Participation or merit in any NCC event.</td>
                </tr>
                <tr>
                  <td className="p-3 border-r font-mono text-blue-700">IE</td>
                  <td className="p-3 border-r">Industry Experience</td>
                  <td className="p-3">Educational tours, internships, freelance projects.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Systematic Upload Instructions */}
          <div className="rounded-md bg-slate-50 p-4 border border-slate-200">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              Systematic Upload Requirement
            </h4>
            <p className="mb-2">Students are required to upload their certificates in a systematic manner.</p>
            <p className="mb-2">Within each category, certificates must be arranged in the following order:</p>
            <ul className="list-decimal pl-5 space-y-1">
              <li><strong>1. Rank-Based Achievements</strong> – Certificates indicating positions secured (1st, 2nd, or 3rd) should be uploaded first.</li>
              <li><strong>2. Leadership Roles</strong> – Certificates reflecting leadership positions such as Society President, Vice President, Treasurer, etc., or similar responsibilities should be uploaded next.</li>
              <li><strong>3. Participation Certificates</strong> – Certificates of participation in events should be uploaded thereafter.</li>
            </ul>
          </div>

          {/* Deadline Warning */}
          <div className="rounded-md bg-orange-50 border border-orange-200 p-3 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-orange-700 shrink-0" />
            <div>
              <p className="font-semibold text-orange-900">Deadline Notice</p>
              <p className="text-orange-800">
                This should be filled by next monday i.e 23/02/2026.
              </p>
            </div>
          </div>

        </CardContent>
      </Card>
      
    </div>
  )
}