import { opportunities as defaultCatalog, inDemandSkills, type Opportunity, type UserProfile } from "@/lib/kindred-data"

export type ScoredOpportunity = {
  id: string
  title: string
  org: string
  type: Opportunity["type"]
  score: number
  matchedSkills: string[]
  missingSkills: string[]
  location: string
  pay: string
  commitment: string
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

/**
 * Deterministic scoring pass over the opportunity catalog. This is the actual
 * "recommendation system" — it compares the signed-in user's declared skills
 * against each opportunity's required skills and produces a ranked,
 * explainable score. The AI agent calls this as a tool so its explanations
 * are grounded in real numbers instead of the model guessing a ranking.
 *
 * `catalog` defaults to the full static opportunity list (jobs, internships,
 * gigs, projects, mentorships, and campus clubs) but callers — like the
 * career-coach API route — can pass a filtered or database-backed catalog
 * instead, so the same scoring logic works for "career" matches and "club"
 * matches alike.
 */
export function scoreOpportunities(
  profile: UserProfile,
  limit?: number,
  catalog: Opportunity[] = defaultCatalog,
): ScoredOpportunity[] {
  const profileSkills = new Set(profile.skills.map(normalize))
  const yearsExperience = Number.parseInt(profile.yearsExperience, 10) || 0

  const scored = catalog.map((opp) => {
    const requiredSkills = [...opp.matchedSkills, ...(opp.extraSkill ? [opp.extraSkill] : [])]
    const matchedSkills = requiredSkills.filter((skill) => profileSkills.has(normalize(skill)))
    const missingSkills = requiredSkills.filter((skill) => !profileSkills.has(normalize(skill)))

    const skillCoverage = requiredSkills.length > 0 ? matchedSkills.length / requiredSkills.length : 0
    const inDemandBonus =
      matchedSkills.filter((skill) => inDemandSkills.has(normalize(skill))).length * 3

    const experienceFit =
      opp.type === "Mentorship" || opp.type === "Project" || opp.type === "Club"
        ? 5
        : Math.min(10, yearsExperience * 1.5)

    const baselineFit = opp.match * 0.5
    const score = Math.round(
      Math.min(99, baselineFit + skillCoverage * 40 + inDemandBonus + experienceFit),
    )

    return {
      id: opp.id,
      title: opp.title,
      org: opp.org,
      type: opp.type,
      score,
      matchedSkills,
      missingSkills,
      location: opp.location,
      pay: opp.pay,
      commitment: opp.commitment,
    }
  })

  scored.sort((a, b) => b.score - a.score)
  return typeof limit === "number" ? scored.slice(0, limit) : scored
}

export function findSkillGaps(profile: UserProfile, catalog: Opportunity[] = defaultCatalog): string[] {
  const profileSkills = new Set(profile.skills.map(normalize))
  const gapCounts = new Map<string, number>()

  for (const opp of catalog) {
    for (const skill of [...opp.matchedSkills, ...(opp.extraSkill ? [opp.extraSkill] : [])]) {
      if (!profileSkills.has(normalize(skill))) {
        gapCounts.set(skill, (gapCounts.get(skill) ?? 0) + 1)
      }
    }
  }

  return [...gapCounts.entries()].sort((a, b) => b[1] - a[1]).map(([skill]) => skill)
}
