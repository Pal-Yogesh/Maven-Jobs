"use client"

import { useSession } from "next-auth/react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CandidatePage() {
  const { data: session } = useSession()
  const user = session?.user
  // TODO: Fetch jobs from Prisma/API instead of local-db
  const jobs: any[] = []

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
          <header className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold">Browse Jobs</h1>
            <p className="text-muted-foreground">Apply to jobs with a single click.</p>
          </header>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">No jobs found</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Jobs posted by recruiters will appear here. (TODO: Add Job model to Prisma schema and create API routes)
              </CardContent>
            </Card>
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
