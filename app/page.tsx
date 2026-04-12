import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, BarChart3, FileCheck, Shield, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import Image from "next/image"
 
export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

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
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container flex h-20 sm:h-16 items-center justify-between px-4">
          
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Logo"
              width={46}
              height={46}
              className="object-contain sm:w-[48px] sm:h-[48px] md:w-[54px] md:h-[54px]"
            />
            <span className="text-[13px] sm:text-xs md:text-lg font-semibold leading-tight">
              AchieveX - Maitreyi <br className="block sm:hidden" />
              <br className="block sm:hidden" />
              
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="h-8 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm">
                Login
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="h-8 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm">
                Sign Up
              </Button> 
            </Link>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
           <h1 className="text-2xl sm:text-5xl md:text-4xl font-bold tracking-tight text-balance">
            Application Portal for IQAC  <br className="block sm:hidden" /> Meritorious Student Award
          </h1>
          <br><br>
          <h2 className="text-2xl sm:text-5xl md:text-2xl  tracking-tight text-balance">
            Track Your Academic Excellence
          </h2>

          <p className="mt-6 text-sm sm:text-lg text-muted-foreground text-balance">
           A comprehensive platform for students to collate and showcase their achievements each year and win the Meritorious Student Award. This is also a space for teachers to track and evaluate overall student performance and growth
          </p>

          <div className="mt-6 sm:mt-10 flex items-center justify-center gap-2 sm:gap-4">
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
      <section className="border-t bg-muted/40 py-12 sm:py-20">
        {/* ✅ ONLY CHANGE HERE */}
        <div className="container px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-16">
            
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need
            </h2>

            <p className="mt-4 text-sm sm:text-base text-muted-foreground">
              Powerful features for both students and Teachers
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            <Card>
              <CardHeader>
                <FileCheck className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-base sm:text-lg">Submit Achievements</CardTitle>
                <CardDescription className="text-sm">
                  Easily submit your academic, sports, cultural, and technical achievements with proof documents
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-base sm:text-lg">Track Progress</CardTitle>
                <CardDescription className="text-sm">
                  Monitor your submissions, view approval status, and track your accumulated merit points
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-base sm:text-lg">Merit Rankings</CardTitle>
                <CardDescription className="text-sm">
                  View your merit ranking and percentile among peers based on approved achievements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-base sm:text-lg">Admin Review</CardTitle>
                <CardDescription className="text-sm">
                  Administrators can review submissions, approve or reject with feedback, and award points
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-base sm:text-lg">Student Management</CardTitle>
                <CardDescription className="text-sm">
                  Comprehensive view of all students, their submissions, and achievement statistics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-base sm:text-lg">Automated Evaluation</CardTitle>
                <CardDescription className="text-sm">
                  Generate merit rankings automatically with calculated ranks and percentiles
                </CardDescription>
              </CardHeader>
            </Card>

          </div>
        </div>
      </section>

      {/* Achievement Categories Section */}
      <section className="container py-20">
        {/* ✅ ONLY CHANGE HERE */}
        <div className="container px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight sm:text-4xl">
              Achievement Categories
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">
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
                  <CardTitle className="text-base sm:text-lg">{category.title}</CardTitle>
                  <CardDescription className="text-sm">{category.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary text-primary-foreground py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-sm sm:text-lg opacity-90">
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
        <div className="container text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; 2025 Student Merit Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
