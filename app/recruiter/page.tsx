"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RecruiterPage() {
  const { data: session } = useSession()
  const user = session?.user
  // TODO: Fetch jobs from Prisma/API instead of local-db
  const jobs: any[] = []
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)

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
                onSubmit={(e) => {
                  e.preventDefault()
                  alert("TODO: Add Job model to Prisma schema and create API route for job creation")
                }}
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
                  <Input name="location" placeholder="Location (e.g., Bengaluru)" />
                  <Input name="vacancies" type="number" placeholder="Vacancies" min={1} />
                  <Select name="employmentType">
                    <SelectTrigger>
                      <SelectValue placeholder="Employment Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select name="workMode">
                    <SelectTrigger>
                      <SelectValue placeholder="Work Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on-site">On-site</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <Input name="minExp" type="number" placeholder="Min Exp (years)" min={0} />
                  <Input name="maxExp" type="number" placeholder="Max Exp (years)" min={0} />
                  <Input name="minSalaryLPA" type="number" placeholder="Min CTC (LPA)" min={0} step="0.5" />
                  <Input name="maxSalaryLPA" type="number" placeholder="Max CTC (LPA)" min={0} step="0.5" />
                </div>

                <Input name="education" placeholder="Education (e.g., B.Tech, MCA)" />
                <Input name="keySkills" placeholder="Key Skills (comma-separated, e.g., React, TypeScript, Redux)" />

                <div className="grid md:grid-cols-2 gap-4">
                  <Input name="shift" placeholder="Shift (e.g., Day, Night)" />
                </div>

                <Textarea name="description" placeholder="Job description and responsibilities" rows={6} />

                <div className="flex justify-end">
                  <Button type="submit" className="min-w-28">
                    Post Job
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Jobs</h2>
            </div>
            <div className="grid gap-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">No jobs posted yet</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  TODO: Add Job and Application models to Prisma schema and create API routes.
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
