import { convertToModelMessages, streamText, tool, type UIMessage } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { z } from "zod"
import { scoreOpportunities, findSkillGaps } from "@/lib/recommendation-engine"
import { getOpportunityCatalog } from "@/lib/db/queries"
import type { UserProfile } from "@/lib/kindred-data"

export const maxDuration = 30

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.error("[kindred] GROQ_API_KEY is not set — add it to .env.local.")
      return new Response(
        JSON.stringify({ error: "The coach isn't configured yet. Add GROQ_API_KEY to .env.local and restart the dev server." }),
        { status: 500, headers: { "content-type": "application/json" } },
      )
    }

    const { messages, profile }: { messages: UIMessage[]; profile: UserProfile } = await req.json()

    // DB-backed catalog (falls back to the static one in lib/kindred-data.ts
    // if the table isn't seeded / reachable — see lib/db/queries.ts).
    const catalog = await getOpportunityCatalog()
    const careerCatalog = catalog.filter((o) => o.type !== "Club")
    const clubCatalog = catalog.filter((o) => o.type === "Club")

    const profileSummary = `
Name: ${profile.fullName || "Unknown"}
Title: ${profile.title || "Not specified"}
Location: ${profile.location || "Not specified"}
Years of experience: ${profile.yearsExperience || "0"}
Summary: ${profile.summary || "No summary provided"}
Skills: ${profile.skills.length > 0 ? profile.skills.join(", ") : "No skills listed yet"}
`.trim()

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You are Kindred's recommendation agent. You help the signed-in user understand and act on their personalized matches across two kinds of opportunities:

1. Career opportunities — jobs, internships, gigs, projects, and mentorships.
2. Campus clubs — cultural & performing arts, technical & academic, special-interest & social, and sports clubs.

Here is the user's profile:
${profileSummary}

Always ground your answers in the "getRecommendations" (career opportunities), "getClubRecommendations" (campus clubs), and "getSkillGaps" (career skill gaps) tools — never invent a match score, club, or skill gap yourself. When you recommend something, briefly explain why it fits using the matched skills/interests the tool returned. Keep answers concise, warm, and actionable. If the user's profile has no skills yet, encourage them to add some so matching improves. If the user asks about clubs, hobbies, or extracurriculars, use "getClubRecommendations" rather than "getRecommendations".`,
      messages: convertToModelMessages(messages),
      tools: {
        getRecommendations: tool({
          description:
            "Get the user's career opportunities (jobs, internships, gigs, projects, mentorships) ranked by fit score, computed from their skills against each opportunity's requirements.",
          inputSchema: z.object({
            limit: z.number().int().min(1).max(10).optional().describe("Max number of results to return."),
          }),
          execute: async ({ limit }) => scoreOpportunities(profile, limit ?? 5, careerCatalog),
        }),
        getClubRecommendations: tool({
          description:
            "Get campus clubs (cultural & performing arts, technical & academic, special-interest & social, sports) ranked by fit against the user's declared skills and interests.",
          inputSchema: z.object({
            limit: z.number().int().min(1).max(10).optional().describe("Max number of results to return."),
          }),
          execute: async ({ limit }) => scoreOpportunities(profile, limit ?? 5, clubCatalog),
        }),
        getSkillGaps: tool({
          description:
            "Get the skills most frequently missing from the user's profile across career opportunities (jobs, internships, gigs, projects, mentorships), ordered by how often they'd unlock a match.",
          inputSchema: z.object({}),
          execute: async () => findSkillGaps(profile, careerCatalog).slice(0, 6),
        }),
      },
      onError: ({ error }) => {
        console.error("[kindred] career-coach streamText error:", error)
      },
    })

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error("[kindred] career-coach stream error:", error)
        // Errors are masked by default; surface a friendly message to the client instead.
        return "Something went wrong while getting your recommendations. Please try again."
      },
    })
  } catch (err) {
    console.error("[kindred] career-coach route error:", err)
    return new Response(
      JSON.stringify({ error: "Something went wrong talking to the coach. Please try again." }),
      { status: 500, headers: { "content-type": "application/json" } },
    )
  }
}
