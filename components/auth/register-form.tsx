"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GoogleButton } from "@/components/auth/google-button"
import axios from "axios"

export function RegisterForm() {
    const pathname = usePathname();
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mobile, setMobile] = useState("")
  const [workStatus, setWorkStatus] = useState<"experienced" | "fresher">("experienced")
  const [experienceYears, setExperienceYears] = useState<number>(2)
  const [resumeName, setResumeName] = useState<string | undefined>(undefined)

  const router = useRouter()
  const canSubmit = useMemo(
    () => name.trim() && email.trim() && password.trim() && (workStatus === "fresher" || experienceYears >= 0),
    [name, email, password, workStatus, experienceYears],
  )

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    setResumeName(f ? f.name : undefined)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log("onSubmit", name, email, password, canSubmit)
    if (!canSubmit) return
    const response = await axios.post("/api/sign-up", {
      name: name.trim(),
      email: email.trim(),
      password,
    })
    console.log("response", response)
    const userID = response.data.userID
    router.push(`/verify/${userID}`)
    // registerCandidate({
    //   name: name.trim(),
    //   email: email.trim(),
    //   password,
    //   mobile: mobile.trim() || undefined,
    //   workStatus,
    //   experienceYears: workStatus === "experienced" ? experienceYears : undefined,
    //   resumeName,
    // })
    // mutate("currentUser")
    // router.push("/candidate")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create your job seeker account</CardDescription>
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
          {/* <div className="grid gap-2">
            <Label htmlFor="mobile">Mobile number</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="10-digit mobile (optional)"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              autoComplete="tel"
            />
          </div>

          <div className="grid gap-2">
            <Label>Work status</Label>
            <RadioGroup
              value={workStatus}
              onValueChange={(v) => setWorkStatus(v as "experienced" | "fresher")}
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center gap-2 border rounded-md p-3">
                <RadioGroupItem id="ws-exp" value="experienced" />
                <Label htmlFor="ws-exp" className="cursor-pointer">
                  Experienced
                </Label>
              </div>
              <div className="flex items-center gap-2 border rounded-md p-3">
                <RadioGroupItem id="ws-fresher" value="fresher" />
                <Label htmlFor="ws-fresher" className="cursor-pointer">
                  Fresher
                </Label>
              </div>
            </RadioGroup>
          </div>

          {workStatus === "experienced" && (
            <div className="grid gap-2">
              <Label htmlFor="exp">Total experience (years)</Label>
              <Input
                id="exp"
                type="number"
                min={0}
                max={50}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="resume">Upload resume (optional)</Label>
            <Input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={onFileChange} />
            {resumeName ? <p className="text-xs text-muted-foreground">Selected: {resumeName}</p> : null}
          </div> */}

          <Button type="submit" disabled={!canSubmit} className="w-full">
            Register
          </Button>

          <div className="text-center text-xs text-muted-foreground">or</div>
          <GoogleButton
            onClick={async () => {
              await signIn("google", { callbackUrl: "/candidate" });
            }}
          />

          <p className="text-xs text-muted-foreground text-center">
            Already registered?{" "}
            <Link 
            href={pathname === "/register" ? "/login" : "/recruiter/login"}
            className="text-primary underline underline-offset-4">
              Login here
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
