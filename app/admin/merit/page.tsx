"use client"

import React, { useState, useEffect } from "react"
import { MeritEvaluationForm } from "@/components/merit-evaluation-form"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminMeritPage() {
  const supabase = createClient()
  
  // State for Filters
  const [streamFilter, setStreamFilter] = useState<string>("all")
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [courseFilter, setCourseFilter] = useState<string>("all")
  
  // State for available options
  const [availableYears, setAvailableYears] = useState<string[]>(["1", "2", "3", "4"])
  const [availableCourses, setAvailableCourses] = useState<string[]>([])
  
  // State for Recent Evaluations
  const [recentEvaluations, setRecentEvaluations] = useState<any[]>([])

  // Fetch Data on Mount
  useEffect(() => {
    fetchCourses()
    fetchRecentEvaluations()
  }, [])

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("course_name")
      .eq("role", "student")
    
    const courses = Array.from(new Set(data?.map(d => d.course_name).filter(Boolean))).sort()
    setAvailableCourses(courses)
  }

  const fetchRecentEvaluations = async () => {
    const { data: latestDateData } = await supabase
      .from("merit_evaluations")
      .select("evaluation_date")
      .order("evaluation_date", { ascending: false })
      .limit(1)
      .single()

    if (latestDateData?.evaluation_date) {
      const { data } = await supabase
        .from("merit_evaluations")
        .select("*, profiles(full_name, student_id)")
        .eq("evaluation_date", latestDateData.evaluation_date)
        .order("rank", { ascending: true }) 
      
      setRecentEvaluations(data || [])
    } else {
      setRecentEvaluations([])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Merit Evaluation</h1>
        <p className="text-muted-foreground mb-6">Generate merit rankings for students</p>
        
        <div className="flex flex-wrap items-end gap-4 bg-slate-50 p-4 rounded-lg border">
          
          {/* 1. Stream Filter (UPDATED: Separated Humanities and Commerce) */}
          <div className="w-full md:w-64">
            <label className="text-sm font-medium mb-1 block">Stream</label>
            <Select value={streamFilter} onValueChange={setStreamFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Stream" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Streams</SelectItem>
                <SelectItem value="humanities">Humanities</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
                <SelectItem value="science">Science</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 2. Year Filter */}
          <div className="w-full md:w-48">
            <label className="text-sm font-medium mb-1 block">Year of Study</label>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    Year {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Course Filter */}
          <div className="w-full md:w-64">
            <label className="text-sm font-medium mb-1 block">Course</label>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {availableCourses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>

      <MeritEvaluationForm 
        streamFilter={streamFilter}
        yearFilter={yearFilter}
        courseFilter={courseFilter}
        onEvaluationGenerated={fetchRecentEvaluations} 
      />

      <Card>
        <CardHeader>
          <CardTitle>Latest Generated List</CardTitle>
          <CardDescription>Showing the most recent merit evaluation batch</CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvaluations && recentEvaluations.length > 0 ? (
            <div className="space-y-3">
              {recentEvaluations.map((evaluation: any) => (
                <div key={evaluation.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{evaluation.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {evaluation.profiles?.student_id} • {evaluation.academic_year}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Rank #{evaluation.rank}</p>
                    <p className="text-sm text-muted-foreground">{evaluation.total_points} points</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No evaluations generated yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}