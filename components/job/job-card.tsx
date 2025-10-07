"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import Link from "next/link"

type Job = {
  id: string
  title: string
  company: string
  location?: string
  description?: string
  createdAt: number
  createdByUserId: string
}

export function JobCard({
  job,
  isApplied,
  status,
}: {
  job: Job
  isApplied?: boolean
  status?: "applied" | "shortlisted" | "rejected"
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {job.title} · {job.company}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">{job.location ? job.location : "Location N/A"}</div>
        {job.description && <p className="text-sm text-pretty">{job.description}</p>}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">Posted {new Date(job.createdAt).toLocaleDateString()}</div>
          {isApplied ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status</span>
              <StatusBadge status={status || "applied"} />
            </div>
          ) : (
            // Use a link to the apply page for a full application form
            <Button asChild className="min-w-28">
              <Link href={`/apply/${job.id}`}>Apply</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
