import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { opportunitySaveSchema } from "@/lib/validation/schemas";

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
  const parsed = opportunitySaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid tracking payload" }, { status: 400 });
  }

  const { error } = await supabase.from("opportunity_saves").upsert(
    {
      user_id: user.id,
      opportunity_id: parsed.data.opportunityId,
      application_status: parsed.data.applicationStatus,
      private_notes: parsed.data.privateNotes,
    },
    { onConflict: "user_id,opportunity_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
