"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"

// Course List (Same as used in SignUp)
const COURSE_LIST = [
  "B.A.(H) Economics", "B.A.(H) English", "B.A.(H) History",
  "B.A.(H) Political Science", "B.A.(H) Sanskrit", "B.A.(H) Philosophy",
  "B.A.(H) Hindi", "B.A. Programme (Multidisciplinary)",
  "B.Com (Programme)", "B.Com (Honours)",
  "B.Sc. Life Sciences", "B.Sc. Physical Sciences", "B.Sc. Mathematical Sciences",
  "B.Sc. Chemistry (H)", "B.Sc. Electronics", "B.Sc. Computer Science (H)",
  "B.Sc. Botany (H)", "B.Sc. Zoology (H)"
]

export default function EditProfilePage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: "",
    student_id: "",
    course_name: "",
    stream: "",
    year_of_study: "",
    phone: "",
  })

  // Load current profile data
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push("/login")

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profile) {
        setFormData({
          full_name: profile.full_name || "",
          student_id: profile.student_id || "",
          course_name: profile.course_name || "",
          stream: profile.stream || "",
          year_of_study: profile.year_of_study?.toString() || "",
          phone: profile.phone || "",
        })
      }
      setLoading(false)
    }
    loadProfile()
  }, [supabase, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          student_id: formData.student_id,
          course_name: formData.course_name,
          stream: formData.stream,
          year_of_study: formData.year_of_study ? parseInt(formData.year_of_study) : null,
          phone: formData.phone,
        })
        .eq("id", user.id)

      if (error) throw error
      
      router.push("/dashboard/profile") // Redirect back to profile view
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground">Update your student information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>Make changes to your profile here.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                value={formData.full_name} 
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                required 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input 
                id="studentId" 
                value={formData.student_id} 
                onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                required 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="course">Course</Label>
              <Select 
                value={formData.course_name} 
                onValueChange={(val) => setFormData({...formData, course_name: val})}
              >
                <SelectTrigger id="course">
                  <SelectValue placeholder="Select your course" />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_LIST.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stream">Stream</Label>
              <Select 
                value={formData.stream} 
                onValueChange={(val) => setFormData({...formData, stream: val})}
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

            <div className="grid gap-2">
              <Label htmlFor="year">Year of Study</Label>
              <Select 
                value={formData.year_of_study} 
                onValueChange={(val) => setFormData({...formData, year_of_study: val})}
              >
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel"
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button type="button" variant="outline" onClick={() => router.back()}>
                 Cancel
               </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}