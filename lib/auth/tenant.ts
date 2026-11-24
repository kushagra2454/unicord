import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUserContext } from "@/lib/data/queries";
import { isUniversityAdmin, isUniversityStaff } from "@/lib/permissions/roles";
import type { Profile, University, UniversityMembership } from "@/types/database";

export interface TenantContext {
  userId: string;
  email: string | undefined;
  profile: Profile | null;
  university: University;
  membership: UniversityMembership | null;
  memberships: UniversityMembership[];
  isStaff: boolean;
  isAdmin: boolean;
  isPlatformAdmin: boolean;
}

export async function requireUniversityAccess(
  universitySlug: string
): Promise<TenantContext> {
  const ctx = await getCurrentUserContext();
  if (!ctx.configured || !ctx.user) {
    redirect(`/login?next=/${universitySlug}/dashboard`);
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect("/login?reason=supabase_unconfigured");
  }

  const { data: university } = await supabase
    .from("universities")
    .select("*")
    .eq("slug", universitySlug)
    .eq("environment", "production")
    .maybeSingle();

  if (!university) {
    redirect("/onboarding/university");
  }

  const membership =
    ctx.memberships.find(
      (m) => m.university_id === university.id && m.verification_status !== "rejected"
    ) ?? null;

  const isPlatformAdmin = Boolean(ctx.profile?.is_platform_admin);

  if (!membership && !isPlatformAdmin) {
    redirect("/onboarding/university");
  }

  return {
    userId: ctx.user.id,
    email: ctx.user.email,
    profile: ctx.profile,
    university: university as University,
    membership,
    memberships: ctx.memberships,
    isStaff: isUniversityStaff(membership, university.id, isPlatformAdmin),
    isAdmin: isUniversityAdmin(membership, university.id, isPlatformAdmin),
    isPlatformAdmin,
  };
}
