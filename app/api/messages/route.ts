import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { canPostInChannel, isUniversityStaff } from "@/lib/permissions/roles";
import { messageCreateSchema } from "@/lib/validation/schemas";

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

  const rl = checkRateLimit(`msg:${user.id}`, 30, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Slow down — message rate limit reached" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = messageCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message payload" }, { status: 400 });
  }

  const [{ data: profile }, { data: membership }, { data: channel }] = await Promise.all([
    supabase.from("profiles").select("is_platform_admin").eq("id", user.id).maybeSingle(),
    supabase
      .from("university_memberships")
      .select("university_id, role, verification_status")
      .eq("university_id", parsed.data.universityId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("channels")
      .select("id, university_id, is_read_only, requires_verified_student")
      .eq("id", parsed.data.channelId)
      .eq("university_id", parsed.data.universityId)
      .maybeSingle(),
  ]);

  if (!channel) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  const isStaff = isUniversityStaff(
    membership,
    channel.university_id,
    Boolean(profile?.is_platform_admin)
  );
  if (!canPostInChannel(channel, membership, Boolean(profile?.is_platform_admin)) && !isStaff) {
    return NextResponse.json(
      { error: "You do not have permission to post in this channel" },
      { status: 403 }
    );
  }

  const { data: msg, error } = await supabase
    .from("messages")
    .insert({
      university_id: channel.university_id,
      channel_id: channel.id,
      sender_id: user.id,
      body: parsed.data.body,
      reply_to_id: parsed.data.replyToId || null,
      environment: "production",
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: msg }, { status: 201 });
}
