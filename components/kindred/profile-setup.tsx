"use client"

import { useState, type FormEvent, type KeyboardEvent } from "react"
import { Sparkles, Plus, X, Briefcase, Trash2, Sun, Moon } from "lucide-react"
import type { UserProfile, ExperienceEntry } from "@/lib/kindred-data"

type Theme = "light" | "dark"

const emptyExperience: ExperienceEntry = { company: "", role: "", duration: "" }

export function ProfileSetup({
  theme,
  onToggleTheme,
  defaultName,
  onComplete,
}: {
  theme: Theme
  onToggleTheme: () => void
  defaultName?: string
  onComplete: (profile: UserProfile) => void
}) {
  const [fullName, setFullName] = useState(defaultName ?? "")
  const [age, setAge] = useState("")
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [yearsExperience, setYearsExperience] = useState("")
  const [summary, setSummary] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [skillDraft, setSkillDraft] = useState("")
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([{ ...emptyExperience }])

  const addSkill = () => {
    const value = skillDraft.trim()
    if (!value) return
    if (!skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setSkills((prev) => [...prev, value])
    }
    setSkillDraft("")
  }

  const onSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addSkill()
    }
  }

  const removeSkill = (name: string) =>
    setSkills((prev) => prev.filter((s) => s !== name))

  const updateExperience = (index: number, field: keyof ExperienceEntry, value: string) =>
    setExperiences((prev) =>
      prev.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp)),
    )

  const addExperience = () =>
    setExperiences((prev) => [...prev, { ...emptyExperience }])

  const removeExperience = (index: number) =>
    setExperiences((prev) => prev.filter((_, i) => i !== index))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onComplete({
      fullName: fullName.trim() || "New Member",
      age: age.trim(),
      title: title.trim() || "Professional",
      location: location.trim(),
      yearsExperience: yearsExperience.trim(),
      summary: summary.trim(),
      skills,
      experiences: experiences.filter((exp) => exp.company.trim() || exp.role.trim()),
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Kindred</span>
        </div>
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {theme === "light" ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
        </button>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          <Sparkles className="size-3.5" />
          Step 2 of 2 · Build your profile
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Create your profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about yourself. These details power your matches and appear in your menu.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-8">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-bold">Basic details</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" required>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Maya Okonkwo"
                  className={inputCls}
                />
              </Field>
              <Field label="Age">
                <input
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  type="number"
                  min={0}
                  placeholder="29"
                  className={inputCls}
                />
              </Field>
              <Field label="Professional title" required>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Product Designer"
                  className={inputCls}
                />
              </Field>
              <Field label="Location">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Berlin, Germany"
                  className={inputCls}
                />
              </Field>
              <Field label="Years of experience">
                <input
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  type="number"
                  min={0}
                  placeholder="6"
                  className={inputCls}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-bold">Professional summary</h2>
            <p className="text-xs text-muted-foreground">A short bio about your work and focus.</p>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              placeholder="End-to-end product designer focused on healthcare and fintech, with a love for design systems and research-driven decisions."
              className={`${inputCls} mt-4 resize-none`}
            />
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-bold">Skills</h2>
            <p className="text-xs text-muted-foreground">
              Add the skills that describe your expertise. Press Enter to add.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                value={skillDraft}
                onChange={(e) => setSkillDraft(e.target.value)}
                onKeyDown={onSkillKeyDown}
                placeholder="e.g. UX Research"
                className={inputCls}
              />
              <button
                type="button"
                onClick={addSkill}
                className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus className="size-4" />
                Add
              </button>
            </div>
            {skills.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <li key={skill}>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        aria-label={`Remove ${skill}`}
                        className="text-accent-foreground/70 transition-colors hover:text-accent-foreground"
                      >
                        <X className="size-3.5" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No skills added yet.</p>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Work experience</h2>
                <p className="text-xs text-muted-foreground">Companies you have worked in.</p>
              </div>
              <button
                type="button"
                onClick={addExperience}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                <Plus className="size-3.5" />
                Add role
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {experiences.map((exp, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                      <Briefcase className="size-4" />
                      Role {index + 1}
                    </span>
                    {experiences.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        aria-label={`Remove role ${index + 1}`}
                        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <input
                      value={exp.company}
                      onChange={(e) => updateExperience(index, "company", e.target.value)}
                      placeholder="Company"
                      className={inputCls}
                    />
                    <input
                      value={exp.role}
                      onChange={(e) => updateExperience(index, "role", e.target.value)}
                      placeholder="Role / title"
                      className={inputCls}
                    />
                    <input
                      value={exp.duration}
                      onChange={(e) => updateExperience(index, "duration", e.target.value)}
                      placeholder="2021 – 2024"
                      className={inputCls}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Sparkles className="size-4" />
              Finish and see matches
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </span>
      {children}
    </label>
  )
}
