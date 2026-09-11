"use client"

import { useEffect, useMemo, useState } from "react"
import { Sparkles, Bookmark } from "lucide-react"
import { Sidebar, type NavView } from "./sidebar"
import { Topbar } from "./topbar"
import { StatCards } from "./stat-cards"
import { OpportunityFeed } from "./opportunity-feed"
import { SkillsPanel } from "./skills-panel"
import { ProfileView } from "./profile-view"
import { AuthLogin } from "./auth-login"
import { ProfileSetup } from "./profile-setup"
import { CareerCoach } from "./career-coach"
import { opportunities, type UserProfile } from "@/lib/kindred-data"
import { getAccountProfile, saveAccountProfile } from "@/lib/kindred-auth"

type Theme = "light" | "dark"

export function AppShell() {
  const [authed, setAuthed] = useState(false)
  const [theme, setTheme] = useState<Theme>("light")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loginEmail, setLoginEmail] = useState("")
  const [view, setView] = useState<NavView>("For you")
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const stored = (localStorage.getItem("kindred-theme") as Theme | null) ?? "light"
    setTheme(stored)
    const storedSaved = localStorage.getItem("kindred-saved")
    if (storedSaved) {
      try {
        setSavedIds(new Set(JSON.parse(storedSaved) as string[]))
      } catch {
        // ignore malformed saved list
      }
    }
  }, [])

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem("kindred-saved", JSON.stringify([...next]))
      return next
    })
  }

  const savedOpportunities = useMemo(
    () => opportunities.filter((o) => savedIds.has(o.id)),
    [savedIds],
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    root.style.colorScheme = theme
    localStorage.setItem("kindred-theme", theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"))

  const handleSignIn = (email: string) => {
    setLoginEmail(email)
    setProfile(getAccountProfile(email))
    setAuthed(true)
  }

  const handleProfileComplete = (next: UserProfile) => {
    setProfile(next)
    saveAccountProfile(loginEmail, next)
  }

  const handleSignOut = () => {
    setAuthed(false)
    setProfile(null)
    setLoginEmail("")
    setView("For you")
  }

  if (!authed) {
    return <AuthLogin theme={theme} onToggleTheme={toggleTheme} onSignIn={handleSignIn} />
  }

  if (!profile) {
    const defaultName = loginEmail ? loginEmail.split("@")[0] : undefined
    return (
      <ProfileSetup
        theme={theme}
        onToggleTheme={toggleTheme}
        defaultName={defaultName}
        onComplete={handleProfileComplete}
      />
    )
  }

  const firstName = profile.fullName.split(" ")[0]

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="hidden lg:block">
        <Sidebar
          profile={profile}
          active={view}
          onNavigate={setView}
          savedCount={savedIds.size}
          onSignOut={handleSignOut}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          theme={theme}
          onToggleTheme={toggleTheme}
          profile={profile}
          onOpenProfile={() => setView("Profile")}
        />

        <main className="flex-1 px-6 py-6">
          {view === "For you" ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                <Sparkles className="size-3.5" />
                12 new matches ranked for you
              </span>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                Good to see you, {firstName}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Opportunities are scored against your skills, so the strongest fits rise to the top.
              </p>

              <div className="mt-6">
                <StatCards />
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
                <OpportunityFeed savedIds={savedIds} onToggleSave={toggleSaved} />
                <aside className="order-first lg:order-last">
                  <div className="lg:sticky lg:top-24">
                    <SkillsPanel profile={profile} />
                  </div>
                </aside>
              </div>
            </>
          ) : null}

          {view === "Saved" ? (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Saved</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {savedOpportunities.length > 0
                  ? `${savedOpportunities.length} opportunit${
                      savedOpportunities.length === 1 ? "y" : "ies"
                    } you bookmarked.`
                  : "Bookmark opportunities from your feed and they will show up here."}
              </p>

              <div className="mt-6">
                {savedOpportunities.length > 0 ? (
                  <OpportunityFeed
                    savedIds={savedIds}
                    onToggleSave={toggleSaved}
                    source={savedOpportunities}
                  />
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Bookmark className="size-5" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-foreground">No saved opportunities yet</p>
                    <button
                      onClick={() => setView("For you")}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Browse opportunities
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : null}

          {view === "My skills" ? (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">My skills</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                These skills power every match in your feed.
              </p>
              <div className="mt-6 max-w-xl">
                <SkillsPanel profile={profile} />
              </div>
            </>
          ) : null}

          {view === "Profile" ? (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Everything you shared during setup.
              </p>
              <div className="mt-6 max-w-3xl">
                <ProfileView profile={profile} />
              </div>
            </>
          ) : null}
        </main>
      </div>

      <CareerCoach profile={profile} />
    </div>
  )
}
