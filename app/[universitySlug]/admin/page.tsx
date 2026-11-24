import { redirect } from "next/navigation";
import { requireUniversityAccess } from "@/lib/auth/tenant";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AlertBanner, PageHeader } from "@/components/ui/primitives";
import { AdminConsoleClient } from "@/components/admin/AdminConsoleClient";

export const dynamic = "force-dynamic";

export default async function UniversityAdminPage({
  params,
}: {
  params: Promise<{ universitySlug: string }>;
}) {
  const { universitySlug } = await params;
  const tenant = await requireUniversityAccess(universitySlug);

  if (!tenant.isStaff) {
    redirect(`/${universitySlug}/dashboard`);
  }

  const supabase = await createServerSupabaseClient();
  const [{ data: members }, { data: resources }, { data: reports }, { data: logs }] = supabase
    ? await Promise.all([
        supabase
          .from("university_memberships")
          .select("id, role, verification_status, programme, profiles(full_name, username)")
          .eq("university_id", tenant.university.id)
          .eq("verification_status", "pending")
          .limit(30),
        supabase
          .from("resources")
          .select("id, title, resource_type, subject_name, verification_status, provenance_notes")
          .eq("university_id", tenant.university.id)
          .eq("environment", "production")
          .eq("verification_status", "pending_review")
          .limit(30),
        supabase
          .from("reports")
          .select("id, target_type, reason, status, created_at")
          .eq("university_id", tenant.university.id)
          .eq("status", "open")
          .limit(20),
        supabase
          .from("audit_logs")
          .select("id, action, target_type, created_at")
          .eq("university_id", tenant.university.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${tenant.university.name} — Moderation & Admin`}
        subtitle="Scoped administrative controls. All actions are recorded to audit_logs."
      />

      <AlertBanner tone="info" title="Scoped Role Enforcement">
        Moderators and university admins here cannot access other universities or read private
        direct messages.
      </AlertBanner>

      <AdminConsoleClient
        universityId={tenant.university.id}
        isAdmin={tenant.isAdmin}
        pendingMembers={(members ?? []) as unknown as []}
        pendingResources={(resources ?? []) as []}
        openReports={(reports ?? []) as []}
        auditLogs={(logs ?? []) as []}
      />
    </div>
  );
}
