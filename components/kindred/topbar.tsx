"use client"

import { Search, SlidersHorizontal, Sun, Moon } from "lucide-react"
import type { UserProfile } from "@/lib/kindred-data"

type Theme = "light" | "dark"

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function Topbar({
  theme,
  onToggleTheme,
  profile,
  onOpenProfile,
}: {
  theme: Theme
  onToggleTheme: () => void
  profile: UserProfile
  onOpenProfile?: () => void
}) {
  const initials = initialsOf(profile.fullName) || "K"

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-background/80 px-6 py-4 backdrop-blur">
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search roles, skills, or organizations..."
          aria-label="Search"
          className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          {theme === "light" ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
        </button>
        <button
          aria-label="Filters"
          className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <SlidersHorizontal className="size-[18px]" />
        </button>
        <button
          onClick={onOpenProfile}
          className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          aria-label={`Open profile for ${profile.fullName}`}
          title={profile.fullName}
        >
          {initials}
        </button>
      </div>
    </header>
  )
}
