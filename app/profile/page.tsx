"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useSession } from "next-auth/react"

// Type definitions (moved from local-db)
export type CandidateProfile = {
  summary?: string
  personal?: {
    fullName?: string
    email?: string
    mobile?: string
    location?: string
    totalExperience?: string
    noticePeriod?: string
  }
  skills?: string[]
  employment?: Array<{
    company: string
    designation: string
    from: string
    to?: string
    current?: boolean
    description?: string
  }>
  education?: Array<{ degree: string; institute: string; year: string }>
  projects?: Array<{ name: string; role: string; from: string; to?: string; description?: string }>
  certifications?: Array<{ name: string; authority: string; year: string }>
  resumeUrl?: string
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">{title}</h3>
      {action}
    </div>
  )
}

function Sidebar({ completion }: { completion: number }) {
  return (
    <aside className="hidden md:flex flex-col gap-3 pr-6 border-r">
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">Profile completeness</p>
        <div className="mt-2 h-2 w-full rounded bg-muted">
          <div className="h-2 rounded bg-primary" style={{ width: `${Math.min(100, Math.max(0, completion))}%` }} />
        </div>
        <p className="mt-2 text-sm font-medium">{Math.round(completion)}% complete</p>
      </div>
      <nav className="rounded-lg border bg-card p-4">
        <ul className="text-sm space-y-2">
          <li>
            <a href="#summary" className="hover:underline">
              Profile Summary
            </a>
          </li>
          <li>
            <a href="#personal" className="hover:underline">
              Personal Details
            </a>
          </li>
          <li>
            <a href="#skills" className="hover:underline">
              Key Skills
            </a>
          </li>
          <li>
            <a href="#employment" className="hover:underline">
              Employment
            </a>
          </li>
          <li>
            <a href="#education" className="hover:underline">
              Education
            </a>
          </li>
          <li>
            <a href="#projects" className="hover:underline">
              Projects
            </a>
          </li>
          <li>
            <a href="#certifications" className="hover:underline">
              Certifications
            </a>
          </li>
          <li>
            <a href="#resume" className="hover:underline">
              Resume
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession();
  const user = session?.user;
  console.log(user);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Local profile state (not persisted - add API routes to save to database)
  const [profile, setProfile] = useState<CandidateProfile>({})
  // Helper function to update profile (local state only - TODO: add API route)
  const updateProfile = (patch: Partial<CandidateProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...patch,
      personal: { ...(prev.personal || {}), ...(patch.personal || {}) }
    }))
    return profile
  }

  const completion = useMemo(() => {
    let c = 0
    if (profile.summary) c += 15
    if (profile.personal?.fullName && profile.personal?.email) c += 20
    if (profile.skills && profile.skills.length > 0) c += 15
    if (profile.employment && profile.employment.length > 0) c += 15
    if (profile.education && profile.education.length > 0) c += 10
    if (profile.projects && profile.projects.length > 0) c += 10
    if (profile.certifications && profile.certifications.length > 0) c += 10
    if (profile.resumeUrl) c += 5
    return Math.min(100, c)
  }, [profile])

  // if (!user) return null

  const noop = () => {}

  return (
    <main className="container mx-auto py-8 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
      <Sidebar completion={completion} />
      <section className="space-y-6">
        <Card id="summary">
          <CardHeader>
            <SectionHeader title="Profile Summary" />
          </CardHeader>
          <CardContent>
            <SummaryForm initialValue={profile.summary} onSaved={noop} updateProfile={updateProfile} />
          </CardContent>
        </Card>

        <Card id="personal">
          <CardHeader>
            <SectionHeader title="Personal Details" />
          </CardHeader>
          <CardContent>
            <PersonalForm initialValue={profile.personal} onSaved={noop} updateProfile={updateProfile} />
          </CardContent>
        </Card>

        <Card id="skills">
          <CardHeader>
            <SectionHeader title="Key Skills" />
          </CardHeader>
          <CardContent>
            <SkillsForm initialValue={profile.skills || []} onSaved={noop} updateProfile={updateProfile} />
          </CardContent>
        </Card>

        <Card id="employment">
          <CardHeader>
            <SectionHeader title="Employment" />
          </CardHeader>
          <CardContent>
            <EmploymentForm initialValue={profile.employment || []} onSaved={noop} updateProfile={updateProfile} />
          </CardContent>
        </Card>

        <Card id="education">
          <CardHeader>
            <SectionHeader title="Education" />
          </CardHeader>
          <CardContent>
            <EducationForm initialValue={profile.education || []} onSaved={noop} updateProfile={updateProfile} />
          </CardContent>
        </Card>

        <Card id="projects">
          <CardHeader>
            <SectionHeader title="Projects" />
          </CardHeader>
          <CardContent>
            <ProjectsForm initialValue={profile.projects || []} onSaved={noop} updateProfile={updateProfile} />
          </CardContent>
        </Card>

        <Card id="certifications">
          <CardHeader>
            <SectionHeader title="Certifications" />
          </CardHeader>
          <CardContent>
            <CertificationsForm initialValue={profile.certifications || []} onSaved={noop} updateProfile={updateProfile} />
          </CardContent>
        </Card>

        <Card id="resume">
          <CardHeader>
            <SectionHeader title="Resume" />
          </CardHeader>
          <CardContent>
            <ResumeForm initialValue={profile.resumeUrl} onSaved={noop} updateProfile={updateProfile} />
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function SummaryForm({ initialValue, onSaved, updateProfile }: { initialValue?: string; onSaved: any; updateProfile: any }) {
  const [summary, setSummary] = useState(initialValue || "")
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        updateProfile({ summary })
        onSaved?.()
      }}
    >
      <Label htmlFor="summary">Add a brief professional summary</Label>
      <Textarea
        id="summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        rows={4}
        placeholder="E.g., Frontend developer with 4+ years in React and TypeScript..."
      />
      <Button type="submit" className="w-fit">
        Save
      </Button>
    </form>
  )
}

