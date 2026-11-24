import Link from "next/link";
import { requireUniversityAccess } from "@/lib/auth/tenant";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/primitives";
import { ResourceUploadForm } from "@/components/academics/ResourceUploadForm";
import type { School } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function UploadResourcePage({
  params,
}: {
  params: Promise<{ universitySlug: string }>;
}) {
  const { universitySlug } = await params;
  const tenant = await requireUniversityAccess(universitySlug);
  const supabase = await createServerSupabaseClient();

  const { data: schools } = supabase
    ? await supabase
        .from("schools")
        .select("*")
        .eq("university_id", tenant.university.id)
        .order("name")
    : { data: [] };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Academic Resource"
        subtitle={`Submissions for ${tenant.university.name} enter private storage with status pending_review until verified by a moderator.`}
        actions={
          <Link
            href={`/${universitySlug}/resources`}
            className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            ← Back to Resources
          </Link>
        }
      />

      <ResourceUploadForm
        universityId={tenant.university.id}
        universitySlug={universitySlug}
        schools={(schools ?? []) as School[]}
      />
    </div>
  );
}
