"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export function AuthCard() {
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const router = useRouter()

  const canSubmit = useMemo(() => name.trim() && email.trim(), [name, email])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    // This component is deprecated - redirect to register
    router.push("/register")
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Choose a role and continue. This demo skips password auth.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <RadioGroup
              value={role}
              onValueChange={(v) => setRole(v as "candidate" | "recruiter")}
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center gap-2 border rounded-md p-3">
                <RadioGroupItem id="role-candidate" value="candidate" />
                <Label htmlFor="role-candidate" className="cursor-pointer">
                  Candidate
                </Label>
              </div>
              <div className="flex items-center gap-2 border rounded-md p-3">
                <RadioGroupItem id="role-recruiter" value="recruiter" />
                <Label htmlFor="role-recruiter" className="cursor-pointer">
                  Recruiter
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={!canSubmit} className="min-w-28">
              Continue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
