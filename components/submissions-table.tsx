"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { CheckCircle, Eye, XCircle } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Submission {
  id: string
  title: string
  description: string
  achievement_date: string
  status: string
  points_awarded: number | null
  admin_remarks: string | null
  created_at: string
  proof_url: string | null
  proof_file_name: string | null
  student: {
    full_name: string
    student_id: string
    department: string
  }
  achievements: {
    name: string
    category: string
    max_points: number
  }
}

export function SubmissionsTable({ submissions }: { submissions: Submission[] }) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [reviewData, setReviewData] = useState({
    status: "",
    pointsAwarded: "",
    adminRemarks: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const filteredSubmissions =
    statusFilter === "all" ? submissions : submissions.filter((s) => s.status === statusFilter)

  const handleReview = async () => {
    if (!selectedSubmission) return

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase
        .from("submissions")
        .update({
          status: reviewData.status,
          points_awarded: reviewData.status === "approved" ? Number.parseInt(reviewData.pointsAwarded) : null,
          admin_remarks: reviewData.adminRemarks || null,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedSubmission.id)

      if (error) throw error

      setSelectedSubmission(null)
      setReviewData({ status: "", pointsAwarded: "", adminRemarks: "" })
      router.refresh()
    } catch (error) {
      console.error("Error reviewing submission:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const openReviewDialog = (submission: Submission) => {
    setSelectedSubmission(submission)
    setReviewData({
      status: submission.status,
      pointsAwarded: submission.points_awarded?.toString() || "",
      adminRemarks: submission.admin_remarks || "",
    })
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>Filter by status:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">{filteredSubmissions.length} submissions</p>
          </div>

          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <div key={submission.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{submission.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {submission.student.full_name} ({submission.student.student_id}) • {submission.student.department}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {submission.achievements.name} • {submission.achievements.category} • Max{" "}
                      {submission.achievements.max_points} points
                    </p>
                  </div>
                  <Badge
                    variant={
                      submission.status === "approved"
                        ? "default"
                        : submission.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {submission.status}
                  </Badge>
                </div>

                <p className="text-sm mb-3">{submission.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Date: {format(new Date(submission.achievement_date), "PPP")}</span>
                    <span>Submitted: {format(new Date(submission.created_at), "PPP")}</span>
                    {submission.points_awarded && <span>Points: {submission.points_awarded}</span>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openReviewDialog(submission)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </div>
              </div>
            ))}

            {filteredSubmissions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No submissions found</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSubmission?.title}</DialogTitle>
            <DialogDescription>Review and approve or reject this submission</DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Student</Label>
                <p className="font-medium">
                  {selectedSubmission.student.full_name} ({selectedSubmission.student.student_id})
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">Achievement Type</Label>
                <p className="font-medium">
                  {selectedSubmission.achievements.name} • {selectedSubmission.achievements.category}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm">{selectedSubmission.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Achievement Date</Label>
                  <p className="text-sm">{format(new Date(selectedSubmission.achievement_date), "PPP")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted On</Label>
                  <p className="text-sm">{format(new Date(selectedSubmission.created_at), "PPP")}</p>
                </div>
              </div>

              {selectedSubmission.proof_file_name && (
                <div>
                  <Label className="text-muted-foreground">Proof Document</Label>
                  <p className="text-sm font-medium">{selectedSubmission.proof_file_name}</p>
                  {selectedSubmission.proof_url && (
                    <a
                      href={selectedSubmission.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary underline"
                    >
                      View Document
                    </a>
                  )}
                </div>
              )}

              <div className="border-t pt-4 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Decision</Label>
                  <Select
                    value={reviewData.status}
                    onValueChange={(value) => setReviewData({ ...reviewData, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select decision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Approve
                        </div>
                      </SelectItem>
                      <SelectItem value="rejected">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          Reject
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {reviewData.status === "approved" && (
                  <div className="grid gap-2">
                    <Label htmlFor="points">Points Awarded</Label>
                    <Input
                      id="points"
                      type="number"
                      min="0"
                      max={selectedSubmission.achievements.max_points}
                      placeholder={`Max ${selectedSubmission.achievements.max_points} points`}
                      value={reviewData.pointsAwarded}
                      onChange={(e) => setReviewData({ ...reviewData, pointsAwarded: e.target.value })}
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="remarks">Admin Remarks</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Add comments or feedback..."
                    rows={3}
                    value={reviewData.adminRemarks}
                    onChange={(e) => setReviewData({ ...reviewData, adminRemarks: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
              Cancel
            </Button>
            <Button onClick={handleReview} disabled={isLoading || !reviewData.status}>
              {isLoading ? "Saving..." : "Save Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
