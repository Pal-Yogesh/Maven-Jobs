"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { AuthCard } from "@/components/auth/auth-card"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user

  return (
    <main className="min-h-dvh flex flex-col">
      <Navbar />
      <section className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10 flex flex-col gap-8">
          <header className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-semibold text-balance">
              Find the right job or the right candidate
            </h1>
            <p className="text-muted-foreground text-pretty">
              A minimal recruitment flow demo inspired by leading job platforms.
            </p>
          </header>

          {user ? (
            <Card className="mx-auto w-full max-w-2xl">
              <CardHeader>
                <CardTitle>Welcome back, {user.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  You are signed in.
                </div>
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href="/candidate">Go to Jobs</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/recruiter">Go to Recruiter</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Sign in to get started</p>
              <div className="flex gap-2 justify-center">
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick setup</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Create a candidate or recruiter account instantly. No passwords in this demo.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Apply in one click</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Candidates can apply, and recruiters manage statuses: applied, shortlisted, rejected.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Clean, modern UI</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Built with Next.js, shadcn/ui, Tailwind tokens, and accessible, responsive layouts.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
