"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { FileText, Award, X, ExternalLink } from "lucide-react"

// --- MAIN COMPONENT ---

export default function AdminStudentsPage() {
  const supabase = createClient()

  // State for Data
  const [students, setStudents] = useState<any[]>([])
  const [allSubmissions, setAllSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // State for Filters
  const [filterCourse, setFilterCourse] = useState<string>("all")
  const [filterYear, setFilterYear] = useState<string>("all")

  // State for Dialogs
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [proofUrl, setProofUrl] = useState<string | null>(null)

  // Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      // 1. Fetch all Students
      const { data: studentsData } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")

      // 2. Fetch ALL submissions at once (Optimized)
      const { data: submissionsData } = await supabase
        .from("submissions")
        .select("*")

      setStudents(studentsData || [])
      setAllSubmissions(submissionsData || [])
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  // --- PROCESSING DATA ---

  // 1. Combine students with their specific submissions
  const studentsWithStats = students.map((student) => {
    const studentSubmissions = allSubmissions.filter((s) => s.student_id === student.id)
    
    const approved = studentSubmissions.filter((s) => s.status === "approved")
    const totalPoints = approved.reduce((sum, s) => sum + (s.points_awarded || 0), 0)

    return {
      ...student,
      submissions: studentSubmissions, // Store full submission list for details
      totalSubmissions: studentSubmissions.length,
      approvedSubmissions: approved.length,
      totalPoints,
    }
  })

  // 2. Get unique Courses and Years for Filter Dropdowns
  const uniqueCourses = Array.from(new Set(students.map(s => s.course_name).filter(Boolean))).sort()
  const uniqueYears = Array.from(new Set(students.map(s => s.year_of_study).filter(Boolean))).sort((a, b) => a - b)

  // 3. Apply Filters
  const filteredStudents = studentsWithStats.filter((student) => {
    const matchCourse = filterCourse === "all" || student.course_name === filterCourse
    const matchYear = filterYear === "all" || student.year_of_study?.toString() === filterYear
    return matchCourse && matchYear
  })

  // 4. Apply Sorting (Points Descending)
  const sortedStudents = [...filteredStudents].sort((a, b) => b.totalPoints - a.totalPoints)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-muted-foreground">Manage students and review achievements</p>
      </div>

      {/* Filters Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-1 block">Filter by Course</label>
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {uniqueCourses.map((course) => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-1/4">
              <label className="text-sm font-medium mb-1 block">Filter by Year</label>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {uniqueYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-1/4 flex items-end">
               <p className="text-sm text-muted-foreground">
                  Showing <span className="font-bold text-foreground">{sortedStudents.length}</span> students
               </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading student data...</div>
      ) : (
        <div className="space-y-4">
          {sortedStudents.map((student) => (
            <Card 
              key={student.id} 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedStudent(student)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{student.full_name}</h3>
                      <Badge variant="secondary">{student.totalPoints} pts</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {student.student_id} • {student.course_name || "Course not set"} • Year {student.year_of_study || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                    
                    <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                      <span>Submissions: <strong className="text-foreground">{student.totalSubmissions}</strong></span>
                      <span>Approved: <strong className="text-green-600">{student.approvedSubmissions}</strong></span>
                    </div>
                  </div>
                  
                  <div className="text-muted-foreground">
                    <FileText size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {sortedStudents.length === 0 && !loading && (
             <Card>
               <CardContent className="pt-10 pb-10 text-center text-muted-foreground">
                 No students found matching the selected filters.
               </CardContent>
             </Card>
          )}
        </div>
      )}

      {/* --- STUDENT DETAILS DIALOG --- */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedStudent?.full_name}'s Achievements</span>
              <Badge variant="outline">Total: {selectedStudent?.totalPoints} pts</Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedStudent?.course_name} • Year {selectedStudent?.year_of_study}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {selectedStudent?.submissions.length === 0 ? (
              <p className="text-center text-muted-foreground">No submissions yet.</p>
            ) : (
              selectedStudent?.submissions.map((sub: any) => (
                <div key={sub.id} className="border rounded-lg p-4 bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{sub.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {sub.category} • {new Date(sub.achievement_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant={sub.status === 'approved' ? 'default' : 'secondary'}
                    >
                      {sub.status}
                    </Badge>
                  </div>
                  
                  {sub.description && (
                    <p className="text-sm text-slate-700 mb-3 line-clamp-2">{sub.description}</p>
                  )}

                  {/* Proof Link */}
                  {sub.proof_url ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full sm:w-auto"
                      onClick={(e) => {
                        e.stopPropagation()
                        setProofUrl(sub.proof_url)
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Proof Document
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">No proof uploaded</span>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* --- PROOF VIEWER DIALOG --- */}
      <Dialog open={!!proofUrl} onOpenChange={() => setProofUrl(null)}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle>Submitted Document</DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-slate-100 w-full flex items-center justify-center p-4 overflow-hidden">
            {proofUrl && (
              <>
                {/* If Image, use img tag to prevent zoom/distortion. If PDF, use iframe. */}
                {proofUrl.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                  <img
                    src={proofUrl}
                    alt="Proof Document"
                    className="max-h-full max-w-full object-contain rounded shadow-sm"
                  />
                ) : (
                  <iframe
                    src={proofUrl}
                    className="w-full h-full rounded border shadow-sm"
                    title="Document Preview"
                  />
                )}
              </>
            )}
          </div>
          <div className="p-4 border-t flex justify-end flex-shrink-0 bg-white">
            <Button variant="secondary" onClick={() => setProofUrl(null)}>Close Viewer</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}