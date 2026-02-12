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
import { FileText, Award, X, ExternalLink, Globe } from "lucide-react"

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
  
  // State for Category Navigation in Dialog
  const [activeCategory, setActiveCategory] = useState<string>("")

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

  // --- HELPER: Get Badge Label based on Stored Activity Type ---
  const getLevelBadge = (sub: any) => {
    // We now rely on the explicit 'activity_type' column stored in the DB
    const type = sub.activity_type

    // Fallback for old data if it doesn't have activity_type yet
    if (!type) {
       // Simple fallback based on points if type is missing
       return <Badge variant="outline">{sub.points_awarded} pts</Badge>
    }

    switch (type) {
      // Industry Types
      case "international":
        return <Badge variant="secondary">International</Badge>
      case "national":
        return <Badge variant="secondary">National</Badge>
      case "local":
        return <Badge variant="secondary">Local</Badge>
      
      // Standard Achievement Types
      case "rank1":
        return <Badge variant="secondary">Rank 1</Badge>
      case "rank2":
        return <Badge variant="secondary">Rank 2</Badge>
      case "rank3":
        return <Badge variant="secondary">Rank 3</Badge>
      case "participation":
        return <Badge variant="secondary">Participation</Badge>
      case "leadership":
        return <Badge variant="secondary">Leadership Role</Badge>
        
      // CGPA / Special
      case "sgpa_performance":
        return <Badge variant="secondary">SGPA Performance</Badge>

      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  // --- PROCESSING DATA ---

  const studentsWithStats = students.map((student) => {
    const studentSubmissions = allSubmissions.filter((s) => s.student_id === student.id)
    
    const approved = studentSubmissions.filter((s) => s.status === "approved")
    const totalPoints = approved.reduce((sum, s) => sum + (s.points_awarded || 0), 0)

    return {
      ...student,
      submissions: studentSubmissions,
      totalSubmissions: studentSubmissions.length,
      approvedSubmissions: approved.length,
      totalPoints,
    }
  })

  const uniqueCourses = Array.from(new Set(students.map(s => s.course_name).filter(Boolean))).sort()
  const uniqueYears = Array.from(new Set(students.map(s => s.year_of_study).filter(Boolean))).sort((a, b) => a - b)

  const filteredStudents = studentsWithStats.filter((student) => {
    const matchCourse = filterCourse === "all" || student.course_name === filterCourse
    const matchYear = filterYear === "all" || student.year_of_study?.toString() === filterYear
    return matchCourse && matchYear
  })

  const sortedStudents = [...filteredStudents].sort((a, b) => b.totalPoints - a.totalPoints)

  useEffect(() => {
    if (selectedStudent && selectedStudent.submissions) {
      setActiveCategory("") 
    }
  }, [selectedStudent])

  return (
    <div className="space-y-6">
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
        <DialogContent className="!w-[80vw] !max-w-none h-[85vh] overflow-hidden p-0 flex flex-col">
          
          {/* Dialog Header */}
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0 bg-white">
            <DialogTitle className="flex items-center justify-between">
              <span className="text-2xl">{selectedStudent?.full_name}'s Achievements</span>
              <Badge variant="outline" className="text-sm">Total: {selectedStudent?.totalPoints} pts</Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedStudent?.course_name} • Year {selectedStudent?.year_of_study}
            </DialogDescription>
          </DialogHeader>

          {/* Main Content Area */}
          {(() => {
            if (!selectedStudent?.submissions || selectedStudent.submissions.length === 0) {
              return (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  No submissions yet.
                </div>
              )
            }

            const groupedData = selectedStudent.submissions.reduce((acc: any, sub: any) => {
              if (!acc[sub.category]) {
                acc[sub.category] = { points: 0, items: [] }
              }
              if (sub.status === 'approved') {
                acc[sub.category].points += (sub.points_awarded || 0)
              }
              acc[sub.category].items.push(sub)
              return acc
            }, {})

            const categoriesList = Object.entries(groupedData)
              .map(([category, data]: any) => ({ category, ...data }))
              .sort((a, b) => b.points - a.points)

            if (!activeCategory && categoriesList.length > 0) {
              setActiveCategory(categoriesList[0].category)
            }

            const currentCategoryData = categoriesList.find(c => c.category === activeCategory)

            return (
              <div className="flex-1 flex overflow-hidden">
                
                {/* LEFT: Category Navigation */}
                <div className="w-1/3 border-r bg-slate-50 overflow-y-auto">
                  <div className="p-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3 tracking-wider">Categories</h4>
                    <div className="space-y-1">
                      {categoriesList.map((cat: any) => (
                        <button
                          key={cat.category}
                          onClick={() => setActiveCategory(cat.category)}
                          className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-between group
                            ${activeCategory === cat.category 
                              ? 'bg-white shadow-sm text-primary ring-1 ring-primary/20' 
                              : 'hover:bg-white hover:shadow-sm text-muted-foreground'
                            }`}
                        >
                          <span className="truncate">{cat.category}</span>
                          <Badge variant={activeCategory === cat.category ? "default" : "secondary"} className="text-[10px] h-5">
                            {cat.points}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Achievement Details */}
                <div className="w-2/3 bg-white overflow-y-auto p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-xl font-bold text-slate-800">{currentCategoryData?.category}</h3>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {currentCategoryData?.points} Points
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {currentCategoryData?.items.map((sub: any) => (
                      <div key={sub.id} className="border rounded-lg p-5 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-base text-slate-900">{sub.title}</h4>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge variant="outline" className="text-xs px-2 py-0">
                                {sub.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(sub.achievement_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end ml-4">
                             <span className="text-lg font-bold text-primary">
                               +{sub.points_awarded}
                             </span>
                             <span className="text-[10px] text-muted-foreground uppercase font-semibold">Points</span>
                          </div>
                        </div>
                        
                        {/* --- VISIBILITY FOR LEVEL & SCOPE --- */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {/* 1. Achievement Level Badge (Now reading from activity_type) */}
                            {getLevelBadge(sub)}
                        </div>
                        
                        {/* Description */}
                        <div className="bg-white p-4 rounded border border-slate-200 mb-4">
                          <p className="text-sm font-semibold text-slate-800 mb-1">Details:</p>
                          {sub.description ? (
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {sub.description}
                            </p>
                          ) : (
                            <p className="text-sm text-slate-400 italic">No description provided for this entry.</p>
                          )}
                        </div>

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
                          <span className="text-xs text-muted-foreground italic">No proof uploaded</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )
          })()}
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