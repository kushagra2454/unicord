import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isUniversityAdmin, isUniversityStaff } from "@/lib/permissions/roles";

const adminActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("review_membership"),
    universityId: z.string().uuid(),
    membershipId: z.string().uuid(),
    verificationStatus: z.enum(["verified", "rejected", "pending"]),
    role: z
      .enum(["student", "verified_student", "faculty_contributor", "moderator", "university_admin"])
      .optional(),
  }),
  z.object({
    action: z.literal("review_resource"),
    universityId: z.string().uuid(),
    resourceId: z.string().uuid(),
    verificationStatus: z.enum(["verified", "rejected", "unverified"]),
  }),
  z.object({
    action: z.literal("review_opportunity"),
    universityId: z.string().uuid(),
    opportunityId: z.string().uuid(),
    verificationStatus: z.enum(["verified_current", "rejected", "closed", "stale"]),
  }),
  z.object({
    action: z.literal("publish_announcement"),
    universityId: z.string().uuid(),
    title: z.string().trim().min(3).max(160),
    body: z.string().trim().min(5).max(2000),
    sourceUrl: z.string().trim().url().optional().or(z.literal("")),
    audience: z.enum(["all_members", "verified_students", "public"]).default("all_members"),
  }),
  z.object({
    action: z.literal("resolve_report"),
    universityId: z.string().uuid(),
    reportId: z.string().uuid(),
    status: z.enum(["resolved", "dismissed", "reviewing"]),
  }),
  z.object({
    action: z.literal("create_university"),
    name: z.string().trim().min(3).max(160),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9-]+$/),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    country: z.string().trim().default("India"),
    officialWebsite: z.string().trim().url(),
  }),
]);

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

  const payload = await request.json().catch(() => null);
  const parsed = adminActionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid admin action payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_platform_admin")
    .eq("id", user.id)
    .maybeSingle();
  const isPlatformAdmin = Boolean(profile?.is_platform_admin);

  const data = parsed.data;

  if (data.action === "create_university") {
    if (!isPlatformAdmin) {
      return NextResponse.json(
        { error: "Only platform administrators can create new university tenants" },
        { status: 403 }
      );
    }

    const { data: created, error } = await supabase
      .from("universities")
      .insert({
        name: data.name,
        slug: data.slug,
        city: data.city,
        state: data.state,
        country: data.country,
        official_website: data.officialWebsite,
        status: "active",
        environment: "production",
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("audit_logs").insert({
      university_id: created.id,
      actor_id: user.id,
      action: "create_university",
      target_type: "university",
      target_id: created.id,
      metadata: { name: data.name, slug: data.slug },
      environment: "production",
    });

    return NextResponse.json({ ok: true, university: created }, { status: 201 });
  }

  const { data: membership } = await supabase
    .from("university_memberships")
    .select("university_id, role, verification_status")
    .eq("university_id", data.universityId)
    .eq("user_id", user.id)
    .maybeSingle();

  const isStaff = isUniversityStaff(membership, data.universityId, isPlatformAdmin);
  const isAdmin = isUniversityAdmin(membership, data.universityId, isPlatformAdmin);

  if (!isStaff) {
    return NextResponse.json({ error: "Forbidden: university staff role required" }, { status: 403 });
  }

  if (data.action === "review_membership") {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only university admins can approve memberships or assign roles" },
        { status: 403 }
      );
    }

    const updateFields: Record<string, unknown> = {
      verification_status: data.verificationStatus,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    };
    if (data.role) {
      updateFields.role = data.role;
    }

    const { error } = await supabase
      .from("university_memberships")
      .update(updateFields)
      .eq("id", data.membershipId)
      .eq("university_id", data.universityId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else if (data.action === "review_resource") {
    const { error } = await supabase
      .from("resources")
      .update({
        verification_status: data.verificationStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.resourceId)
      .eq("university_id", data.universityId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else if (data.action === "review_opportunity") {
    const { error } = await supabase
      .from("opportunities")
      .update({
        verification_status: data.verificationStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.opportunityId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else if (data.action === "publish_announcement") {
    const { error } = await supabase.from("announcements").insert({
      university_id: data.universityId,
      title: data.title,
      body: data.body,
      source_url: data.sourceUrl || null,
      audience: data.audience,
      status: "published",
      created_by: user.id,
      environment: "production",
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else if (data.action === "resolve_report") {
    const { error } = await supabase
      .from("reports")
      .update({
        status: data.status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.reportId)
      .eq("university_id", data.universityId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("audit_logs").insert({
    university_id: data.universityId,
    actor_id: user.id,
    action: data.action,
    target_type: "admin_moderation",
    metadata: data,
    environment: "production",
  });

  return NextResponse.json({ ok: true });
}
