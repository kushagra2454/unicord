import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
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

  const [
    { data: profile },
    { data: memberships },
    { data: resources },
    { data: opportunitySaves },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("university_memberships").select("*").eq("user_id", user.id),
    supabase.from("resources").select("id, title, resource_type, verification_status, created_at").eq("uploaded_by", user.id),
    supabase.from("opportunity_saves").select("opportunity_id, application_status, created_at").eq("user_id", user.id),
  ]);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    account: { id: user.id, email: user.email },
    profile,
    memberships: memberships ?? [],
    uploadedResources: resources ?? [],
    savedOpportunities: opportunitySaves ?? [],
  };

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="unicord-export-${user.id.slice(0, 8)}.json"`,
    },
  });
}
