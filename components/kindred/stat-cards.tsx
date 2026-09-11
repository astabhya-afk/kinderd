import { stats } from "@/lib/kindred-data"
import { cn } from "@/lib/utils"

const dotTone: Record<string, string> = {
  primary: "bg-primary",
  amber: "bg-amber-500",
  green: "bg-emerald-500",
  blue: "bg-sky-500",
}

export function StatCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className={cn("size-2 rounded-full", dotTone[stat.tone])} />
            <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
        </div>
      ))}
    </div>
  )
}
