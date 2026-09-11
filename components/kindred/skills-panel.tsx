import { Plus, TrendingUp } from "lucide-react"
import { skills as sampleSkills, inDemandSkills, type UserProfile } from "@/lib/kindred-data"

function buildSkills(profile: UserProfile) {
  if (profile.skills.length === 0) return sampleSkills
  return profile.skills.map((name, i) => ({
    name,
    level: Math.max(60, 95 - i * 6),
    inDemand: inDemandSkills.has(name.toLowerCase()),
  }))
}

export function SkillsPanel({ profile }: { profile: UserProfile }) {
  const skills = buildSkills(profile)
  const inDemandCount = skills.filter((s) => s.inDemand).length
  const strength = Math.min(98, 40 + skills.length * 8 + inDemandCount * 4)

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Your skills</h2>
          <p className="text-xs text-muted-foreground">Drives every match below</p>
        </div>
        <button className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
          <Plus className="size-3.5" />
          Add
        </button>
      </div>

      <div className="mt-4 rounded-xl bg-muted p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Profile strength</span>
          <span className="font-bold text-primary">{strength}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-primary" style={{ width: `${strength}%` }} />
        </div>
        <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="size-3.5 text-primary" />
          Add 2 more skills to unlock 4 new matches
        </p>
      </div>

      <ul className="mt-4 flex flex-col gap-4">
        {skills.map((skill) => (
          <li key={skill.name}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{skill.name}</span>
              {skill.inDemand ? (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                  In demand
                </span>
              ) : null}
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
