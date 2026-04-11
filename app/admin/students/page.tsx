"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, ExternalLink } from "lucide-react"

export default function AdminStudentsPage() {
  const supabase = createClient()

  const [students, setStudents] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [filterCourse, setFilterCourse] = useState("all")
  const [filterYear, setFilterYear] = useState("all")

  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [proofUrl, setProofUrl] = useState<string | null>(null)

  const [showCategories, setShowCategories] = useState(true)

  // ---------------- FETCH ----------------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: studentsData } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")

      const { data: submissionsData } = await supabase
        .from("submissions")
        .select("*")

      setStudents(studentsData || [])
      setSubmissions(submissionsData || [])
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  // ---------------- PROCESS DATA ----------------
  const studentsWithStats = students.map((student) => {
    const studentSubs = submissions.filter(
      (s) => s.student_id === student.id
    )

    const approvedSubs = studentSubs.filter(
      (s) => s.status === "approved"
    )

    // Category-wise Points
    const categoryPoints: Record<string, number> = {}

    approvedSubs.forEach((sub) => {
      const category = sub.category || "OTHER"
      const points = sub.points_awarded || 0

      if (!categoryPoints[category]) {
        categoryPoints[category] = 0
      }

      categoryPoints[category] += points
    })

    const totalPoints = Object.values(categoryPoints).reduce(
      (sum, val) => sum + val,
      0
    )

    return {
      ...student,
      submissions: studentSubs,
      totalSubmissions: studentSubs.length,
      approvedSubmissions: approvedSubs.length,
      categoryPoints,
      totalPoints,
    }
  })

  const uniqueCourses = Array.from(
    new Set(students.map((s) => s.course_name).filter(Boolean))
  )

  const uniqueYears = Array.from(
    new Set(students.map((s) => s.year_of_study).filter(Boolean))
  )

  const filteredStudents = studentsWithStats.filter((student) => {
    const matchCourse =
      filterCourse === "all" || student.course_name === filterCourse

    const matchYear =
      filterYear === "all" ||
      student.year_of_study?.toString() === filterYear

    return matchCourse && matchYear
  })

  const sortedStudents = [...filteredStudents].sort(
    (a, b) => b.totalPoints - a.totalPoints
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-muted-foreground">
          Leaderboard based on approved achievements
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">

          <div className="flex flex-wrap gap-4">

            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-1 block">
                Filter by Course
              </label>
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {uniqueCourses.map((course: any) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-1/4">
              <label className="text-sm font-medium mb-1 block">
                Filter by Year
              </label>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {uniqueYears.map((year: any) => (
                    <SelectItem key={year} value={year.toString()}>
                      Year {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end text-sm text-muted-foreground">
              Showing {sortedStudents.length} students
            </div>
          </div>

          {/* Category Toggle */}
          <div className="flex items-center justify-between border rounded-md p-3 bg-slate-50">
            <span className="text-sm font-semibold">
              Categories Visible
            </span>

            <button
              onClick={() => setShowCategories(!showCategories)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                showCategories ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                  showCategories ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

        </CardContent>
      </Card>

      {/* Student List */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="space-y-4">
          {sortedStudents.map((student, index) => (
            <Card
              key={student.id}
              className="cursor-pointer hover:border-primary"
              onClick={() => setSelectedStudent(student)}
            >
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">

                  <div>
                    <h3 className="font-semibold text-lg">
                      #{index + 1} {student.full_name}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {student.course_name} • Year {student.year_of_study}
                    </p>

                    {showCategories && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {Object.entries(student.categoryPoints).map(
                          ([category, points]) => (
                            <Badge key={category} variant="outline">
                              {category}: {points}
                            </Badge>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <Badge>{student.totalPoints} pts</Badge>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  )
}
