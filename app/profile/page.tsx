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
import axios from "axios"
import { Navbar } from "@/components/navbar"
import toast from "react-hot-toast"
import { useToast } from "@/hooks/use-toast"

// Type definitions
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
  education?: Array<{
    degree: string
    institute: string
    from?: string
    to?: string
    current?: boolean
    description?: string
  }>
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
    <aside className="hidden md:flex lg:sticky top-10 self-start flex-col gap-3 pr-6 border-r">
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
  const { data: session, status } = useSession()
  const user = session?.user
  const { toast } = useToast()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const [profile, setProfile] = useState<CandidateProfile>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Helper function to update profile
  const updateProfile = async (patch: Partial<CandidateProfile>) => {
    const updatedProfile = {
      ...profile,
      ...patch,
      personal: { ...(profile.personal || {}), ...(patch.personal || {}) }
    }
    
    setProfile(updatedProfile)
    
    // Save to API
    setIsSaving(true)
    try {
      const response = await axios.post('/api/profile', {
        userId: user?.id,
        profileData: {
          summary: updatedProfile.summary,
          fullName: updatedProfile.personal?.fullName,
          mobile: updatedProfile.personal?.mobile,
          location: updatedProfile.personal?.location,
          totalExperience: updatedProfile.personal?.totalExperience,
          noticePeriod: updatedProfile.personal?.noticePeriod,
          resumeUrl: updatedProfile.resumeUrl
        },
        skills: updatedProfile.skills?.map(name => ({ name })) || [],
        employments: updatedProfile.employment || [],
        educations: updatedProfile.education || [],
        projects: updatedProfile.projects || [],
        certifications: updatedProfile.certifications || []
      })
      
      const result = await response.data
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Profile saved successfully"
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "Failed to save profile data",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
    
    return updatedProfile
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

  useEffect(() => {
    if (user?.id) {
      fetchProfileData()
    }
  }, [user?.id])

  const fetchProfileData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/profile?userId=${user?.id}`)
      const result = await response.json()
      
      if (result.success) {
        const { profile, skills, employments, educations, projects, certifications } = result.data
        
        setProfile({
          summary: profile?.summary || "",
          personal: {
            fullName: profile?.fullName || "",
            email: profile?.email || user?.email || "",
            mobile: profile?.mobile || "",
            location: profile?.location || "",
            totalExperience: profile?.totalExperience || "",
            noticePeriod: profile?.noticePeriod || ""
          },
          skills: skills?.map((s: any) => s.name) || [],
          employment: employments?.map((emp: any) => ({
            company: emp.company,
            designation: emp.designation,
            from: emp.from,
            to: emp.to,
            current: emp.current,
            description: emp.description
          })) || [],
          education: educations?.map((edu: any) => ({
            degree: edu.degree,
            institute: edu.institute,
            from: edu.from,
            to: edu.to,
            current: edu.current,
            description: edu.description
          })) || [],
          projects: projects?.map((proj: any) => ({
            name: proj.name,
            role: proj.role,
            from: proj.from,
            to: proj.to,
            description: proj.description
          })) || [],
          certifications: certifications?.map((cert: any) => ({
            name: cert.name,
            authority: cert.authority,
            year: cert.year
          })) || [],
          resumeUrl: profile?.resumeUrl || ""
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto py-8 flex justify-center">
          <div className="text-center">
            <p>Loading profile...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <main className="min-h-dvh flex flex-col">
        <Navbar />
        <main className="container mx-auto py-8 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
          <Sidebar completion={completion} />
          <section className="space-y-6">
            <Card id="summary">
              <CardHeader>
                <SectionHeader title="Profile Summary" />
              </CardHeader>
              <CardContent>
                <SummaryForm 
                  initialValue={profile.summary} 
                  updateProfile={updateProfile} 
                  isSaving={isSaving}
                />
              </CardContent>
            </Card>

            <Card id="personal">
              <CardHeader>
                <SectionHeader title="Personal Details" />
              </CardHeader>
              <CardContent>
                <PersonalForm 
                  initialValue={profile.personal} 
                  updateProfile={updateProfile} 
                  isSaving={isSaving}
                />
              </CardContent>
            </Card>

            <Card id="skills">
              <CardHeader>
                <SectionHeader title="Key Skills" />
              </CardHeader>
              <CardContent>
                <SkillsForm 
                  initialValue={profile.skills || []} 
                  updateProfile={updateProfile} 
                  isSaving={isSaving}
                />
              </CardContent>
            </Card>

            <Card id="employment">
              <CardHeader>
                <SectionHeader title="Employment" />
              </CardHeader>
              <CardContent>
                <EmploymentForm 
                  initialValue={profile.employment || []} 
                  updateProfile={updateProfile} 
                  isSaving={isSaving}
                />
              </CardContent>
            </Card>

            <Card id="education">
              <CardHeader>
                <SectionHeader title="Education" />
              </CardHeader>
              <CardContent>
                <EducationForm 
                  initialValue={profile.education || []} 
                  updateProfile={updateProfile} 
                  isSaving={isSaving}
                />
              </CardContent>
            </Card>

            <Card id="projects">
              <CardHeader>
                <SectionHeader title="Projects" />
              </CardHeader>
              <CardContent>
                <ProjectsForm 
                  initialValue={profile.projects || []} 
                  updateProfile={updateProfile} 
                  isSaving={isSaving}
                />
              </CardContent>
            </Card>

            <Card id="certifications">
              <CardHeader>
                <SectionHeader title="Certifications" />
              </CardHeader>
              <CardContent>
                <CertificationsForm 
                  initialValue={profile.certifications || []} 
                  updateProfile={updateProfile} 
                  isSaving={isSaving}
                />
              </CardContent>
            </Card>

            <Card id="resume">
              <CardHeader>
                <SectionHeader title="Resume" />
              </CardHeader>
              <CardContent>
                <ResumeForm 
                  initialValue={profile.resumeUrl} 
                  updateProfile={updateProfile} 
                  isSaving={isSaving}
                />
              </CardContent>
            </Card>
          </section>
        </main>
      </main>
    </>
  )
}

function SummaryForm({ 
  initialValue, 
  updateProfile, 
  isSaving 
}: { 
  initialValue?: string
  updateProfile: any
  isSaving: boolean
}) {
  const [summary, setSummary] = useState(initialValue || "")
  const [localSaving, setLocalSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalSaving(true)
    await updateProfile({ summary })
    setLocalSaving(false)
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Label htmlFor="summary">Add a brief professional summary</Label>
      <Textarea
        id="summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        rows={4}
        placeholder="Frontend developer with 4+ years in React and TypeScript..."
      />
      <Button type="submit" className="w-fit" disabled={localSaving || isSaving}>
        {localSaving ? "Saving..." : "Save"}
      </Button>
    </form>
  )
}

function PersonalForm({
  initialValue,
  updateProfile,
  isSaving
}: {
  initialValue?: CandidateProfile["personal"]
  updateProfile: any
  isSaving: boolean
}) {
  const [state, setState] = useState({
    fullName: initialValue?.fullName || "",
    email: initialValue?.email || "",
    mobile: initialValue?.mobile || "",
    location: initialValue?.location || "",
    totalExperience: initialValue?.totalExperience || "",
    noticePeriod: initialValue?.noticePeriod || "",
  })
  const [localSaving, setLocalSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalSaving(true)
    await updateProfile({ personal: state })
    setLocalSaving(false)
  }

  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
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
        <Button type="submit" disabled={localSaving || isSaving}>
          {localSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  )
}

function SkillsForm({ 
  initialValue, 
  updateProfile, 
  isSaving 
}: { 
  initialValue: string[]
  updateProfile: any
  isSaving: boolean
}) {
  const [skillsStr, setSkillsStr] = useState(initialValue.join(", "))
  const [localSaving, setLocalSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalSaving(true)
    const skills = skillsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    await updateProfile({ skills })
    setLocalSaving(false)
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Label htmlFor="skills">Add skills (comma separated)</Label>
      <Input
        id="skills"
        value={skillsStr}
        onChange={(e) => setSkillsStr(e.target.value)}
        placeholder="React, Next.js, TypeScript"
      />
      <Button type="submit" className="w-fit" disabled={localSaving || isSaving}>
        {localSaving ? "Saving..." : "Save"}
      </Button>
    </form>
  )
}

function EmploymentForm({
  initialValue,
  updateProfile,
  isSaving
}: {
  initialValue: NonNullable<CandidateProfile["employment"]>
  updateProfile: any
  isSaving: boolean
}) {
  const [items, setItems] = useState(initialValue || [])
  const [draft, setDraft] = useState({
    company: "",
    designation: "",
    from: "",
    to: "",
    current: false,
    description: "",
  })
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [localSaving, setLocalSaving] = useState(false)

  useEffect(() => {
    setItems(initialValue || [])
  }, [initialValue])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.company.trim() && !draft.designation.trim()) return
    
    setLocalSaving(true)
    let next
    
    if (editIndex !== null) {
      next = items.map((item, idx) => (idx === editIndex ? { ...draft } : item))
      setEditIndex(null)
    } else {
      next = [...items, { ...draft }]
    }
    
    setItems(next)
    await updateProfile({ employment: next })
    setDraft({ company: "", designation: "", from: "", to: "", current: false, description: "" })
    setLocalSaving(false)
  }

  const handleRemove = async (index: number) => {
    setLocalSaving(true)
    const next = items.filter((_, i) => i !== index)
    setItems(next)
    await updateProfile({ employment: next })
    setLocalSaving(false)
  }

  return (
    <div className="space-y-4">
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            placeholder="Acme Corp"
            value={draft.company}
            onChange={(e) => setDraft({ ...draft, company: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="designation">Designation</Label>
          <Input
            id="designation"
            placeholder="Senior Engineer"
            value={draft.designation}
            onChange={(e) => setDraft({ ...draft, designation: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="from">From</Label>
          <Input
            id="from"
            placeholder="Jan 2022"
            value={draft.from}
            onChange={(e) => setDraft({ ...draft, from: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="to">To</Label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.current}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, current: e.target.checked, to: e.target.checked ? "" : d.to }))
                }
              />
              <span>Current</span>
            </label>
          </div>
          <Input
            id="to"
            placeholder="Dec 2023 or leave blank if current"
            value={draft.to}
            onChange={(e) => setDraft({ ...draft, to: e.target.value })}
            disabled={draft.current}
          />
        </div>
        <div className="md:col-span-2 grid gap-2">
          <Label htmlFor="employment-desc">Description</Label>
          <Textarea
            id="employment-desc"
            placeholder="Brief description of responsibilities or achievements"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            rows={3}
          />
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" disabled={localSaving || isSaving}>
            {editIndex !== null ? "Update Employment" : "Add Employment"}
          </Button>
          {editIndex !== null && (
            <Button type="button" variant="outline" onClick={() => {
              setEditIndex(null)
              setDraft({ company: "", designation: "", from: "", to: "", current: false, description: "" })
            }}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No employment added yet.</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="rounded-md border p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">
                    {item.designation || "(No designation)"} at {item.company || "(No company)"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.from || ""} - {item.current ? "Present" : item.to || ""}
                  </div>
                </div>
                {item.current && (
                  <span className="ml-3 rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium">
                    Current
                  </span>
                )}
              </div>

              {item.description ? (
                <p className="mt-2 text-sm">{item.description}</p>
              ) : null}

              <div className="mt-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemove(idx)}
                  disabled={localSaving || isSaving}
                >
                  Remove
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDraft({
                      company: item.company || "",
                      designation: item.designation || "",
                      from: item.from || "",
                      to: item.to || "",
                      current: !!item.current,
                      description: item.description || "",
                    })
                    setEditIndex(idx)
                  }}
                >
                  Edit
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
  updateProfile,
  isSaving
}: {
  initialValue: NonNullable<CandidateProfile["education"]>
  updateProfile: any
  isSaving: boolean
}) {
  const [items, setItems] = useState(initialValue || [])
  const [draft, setDraft] = useState({
    degree: "",
    institute: "",
    from: "",
    to: "",
    current: false,
    description: "",
  })
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [localSaving, setLocalSaving] = useState(false)

  useEffect(() => {
    setItems(initialValue || [])
  }, [initialValue])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.degree.trim() && !draft.institute.trim()) return
    
    setLocalSaving(true)
    let next
    
    if (editIndex !== null) {
      next = items.map((item, idx) => (idx === editIndex ? { ...draft } : item))
      setEditIndex(null)
    } else {
      next = [...items, { ...draft }]
    }
    
    setItems(next)
    await updateProfile({ education: next })
    setDraft({ degree: "", institute: "", from: "", to: "", current: false, description: "" })
    setLocalSaving(false)
  }

  const handleRemove = async (index: number) => {
    setLocalSaving(true)
    const next = items.filter((_, i) => i !== index)
    setItems(next)
    await updateProfile({ education: next })
    setLocalSaving(false)
  }

  return (
    <div className="space-y-4">
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="degree">Degree</Label>
          <Input
            id="degree"
            placeholder="B.Tech, M.Sc, MBA..."
            value={draft.degree}
            onChange={(e) => setDraft({ ...draft, degree: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="institute">Institute</Label>
          <Input
            id="institute"
            placeholder="ABC University"
            value={draft.institute}
            onChange={(e) => setDraft({ ...draft, institute: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="from">From</Label>
          <Input
            id="from"
            placeholder="2019"
            value={draft.from}
            onChange={(e) => setDraft({ ...draft, from: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="to">To</Label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.current}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    current: e.target.checked,
                    to: e.target.checked ? "" : d.to,
                  }))
                }
              />
              <span>Current</span>
            </label>
          </div>
          <Input
            id="to"
            placeholder="2023 or leave blank if current"
            value={draft.to}
            onChange={(e) => setDraft({ ...draft, to: e.target.value })}
            disabled={draft.current}
          />
        </div>
        <div className="md:col-span-2 grid gap-2">
          <Label htmlFor="education-desc">Description</Label>
          <Textarea
            id="education-desc"
            placeholder="Brief description, specialization, or achievements"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            rows={3}
          />
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" disabled={localSaving || isSaving}>
            {editIndex !== null ? "Update Education" : "Add Education"}
          </Button>
          {editIndex !== null && (
            <Button type="button" variant="outline" onClick={() => {
              setEditIndex(null)
              setDraft({ degree: "", institute: "", from: "", to: "", current: false, description: "" })
            }}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No education added yet.</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="rounded-md border p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">
                    {item.degree || "(No degree)"} at{" "}
                    {item.institute || "(No institute)"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.from || ""} - {item.current ? "Present" : item.to || ""}
                  </div>
                </div>
                {item.current && (
                  <span className="ml-3 rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium">
                    Current
                  </span>
                )}
              </div>

              {item.description ? (
                <p className="mt-2 text-sm">{item.description}</p>
              ) : null}

              <div className="mt-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemove(idx)}
                  disabled={localSaving || isSaving}
                >
                  Remove
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDraft({
                      degree: item.degree || "",
                      institute: item.institute || "",
                      from: item.from || "",
                      to: item.to || "",
                      current: !!item.current,
                      description: item.description || "",
                    })
                    setEditIndex(idx)
                  }}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function ProjectsForm({
  initialValue,
  updateProfile,
  isSaving
}: {
  initialValue: NonNullable<CandidateProfile["projects"]>
  updateProfile: any
  isSaving: boolean
}) {
  const [items, setItems] = useState(initialValue || [])
  const [draft, setDraft] = useState({
    name: "",
    role: "",
    from: "",
    to: "",
    description: "",
  })
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [localSaving, setLocalSaving] = useState(false)

  useEffect(() => {
    setItems(initialValue || [])
  }, [initialValue])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.name.trim() || !draft.role.trim() || !draft.from.trim()) return
    
    setLocalSaving(true)
    let next
    
    if (editIndex !== null) {
      next = items.map((item, idx) => (idx === editIndex ? { ...draft } : item))
      setEditIndex(null)
    } else {
      next = [...items, { ...draft }]
    }
    
    setItems(next)
    await updateProfile({ projects: next })
    setDraft({ name: "", role: "", from: "", to: "", description: "" })
    setLocalSaving(false)
  }

  const handleRemove = async (index: number) => {
    setLocalSaving(true)
    const next = items.filter((_, i) => i !== index)
    setItems(next)
    await updateProfile({ projects: next })
    setLocalSaving(false)
  }

  return (
    <div className="space-y-4">
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label>Project Name</Label>
          <Input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Enter project name"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Role</Label>
          <Input
            value={draft.role}
            onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            placeholder="Your role in the project"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>From</Label>
          <Input
            value={draft.from}
            onChange={(e) => setDraft({ ...draft, from: e.target.value })}
            placeholder="Jan 2023"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>To</Label>
          <Input
            value={draft.to}
            onChange={(e) => setDraft({ ...draft, to: e.target.value })}
            placeholder="Dec 2023 or Present"
          />
        </div>
        <div className="md:col-span-2 grid gap-2">
          <Label>Description</Label>
          <Textarea
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            rows={3}
            placeholder="Brief description of the project"
          />
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" disabled={localSaving || isSaving}>
            {editIndex !== null ? "Update Project" : "Add Project"}
          </Button>
          {editIndex !== null && (
            <Button type="button" variant="outline" onClick={() => {
              setEditIndex(null)
              setDraft({ name: "", role: "", from: "", to: "", description: "" })
            }}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects added yet.</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="rounded-md border p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.role} • {item.from} - {item.to || "Present"}
                  </div>
                </div>
              </div>

              {item.description && <p className="mt-2 text-sm">{item.description}</p>}

              <div className="mt-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemove(idx)}
                  disabled={localSaving || isSaving}
                >
                  Remove
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDraft({
                      name: item.name || "",
                      role: item.role || "",
                      from: item.from || "",
                      to: item.to || "",
                      description: item.description || "",
                    })
                    setEditIndex(idx)
                  }}
                >
                  Edit
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
  updateProfile,
  isSaving
}: {
  initialValue: NonNullable<CandidateProfile["certifications"]>
  updateProfile: any
  isSaving: boolean
}) {
  const [items, setItems] = useState(initialValue || [])
  const [draft, setDraft] = useState({ name: "", authority: "", year: "" })
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [localSaving, setLocalSaving] = useState(false)

  useEffect(() => {
    setItems(initialValue || [])
  }, [initialValue])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalSaving(true)
    
    let next
    if (editIndex !== null) {
      next = items.map((item, idx) => (idx === editIndex ? { ...draft } : item))
      setEditIndex(null)
    } else {
      next = [...items, { ...draft }]
    }
    
    setItems(next)
    await updateProfile({ certifications: next })
    setDraft({ name: "", authority: "", year: "" })
    setLocalSaving(false)
  }

  const handleRemove = async (index: number) => {
    setLocalSaving(true)
    const next = items.filter((_, i) => i !== index)
    setItems(next)
    await updateProfile({ certifications: next })
    setLocalSaving(false)
  }

  return (
    <div className="space-y-4">
      <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="AWS Certified Cloud Practitioner"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Authority</Label>
          <Input
            value={draft.authority}
            onChange={(e) => setDraft({ ...draft, authority: e.target.value })}
            placeholder="Amazon Web Services"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Year</Label>
          <Input
            value={draft.year}
            onChange={(e) => setDraft({ ...draft, year: e.target.value })}
            placeholder="2023"
            required
          />
        </div>
        <div className="md:col-span-3 flex gap-2">
          <Button type="submit" disabled={localSaving || isSaving}>
            {editIndex !== null ? "Update Certification" : "Add Certification"}
          </Button>
          {editIndex !== null && (
            <Button type="button" variant="outline" onClick={() => {
              setEditIndex(null)
              setDraft({ name: "", authority: "", year: "" })
            }}>
              Cancel
            </Button>
          )}
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDraft(item)
                    setEditIndex(idx)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemove(idx)}
                  disabled={localSaving || isSaving}
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

function ResumeForm({ 
  initialValue, 
  updateProfile, 
  isSaving 
}: { 
  initialValue?: string
  updateProfile: any
  isSaving: boolean
}) {
  const [resumeUrl, setResumeUrl] = useState(initialValue || "")
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [localSaving, setLocalSaving] = useState(false)

  const handleFile = async (file: File) => {
    setFile(file)
    setUploading(true)

    try {
      // Upload file to Cloudflare R2
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setResumeUrl(result.data.resumeUrl)
        await updateProfile({ resumeUrl: result.data.resumeUrl })
        toast({
          title: "Success",
          description: "Resume uploaded successfully",
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      console.error('Error uploading resume:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload resume",
        variant: "destructive",
      })
      setFile(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleRemove = async () => {
    setLocalSaving(true)
    try {
      await updateProfile({ resumeUrl: "" })
      setFile(null)
      setResumeUrl("")
      toast({
        title: "Success",
        description: "Resume removed successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove resume",
        variant: "destructive",
      })
    } finally {
      setLocalSaving(false)
    }
  }

  const handleResumeDownload = async() => {
    try {
      // Get presigned URL from API
      const resumePresignedUrl = await axios.get(`/api/presigned-url?fileKey=${resumeUrl}`)
      const downloadLink = resumePresignedUrl.data.presignedUrl

      const parts = resumeUrl.split('/')
      const originalFilename = parts.length >= 2 ? parts[parts.length - 2] : 'Resume.pdf'

      // Fetch the file as a blob
      const response = await fetch(downloadLink)
      const blob = await response.blob()

      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob)

      // Create download link
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = originalFilename
      link.click()

      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl)

      toast.success("Resume downloaded successfully")
        
    } catch (error) {
      console.error('Error downloading resume:', error)
      toast.error("Failed to download resume")
    }
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Upload Resume</Label>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : uploading 
            ? "border-muted-foreground/30 cursor-not-allowed opacity-60"
            : "border-muted-foreground/30 hover:border-primary/60"
        }`}
        onClick={() => !uploading && document.getElementById("fileInput")?.click()}
      >
        <input
          type="file"
          id="fileInput"
          accept=".pdf,.doc,.docx"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0])
            }
          }}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Uploading resume...
            </p>
          </div>
        ) : file ? (
          <p className="text-sm text-muted-foreground">
            ✅ {file.name} uploaded successfully
          </p>
        ) : (
          <>
            <svg
              className="w-12 h-12 mb-3 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-muted-foreground">
              Drag and drop your resume here, or{" "}
              <span className="text-primary font-medium">browse</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supported formats: PDF, DOC, DOCX (Max 5MB)
            </p>
          </>
        )}
      </div>

      {resumeUrl && (
        <div className="border rounded-md px-4 py-3 bg-background">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">
                {(() => {
                  const parts = resumeUrl.split('/')
                  // Format: resumes/uuid/originalFilename/timestamp.pdf
                  // Get the second-to-last part which is the original filename
                  return parts.length >= 2 ? parts[parts.length - 2] : 'Resume.pdf'
                })()}
              </h4>
              <p className="text-xs text-muted-foreground">
                Uploaded on {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleResumeDownload}
                disabled={uploading || localSaving || isSaving}
                title="Download Resume"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={handleRemove}
                disabled={uploading || localSaving || isSaving}
                title="Delete Resume"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}