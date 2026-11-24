import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateGroundedResponse } from "@/lib/ai/gemini";
import { JECRC_OFFICIAL_CALENDAR_DOCS, JECRC_OFFICIAL_SOURCES } from "@/lib/sources/jecrc";

const demoAiSchema = z.object({
  persona: z.enum([
    "study_buddy",
    "campus_guide",
    "placement_mentor",
    "project_partner",
    "opportunity_finder",
  ]),
  prompt: z.string().trim().min(2).max(1000),
});

export async function POST(request: Request) {
  const rl = checkRateLimit("demo-ai", 20, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Demo AI rate limit reached" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = demoAiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid demo AI prompt" }, { status: 400 });
  }

  const citations = [
    ...JECRC_OFFICIAL_CALENDAR_DOCS.slice(0, 2).map((c) => ({
      title: c.title,
      url: c.documentUrl,
      type: "academic_calendar" as const,
    })),
    ...JECRC_OFFICIAL_SOURCES.slice(0, 2).map((s) => ({
      title: s.name,
      url: s.sourceUrl,
      type: "institutional_content" as const,
    })),
  ];

  const contextText = [
    "DEMO ENVIRONMENT — SIMULATED CONTEXT ONLY.",
    ...JECRC_OFFICIAL_SOURCES.map((s) => `${s.name}: ${s.summary} (${s.sourceUrl})`),
    ...JECRC_OFFICIAL_CALENDAR_DOCS.map((c) => `${c.title} [${c.academicYear}]: ${c.documentUrl}`),
  ].join("\n");

  const result = await generateGroundedResponse({
    persona: parsed.data.persona,
    prompt: parsed.data.prompt,
    universityName: "JECRC University (Demo Sandbox)",
    citations,
    retrievedContextText: contextText,
  });

  if (!result.configured) {
    return NextResponse.json({
      ok: true,
      mode: "scripted_walkthrough",
      configured: false,
      answer: `[SCRIPTED DEMO WALKTHROUGH — GEMINI_API_KEY NOT CONFIGURED]\n\nPersona: ${parsed.data.persona}\nYou asked: "${parsed.data.prompt}"\n\nIn live production, Unicord queries the authenticated student's authorized university records (resources, academic calendars, and non-expired opportunities) and sends only permitted context to the Gemini API server-side.\n\nTo enable live Gemini responses here in Demo Mode, configure GEMINI_API_KEY in .env.local.`,
      citations,
    });
  }

  return NextResponse.json({
    ok: true,
    mode: "live_gemini_demo",
    configured: true,
    answer: result.answer,
    citations: result.citations,
    modelUsed: result.modelUsed,
  });
}
