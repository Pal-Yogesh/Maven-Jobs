"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GoogleButton } from "@/components/auth/google-button"
import axios from "axios"

export function RecruiterRegisterForm() {
    const pathname = usePathname();
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [company, setCompany] = useState("")

  const router = useRouter()
  const canSubmit = useMemo(
    () => name.trim() && email.trim() && password.trim(),
    [name, email, password]
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log("onSubmit", name, email, password, canSubmit)
    if (!canSubmit) return
    const response = await axios.post("/api/recruiter-sign-up", {
      name: name.trim(),
      email: email.trim(),
      password,
    })
    console.log("response", response)
    const userID = response.data.userID
    router.push(`/recruiter/verify/${userID}`)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recruiter Registration</CardTitle>
        <CardDescription>Create your recruiter account</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email ID</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Create password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">Company (optional)</Label>
            <Input
              id="company"
              placeholder="Your company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={!canSubmit} className="w-full">
            Register as Recruiter
          </Button>

          <div className="text-center text-xs text-muted-foreground">or</div>
          <GoogleButton
            onClick={async () => {
              await signIn("google", { callbackUrl: "/recruiter" });
            }}
          />

          <p className="text-xs text-muted-foreground text-center">
            Already registered?{" "}
            <Link 
            href={pathname === "/recruiter/register" ? "/recruiter/login" : "/recruiter/login"}
            className="text-primary underline underline-offset-4">
              Login here
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