function PersonalForm({
  initialValue,
  onSaved,
  updateProfile,
}: {
  initialValue?: CandidateProfile["personal"]
  onSaved: any
  updateProfile: any
}) {
  const [state, setState] = useState({
    fullName: initialValue?.fullName || "",
    email: initialValue?.email || "",
    mobile: initialValue?.mobile || "",
    location: initialValue?.location || "",
    totalExperience: initialValue?.totalExperience || "",
    noticePeriod: initialValue?.noticePeriod || "",
  })

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        updateProfile({ personal: state })
        onSaved?.()
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={state.fullName}
          onChange={(e) => setState({ ...state, fullName: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={state.email}
          onChange={(e) => setState({ ...state, email: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="mobile">Mobile</Label>
        <Input id="mobile" value={state.mobile} onChange={(e) => setState({ ...state, mobile: e.target.value })} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={state.location}
          onChange={(e) => setState({ ...state, location: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="totalExperience">Total Experience</Label>
        <Input
          id="totalExperience"
          value={state.totalExperience}
          onChange={(e) => setState({ ...state, totalExperience: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="noticePeriod">Notice Period</Label>
        <Input
          id="noticePeriod"
          value={state.noticePeriod}
          onChange={(e) => setState({ ...state, noticePeriod: e.target.value })}
        />
      </div>
      <div className="md:col-span-2">
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}

function SkillsForm({ initialValue, onSaved, updateProfile }: { initialValue: string[]; onSaved: any; updateProfile: any }) {
  const [skillsStr, setSkillsStr] = useState(initialValue.join(", "))
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        const skills = skillsStr
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        updateProfile({ skills })
        onSaved?.()
      }}
    >
      <Label htmlFor="skills">Add skills (comma separated)</Label>
      <Input
        id="skills"
        value={skillsStr}
        onChange={(e) => setSkillsStr(e.target.value)}
        placeholder="React, Next.js, TypeScript"
      />
      <Button type="submit" className="w-fit">
        Save
      </Button>
    </form>
  )
}

function EmploymentForm({
  initialValue,
  onSaved,
  updateProfile,
}: {
  initialValue: NonNullable<CandidateProfile["employment"]>
  onSaved: any
  updateProfile: any
}) {
  const [items, setItems] = useState(initialValue)
  const [draft, setDraft] = useState({
    company: "",
    designation: "",
    from: "",
    to: "",
    current: false,
    description: "",
  })
  return (
    <div className="space-y-4">
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          const next = [...items, { ...draft }]
          setItems(next)
          updateProfile({ employment: next })
          onSaved?.()
          setDraft({ company: "", designation: "", from: "", to: "", current: false, description: "" })
        }}
      >
        <div className="grid gap-2">
          <Label>Company</Label>
          <Input value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Designation</Label>
          <Input value={draft.designation} onChange={(e) => setDraft({ ...draft, designation: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>From</Label>
          <Input value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>To</Label>
          <Input value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} />
        </div>
        <div className="md:col-span-2 grid gap-2">
          <Label>Description</Label>
          <Textarea
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            rows={3}
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit">Add Employment</Button>
        </div>
      </form>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No employment added yet.</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="rounded-md border p-3">
              <div className="font-medium">
                {item.designation} at {item.company}
              </div>
              <div className="text-sm text-muted-foreground">
                {item.from} - {item.to || "Present"}
              </div>
              {item.description ? <p className="mt-2 text-sm">{item.description}</p> : null}
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const next = items.filter((_, i) => i !== idx)
                    setItems(next)
                    updateProfile({ employment: next })
                    onSaved?.()
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function EducationForm({
  initialValue,
  onSaved,
  updateProfile,
}: {
  initialValue: NonNullable<CandidateProfile["education"]>
  onSaved: any
  updateProfile: any
}) {
  const [items, setItems] = useState(initialValue)
  const [draft, setDraft] = useState({ degree: "", institute: "", year: "" })
  return (
    <div className="space-y-4">
      <form
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          const next = [...items, { ...draft }]
          setItems(next)
          updateProfile({ education: next })
          onSaved?.()
          setDraft({ degree: "", institute: "", year: "" })
        }}
      >
        <div className="grid gap-2">
          <Label>Degree</Label>
          <Input value={draft.degree} onChange={(e) => setDraft({ ...draft, degree: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Institute</Label>
          <Input value={draft.institute} onChange={(e) => setDraft({ ...draft, institute: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Year</Label>
          <Input value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })} />
        </div>
        <div className="md:col-span-3">
          <Button type="submit">Add Education</Button>
        </div>
      </form>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No education added yet.</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="rounded-md border p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{item.degree}</div>
                <div className="text-sm text-muted-foreground">
                  {item.institute} • {item.year}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const next = items.filter((_, i) => i !== idx)
                  setItems(next)
                  updateProfile({ education: next })
                  onSaved?.()
                }}
              >
                Remove
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function ProjectsForm({
  initialValue,
  onSaved,
  updateProfile,
}: {
  initialValue: NonNullable<CandidateProfile["projects"]>
  onSaved: any
  updateProfile: any
}) {
  const [items, setItems] = useState(initialValue)
  const [draft, setDraft] = useState({ name: "", role: "", from: "", to: "", description: "" })
  return (
    <div className="space-y-4">
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          const next = [...items, { ...draft }]
          setItems(next)
          updateProfile({ projects: next })
          onSaved?.()
          setDraft({ name: "", role: "", from: "", to: "", description: "" })
        }}
      >
        <div className="grid gap-2">
          <Label>Project Name</Label>
          <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Role</Label>
          <Input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>From</Label>
          <Input value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>To</Label>
          <Input value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} />
        </div>
        <div className="md:col-span-2 grid gap-2">
          <Label>Description</Label>
          <Textarea
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            rows={3}
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit">Add Project</Button>
        </div>
      </form>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects added yet.</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="rounded-md border p-3">
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-muted-foreground">
                {item.role} • {item.from} - {item.to || "Present"}
              </div>
              {item.description ? <p className="mt-2 text-sm">{item.description}</p> : null}
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const next = items.filter((_, i) => i !== idx)
                    setItems(next)
                    updateProfile({ projects: next })
                    onSaved?.()
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function CertificationsForm({
  initialValue,
  onSaved,
  updateProfile,
}: {
  initialValue: NonNullable<CandidateProfile["certifications"]>
  onSaved: any
  updateProfile: any
}) {
  const [items, setItems] = useState(initialValue)
  const [draft, setDraft] = useState({ name: "", authority: "", year: "" })
  return (
    <div className="space-y-4">
      <form
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          const next = [...items, { ...draft }]
          setItems(next)
          updateProfile({ certifications: next })
          onSaved?.()
          setDraft({ name: "", authority: "", year: "" })
        }}
      >
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Authority</Label>
          <Input value={draft.authority} onChange={(e) => setDraft({ ...draft, authority: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Year</Label>
          <Input value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })} />
        </div>
        <div className="md:col-span-3">
          <Button type="submit">Add Certification</Button>
        </div>
      </form>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No certifications added yet.</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="rounded-md border p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">
                  {item.authority} • {item.year}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const next = items.filter((_, i) => i !== idx)
                  setItems(next)
                  updateProfile({ certifications: next })
                  onSaved?.()
                }}
              >
                Remove
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function ResumeForm({ initialValue, onSaved, updateProfile }: { initialValue?: string; onSaved: any; updateProfile: any }) {
  const [resumeUrl, setResumeUrl] = useState(initialValue || "")
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        updateProfile({ resumeUrl })
        onSaved?.()
      }}
    >
      <Label htmlFor="resume">Resume URL</Label>
      <Input
        id="resume"
        placeholder="Paste a link to your resume (Google Drive, etc.)"
        value={resumeUrl}
        onChange={(e) => setResumeUrl(e.target.value)}
      />
      <Button type="submit" className="w-fit">
        Save
      </Button>
    </form>
  )
}
