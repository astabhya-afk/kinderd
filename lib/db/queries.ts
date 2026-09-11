import { db } from "./index"
import { opportunities as opportunitiesTable } from "./schema"
import { opportunities as staticCatalog, type Opportunity } from "@/lib/kindred-data"

/**
 * Reads the full opportunity catalog (jobs, internships, gigs, projects,
 * mentorships, and campus clubs) from Postgres. Falls back to the bundled
 * static catalog in lib/kindred-data.ts if the table hasn't been seeded yet
 * (see lib/db/seed.ts) or the database isn't reachable — e.g. local dev
 * without DATABASE_URL set — so the app and the AI coach keep working
 * either way.
 */
export async function getOpportunityCatalog(): Promise<Opportunity[]> {
  try {
    const rows = await db.select().from(opportunitiesTable)
    if (rows.length > 0) {
      return rows.map((row) => ({
        ...row,
        isNew: row.isNew ?? undefined,
        extraSkill: row.extraSkill ?? undefined,
        category: row.category ?? undefined,
      })) as Opportunity[]
    }
  } catch (err) {
    console.error("[kindred] opportunities DB read failed, falling back to static catalog:", err)
  }
  return staticCatalog
}
