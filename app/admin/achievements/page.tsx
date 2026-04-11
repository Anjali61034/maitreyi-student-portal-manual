import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminAchievementsPage() {
  // No database calls needed. Just displaying the manual guide.

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Evaluation Criteria & Award Details</h1>
        <p className="text-muted-foreground">Reference guide for manual student evaluation</p>
      </div>

      {/* 1. EVALUATION CRITERIA TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Criteria</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="p-4 font-semibold border-r">Criteria</th>
                  <th className="p-4 font-semibold">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-4 font-medium border-r bg-blue-50">CGPA (Humanities)</td>
                  <td className="p-4">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>5 Points: CGPA 8 above</li>
                      <li>4 Points: CGPA 7 above</li>
                      <li>3 Points: CGPA 6 above</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium border-r bg-blue-50">CGPA (Sciences and Commerce)</td>
                  <td className="p-4">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>5 Points: CGPA 9 above</li>
                      <li>4 Points: CGPA 8 above</li>
                      <li>3 Points: CGPA 7 above</li>
                      <li>2 Points: CGPA 6 above</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium border-r">Extra-Curricular Activities</td>
                  <td className="p-4">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Participation: 0.5 mark</li>
                      <li>1st Position: 2 marks</li>
                      <li>2nd Position: 1.5 marks</li>
                      <li>3rd Position: 1 mark</li>
                      <li>Leadership Role: 1 mark</li>
                      <li>(Maximum 5 marks)</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium border-r">Academic Engagement and Research</td>
                  <td className="p-4">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Participation: 0.5 mark</li>
                      <li>1st Position: 2 marks</li>
                      <li>2nd Position: 1.5 marks</li>
                      <li>3rd Position: 1 mark</li>
                      <li>Leadership Role: 1 mark</li>
                      <li>(Maximum 5 marks)</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium border-r">Outreach Activities</td>
                  <td className="p-4">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Participation: 0.5 mark</li>
                      <li>1st Position: 2 marks</li>
                      <li>2nd Position: 1.5 marks</li>
                      <li>3rd Position: 1 mark</li>
                      <li>Leadership Role: 1 mark</li>
                      <li>(Maximum 5 marks)</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium border-r">Sports</td>
                  <td className="p-4">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Participation: 0.5 mark</li>
                      <li>1st Position: 2 marks</li>
                      <li>2nd Position: 1.5 marks</li>
                      <li>3rd Position: 1 mark</li>
                      <li>Leadership Role: 1 mark</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium border-r">National Cadet Corps</td>
                  <td className="p-4">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Participation: 0.5 mark</li>
                      <li>1st Position: 2 marks</li>
                      <li>2nd Position: 1.5 marks</li>
                      <li>3rd Position: 1 mark</li>
                      <li>Leadership Role: 1 mark</li>
                      <li>(Maximum 5 marks)</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium border-r">Industry Experience</td>
                  <td className="p-4">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>International: 2 marks</li>
                      <li>National: 1.5 marks</li>
                      <li>University/Local Level: 1 mark</li>
                      <li>(Maximum 5 marks)</li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 2. AWARD DETAILS */}
      <Card className="border-t-4 border-t-blue-600">
        <CardHeader>
          <CardTitle className="text-blue-700">Award Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm leading-relaxed">
            <p><strong>1.</strong> The award will be presented each year on the college Annual Day, in three subcategories: Humanities, Commerce, and Sciences.</p>
            <p><strong>2.</strong> One student each from First, Second, Third and Fourth year, for each stream, will be selected for the award. A total of <strong>12 students</strong> will be recipients each year.</p>
          </div>
        </CardContent>
      </Card>

      {/* 3. CODES TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Codes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="p-4 font-semibold border-r">Code</th>
                  <th className="p-4 font-semibold border-r">Activity Category</th>
                  <th className="p-4 font-semibold">What it covers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-4 font-mono border-r">ECA</td>
                  <td className="p-4 font-medium border-r">Extra Curricular Activity</td>
                  <td className="p-4">All non-academic activities, events organised, attended, participated in.</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono border-r">AER</td>
                  <td className="p-4 font-medium border-r">Academic Engagement and Research</td>
                  <td className="p-4">Academic papers presented or published. Details of seminars, conferences, workshops organized or participated in newspaper articles chapters or any other publication, creative or academic, or research projects undertaken.</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono border-r">OA</td>
                  <td className="p-4 font-medium border-r">Outreach Activities</td>
                  <td className="p-4">Social outreach activities, work with an NGO or NSS events organized or participated in.</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono border-r">SP</td>
                  <td className="p-4 font-medium border-r">Sports</td>
                  <td className="p-4">Participation or position held in any sports event or competition.</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono border-r">NCC</td>
                  <td className="p-4 font-medium border-r">National Cadet Corps</td>
                  <td className="p-4">Participation or merit in any NCC event.</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono border-r">IE</td>
                  <td className="p-4 font-medium border-r">Industry Experience</td>
                  <td className="p-4">Educational tours, internships, freelance projects.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}