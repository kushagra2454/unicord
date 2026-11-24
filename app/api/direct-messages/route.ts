import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { hasActiveMembership } from "@/lib/permissions/roles";
import { directMessageCreateSchema } from "@/lib/validation/schemas";

const startSchema = z.object({
  universityId: z.string().uuid(),
  recipientId: z.string().uuid(),
});

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

  const rl = checkRateLimit(`dm:${user.id}`, 30, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Direct message rate limit reached" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);

  // Branch A: Start a conversation
  if (body && "recipientId" in body) {
    const parsed = startSchema.safeParse(body);
    if (!parsed.success || parsed.data.recipientId === user.id) {
      return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
    }

    const [{ data: myMember }, { data: theirMember }, { data: block }] = await Promise.all([
      supabase
        .from("university_memberships")
        .select("university_id, verification_status")
        .eq("university_id", parsed.data.universityId)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("university_memberships")
        .select("university_id, verification_status")
        .eq("university_id", parsed.data.universityId)
        .eq("user_id", parsed.data.recipientId)
        .maybeSingle(),
      supabase
        .from("user_blocks")
        .select("blocker_id")
        .or(
          `and(blocker_id.eq.${user.id},blocked_id.eq.${parsed.data.recipientId}),and(blocker_id.eq.${parsed.data.recipientId},blocked_id.eq.${user.id})`
        )
        .maybeSingle(),
    ]);

    if (
      !hasActiveMembership(myMember, parsed.data.universityId) ||
      !hasActiveMembership(theirMember, parsed.data.universityId)
    ) {
      return NextResponse.json(
        { error: "Both users must belong to the same active university" },
        { status: 403 }
      );
    }

    if (block) {
      return NextResponse.json({ error: "Conversation blocked by user settings" }, { status: 403 });
    }

    const admin = createAdminSupabaseClient() ?? supabase;
    const { data: conv, error: convErr } = await admin
      .from("conversations")
      .insert({ university_id: parsed.data.universityId, environment: "production" })
      .select("id")
      .single();

    if (convErr || !conv) {
      return NextResponse.json(
        { error: convErr?.message || "Failed to create conversation" },
        { status: 500 }
      );
    }

    await admin.from("conversation_members").insert([
      { conversation_id: conv.id, user_id: user.id },
      { conversation_id: conv.id, user_id: parsed.data.recipientId },
    ]);

    return NextResponse.json({ ok: true, conversationId: conv.id }, { status: 201 });
  }

  // Branch B: Send a direct message
  const parsedMsg = directMessageCreateSchema.safeParse(body);
  if (!parsedMsg.success) {
    return NextResponse.json({ error: "Invalid direct message payload" }, { status: 400 });
  }

  const { data: member } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", parsedMsg.data.conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ error: "Not a participant in this conversation" }, { status: 403 });
  }

  const { data: dm, error } = await supabase
    .from("direct_messages")
    .insert({
      conversation_id: parsedMsg.data.conversationId,
      sender_id: user.id,
      body: parsedMsg.data.body,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, directMessage: dm }, { status: 201 });
}
