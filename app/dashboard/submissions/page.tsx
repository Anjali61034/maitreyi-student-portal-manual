"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { Trash2, X, ZoomIn, Loader2 } from "lucide-react"

export default function SubmissionsPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // State for submissions and loading
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // State for Image Popup
  const [imagePreview, setImagePreview] = useState<{ url: string; name: string } | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          // Redirect if not logged in
          router.push("/auth/login")
          return
        }

        const { data } = await supabase
          .from("submissions")
          .select("*, achievements(name, category, max_points)")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false })

        setSubmissions(data || [])
      } catch (error) {
        console.error("Error fetching submissions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [supabase, router])

  // 1. Delete Function
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission? This cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("submissions").delete().eq("id", id)
      if (error) throw error
      
      // Remove item from local state immediately for faster UI update
      setSubmissions(submissions.filter(s => s.id !== id))
    } catch (error) {
      console.error("Error deleting submission:", error)
      alert("Failed to delete submission.")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Submissions</h1>
        <p className="text-muted-foreground">View, track, and manage your achievement submissions</p>
      </div>

      {submissions && submissions.length > 0 ? (
        <div className="grid gap-4">
          {submissions.map((submission: any) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 pr-8">
                    <CardTitle>{submission.title}</CardTitle>
                    <CardDescription>
                      {submission.achievements?.name || submission.category} • {submission.achievements?.category || submission.category}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
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
                    
                    {/* DELETE BUTTON */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8" 
                      onClick={() => handleDelete(submission.id)}
                      title="Delete Submission"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-sm">{submission.description}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Achievement Date</p>
                    <p className="text-sm font-medium">{format(new Date(submission.achievement_date), "PPP")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted On</p>
                    <p className="text-sm font-medium">{format(new Date(submission.created_at), "PPP")}</p>
                  </div>
                  {submission.points_awarded && (
                    <div>
                      <p className="text-sm text-muted-foreground">Points Awarded</p>
                      <p className="text-sm font-medium">
                        {submission.points_awarded} / {submission.achievements?.max_points || 5}
                      </p>
                    </div>
                  )}
                </div>

                {submission.admin_remarks && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Admin Remarks</p>
                    <p className="text-sm bg-muted p-3 rounded-md">{submission.admin_remarks}</p>
                  </div>
                )}

                {submission.proof_file_name && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Proof Document</p>
                    {/* CLICKABLE LINK FOR IMAGE POPUP */}
                    {submission.proof_url ? (
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-primary"
                        onClick={() => setImagePreview({ url: submission.proof_url, name: submission.proof_file_name })}
                      >
                        <ZoomIn className="h-4 w-4 mr-1" />
                        View {submission.proof_file_name}
                      </Button>
                    ) : (
                      <p className="text-sm font-medium">{submission.proof_file_name}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No submissions yet</p>
            <p className="text-sm text-muted-foreground mt-2">Start by submitting your achievements!</p>
          </CardContent>
        </Card>
      )}

            {/* IMAGE POPUP DIALOG */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-5xl w-full p-0 overflow-hidden bg-black/90 border-none">
          {/* ADD THIS LINE HERE TO FIX THE WARNING */}
          <DialogTitle className="sr-only">Image Preview</DialogTitle>

          {/* Close Button at Top Right */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={() => setImagePreview(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center justify-center min-h-[60vh]">
            {imagePreview && (
              <img 
                src={imagePreview.url} 
                alt={imagePreview.name} 
                className="max-w-full max-h-[85vh] object-contain"
              />
            )}
          </div>
          
          <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm">
            {imagePreview?.name}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}