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
    semester: "",
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
      // Get all students with their approved submissions
      const { data: students } = await supabase.from("profiles").select("id").eq("role", "student")

      if (!students || students.length === 0) {
        throw new Error("No students found")
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
          semester: formData.semester,
          total_points: student.total_points,
          rank,
          percentile: Math.round(percentile * 100) / 100,
        }
      })

      // Insert evaluations (upsert to handle duplicates)
      const { error } = await supabase.from("merit_evaluations").upsert(evaluations, {
        onConflict: "student_id,academic_year,semester",
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
            <div className="grid gap-2">
              <Label htmlFor="semester">Semester</Label>
              <Select
                value={formData.semester}
                onValueChange={(value) => setFormData({ ...formData, semester: value })}
              >
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fall">Fall</SelectItem>
                  <SelectItem value="Spring">Spring</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
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
