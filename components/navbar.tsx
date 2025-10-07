"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user

  const onSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <header className="border-b bg-card">
      <nav className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold">
            HireBoard
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <Link className="text-muted-foreground hover:text-foreground" href="/candidate">
              Jobs
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/recruiter">
              Recruiter
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="https://resume-parser-steel.vercel.app/resume-parser">
              Resume Parser
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/profile" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground">
                Profile
              </Link>
              <Button size="sm" variant="ghost" onClick={onSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href="/register">Register</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/login">Login</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
