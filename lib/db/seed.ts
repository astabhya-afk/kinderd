/**
 * Seeds the `opportunities` table from the static catalog in
 * lib/kindred-data.ts — jobs, internships, gigs, projects, mentorships, and
 * the full campus club directory (cultural, technical, special-interest,
 * and sports clubs). Safe to re-run: existing rows are updated in place by
 * `id`, so this doubles as the way to push catalog edits to the DB.
 *
 * Usage:
 *   pnpm db:seed
 *
 * Requires DATABASE_URL to be set (checks .env.local, then .env).
 */
import { config } from "dotenv"
import { existsSync } from "node:fs"

if (existsSync(".env.local")) config({ path: ".env.local" })
else config()

import { db, pool } from "./index"
import { opportunities as opportunitiesTable } from "./schema"
import { opportunities as catalog } from "../kindred-data"

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("[kindred] DATABASE_URL is not set — add it to .env.local before seeding.")
    process.exit(1)
  }

  const clubCount = catalog.filter((o) => o.type === "Club").length
  console.log(
    `[kindred] seeding ${catalog.length} opportunities (${clubCount} campus clubs, ${
      catalog.length - clubCount
    } jobs/internships/gigs/projects/mentorships)...`,
  )

  for (const opp of catalog) {
    const row = {
      id: opp.id,
      type: opp.type,
      title: opp.title,
      org: opp.org,
      isNew: opp.isNew ?? false,
      match: opp.match,
      description: opp.description,
      location: opp.location,
      pay: opp.pay,
      commitment: opp.commitment,
      matchedCount: opp.matchedCount,
      totalSkills: opp.totalSkills,
      matchedSkills: opp.matchedSkills,
      extraSkill: opp.extraSkill ?? null,
      category: opp.category ?? null,
    }

    await db
      .insert(opportunitiesTable)
      .values(row)
      .onConflictDoUpdate({ target: opportunitiesTable.id, set: row })
  }

  console.log("[kindred] seed complete.")
  await pool.end()
}

main().catch((err) => {
  console.error("[kindred] seed failed:", err)
  process.exit(1)
})
