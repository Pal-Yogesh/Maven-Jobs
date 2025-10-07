"use client"

import { useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ApplyJobPage() {
  const router = useRouter()
  const params = useParams<{ jobId: string }>()
  const jobId = params?.jobId as string

  const { data: session } = useSession()
  const user = session?.user
  // TODO: Fetch job and application from Prisma/API
  const job: any = null
  const existingApp: any = null

  const disabled = true // Disabled until Job/Application models are added

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    alert("TODO: Add Job and Application models to Prisma schema and create API routes")
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <Navbar />
      <section className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
          <header className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-semibold">Apply to Job</h1>
            <p className="text-muted-foreground">Fill your details similar to Naukri’s application form.</p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{job ? `${job.title} · ${job.company}` : "Job"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {existingApp && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">You have already applied</span>
                  <Badge className="bg-primary text-primary-foreground">{existingApp.status}</Badge>
                </div>
              )}

              <form action={onSubmit} className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input name="resumeName" placeholder="Resume file name (demo)" />
                  <Input name="currentCompany" placeholder="Current company" />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Input name="totalExperienceYears" type="number" placeholder="Total experience (years)" min={0} />
                  <Input name="currentCtcLpa" type="number" placeholder="Current CTC (LPA)" min={0} step="0.5" />
                  <Input name="expectedCtcLpa" type="number" placeholder="Expected CTC (LPA)" min={0} step="0.5" />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Input name="noticePeriodDays" type="number" placeholder="Notice period (days)" min={0} />
                  <Input name="locationPreference" placeholder="Preferred location" />
                  <Input name="skills" placeholder="Skills (comma-separated, e.g., React, JavaScript)" />
                </div>

                <Textarea name="coverLetter" rows={6} placeholder="Cover letter / Application summary (optional)" />

                <div className="flex justify-end">
                  <Button type="submit" className="min-w-28" disabled={disabled}>
                    {existingApp ? "Update Application" : "Submit Application"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
