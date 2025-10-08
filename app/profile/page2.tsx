"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";

// Type definitions (moved from local-db)
export type CandidateProfile = {
  summary?: string;
  personal?: {
    fullName?: string;
    email?: string;
    mobile?: string;
    location?: string;
    totalExperience?: string;
    noticePeriod?: string;
  };
  skills?: string[];
  employment?: Array<{
    company: string;
    designation: string;
    from: string;
    to?: string;
    current?: boolean;
    description?: string;
  }>;
  education?: Array<{
    degree: string;
    institute: string;
    from?: string;
    to?: string;
    current?: boolean;
    description?: string;
  }>;
  projects?: Array<{
    name: string;
    role: string;
    from: string;
    to?: string;
    description?: string;
  }>;
  certifications?: Array<{ name: string; authority: string; year: string }>;
  resumeUrl?: string;
};


function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">{title}</h3>
      {action}
    </div>
  );
}

function Sidebar({ completion }: { completion: number }) {
  return (
    <aside className="hidden md:flex lg:sticky top-10 self-start flex-col gap-3 pr-6 border-r">
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">Profile completeness</p>
        <div className="mt-2 h-2 w-full rounded bg-muted">
          <div
            className="h-2 rounded bg-primary"
            style={{ width: `${Math.min(100, Math.max(0, completion))}%` }}
          />
        </div>
        <p className="mt-2 text-sm font-medium">
          {Math.round(completion)}% complete
        </p>
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
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  console.log(user);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Local profile state (not persisted - add API routes to save to database)
  const [profile, setProfile] = useState<CandidateProfile>({});
  // Helper function to update profile (local state only - TODO: add API route)
  const updateProfile = (patch: Partial<CandidateProfile>) => {
    setProfile((prev) => ({
      ...prev,
      ...patch,
      personal: { ...(prev.personal || {}), ...(patch.personal || {}) },
    }));
    return profile;
  };

  const completion = useMemo(() => {
    let c = 0;
    if (profile.summary) c += 15;
    if (profile.personal?.fullName && profile.personal?.email) c += 20;
    if (profile.skills && profile.skills.length > 0) c += 15;
    if (profile.employment && profile.employment.length > 0) c += 15;
    if (profile.education && profile.education.length > 0) c += 10;
    if (profile.projects && profile.projects.length > 0) c += 10;
    if (profile.certifications && profile.certifications.length > 0) c += 10;
    if (profile.resumeUrl) c += 5;
    return Math.min(100, c);
  }, [profile]);

  // if (!user) return null

  const noop = () => {};

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
                  onSaved={noop}
                  updateProfile={updateProfile}
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
                  onSaved={noop}
                  updateProfile={updateProfile}
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
                  onSaved={noop}
                  updateProfile={updateProfile}
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
                  onSaved={noop}
                  updateProfile={updateProfile}
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
                  onSaved={noop}
                  updateProfile={updateProfile}
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
                  onSaved={noop}
                  updateProfile={updateProfile}
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
                  onSaved={noop}
                  updateProfile={updateProfile}
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
                  onSaved={noop}
                  updateProfile={updateProfile}
                />
              </CardContent>
            </Card>
          </section>
        </main>
      </main>
    </>
  );
}

function SummaryForm({
  initialValue,
  onSaved,
  updateProfile,
}: {
  initialValue?: string;
  onSaved: any;
  updateProfile: any;
}) {
  const [summary, setSummary] = useState(initialValue || "");
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        updateProfile({ summary });
        onSaved?.();
      }}
    >
      <Label htmlFor="summary">Add a brief professional summary</Label>
      <Textarea
        id="summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        rows={4}
        placeholder="Frontend developer with 4+ years in React and TypeScript..."
      />
      <Button type="submit" className="w-fit">
        Save
      </Button>
    </form>
  );
}

