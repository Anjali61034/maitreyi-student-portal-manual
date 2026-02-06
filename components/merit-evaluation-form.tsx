"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function MeritEvaluationForm() {
  const [formData, setFormData] = useState({
    academicYear: "",
    studentYear: "", // ADDED: Student Year Filter
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // Query to get students
      let query = supabase.from("profiles").select("id").eq("role", "student")

      // ADDED: Filter by Student Year if selected
      if (formData.studentYear) {
        query = query.eq("year_of_study", formData.studentYear)
      }

      const { data: students } = await query

      if (!students || students.length === 0) {
        throw new Error("No students found for the selected criteria")
      }

      // Calculate points for each student
      const studentPoints = await Promise.all(
        students.map(async (student) => {
          const { data: submissions } = await supabase
            .from("submissions")
            .select("points_awarded")
            .eq("student_id", student.id)
            .eq("status", "approved")

          const totalPoints = submissions?.reduce((sum, s) => sum + (s.points_awarded || 0), 0) || 0

          return {
            student_id: student.id,
            total_points: totalPoints,
          }
        }),
      )

      // Sort by points and assign ranks
      const sortedStudents = studentPoints.sort((a, b) => b.total_points - a.total_points)

      // Calculate percentiles and create evaluation records
      const evaluations = sortedStudents.map((student, index) => {
        const rank = index + 1
        const percentile = ((sortedStudents.length - index) / sortedStudents.length) * 100

        return {
          student_id: student.student_id,
          academic_year: formData.academicYear,
          student_year: formData.studentYear, // Store student year in evaluation if needed
          total_points: student.total_points,
          rank,
          percentile: Math.round(percentile * 100) / 100,
        }
      })

      // Insert evaluations (upsert to handle duplicates)
      // Updated conflict constraint
      const { error } = await supabase.from("merit_evaluations").upsert(evaluations, {
        onConflict: "student_id,academic_year,student_year", 
        // Note: You might need to update your DB unique constraint to include student_year if you want unique rows per year/batch
      })

      if (error) throw error

      setMessage({
        type: "success",
        text: `Successfully generated merit rankings for ${evaluations.length} students`,
      })
      router.refresh()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to generate merit rankings",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Merit Rankings</CardTitle>
        <CardDescription>Calculate and assign merit rankings based on approved achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                id="academicYear"
                placeholder="e.g., 2024-2025"
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              />
            </div>
            
            {/* ADDED: Student Year Filter */}
            <div className="grid gap-2">
              <Label htmlFor="studentYear">Student Year</Label>
              <Select
                value={formData.studentYear}
                onValueChange={(value) => setFormData({ ...formData, studentYear: value })}
              >
                <SelectTrigger id="studentYear">
                  <SelectValue placeholder="Select Student Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">First Year</SelectItem>
                  <SelectItem value="2">Second Year</SelectItem>
                  <SelectItem value="3">Third Year</SelectItem>
                  <SelectItem value="4">Fourth Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Merit Rankings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}