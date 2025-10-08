"use client"

import Image from "next/image"
import Link from "next/link"
import { RecruiterRegisterForm } from "@/components/auth/recruiter-register-form"

export default function RegisterPage() {
  return (
    <main className="min-h-dvh flex flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-6xl h-14 px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/placeholder-logo.svg" alt="Logo" width={24} height={24} />
            <span className="font-semibold">HireBoard</span>
          </Link>
          <nav className="text-sm">
            Already have an account?{" "}
            <Link href="/recruiter/login" className="text-primary underline underline-offset-4">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <section className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <RecruiterRegisterForm />
          </div>
          <aside className="order-1 md:order-2">
            <div className="rounded-lg border p-6 h-full">
              <h2 className="text-xl font-semibold mb-2">Why create your profile?</h2>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                <li>Discover jobs matching your skills</li>
                <li>Let recruiters find your profile</li>
                <li>Stay informed with job alerts</li>
                <li>Easy apply with your resume</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
