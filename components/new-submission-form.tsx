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
import { Trash2, Plus, GraduationCap, User, Globe, Calculator, AlertTriangle, Loader2 } from "lucide-react"

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
  const [activityType, setActivityType] = useState<string>("participation")
  const [industryLevel, setIndustryLevel] = useState<string>("local")
  const [achievementRank, setAchievementRank] = useState<string>("") 
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [proofFile, setProofFile] = useState<File | null>(null)
  
  const [sgpaList, setSgpaList] = useState([{ sem: 1, sgpa: "" }])
  
  // User Profile State
  const [userStream, setUserStream] = useState<"humanities" | "science">("humanities")
  const [userCourse, setUserCourse] = useState<string>("")
  const [existingPoints, setExistingPoints] = useState<Record<string, number>>({})
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // NEW: State for Warning Message
  const [isCapped, setIsCapped] = useState<boolean>(false)

  // Fetch User Profile Data
  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("stream, course_name")
        .eq("id", user.id)
        .single()
      
      if (profile?.stream) setUserStream(profile.stream as "humanities" | "science")
      if (profile?.course_name) setUserCourse(profile.course_name)

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

  // --- EVALUATION LOGIC: SGPA Average Calculation ---
  const calculateSgpaPoints = (sgpas: { sem: number, sgpa: string }[]): number => {
    const validEntries = sgpas
      .filter(y => y.sgpa !== "")
      .map(y => parseFloat(y.sgpa))
      .filter(n => !isNaN(n))

    if (validEntries.length === 0) return 0

    const sum = validEntries.reduce((a, b) => a + b, 0)
    const averageSgpa = sum / validEntries.length
    const finalAvg = parseFloat(averageSgpa.toFixed(2))

    if (userStream === "humanities") {
      if (finalAvg >= 8.0) return 5
      if (finalAvg >= 7.5) return 4
      if (finalAvg >= 7.0) return 3
      if (finalAvg >= 6.5) return 2
      if (finalAvg >= 6.0) return 1
    } else {
      if (finalAvg >= 9.0) return 5
      if (finalAvg >= 8.5) return 4
      if (finalAvg >= 8.0) return 3
      if (finalAvg >= 7.5) return 2
      if (finalAvg >= 7.0) return 1
    }
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setIsCapped(false) // Reset warning on new submit

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      if (category !== "cgpa_evaluation") {
        const selectedDate = new Date(date)
        const academicStart = new Date("2025-01-01")
        const academicEnd = new Date("2025-12-31")
        
        if (!date || isNaN(selectedDate.getTime())) throw new Error("Please select a valid date.")
        if (selectedDate < academicStart || selectedDate > academicEnd) {
          throw new Error("Invalid date. Achievement must be within 2025-2026 Academic Year (January 2025 - December 2025).")
        }
      }

      let pointsToAward = 0
      let finalCategory = category
      let details = description
      let finalTitle = title
      let finalDate = date

      // 1. CGPA EVALUATION
      if (category === "cgpa_evaluation") {
        const validSgpas = sgpaList.filter(c => c.sgpa !== "").map(c => parseFloat(c.sgpa)).filter(n => !isNaN(n))
        if (validSgpas.length === 0) throw new Error("Please enter at least one valid SGPA")
        
        pointsToAward = calculateSgpaPoints(sgpaList)
        
        finalTitle = `SGPA Performance Evaluation - ${userCourse}`
        const semDetails = sgpaList.map(s => `Sem ${s.sem}: ${s.sgpa || '-'}`).join(", ")
        details = `Course: ${userCourse}. Stream: ${userStream.toUpperCase()}. ${semDetails}.`
        finalDate = new Date().toISOString().split('T')[0]
        finalCategory = "CGPA Evaluation"
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

        if (category === "academic_engagement_and_research") finalCategory = "Academic Engagement and Research"
        else if (category === "extra_curricular_activities") finalCategory = "Extra Curricular Activities"
        else if (category === "outreach_activities") finalCategory = "Outreach Activities"
        else if (category === "sports") finalCategory = "Sports"
        else if (category === "ncc") finalCategory = "National Cadet Corps"
      }

      // --- UPDATED LOGIC: CAPPING AND LIMIT CHECK ---
      const currentCategoryPoints = existingPoints[finalCategory] || 0

      // If category is already full (5+), prevent submission.
      if (currentCategoryPoints >= 5) {
        throw new Error("You have already reached the maximum 5 points for this category. No further submissions allowed.")
      }

      // Calculate remaining space
      const remainingPoints = 5 - currentCategoryPoints

      // If the new points exceed the remaining space, cap them and show warning
      if (pointsToAward > remainingPoints) {
        pointsToAward = remainingPoints
        setIsCapped(true)
      }
      // --- END OF UPDATED LOGIC ---

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

      // Activity Type Mapping
      const activityTypeToSave = category === "cgpa_evaluation" ? "sgpa_performance" : category === "industry" ? industryLevel : activityType

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
        achievement_scope: achievementRank || null, 
        activity_type: activityTypeToSave, 
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
          
          {/* READ ONLY: Profile Info */}
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
            <Select value={category} onValueChange={(val) => {
                setCategory(val)
                setAchievementRank("") 
                setActivityType("participation")
                setSgpaList([{ sem: 1, sgpa: "" }])
                setIsCapped(false)
            }}>
              <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
<SelectContent>
  <SelectItem value="cgpa_evaluation">CGPA Evaluation (SGPA)</SelectItem>
  <SelectItem value="academic_engagement_and_research">Academic Engagement and Research</SelectItem>
  <SelectItem value="extra_curricular_activities">Extra Curricular Activities</SelectItem>
  <SelectItem value="outreach_activities">Outreach Activities</SelectItem>
  <SelectItem value="sports">Sports</SelectItem>
  <SelectItem value="ncc">National Cadet Corps</SelectItem>
  <SelectItem value="industry_experience">Industry Experience</SelectItem>
</SelectContent>
            </Select>
          </div>

          {/* CONDITIONAL: HIDE TITLE, DETAILS, DATE IF CGPA MODE */}
          {!(category === "cgpa_evaluation") && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="title">Title of Activity</Label>
                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Name, Nature of Involvement" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Activity Organiser</Label>
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required placeholder="Cultural society, club, university or any other organisation or institution outside" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required min="2025-01-01" max="2025-12-31" />
                <p className="text-xs text-muted-foreground">Must be between January 2025 - December 2025</p>
              </div>
            </>
          )}

          {/* 1. CGPA EVALUATION INPUTS */}
          {category === "cgpa_evaluation" && (
            <div className="space-y-2 border p-4 rounded bg-slate-50">
              <div className="flex items-center gap-2 text-blue-600">
                <Calculator className="h-4 w-4" />
                <Label className="font-semibold">Enter SGPA (Last 2 Semesters)</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Points calculated based on <b>Average</b> of entered SGPAs.<br />
                Using <b>{userStream === "humanities" ? "Humanities/Commerce" : "Science"}</b> criteria.
              </p>
              
              {sgpaList.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input 
                    type="number" 
                    placeholder="Sem" 
                    value={item.sem} 
                    disabled 
                    className="w-20" 
                  />
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="SGPA (e.g. 8.5)" 
                    value={item.sgpa} 
                    onChange={(e) => {
                      const list = [...sgpaList]; 
                      list[idx].sgpa = e.target.value; 
                      setSgpaList(list);
                    }} 
                  />
                  {sgpaList.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => setSgpaList(sgpaList.filter((_, i) => i !== idx))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                disabled={sgpaList.length >= 2}
                onClick={() => {
                  if (sgpaList.length < 2) {
                    setSgpaList([...sgpaList, { sem: sgpaList.length + 1, sgpa: "" }]);
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Semester (Max 2)
              </Button>
            </div>
          )}

          {/* 2. INDUSTRY EXPERIENCE INPUTS */}
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

          {/* 3. STANDARD ACTIVITY INPUTS */}
          {category !== "cgpa_evaluation" && category !== "industry" && (
            <div className="space-y-4">
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
            </div>
          )}

          {/* PROOF UPLOAD */}
          <div className="grid gap-2">
            <Label htmlFor="proof">Proof Document</Label>
            <Input id="proof" type="file" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
            <p className="text-xs text-muted-foreground">Please upload your best certificates.</p>
          </div>

          {/* NEW: WARNING MESSAGE FOR CAPPING */}
          {isCapped && (
             <div className="rounded-md bg-orange-50 border border-orange-200 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-700 shrink-0" />
                <div>
                  <p className="font-semibold text-orange-900">Submission Successful (Capped)</p>
                  <p className="text-sm text-orange-800">
                    Your achievement has been recorded. However, to maintain the category limit of 5.0 points, the system has adjusted the points for this entry. Your accumulated total for this category is now 5.0.
                  </p>
                </div>
             </div>
          )}

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Evaluating..." : "Submit & Get Points"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}