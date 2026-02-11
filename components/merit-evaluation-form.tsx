"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, AlertTriangle, Download, FileText } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface MeritEvaluationFormProps {
  streamFilter: string
  yearFilter: string
  onEvaluationGenerated: () => void
}

export function MeritEvaluationForm({ streamFilter, yearFilter, onEvaluationGenerated }: MeritEvaluationFormProps) {
  const supabase = createClient()
  const [isGenerating, setIsGenerating] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "warning", text: string } | null>(null)
  const [generatedList, setGeneratedList] = useState<any[]>([])

  const handleGenerateMerit = async () => {
    setIsGenerating(true)
    setStatusMessage(null)
    setGeneratedList([])

    try {
      // 1. Build Query
      let query = supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")

      if (streamFilter !== "all") {
        query = query.eq("stream", streamFilter)
      }

      if (yearFilter !== "all") {
        query = query.eq("year_of_study", parseInt(yearFilter))
      }

      const { data: students, error: studentError } = await query
      
      if (studentError) throw studentError

      if (!students || students.length === 0) {
        setStatusMessage({ 
          type: "warning", 
          text: "No students found matching these filters." 
        })
        setIsGenerating(false)
        return
      }

      // 2. Fetch Submissions (UPDATED: Fetching category and cgpa_value)
      const studentIds = students.map(s => s.id)
      
      const { data: submissions, error: subError } = await supabase
        .from("submissions")
        .select("student_id, points_awarded, category, cgpa_value")
        .in("student_id", studentIds)
        .eq("status", "approved")

      if (subError) throw subError

      // 3. Calculate Totals, CGPA Values, and Rank
      const pointsMap: Record<string, number> = {}
      const cgpaValueMap: Record<string, number> = {}

      submissions?.forEach(sub => {
        // Calculate Total Points
        pointsMap[sub.student_id] = (pointsMap[sub.student_id] || 0) + (sub.points_awarded || 0)
        
        // Read the stored CGPA value for tie-breaking
        if (sub.category === 'CGPA Evaluation') {
          cgpaValueMap[sub.student_id] = sub.cgpa_value || 0
        }
      })

      const rankedStudents = students
        .map(student => ({
          ...student,
          totalPoints: pointsMap[student.id] || 0,
          cgpaValue: cgpaValueMap[student.id] || 0 // Use the stored value
        }))
        // SORT LOGIC: Primary = Total Points, Secondary = Actual CGPA Value
        .sort((a, b) => {
          if (b.totalPoints !== a.totalPoints) {
            return b.totalPoints - a.totalPoints
          }
          // If points are tied, higher CGPA number wins
          return b.cgpaValue - a.cgpaValue
        })
        .map((student, index) => ({
          ...student,
          rank: index + 1
        }))

      setGeneratedList(rankedStudents)

      // 4. Save to Database
      const currentDate = new Date().toISOString()
      const academicYear = new Date().getFullYear().toString()

      const recordsToInsert = rankedStudents.map(s => ({
        student_id: s.id,
        total_points: s.totalPoints,
        rank: s.rank,
        academic_year: academicYear,
        evaluation_date: currentDate,
      }))

      const { error: insertError } = await supabase
        .from("merit_evaluations")
        .insert(recordsToInsert)

      if (insertError) throw insertError

      setStatusMessage({ type: "success", text: `Generated merit list for ${rankedStudents.length} students.` })
      
      if (onEvaluationGenerated) onEvaluationGenerated()

    } catch (error: any) {
      console.error("Merit Generation Error:", error)
      setStatusMessage({ type: "error", text: error.message || "Failed to generate merit list." })
    } finally {
      setIsGenerating(false)
    }
  }

  // --- PDF GENERATION FUNCTION ---
  const handleDownloadPDF = () => {
    if (generatedList.length === 0) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Title
    doc.setFontSize(18)
    doc.text("Merit Evaluation List", pageWidth / 2, 20, { align: "center" })
    
    // Filters Info
    doc.setFontSize(10)
    const filterText = `Stream: ${streamFilter === 'all' ? 'All Streams' : streamFilter} | Year: ${yearFilter === 'all' ? 'All Years' : `Year ${yearFilter}`}`
    doc.text(filterText, pageWidth / 2, 30, { align: "center" })
    
    // Date
    doc.setFontSize(9)
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 35, { align: "center" })

    // Table Data
    const tableColumn = ["Rank", "Student Name", "Student ID", "Course", "Points"]
    const tableRows = generatedList.map((student, index) => [
      student.rank,
      student.full_name,
      student.student_id || "N/A",
      student.course_name?.substring(0, 20) + (student.course_name?.length > 20 ? "..." : "") || "N/A",
      student.totalPoints
    ])

    // Generate Table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [2, 48, 71] }, // Dark Blue header
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 15 }, // Rank
        1: { cellWidth: 'auto' }, // Name
        2: { cellWidth: 30 }, // ID
        3: { cellWidth: 40 }, // Course
        4: { cellWidth: 15 }, // Points
      }
    })

    // Save PDF
    doc.save(`merit-list-${streamFilter}-${yearFilter}-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate New List</CardTitle>
        <p className="text-sm text-muted-foreground">
          Filters: {streamFilter === "all" ? "All Streams" : streamFilter} • {yearFilter === "all" ? "All Years" : `Year ${yearFilter}`}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateMerit} 
              disabled={isGenerating}
              className="w-full md:w-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Generate List
                </>
              )}
            </Button>

            {/* Download Button - Only shows if list is generated */}
            {generatedList.length > 0 && !isGenerating && (
              <Button 
                variant="outline" 
                onClick={handleDownloadPDF}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>

          {statusMessage && (
            <div className={`p-3 rounded-md text-sm flex gap-2 items-start
              ${statusMessage.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : 
                statusMessage.type === "warning" ? "bg-yellow-50 text-yellow-800 border border-yellow-200" :
                "bg-red-50 text-red-800 border border-red-200"}`}>
              {statusMessage.type === "warning" && <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Preview List */}
          {generatedList.length > 0 && !isGenerating && (
            <div className="mt-4 border rounded-lg p-4 bg-slate-50 max-h-[400px] overflow-y-auto">
              <h4 className="text-sm font-semibold mb-3 sticky top-0 bg-slate-50 py-1">Generated Results Preview</h4>
              <div className="space-y-2">
                {generatedList.map((student, idx) => (
                  <div key={student.id} className="flex items-center justify-between border-b border-slate-200 pb-2 text-sm last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="font-bold w-6">#{student.rank}</span>
                      <div>
                        <p className="font-medium text-slate-800">{student.full_name}</p>
                        <p className="text-xs text-muted-foreground">{student.student_id}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{student.totalPoints} pts</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}