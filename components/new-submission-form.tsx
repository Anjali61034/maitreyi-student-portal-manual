"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Achievement {
  id: string
  name: string
  category: string
  description: string
  max_points: number
}

interface NewSubmissionFormProps {
  achievements: Achievement[]
}

export function NewSubmissionForm({ achievements }: NewSubmissionFormProps) {
  const [formData, setFormData] = useState({
    achievementId: "",
    title: "",
    description: "",
    achievementDate: "",
    proofFile: null as File | null,
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const selectedAchievement = achievements.find((a) => a.id === formData.achievementId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      let proofUrl = null
      let proofFileName = null

      // Upload proof file if provided
      if (formData.proofFile) {
        const fileExt = formData.proofFile.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from("achievement-proofs")
          .upload(fileName, formData.proofFile)

        if (uploadError) {
          if (uploadError.message.includes("Bucket not found")) {
            throw new Error(
              "Storage bucket not set up. Please ask your administrator to create the 'achievement-proofs' bucket in Supabase Storage. See SUPABASE_SETUP.md for instructions.",
            )
          }
          throw uploadError
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("achievement-proofs").getPublicUrl(fileName)

        proofUrl = publicUrl
        proofFileName = formData.proofFile.name
      }

      // Insert submission
      const { error: insertError } = await supabase.from("submissions").insert({
        student_id: user.id,
        achievement_id: formData.achievementId,
        title: formData.title,
        description: formData.description,
        achievement_date: formData.achievementDate,
        proof_url: proofUrl,
        proof_file_name: proofFileName,
        status: "pending",
      })

      if (insertError) throw insertError

      router.push("/dashboard/submissions")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievement Details</CardTitle>
        <CardDescription>Fill in the details of your achievement</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="achievement">Achievement Type</Label>
            <Select
              value={formData.achievementId}
              onValueChange={(value) => setFormData({ ...formData, achievementId: value })}
            >
              <SelectTrigger id="achievement">
                <SelectValue placeholder="Select achievement type" />
              </SelectTrigger>
              <SelectContent>
                {achievements.map((achievement) => (
                  <SelectItem key={achievement.id} value={achievement.id}>
                    {achievement.name} ({achievement.category}) - Max {achievement.max_points} points
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAchievement && <p className="text-sm text-muted-foreground">{selectedAchievement.description}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., First Class in Semester 5"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide details about your achievement..."
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="achievementDate">Achievement Date</Label>
            <Input
              id="achievementDate"
              type="date"
              required
              value={formData.achievementDate}
              onChange={(e) => setFormData({ ...formData, achievementDate: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="proofFile">Proof Document (Optional)</Label>
            <Input
              id="proofFile"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFormData({ ...formData, proofFile: e.target.files?.[0] || null })}
            />
            <p className="text-sm text-muted-foreground">Upload certificates, photos, or other proof documents</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Submitting..." : "Submit Achievement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
