"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

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
}

export default function RecruiterPage() {
  const { data: session } = useSession()
  const user = session?.user
  const { toast } = useToast()
  
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [employmentType, setEmploymentType] = useState<string>("")
  const [workMode, setWorkMode] = useState<string>("")

  // Fetch jobs posted by this recruiter
  useEffect(() => {
    const fetchJobs = async () => {
      if (!session?.user) return
      
      setIsLoading(true)
      try {
        const response = await fetch('/api/jobs')
        if (response.ok) {
          const data = await response.json()
          // Filter jobs by current user
          const myJobs = data.jobs.filter((job: any) => job.postedBy === session.user.id)
          setJobs(myJobs)
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [session])

  // Handle job posting form submission
  const handleJobPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Store form reference before async operations
    const form = e.currentTarget
    
    // Validate select fields
    if (!employmentType) {
      toast({
        title: "Validation Error",
        description: "Please select an employment type",
        variant: "destructive",
      })
      return
    }
    
    if (!workMode) {
      toast({
        title: "Validation Error",
        description: "Please select a work mode",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)

    const formData = new FormData(form)
    
    const minExp = formData.get('minExp') as string
    const maxExp = formData.get('maxExp') as string
    const experience = minExp && maxExp ? `${minExp}-${maxExp} years` : 'Any'
    
    const minSalary = formData.get('minSalaryLPA') as string
    const maxSalary = formData.get('maxSalaryLPA') as string
    const salary = minSalary && maxSalary ? `${minSalary}-${maxSalary} LPA` : undefined

    const jobData = {
      title: formData.get('title') as string,
      company: formData.get('company') as string,
      location: formData.get('location') as string,
      type: `${employmentType} (${workMode})`,
      employmentType: employmentType,
      workMode: workMode,
      experience,
      salary,
      skills: formData.get('keySkills') as string,
      description: formData.get('description') as string,
    }

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Job posted successfully",
        })
        // Add new job to the list
        setJobs([result.job, ...jobs])
        // Reset form
        form.reset()
        setEmploymentType("")
        setWorkMode("")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to post job",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error posting job:', error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <Navbar />
      <section className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 space-y-10">
          <header className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold">Recruiter Dashboard</h1>
            <p className="text-muted-foreground">Post jobs and manage applicants.</p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Post a Job</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleJobPost}
                className="grid gap-6"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <Input name="title" placeholder="Job title" required />
                  <Input name="company" placeholder="Company" required />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Input name="department" placeholder="Department (e.g., Engineering)" />
                  <Input name="roleTitle" placeholder="Role title (e.g., Frontend Developer)" />
                  <Input name="industry" placeholder="Industry (e.g., IT Services)" />
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <Input name="location" placeholder="Location (e.g., Bengaluru)" required />
                  <Input name="vacancies" type="number" placeholder="Vacancies" min={1} />
                  <div className="space-y-1">
                    <Select value={employmentType} onValueChange={setEmploymentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Employment Type *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Select value={workMode} onValueChange={setWorkMode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Work Mode *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="On-site">On-site</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <Input name="minExp" type="number" placeholder="Min Exp (years)" min={0} />
                  <Input name="maxExp" type="number" placeholder="Max Exp (years)" min={0} />
                  <Input name="minSalaryLPA" type="number" placeholder="Min CTC (LPA)" min={0} step="0.5" />
                  <Input name="maxSalaryLPA" type="number" placeholder="Max CTC (LPA)" min={0} step="0.5" />
                </div>

                <Input name="education" placeholder="Education (e.g., B.Tech, MCA)" />
                <Input name="keySkills" placeholder="Key Skills (comma-separated, e.g., React, TypeScript, Redux)" required />

                <div className="grid md:grid-cols-2 gap-4">
                  <Input name="shift" placeholder="Shift (e.g., Day, Night)" />
                </div>

                <Textarea name="description" placeholder="Job description and responsibilities" rows={6} />

                <div className="flex justify-end">
                  <Button type="submit" className="min-w-28" disabled={isSubmitting}>
                    {isSubmitting ? "Posting..." : "Post Job"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Jobs</h2>
              {jobs.length > 0 && (
                <span className="text-sm text-muted-foreground">{jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} posted</span>
              )}
            </div>
            <div className="grid gap-3">
              {isLoading ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Loading jobs...
                  </CardContent>
                </Card>
              ) : jobs.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">No jobs posted yet</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Post your first job using the form above!
                  </CardContent>
                </Card>
              ) : (
                jobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {job.company} • {job.location}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                        >
                          {expandedJobId === job.id ? "Hide" : "View"} Details
                        </Button>
                      </div>
                    </CardHeader>
                    {expandedJobId === job.id && (
                      <CardContent className="space-y-4">
                        <Separator />
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          {job.employmentType && (
                            <div>
                              <span className="font-medium">Employment Type:</span> {job.employmentType}
                            </div>
                          )}
                          {job.workMode && (
                            <div>
                              <span className="font-medium">Work Mode:</span> {job.workMode}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Experience:</span> {job.experience}
                          </div>
                          {job.salary && (
                            <div>
                              <span className="font-medium">Salary:</span> {job.salary}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Posted:</span> {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Skills:</span> {job.skills}
                        </div>
                        {job.description && (
                          <div className="text-sm">
                            <span className="font-medium">Description:</span>
                            <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
