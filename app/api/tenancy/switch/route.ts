import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const switchSchema = z.object({
  universityId: z.string().uuid(),
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

  const body = await request.json().catch(() => null);
  const parsed = switchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid universityId" }, { status: 400 });
  }

  // Verify the user actually holds a non-rejected membership in the target university
  const { data: membership } = await supabase
    .from("university_memberships")
    .select("id, verification_status")
    .eq("university_id", parsed.data.universityId)
    .eq("user_id", user.id)
    .neq("verification_status", "rejected")
    .maybeSingle();

  if (!membership) {
    return NextResponse.json(
      { error: "Membership required for this university" },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ active_university_id: parsed.data.universityId })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, activeUniversityId: parsed.data.universityId });
}
