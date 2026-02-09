"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

// Course List extracted from the image
const COURSE_LIST = [
  "B.A.(H) Economics",
  "B.A.(H) English",
  "B.A.(H) History",
  "B.A.(H) Political Science",
  "B.A.(H) Sanskrit",
  "B.A.(H) Philosophy",
  "B.A.(H) Hindi",
  "B.A. Programme (Multidisciplinary)",
  "B.Com (Programme)",
  "B.Com (Honours)",
  "B.Sc. Life Sciences",
  "B.Sc. Physical Sciences",
  "B.Sc. Mathematical Sciences",
  "B.Sc. Chemistry (H)",
  "B.Sc. Electronics",
  "B.Sc. Computer Science (H)",
  "B.Sc. Botany (H)",
  "B.Sc. Zoology (H)"
]

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    repeatPassword: "",
    fullName: "",
    role: "student",
    studentId: "",
    courseName: "", // ADDED: Course selection
    stream: "", 
    yearOfStudy: "",
    phone: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.role === "student" && !formData.studentId) {
      setError("Student ID is required for student accounts")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName,
            role: formData.role,
            student_id: formData.studentId || null,
            // REMOVED: department
            course_name: formData.courseName || null, // ADDED: Save Course
            stream: formData.stream || null, // ADDED: Save Stream (Humanities/Science)
            year_of_study: formData.yearOfStudy ? Number.parseInt(formData.yearOfStudy) : null,
            phone: formData.phone || null,
          },
        },
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Register for the Student Merit Portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@university.edu"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repeatPassword">Confirm Password</Label>
                    <Input
                      id="repeatPassword"
                      type="password"
                      required
                      value={formData.repeatPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          repeatPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">Account Type</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === "student" && (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="studentId">Roll No.</Label>
                        <Input
                          id="studentId"
                          type="text"
                          placeholder="STU2024001"
                          required
                          value={formData.studentId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              studentId: e.target.value,
                            })
                          }
                        />
                      </div>
                      
                      {/* ADDED: Course Dropdown replacing Department */}
                      <div className="grid gap-2">
                        <Label htmlFor="courseName">Course</Label>
                        <Select 
                           value={formData.courseName} 
                           onValueChange={(value) => setFormData({ ...formData, courseName: value })}
                        >
                          <SelectTrigger id="courseName">
                            <SelectValue placeholder="Select Course" />
                          </SelectTrigger>
                          <SelectContent>
                            {COURSE_LIST.map((course) => (
                              <SelectItem key={course} value={course}>{course}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="stream">Stream </Label>
                      <Select
                        value={formData.stream}
                        onValueChange={(value) => setFormData({ ...formData, stream: value })}
                      >
                        <SelectTrigger id="stream">
                          <SelectValue placeholder="Select stream" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="humanities">Humanities / Commerce</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="yearOfStudy">Year of Study</Label>
                        <Select
                          value={formData.yearOfStudy}
                          onValueChange={(value) => setFormData({ ...formData, yearOfStudy: value })}
                        >
                          <SelectTrigger id="yearOfStudy">
                            <SelectValue placeholder="Select year" />
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
                  </>
                )}

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}