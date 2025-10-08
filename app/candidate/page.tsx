"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, MapPin, Briefcase, Clock } from "lucide-react"

interface Job {
  id: string
  title: string
  description?: string
  company: string
  location: string
  salary?: string
  type: string
  employmentType?: string
  workMode?: string
  experience: string
  skills: string
  createdAt: string
  user?: {
    name: string
    email: string
  }
}

export default function CandidatePage() {
  const { data: session } = useSession()
  const user = session?.user
  
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)

  // Fetch all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (searchQuery) params.append('search', searchQuery)
        if (locationFilter) params.append('location', locationFilter)
        
        const response = await fetch(`/api/jobs?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setJobs(data.jobs || [])
        } else {
          console.error('Failed to fetch jobs')
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [searchQuery, locationFilter])

  const handleSearch = () => {
    // Trigger re-fetch by updating state (already handled by useEffect dependencies)
  }

  // const onApply = async (jobId: string) => {
  //   if (!user) return
  //   await applyToJob(jobId, user.id)
  //   // Update related SWR caches
  //   mutate("jobs")
  //   mutate(`applications:candidate:${user.id}`)
  //   mutate(`applications:job:${jobId}`)
  // }

  return (
    <main className="min-h-dvh flex flex-col">
      <Navbar />
      <section className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
          <header className="space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold">Browse Jobs</h1>
              <p className="text-muted-foreground">Find your next opportunity</p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search jobs by title, company, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="sm:w-64 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </header>

          {/* Jobs List */}
          <div className="space-y-3">
            {isLoading ? (
              // Loading skeletons
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3 mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : jobs.length === 0 ? (
              // Empty state
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">No jobs found</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {searchQuery || locationFilter
                    ? "Try adjusting your search filters"
                    : "No jobs have been posted yet. Check back later!"}
                </CardContent>
              </Card>
            ) : (
              // Jobs list
              jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-medium">{job.company}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                        </CardDescription>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {job.employmentType && (
                            <Badge variant="secondary">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {job.employmentType}
                            </Badge>
                          )}
                          {job.workMode && (
                            <Badge variant="outline">{job.workMode}</Badge>
                          )}
                          {job.salary && (
                            <Badge variant="outline">₹ {job.salary}</Badge>
                          )}
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {job.experience}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant={expandedJobId === job.id ? "outline" : "default"}
                        size="sm"
                        onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                      >
                        {expandedJobId === job.id ? "Hide" : "View"} Details
                      </Button>
                    </div>
                  </CardHeader>
                  
                  {expandedJobId === job.id && (
                    <CardContent className="space-y-4 border-t pt-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.split(',').map((skill, idx) => (
                            <Badge key={idx} variant="secondary">
                              {skill.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {job.description && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Job Description</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {job.description}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4">
                        <p className="text-xs text-muted-foreground">
                          Posted {new Date(job.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <Button>Apply Now</Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>

          {user && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Your application statuses</h2>
              <p className="text-sm text-muted-foreground">
                You&apos;ll see status badges on jobs you&apos;ve applied to.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline">applied</Badge>
                <Badge className="bg-primary text-primary-foreground">shortlisted</Badge>
                <Badge variant="destructive">rejected</Badge>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  )
}
