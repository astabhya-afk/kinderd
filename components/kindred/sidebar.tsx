"use client"

import { Sparkles, LayoutGrid, Bookmark, User, LogOut, MapPin, Calendar, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserProfile } from "@/lib/kindred-data"

export type NavView = "For you" | "My skills" | "Saved" | "Profile"

const nav: { label: NavView; icon: typeof Sparkles }[] = [
  { label: "For you", icon: Sparkles },
  { label: "My skills", icon: LayoutGrid },
  { label: "Saved", icon: Bookmark },
  { label: "Profile", icon: User },
]

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function Sidebar({
  profile,
  active,
  onNavigate,
  savedCount,
  onSignOut,
}: {
  profile: UserProfile
  active: NavView
  onNavigate: (view: NavView) => void
  savedCount: number
  onSignOut?: () => void
}) {
  const initials = initialsOf(profile.fullName) || "K"

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="px-6 py-5">
        <button
          onClick={() => onNavigate("For you")}
          aria-label="Go to home"
          className="text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-70"
        >
          Kindred
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-2">
        {nav.map((item) => {
          const isActive = active === item.label
          const badge = item.label === "Saved" ? savedCount : null
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.label)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-[18px]" />
              <span className="flex-1 text-left">{item.label}</span>
              {badge ? (
                <span
                  className={cn(
                    "min-w-5 rounded-full px-1.5 text-center text-xs font-semibold",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </nav>

      <div className="mx-3 mt-4 rounded-xl border border-border p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Your details
        </p>
        <ul className="mt-2 flex flex-col gap-2 text-xs text-muted-foreground">
          {profile.location ? (
            <li className="flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0 text-primary" />
              <span className="truncate">{profile.location}</span>
            </li>
          ) : null}
          {profile.age ? (
            <li className="flex items-center gap-2">
              <Calendar className="size-3.5 shrink-0 text-primary" />
              <span className="truncate">{profile.age} years old</span>
            </li>
          ) : null}
          {profile.yearsExperience ? (
            <li className="flex items-center gap-2">
              <Briefcase className="size-3.5 shrink-0 text-primary" />
              <span className="truncate">{profile.yearsExperience} yrs experience</span>
            </li>
          ) : null}
        </ul>
        {profile.experiences.length > 0 ? (
          <>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Experience
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {profile.experiences.slice(0, 3).map((exp, i) => (
                <li key={i} className="text-xs">
                  <p className="truncate font-medium text-foreground">
                    {exp.role || "Role"}
                  </p>
                  <p className="truncate text-muted-foreground">
                    {exp.company}
                    {exp.duration ? ` · ${exp.duration}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      <div className="flex-1" />

      <div className="m-3 flex items-center gap-3 rounded-xl border border-border p-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{profile.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{profile.title}</p>
        </div>
        <button
          onClick={onSignOut}
          aria-label="Sign out"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-[18px]" />
        </button>
      </div>
    </aside>
  )
}