function PersonalForm({
  initialValue,
  onSaved,
  updateProfile,
}: {
  initialValue?: CandidateProfile["personal"];
  onSaved: any;
  updateProfile: any;
}) {
  const [state, setState] = useState({
    fullName: initialValue?.fullName || "",
    email: initialValue?.email || "",
    mobile: initialValue?.mobile || "",
    location: initialValue?.location || "",
    totalExperience: initialValue?.totalExperience || "",
    noticePeriod: initialValue?.noticePeriod || "",
  });

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        updateProfile({ personal: state });
        onSaved?.();
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
        <Input
          id="mobile"
          value={state.mobile}
          onChange={(e) => setState({ ...state, mobile: e.target.value })}
        />
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
          onChange={(e) =>
            setState({ ...state, totalExperience: e.target.value })
          }
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
  );
}

function SkillsForm({
  initialValue,
  onSaved,
  updateProfile,
}: {
  initialValue: string[];
  onSaved: any;
  updateProfile: any;
}) {
  const [skillsStr, setSkillsStr] = useState(initialValue.join(", "));
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const skills = skillsStr
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        updateProfile({ skills });
        onSaved?.();
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
  );
}

function EmploymentForm({
  initialValue,
  onSaved,
  updateProfile,
}: {
  initialValue: NonNullable<CandidateProfile["employment"]>;
  onSaved: any;
  updateProfile: any;
}) {
  const [items, setItems] = useState(initialValue || []);
  const [draft, setDraft] = useState({
    company: "",
    designation: "",
    from: "",
    to: "",
    current: false,
    description: "",
  });

  // keep local items in sync when parent initialValue changes
  useEffect(() => {
    setItems(initialValue || []);
  }, [initialValue]);
  return (
    <div className="space-y-4">
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          // basic validation: require company or designation
          if (!draft.company.trim() && !draft.designation.trim()) return;
          const next = [...items, { ...draft }];
          setItems(next);
          updateProfile({ employment: next });
          onSaved?.();
          setDraft({ company: "", designation: "", from: "", to: "", current: false, description: "" });
        }}
      >
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
                  onClick={() => {
                    const next = items.filter((_, i) => i !== idx);
                    setItems(next);
                    updateProfile({ employment: next });
                    onSaved?.();
                  }}
                >
                  Remove
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // populate draft with this item for quick editing
                    setDraft({
                      company: item.company || "",
                      designation: item.designation || "",
                      from: item.from || "",
                      to: item.to || "",
                      current: !!item.current,
                      description: item.description || "",
                    });
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
  );
}


function EducationForm({
  initialValue,
  onSaved,
  updateProfile,
}: {
  initialValue: NonNullable<CandidateProfile["education"]>;
  onSaved: any;
  updateProfile: any;
}) {
  const [items, setItems] = useState(initialValue || []);
  const [draft, setDraft] = useState({
    degree: "",
    institute: "",
    from: "",
    to: "",
    current: false,
    description: "",
  });

  // Sync local items when parent initialValue changes
  useEffect(() => {
    setItems(initialValue || []);
  }, [initialValue]);

  return (
    <div className="space-y-4">
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          // Basic validation
          if (!draft.degree.trim() && !draft.institute.trim()) return;
          const next = [...items, { ...draft }];
          setItems(next);
          updateProfile({ education: next });
          onSaved?.();
          setDraft({
            degree: "",
            institute: "",
            from: "",
            to: "",
            current: false,
            description: "",
          });
        }}
      >
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
        <div className="md:col-span-2">
          <Button type="submit">Add Education</Button>
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
                  onClick={() => {
                    const next = items.filter((_, i) => i !== idx);
                    setItems(next);
                    updateProfile({ education: next });
                    onSaved?.();
                  }}
                >
                  Remove
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // populate draft with this item for quick editing
                    setDraft({
                      degree: item.degree || "",
                      institute: item.institute || "",
                      from: item.from || "",
                      to: item.to || "",
                      current: !!item.current,
                      description: item.description || "",
                    });
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
  );
}

