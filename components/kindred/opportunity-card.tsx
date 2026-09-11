"use client"

import {
  MapPin,
  Wallet,
  Clock,
  Check,
  ArrowUpRight,
  Bookmark,
  Briefcase,
  Zap,
  GraduationCap,
  Layers,
  BadgeCheck,
  Users,
} from "lucide-react"
import type { Opportunity, OpportunityType } from "@/lib/kindred-data"
import { cn } from "@/lib/utils"
import { MatchRing } from "./match-ring"

const typeMeta: Record<OpportunityType, { icon: typeof Briefcase; label: string }> = {
  Job: { icon: Briefcase, label: "Job" },
  Internship: { icon: BadgeCheck, label: "Internship" },
  Gig: { icon: Zap, label: "Gig" },
  Project: { icon: Layers, label: "Project" },
  Mentorship: { icon: GraduationCap, label: "Mentorship" },
  Club: { icon: Users, label: "Club" },
}

export function OpportunityCard({
  opp,
  saved,
  onToggleSave,
}: {
  opp: Opportunity
  saved: boolean
  onToggleSave: () => void
}) {
  const meta = typeMeta[opp.type]

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <meta.icon className="size-3.5" />
            {meta.label}
          </span>
          {opp.isNew ? (
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
              New
            </span>
          ) : null}
        </div>
        <MatchRing value={opp.match} />
      </div>

      <div className="mt-3">
        <h3 className="text-lg font-bold leading-snug text-foreground">{opp.title}</h3>
        <p className="text-sm text-muted-foreground">{opp.org}</p>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{opp.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-3.5" />
          {opp.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Wallet className="size-3.5" />
          {opp.pay}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" />
          {opp.commitment}
        </span>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="text-xs font-medium text-foreground">
          Matched {opp.matchedCount} of {opp.totalSkills} key skills
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {opp.matchedSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
            >
              <Check className="size-3" />
              {skill}
            </span>
          ))}
          {opp.extraSkill ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
              + {opp.extraSkill}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          {opp.type === "Club" ? "Join" : "Apply"}
          <ArrowUpRight className="size-4" />
        </button>
        <button
          onClick={onToggleSave}
          aria-label={saved ? "Remove from saved" : "Save opportunity"}
          aria-pressed={saved}
          className={cn(
            "flex size-11 items-center justify-center rounded-xl border border-border transition-colors",
            saved ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Bookmark className={cn("size-[18px]", saved && "fill-current")} />
        </button>
      </div>
    </article>
  )
}
