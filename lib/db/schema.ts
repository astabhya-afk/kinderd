import { pgTable, text, timestamp, boolean, serial, integer, jsonb } from "drizzle-orm/pg-core"
import type { ExperienceEntry, OpportunityType, ClubCategory } from "@/lib/kindred-data"

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- App tables ------------------------------------------------------------
// One profile row per user. Scoped by `userId` (no FK by default).

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull().unique(),
  fullName: text("fullName").notNull().default(""),
  age: text("age").notNull().default(""),
  title: text("title").notNull().default(""),
  location: text("location").notNull().default(""),
  yearsExperience: text("yearsExperience").notNull().default(""),
  summary: text("summary").notNull().default(""),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  experiences: jsonb("experiences").$type<ExperienceEntry[]>().notNull().default([]),
  savedIds: jsonb("savedIds").$type<string[]>().notNull().default([]),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// The opportunity catalog: jobs, internships, gigs, projects, mentorships,
// and campus clubs (cultural, technical, special-interest, sports). This is
// the same shape as the `Opportunity` type in lib/kindred-data.ts — that
// static catalog is the seed source (see lib/db/seed.ts) and doubles as a
// fallback the app and the AI coach read from if the DB isn't reachable.
export const opportunities = pgTable("opportunities", {
  id: text("id").primaryKey(),
  type: text("type").$type<OpportunityType>().notNull(),
  title: text("title").notNull(),
  org: text("org").notNull(),
  isNew: boolean("isNew").notNull().default(false),
  match: integer("match").notNull().default(0),
  description: text("description").notNull().default(""),
  location: text("location").notNull().default(""),
  pay: text("pay").notNull().default(""),
  commitment: text("commitment").notNull().default(""),
  matchedCount: integer("matchedCount").notNull().default(0),
  totalSkills: integer("totalSkills").notNull().default(0),
  matchedSkills: jsonb("matchedSkills").$type<string[]>().notNull().default([]),
  extraSkill: text("extraSkill"),
  // Only set for type === "Club" — groups the club directory into sections.
  category: text("category").$type<ClubCategory>(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})