// function ProjectsForm({
//   initialValue,
//   onSaved,
//   updateProfile,
// }: {
//   initialValue: NonNullable<CandidateProfile["projects"]>;
//   onSaved: any;
//   updateProfile: any;
// }) {
//   const [items, setItems] = useState(initialValue);
//   const [draft, setDraft] = useState({
//     name: "",
//     role: "",
//     from: "",
//     to: "",
//     description: "",
//   });
//   return (
//     <div className="space-y-4">
//       <form
//         className="grid grid-cols-1 md:grid-cols-2 gap-4"
//         onSubmit={(e) => {
//           e.preventDefault();
//           const next = [...items, { ...draft }];
//           setItems(next);
//           updateProfile({ projects: next });
//           onSaved?.();
//           setDraft({ name: "", role: "", from: "", to: "", description: "" });
//         }}
//       >
//         <div className="grid gap-2">
//           <Label>Project Name</Label>
//           <Input
//             value={draft.name}
//             onChange={(e) => setDraft({ ...draft, name: e.target.value })}
//           />
//         </div>
//         <div className="grid gap-2">
//           <Label>Role</Label>
//           <Input
//             value={draft.role}
//             onChange={(e) => setDraft({ ...draft, role: e.target.value })}
//           />
//         </div>
//         <div className="grid gap-2">
//           <Label>From</Label>
//           <Input
//             value={draft.from}
//             onChange={(e) => setDraft({ ...draft, from: e.target.value })}
//           />
//         </div>
//         <div className="grid gap-2">
//           <Label>To</Label>
//           <Input
//             value={draft.to}
//             onChange={(e) => setDraft({ ...draft, to: e.target.value })}
//           />
//         </div>
//         <div className="md:col-span-2 grid gap-2">
//           <Label>Description</Label>
//           <Textarea
//             value={draft.description}
//             onChange={(e) =>
//               setDraft({ ...draft, description: e.target.value })
//             }
//             rows={3}
//           />
//         </div>
//         <div className="md:col-span-2">
//           <Button type="submit">Add Project</Button>
//         </div>
//       </form>

//       <div className="space-y-3">
//         {items.length === 0 ? (
//           <p className="text-sm text-muted-foreground">
//             No projects added yet.
//           </p>
//         ) : (
//           items.map((item, idx) => (
//             <div key={idx} className="rounded-md border p-3">
//               <div className="font-medium">{item.name}</div>
//               <div className="text-sm text-muted-foreground">
//                 {item.role} • {item.from} - {item.to || "Present"}
//               </div>
//               {item.description ? (
//                 <p className="mt-2 text-sm">{item.description}</p>
//               ) : null}
//               <div className="mt-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => {
//                     const next = items.filter((_, i) => i !== idx);
//                     setItems(next);
//                     updateProfile({ projects: next });
//                     onSaved?.();
//                   }}
//                 >
//                   Remove
//                 </Button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
function ProjectsForm({
  initialValue,
  onSaved,
  updateProfile,
}: {
  initialValue: NonNullable<CandidateProfile["projects"]>;
  onSaved: () => void;
  updateProfile: (data: { projects: CandidateProfile["projects"] }) => void;
}) {
  const [items, setItems] = useState(initialValue || []);
  const [draft, setDraft] = useState<{
    name: string;
    role: string;
    from: string;
    to?: string;
    description?: string;
  }>({
    name: "",
    role: "",
    from: "",
    to: "",
    description: "",
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Keep local items in sync with parent updates
  useEffect(() => {
    setItems(initialValue || []);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!draft.name.trim() || !draft.role.trim() || !draft.from.trim()) {
      alert("Please fill in Project Name, Role, and From fields.");
      return;
    }

    let next;

    if (editIndex !== null) {
      // Update existing project
      next = items.map((item, idx) => (idx === editIndex ? { ...draft } : item));
      setEditIndex(null);
    } else {
      // Add new project
      next = [...items, { ...draft }];
    }

    setItems(next);
    updateProfile({ projects: next });
    onSaved?.();

    // Reset draft
    setDraft({ name: "", role: "", from: "", to: "", description: "" });
  };

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
            value={draft.to || ""}
            onChange={(e) => setDraft({ ...draft, to: e.target.value })}
            placeholder="Dec 2023 or Present"
          />
        </div>
        <div className="md:col-span-2 grid gap-2">
          <Label>Description</Label>
          <Textarea
            value={draft.description || ""}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            rows={3}
            placeholder="Brief description of the project"
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit">
            {editIndex !== null ? "Update Project" : "Add Project"}
          </Button>
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
                  onClick={() => {
                    const next = items.filter((_, i) => i !== idx);
                    setItems(next);
                    updateProfile({ projects: next });
                    onSaved?.();
                  }}
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
                    });
                    setEditIndex(idx);
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
  );
}


