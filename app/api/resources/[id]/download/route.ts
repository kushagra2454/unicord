import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { canAccessResource } from "@/lib/permissions/roles";
import type { AcademicResource } from "@/types/database";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const { data: resource } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .eq("environment", "production")
    .maybeSingle();

  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from("profiles").select("is_platform_admin").eq("id", user.id).maybeSingle(),
    supabase
      .from("university_memberships")
      .select("university_id, role, verification_status")
      .eq("university_id", resource.university_id)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const allowed = canAccessResource(
    resource as AcademicResource,
    membership,
    user.id,
    Boolean(profile?.is_platform_admin)
  );

  if (!allowed) {
    return NextResponse.json(
      { error: "You are not authorized to download this resource" },
      { status: 403 }
    );
  }

  const storageClient = createAdminSupabaseClient() ?? supabase;
  const { data: signed, error: signErr } = await storageClient.storage
    .from("academic-resources")
    .createSignedUrl(resource.storage_path, 60, {
      download: resource.original_filename,
    });

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json(
      { error: signErr?.message || "Unable to create signed download URL" },
      { status: 500 }
    );
  }

  if (createAdminSupabaseClient()) {
    await storageClient
      .from("resources")
      .update({ download_count: (resource.download_count ?? 0) + 1 })
      .eq("id", resource.id);
  }

  return NextResponse.json({
    ok: true,
    signedUrl: signed.signedUrl,
    expiresInSeconds: 60,
  });
}
