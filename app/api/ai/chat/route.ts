import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { hasActiveMembership } from "@/lib/permissions/roles";
import { aiChatRequestSchema } from "@/lib/validation/schemas";
import { generateGroundedResponse, type CitationRef } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(`ai:${user.id}`, 15, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "AI rate limit reached. Please wait a few minutes before asking again." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = aiChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid AI prompt payload" }, { status: 400 });
  }

  let universityName = "Unicord Campus";
  const citations: CitationRef[] = [];
  const contextLines: string[] = [];

  if (parsed.data.universityId) {
    const [{ data: membership }, { data: profile }, { data: uni }] = await Promise.all([
      supabase
        .from("university_memberships")
        .select("university_id, verification_status")
        .eq("university_id", parsed.data.universityId)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("profiles").select("is_platform_admin").eq("id", user.id).maybeSingle(),
      supabase
        .from("universities")
        .select("id, name, official_website")
        .eq("id", parsed.data.universityId)
        .eq("environment", "production")
        .maybeSingle(),
    ]);

    if (!uni) {
      return NextResponse.json({ error: "University not found" }, { status: 404 });
    }

    if (
      !profile?.is_platform_admin &&
      !hasActiveMembership(membership, parsed.data.universityId)
    ) {
      return NextResponse.json(
        { error: "You are not authorized to query this university's data" },
        { status: 403 }
      );
    }

    universityName = uni.name;

    // Permission-aware retrieval: only verified institutional content, verified resources in user's tenant, and non-rejected production opportunities
    const [{ data: inst }, { data: cals }, { data: resRows }, { data: opps }] =
      await Promise.all([
        supabase
          .from("institutional_content")
          .select("title, summary, source_url, last_fetched_at")
          .eq("university_id", uni.id)
          .eq("environment", "production")
          .in("verification_status", ["verified_official", "stale"])
          .limit(6),
        supabase
          .from("academic_terms")
          .select("name, academic_year, document_url, source_url")
          .eq("university_id", uni.id)
          .limit(5),
        supabase
          .from("resources")
          .select("id, title, subject_name, resource_type, exam_year")
          .eq("university_id", uni.id)
          .eq("environment", "production")
          .eq("verification_status", "verified")
          .limit(6),
        supabase
          .from("opportunities")
          .select("id, title, organization, category, source_url, verification_status")
          .eq("environment", "production")
          .in("verification_status", ["verified_current", "source_listed_unreviewed"])
          .limit(6),
      ]);

    for (const row of inst ?? []) {
      contextLines.push(`[Institutional] ${row.title}: ${row.summary} (Source: ${row.source_url})`);
      citations.push({
        title: row.title,
        url: row.source_url,
        type: "institutional_content",
      });
    }

    for (const cal of cals ?? []) {
      const url = cal.document_url || cal.source_url;
      contextLines.push(`[Academic Calendar ${cal.academic_year}] ${cal.name} (${url})`);
      citations.push({ title: cal.name, url, type: "academic_calendar" });
    }

    for (const r of resRows ?? []) {
      contextLines.push(
        `[Verified Resource] ${r.title} (${r.resource_type}, ${r.subject_name || "General"}${
          r.exam_year ? `, ${r.exam_year}` : ""
        })`
      );
    }

    for (const o of opps ?? []) {
      contextLines.push(
        `[Opportunity: ${o.verification_status}] ${o.title} at ${o.organization} (${o.source_url})`
      );
      citations.push({
        title: `${o.title} (${o.organization})`,
        url: o.source_url,
        type: "opportunity",
      });
    }
  }

  const aiResult = await generateGroundedResponse({
    persona: parsed.data.persona,
    prompt: parsed.data.prompt,
    universityName,
    citations: citations.slice(0, 8),
    retrievedContextText: contextLines.join("\n"),
  });

  // Persist user-controlled AI conversation
  let convId = parsed.data.conversationId || null;
  if (!convId) {
    const { data: conv } = await supabase
      .from("ai_conversations")
      .insert({
        user_id: user.id,
        university_id: parsed.data.universityId || null,
        persona: parsed.data.persona,
        title: parsed.data.prompt.slice(0, 60),
        environment: "production",
      })
      .select("id")
      .single();
    convId = conv?.id ?? null;
  }

  if (convId) {
    await supabase.from("ai_messages").insert([
      {
        conversation_id: convId,
        role: "user",
        content: parsed.data.prompt,
        source_refs: [],
      },
      {
        conversation_id: convId,
        role: "assistant",
        content: aiResult.answer,
        source_refs: aiResult.citations,
      },
    ]);
  }

  return NextResponse.json({
    ok: true,
    conversationId: convId,
    configured: aiResult.configured,
    answer: aiResult.answer,
    citations: aiResult.citations,
    modelUsed: aiResult.modelUsed,
  });
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }

  await supabase
    .from("ai_conversations")
    .delete()
    .eq("id", conversationId)
    .eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
