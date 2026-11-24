import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const joinSchema = z.object({
  universityId: z.string().uuid(),
  schoolId: z.string().uuid().optional().nullable(),
  programme: z.string().trim().max(120).optional().nullable(),
  yearOfStudy: z.coerce.number().int().min(1).max(8).optional().nullable(),
  semester: z.coerce.number().int().min(1).max(12).optional().nullable(),
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
  const parsed = joinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid join request payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Always force role='student' and verification_status='pending' server-side
  const { data: existing } = await supabase
    .from("university_memberships")
    .select("id")
    .eq("university_id", parsed.data.universityId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, alreadyMember: true });
  }

  const { error } = await supabase.from("university_memberships").insert({
    university_id: parsed.data.universityId,
    user_id: user.id,
    role: "student",
    verification_status: "pending",
    school_id: parsed.data.schoolId || null,
    programme: parsed.data.programme || null,
    year_of_study: parsed.data.yearOfStudy || null,
    semester: parsed.data.semester || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase
    .from("profiles")
    .update({ active_university_id: parsed.data.universityId })
    .eq("id", user.id);

  return NextResponse.json({ ok: true, status: "pending" }, { status: 201 });
}
