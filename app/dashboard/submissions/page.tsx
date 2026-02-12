"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { Trash2, X, ZoomIn, Loader2, ArrowLeft, Trophy, Clock } from "lucide-react"

// Max points per category constant
const MAX_POINTS_PER_CATEGORY = 5

export default function SubmissionsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [imagePreview, setImagePreview] = useState<{ url: string; name: string } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        // UPDATED: Fixed relation syntax to !student
        const { data } = await supabase
          .from("submissions")
          .select("*, student:profiles!student_id(full_name, student_id, course_name)")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false })

        // DEBUG LOG: Check how many items are fetched
        console.log("Submissions fetched count:", data?.length || 0)
        console.log("Submissions data:", data)

        setSubmissions(data || [])
      } catch (error) {
        console.error("Error fetching submissions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [supabase, router])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission? This cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("submissions").delete().eq("id", id)
      if (error) throw error
      
      setSubmissions(submissions.filter(s => s.id !== id))
    } catch (error) {
      console.error("Error deleting submission:", error)
      alert("Failed to delete submission.")
    }
  }

  // UPDATED LOGIC: Calculate stats based on ALL submissions (including Pending)
  const categoryStats = submissions.reduce((acc: any, sub: any) => {
    const cat = sub.category || "Uncategorized"
    if (!acc[cat]) {
      acc[cat] = { total: 0, count: 0 }
    }
    
    // Count ALL submissions (including pending)
    acc[cat].count += 1
    
    // Only sum points for approved submissions
    if (sub.status === "approved") {
      acc[cat].total += (sub.points_awarded || 0)
    }
    return acc
  }, {})

  const categoryList = Object.keys(categoryStats)
  // Filter submissions for detailed view
  const displaySubmissions = selectedCategory 
    ? submissions.filter(s => s.category === selectedCategory)
    : []

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
        <p className="text-muted-foreground">
          {selectedCategory 
             ? `Viewing achievements for: ${selectedCategory}` 
             : "Overview of your progress by category"}
        </p>
      </div>

      {/* --- VIEW 1: CATEGORY OVERVIEW --- */}
      {!selectedCategory && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categoryList.length === 0 && (
            // Changed message to be clearer
            <div className="col-span-full p-12 text-center text-muted-foreground border rounded-lg bg-slate-50">
              No records found in database. 
              If you recently submitted something, please try refreshing the page.
            </div>
          )}

          {categoryList.map((category) => {
            const points = categoryStats[category].total
            const count = categoryStats[category].count
            const progress = (points / MAX_POINTS_PER_CATEGORY) * 100
            const allPending = points === 0 && count > 0
            
            return (
              <Card 
                key={category} 
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 border-t-4 border-t-transparent group"
                onClick={() => setSelectedCategory(category)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{category}</CardTitle>
                    <CardDescription>
                      {count} item{count !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  {/* Show Clock if Pending, Trophy if has points */}
                  {allPending ? (
                     <Clock className="h-5 w-5 text-yellow-600" />
                  ) : (
                     <Trophy className="h-5 w-5 text-amber-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{points} pts</span>
                      <span className="text-sm text-muted-foreground">/ {MAX_POINTS_PER_CATEGORY}</span>
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ease-out ${
                           allPending ? 'bg-yellow-400' : 'bg-primary'
                        }`} 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    {/* Status Badge */}
                    {allPending ? (
                       <div className="text-center mt-2">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
                       </div>
                    ) : (
                       <div className="text-center mt-2">
                          <p className="text-xs text-muted-foreground">{MAX_POINTS_PER_CATEGORY - points} points remaining</p>
                       </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* --- VIEW 2: DETAILED LIST --- */}
      {selectedCategory && (
        <div className="space-y-6">
          <Button 
            variant="outline" 
            className="mb-4" 
            onClick={() => setSelectedCategory(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>

          <div className="grid gap-4 md:grid-cols-2">
            {displaySubmissions.map((submission) => (
              <Card key={submission.id} className="relative group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 pr-8">
                      <CardTitle>{submission.title}</CardTitle>
                      <CardDescription>
                        {format(new Date(submission.achievement_date), "PPP")}
                      </CardDescription>
                    </div>
                    
                    {/* Delete Button */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 absolute top-2 right-0" 
                      onClick={() => handleDelete(submission.id)}
                      title="Delete Submission"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">

                  {/* ADDED: Achievement Level and Rank (Using correct DB columns) */}
<div className="grid grid-cols-2 gap-4">
  <div>
    <p className="text-sm text-muted-foreground">Achievement Level</p>
    <p className="font-medium capitalize">{submission.activity_type?.replace(/_/g, ' ') || 'N/A'}</p>
  </div>
</div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-sm">{submission.description}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Points Awarded</p>
                      <p className="text-lg font-bold text-primary">
                        {submission.points_awarded} / {MAX_POINTS_PER_CATEGORY}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge 
                        variant={submission.status === 'approved' ? 'default' : 'secondary'}
                        className="w-fit"
                      >
                        {submission.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Proof Link with Image Preview Logic */}
                  {submission.proof_url && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Proof Document</p>
                      
                      {/* Link that opens Dialog for Images, or New Tab for PDFs */}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-primary"
                        onClick={() => {
                           // If it's an image, open dialog. If PDF, open new tab.
                           if (submission.proof_url.match(/\.(jpeg|jpg|gif|png)$/i)) {
                             setImagePreview({ url: submission.proof_url, name: submission.proof_file_name })
                           } else {
                             window.open(submission.proof_url, '_blank')
                           }
                        }}
                      >
                        <ZoomIn className="h-4 w-4 mr-1" />
                        View {submission.proof_file_name}
                      </Button>
                    </div>
                  )}

                  {submission.admin_remarks && (
                    <div className="rounded-md bg-slate-50 p-3 border border-slate-200">
                      <p className="text-sm text-muted-foreground">Admin Remarks:</p>
                      <p className="text-sm mt-1">{submission.admin_remarks}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {displaySubmissions.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">No submissions found in this category.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* --- IMAGE POPUP DIALOG (Same as before) --- */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-5xl w-full p-0 overflow-hidden bg-black/90 border-none">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>

          {/* Close Button */}
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
                className="max-h-[85vh] max-w-full object-contain"
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