function CertificationsForm({
  initialValue,
  onSaved,
  updateProfile,
}: {
  initialValue: NonNullable<CandidateProfile["certifications"]>;
  onSaved: any;
  updateProfile: any;
}) {
  const [items, setItems] = useState(initialValue);
  const [draft, setDraft] = useState({ name: "", authority: "", year: "" });
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editIndex !== null) {
      // Editing existing certification
      const next = [...items];
      next[editIndex] = { ...draft };
      setItems(next);
      updateProfile({ certifications: next });
      onSaved?.();
      setEditIndex(null);
    } else {
      // Adding new certification
      const next = [...items, { ...draft }];
      setItems(next);
      updateProfile({ certifications: next });
      onSaved?.();
    }

    // Clear the form
    setDraft({ name: "", authority: "", year: "" });
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setDraft(items[index]);
  };

  const handleRemove = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    updateProfile({ certifications: next });
    onSaved?.();
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setDraft({ name: "", authority: "", year: "" });
  };

  return (
    <div className="space-y-4">
      {/* Add/Edit Form */}
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
            placeholder="Authority"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Year</Label>
          <Input
            value={draft.year}
            onChange={(e) => setDraft({ ...draft, year: e.target.value })}
            placeholder="Year"
            required
          />
        </div>

        <div className="md:col-span-3 flex gap-3">
          <Button type="submit">
            {editIndex !== null ? "Update Certification" : "Add Certification"}
          </Button>
          {editIndex !== null && (
            <Button type="button" variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* List of Certifications */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No certifications added yet.</p>
        ) : (
          items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-md border p-3 flex items-center justify-between"
            >
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
                  onClick={() => handleEdit(idx)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemove(idx)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ResumeForm({
  initialValue,
  onSaved,
  updateProfile,
}: {
  initialValue?: string;
  onSaved: any;
  updateProfile: any;
}) {
  const [resumeUrl, setResumeUrl] = useState(initialValue || "");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setFile(file);
    setUploading(true);

    // ⚠️ Replace this with your actual upload logic (e.g., Firebase, S3, or API call)
    // For now, just simulate upload
    setTimeout(() => {
      const fakeUrl = URL.createObjectURL(file);
      setResumeUrl(fakeUrl);
      setUploading(false);
    }, 1500);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        updateProfile({ resumeUrl });
        onSaved?.();
      }}
    >
      <Label className="text-base font-medium">Upload Resume</Label>

      {/* Drag and Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 hover:border-primary/60"
        }`}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <input
          type="file"
          id="fileInput"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {uploading ? (
          <p className="text-sm text-muted-foreground animate-pulse">
            Uploading resume...
          </p>
        ) : file ? (
          <p className="text-sm text-muted-foreground">
            ✅ {file.name} uploaded successfully
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Drag and drop your resume here, or{" "}
              <span className="text-primary font-medium">browse</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supported formats: PDF, DOC, DOCX
            </p>
          </>
        )}
      </div>

      {resumeUrl && (
        <div className="flex items-center justify-between text-sm text-muted-foreground border rounded-md px-3 py-2">
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline truncate max-w-[80%]"
          >
            View Uploaded Resume
          </a>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setFile(null);
              setResumeUrl("");
            }}
          >
            Remove
          </Button>
        </div>
      )}

      <Button type="submit" disabled={uploading || !resumeUrl}>
        {uploading ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}


