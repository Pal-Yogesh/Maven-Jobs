"use client"

export function ApplicantList({ jobId }: { jobId: string }) {
  // TODO: Fetch applications from Prisma/API instead of local-db
  return (
    <div className="text-sm text-muted-foreground">
      No applicants yet. (TODO: Add Job and Application models to Prisma schema and create API routes)
    </div>
  )
}
