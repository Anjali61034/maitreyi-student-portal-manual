import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, BarChart3, FileCheck, Shield, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is authenticated, redirect to appropriate dashboard
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role === "admin") {
      redirect("/admin")
    } else if (profile?.role === "student") {
      redirect("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Student Merit Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
            Track Your Academic Excellence
          </h1>
          <p className="mt-6 text-lg text-muted-foreground text-balance">
            A comprehensive platform for students to showcase their achievements and for administrators to evaluate
            merit rankings based on academic, sports, cultural, and technical accomplishments.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/40 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything You Need</h2>
            <p className="mt-4 text-muted-foreground">Powerful features for both students and administrators</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <FileCheck className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Submit Achievements</CardTitle>
                <CardDescription>
                  Easily submit your academic, sports, cultural, and technical achievements with proof documents
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Track Progress</CardTitle>
                <CardDescription>
                  Monitor your submissions, view approval status, and track your accumulated merit points
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Merit Rankings</CardTitle>
                <CardDescription>
                  View your merit ranking and percentile among peers based on approved achievements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Admin Review</CardTitle>
                <CardDescription>
                  Administrators can review submissions, approve or reject with feedback, and award points
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Student Management</CardTitle>
                <CardDescription>
                  Comprehensive view of all students, their submissions, and achievement statistics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Automated Evaluation</CardTitle>
                <CardDescription>
                  Generate merit rankings automatically with calculated ranks and percentiles
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Achievement Categories Section */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Achievement Categories</h2>
          <p className="mt-4 text-muted-foreground">
            Submit achievements across multiple categories to build your merit profile
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Academic Excellence",
              description: "First class grades, research publications, academic awards",
            },
            {
              title: "Sports & Athletics",
              description: "University, state, and national level sports achievements",
            },
            {
              title: "Cultural Activities",
              description: "Participation and wins in cultural events and competitions",
            },
            {
              title: "Technical Skills",
              description: "Hackathons, certifications, technical project achievements",
            },
            {
              title: "Social Service",
              description: "NSS, NCC, community service, and volunteer activities",
            },
            {
              title: "Leadership",
              description: "Student organization positions and leadership roles",
            },
          ].map((category) => (
            <Card key={category.title}>
              <CardHeader>
                <CardTitle className="text-lg">{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary text-primary-foreground py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to Get Started?</h2>
            <p className="mt-4 text-lg opacity-90">
              Join the Student Merit Portal today and start tracking your achievements
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg" variant="secondary">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Student Merit Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
