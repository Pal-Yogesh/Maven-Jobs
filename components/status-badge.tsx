"use client"

import { Badge } from "@/components/ui/badge"

export function StatusBadge({ status }: { status: "applied" | "shortlisted" | "rejected" }) {
  if (status === "shortlisted") {
    return <Badge className="bg-primary text-primary-foreground">shortlisted</Badge>
  }
  if (status === "rejected") {
    return <Badge variant="destructive">rejected</Badge>
  }
  return <Badge variant="outline">applied</Badge>
}
