"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Trash2, Plus, GraduationCap, User } from "lucide-react"

// Standard Activity Points
const ACTIVITY_POINTS = {
  participation: 0.5,
  rank3: 1.0,
  rank2: 1.5,
  rank1: 2.0,
  leadership: 1.0,
}

// Industry Experience Specific Points
const INDUSTRY_POINTS = {
  international: 2.0,
  national: 1.5,
  local: 1.0,
}

export function NewSubmissionForm() {
  const router = useRouter()
  const supabase = createClient()

  // Form State
  const [category, setCategory] = useState<string>("") 
  const [academicType, setAcademicType] = useState<string>("cgpa") 
  const [activityType, setActivityType] = useState<string>("participation")
  const [industryLevel, setIndustryLevel] = useState<string>("local")
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [proofFile, setProofFile] = useState<File | null>(null)
  
  const [cgpaList, setCgpaList] = useState([{ year: 1, cgpa: "" }])
  
  // User Profile State (Fetched from Signup)
  const [userStream, setUserStream] = useState<"humanities" | "science">("humanities")
  const [userCourse, setUserCourse] = useState<string>("")
  const [existingPoints, setExistingPoints] = useState<Record<string, number>>({})
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch User Profile Data (Stream and Course) on Load
  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch Stream and Course from 'profiles' table (stored at Signup)
      const { data: profile } = await supabase
        .from("profiles")
        .select("stream, course_name")
        .eq("id", user.id)
        .single()
      
      if (profile?.stream) setUserStream(profile.stream as "humanities" | "science")
      if (profile?.course_name) setUserCourse(profile.course_name)

      // Fetch Existing Points for Validation
      const { data: submissions } = await supabase
        .from("submissions")
        .select("category, points_awarded")
        .eq("student_id", user.id)
        .eq("status", "approved")

      const totals: Record<string, number> = {}
      submissions?.forEach((sub: any) => {
        totals[sub.category] = (totals[sub.category] || 0) + (sub.points_awarded || 0)
      })
      setExistingPoints(totals)
    }
    initData()
  }, [supabase])

  // UPDATED: Calculate CGPA Points based on LAST (Highest Year) CGPA
  // Uses the userStream fetched from the database
  const calculateCgpaPoints = (yearlyCgpas: { year: number, cgpa: string }[]): number => {
    const validEntries = yearlyCgpas
      .filter(y => y.cgpa !== "")
      .map(y => ({ year: y.year, cgpa: parseFloat(y.cgpa) }))
      .filter(y => !isNaN(y.cgpa))

    if (validEntries.length === 0) return 0

    // Find the entry with the highest year number (The "Last" CGPA entered by student)
    const lastEntry = validEntries.reduce((prev, current) => {
      return (prev.year > current.year) ? prev : current
    })

    const lastCgpa = parseFloat(lastEntry.cgpa.toFixed(2))

    // Apply Rules based on Fetched Stream (from Signup)
    if (userStream === "humanities") {
      // Humanities/Commerce Rules
      if (lastCgpa >= 8.0) return 5
      if (lastCgpa >= 7.5) return 4
      if (lastCgpa >= 7.0) return 3
      if (lastCgpa >= 6.5) return 2
      if (lastCgpa >= 6.0) return 1
    } else {
      // Science Rules
      if (lastCgpa >= 9.0) return 5
      if (lastCgpa >= 8.5) return 4
      if (lastCgpa >= 8.0) return 3
      if (lastCgpa >= 7.5) return 2
      if (lastCgpa >= 7.0) return 1
    }
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // If NOT CGPA mode, validate Date input normally
      if (category !== "academic" || academicType !== "cgpa") {
        const selectedDate = new Date(date)
        const academicStart = new Date("2024-04-01")
        const academicEnd = new Date("2025-03-31")
        
        if (!date || isNaN(selectedDate.getTime())) throw new Error("Please select a valid date.")
        if (selectedDate < academicStart || selectedDate > academicEnd) {
          throw new Error("Invalid date. Achievement must be within the 2024-2025 Academic Year (April 2024 - March 2025).")
        }
      }

      let pointsToAward = 0
      let finalCategory = category
      let details = description
      let finalTitle = title
      let finalDate = date

      // 1. ACADEMIC (CGPA)
      if (category === "academic" && academicType === "cgpa") {
        const validCgpas = cgpaList.filter(c => c.cgpa !== "").map(c => parseFloat(c.cgpa)).filter(n => !isNaN(n))
        if (validCgpas.length === 0) throw new Error("Please enter at least one valid CGPA")
        
        pointsToAward = calculateCgpaPoints(cgpaList)
        
        // Auto-generate Title, Description, and Date for CGPA mode
        finalTitle = `Academic CGPA Performance - ${userCourse}`
        details = `Course: ${userCourse}. Stream: ${userStream.toUpperCase()}. Year-wise CGPA: ${cgpaList.map(c => `Year ${c.year}: ${c.cgpa || '-'}`).join(", ")}.`
        // Set date to today for CGPA records
        finalDate = new Date().toISOString().split('T')[0]
        
        finalCategory = "Academic (CGPA)"
      } 
      // 2. INDUSTRY EXPERIENCE
      else if (category === "industry") {
        pointsToAward = INDUSTRY_POINTS[industryLevel as keyof typeof INDUSTRY_POINTS] || 0
        finalCategory = "Industry Experience"
      }
      // 3. STANDARD ACTIVITIES
      else {
        const typeKey = activityType as keyof typeof ACTIVITY_POINTS
        pointsToAward = ACTIVITY_POINTS[typeKey] || 0

        if (category === "academic") finalCategory = "Academic Engagement"
        else if (category === "extra_curricular") finalCategory = "Extra Curricular"
        else if (category === "outreach") finalCategory = "Outreach"
        else if (category === "sports") finalCategory = "Sports"
        else if (category === "ncc") finalCategory = "National Cadet Corps"
      }

      // VALIDATION: 5 Point Limit
      const currentPoints = existingPoints[finalCategory] || 0
      if (currentPoints + pointsToAward > 5) {
        throw new Error(`Limit reached! You have ${currentPoints}/5 points in ${finalCategory}.`)
      }

      // FILE UPLOAD
      let proofUrl = null
      let proofFileName = null

      if (proofFile) {
        const fileExt = proofFile.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from("achievement-proofs")
          .upload(fileName, proofFile)

        if (uploadError) throw new Error(`File upload failed: ${uploadError.message}`)

        const { data: { publicUrl } } = supabase.storage.from("achievement-proofs").getPublicUrl(fileName)
        proofUrl = publicUrl
        proofFileName = proofFile.name
      }

      // INSERT TO DATABASE
      const { error: insertError } = await supabase.from("submissions").insert({
        student_id: user.id,
        title: finalTitle,
        description: details,
        category: finalCategory, 
        achievement_date: finalDate,
        proof_url: proofUrl,
        proof_file_name: proofFileName,
        points_awarded: pointsToAward,
        status: "approved",
      })

      if (insertError) throw insertError
      router.push("/dashboard/submissions")
    } catch (error: unknown) {
      let errorMessage = "An error occurred.";
      if (error instanceof Error) errorMessage = error.message;
      else if (typeof error === 'object' && error !== null && 'message' in error) errorMessage = (error as any).message;
      setError(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Achievement</CardTitle>
        <CardDescription>Points are calculated automatically based on criteria.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* READ ONLY: Profile Info (Course & Stream from Signup) */}
          <div className="bg-slate-50 border p-4 rounded-md flex flex-col sm:flex-row gap-4 text-sm">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-slate-500" />
              <span className="font-semibold">Course:</span>
              <span>{userCourse || "Loading..."}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <span className="font-semibold">Stream Logic:</span>
              <span className="capitalize text-primary">{userStream}</span>
            </div>
          </div>
          
          {/* CATEGORY SELECTOR */}
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="extra_curricular">Extra-Curricular</SelectItem>
                <SelectItem value="outreach">Outreach Activities</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="ncc">National Cadet Corps</SelectItem>
                <SelectItem value="industry">Industry Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ACADEMIC SUB-TYPE */}
          {category === "academic" && (
            <div className="grid gap-2">
              <Label>Academic Sub-Type</Label>
              <Select value={academicType} onValueChange={setAcademicType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cgpa">CGPA Calculation</SelectItem>
                  <SelectItem value="engagement">Research / Engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* CONDITIONAL: HIDE TITLE, DETAILS, DATE IF CGPA MODE */}
          {!(category === "academic" && academicType === "cgpa") && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Internship at Google" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Details</Label>
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="More details..." />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required min="2024-04-01" max="2025-03-31" />
                <p className="text-xs text-muted-foreground">Must be between April 2024 - March 2025</p>
              </div>
            </>
          )}

          {/* YEAR-WISE CGPA INPUTS */}
          {category === "academic" && academicType === "cgpa" && (
            <div className="space-y-2 border p-4 rounded bg-slate-50">
              <Label>Enter CGPA Year-wise</Label>
              <p className="text-xs text-muted-foreground">
                Using <b>{userStream === "humanities" ? "Humanities/Commerce" : "Science"}</b> criteria. 
                Points calculated based on <b>last (highest) year</b> CGPA.
              </p>
              
              {cgpaList.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input 
                    type="number" 
                    placeholder="Year" 
                    value={idx + 1} 
                    disabled 
                    className="w-20" 
                  />
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="CGPA (e.g. 8.5)" 
                    value={item.cgpa} 
                    onChange={(e) => {
                      const list = [...cgpaList]; 
                      list[idx].cgpa = e.target.value; 
                      setCgpaList(list);
                    }} 
                  />
                  {cgpaList.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => setCgpaList(cgpaList.filter((_, i) => i !== idx))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                disabled={cgpaList.length >= 4}
                onClick={() => {
                  if (cgpaList.length < 4) {
                    setCgpaList([...cgpaList, { year: cgpaList.length + 1, cgpa: "" }]);
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Year
              </Button>
            </div>
          )}

          {/* INDUSTRY EXPERIENCE SPECIFIC INPUTS */}
          {category === "industry" && (
            <div className="grid gap-2">
              <Label>Experience Level</Label>
              <Select value={industryLevel} onValueChange={setIndustryLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="international">International</SelectItem>
                  <SelectItem value="national">National</SelectItem>
                  <SelectItem value="local">University / Local</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* STANDARD ACTIVITY INPUTS */}
          {category !== "academic" && category !== "industry" && (
            <div className="grid gap-2">
              <Label>Achievement Level</Label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="participation">Participation </SelectItem>
                  <SelectItem value="rank3">Rank 3 / Third Prize </SelectItem>
                  <SelectItem value="rank2">Rank 2 / Second Prize </SelectItem>
                  <SelectItem value="rank1">Rank 1 / First Prize </SelectItem>
                  <SelectItem value="leadership">Leadership Role </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* PROOF UPLOAD (Always Visible) */}
          <div className="grid gap-2">
            <Label htmlFor="proof">Proof Document</Label>
            <Input id="proof" type="file" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Evaluating..." : "Submit & Get Points"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}