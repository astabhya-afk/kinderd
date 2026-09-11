"use client"

import { useState } from "react"
import { ArrowDownUp } from "lucide-react"
import { opportunities as allOpportunities, type Opportunity, type OpportunityType } from "@/lib/kindred-data"
import { cn } from "@/lib/utils"
import { OpportunityCard } from "./opportunity-card"

type Filter = "All" | OpportunityType

const filters: Filter[] = ["All", "Job", "Internship", "Gig", "Project", "Mentorship", "Club"]
const filterLabel: Record<Filter, string> = {
  All: "All",
  Job: "Jobs",
  Internship: "Internships",
  Gig: "Gigs",
  Project: "Projects",
  Mentorship: "Mentorship",
  Club: "Clubs",
}

export function OpportunityFeed({
  savedIds,
  onToggleSave,
  source = allOpportunities,
}: {
  savedIds: Set<string>
  onToggleSave: (id: string) => void
  source?: Opportunity[]
}) {
  const [active, setActive] = useState<Filter>("All")

  const visible = active === "All" ? source : source.filter((o) => o.type === active)

  const countFor = (f: Filter) =>
    f === "All" ? source.length : source.filter((o) => o.type === f).length

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.map((f) => {
            const isActive = active === f
            return (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border",
                )}
              >
                {filterLabel[f]}
                <span className={cn("text-xs", isActive ? "opacity-80" : "opacity-70")}>
                  {countFor(f)}
                </span>
              </button>
            )
          })}
        </div>

        <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowDownUp className="size-3.5" />
          Best match
        </button>
      </div>

      {visible.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {visible.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              saved={savedIds.has(opp.id)}
              onToggleSave={() => onToggleSave(opp.id)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm font-medium text-foreground">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No {active === "All" ? "opportunities" : filterLabel[active].toLowerCase()} to show.
          </p>
        </div>
      )}
    </section>
  )
}
