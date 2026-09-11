import { MapPin, Calendar, Briefcase, Clock, User } from "lucide-react"
import type { UserProfile } from "@/lib/kindred-data"

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function ProfileView({ profile }: { profile: UserProfile }) {
  const initials = initialsOf(profile.fullName) || "K"

  const details = [
    profile.location ? { icon: MapPin, text: profile.location } : null,
    profile.age ? { icon: Calendar, text: `${profile.age} years old` } : null,
    profile.yearsExperience ? { icon: Clock, text: `${profile.yearsExperience} yrs experience` } : null,
  ].filter(Boolean) as { icon: typeof MapPin; text: string }[]

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{profile.fullName}</h2>
            <p className="text-sm text-muted-foreground">{profile.title}</p>
          </div>
        </div>

        {details.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {details.map((d, i) => (
              <li key={i} className="inline-flex items-center gap-1.5">
                <d.icon className="size-4 text-primary" />
                {d.text}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h3 className="inline-flex items-center gap-2 text-base font-bold text-foreground">
          <User className="size-4 text-primary" />
          About me
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {profile.summary || "No summary added yet. Edit your profile to tell others about your work and focus."}
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-base font-bold text-foreground">Skills</h3>
        <p className="text-xs text-muted-foreground">The skills you chose during setup.</p>
        {profile.skills.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <li key={skill}>
                <span className="inline-flex items-center rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground">
                  {skill}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No skills added yet.</p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-base font-bold text-foreground">Work experience</h3>
        {profile.experiences.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-3">
            {profile.experiences.map((exp, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-border p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Briefcase className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{exp.role || "Role"}</p>
                  <p className="text-sm text-muted-foreground">
                    {exp.company}
                    {exp.duration ? ` · ${exp.duration}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No work experience added yet.</p>
        )}
      </section>
    </div>
  )
}
