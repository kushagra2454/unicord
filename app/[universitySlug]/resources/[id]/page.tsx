import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireUniversityAccess } from "@/lib/auth/tenant";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { canAccessResource } from "@/lib/permissions/roles";
import { formatDate, formatFileSize } from "@/lib/utils";
import { AlertBanner, Badge, Card, PageHeader } from "@/components/ui/primitives";
import { ResourceActions } from "@/components/academics/ResourceActions";
import type { AcademicResource } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ universitySlug: string; id: string }>;
}) {
  const { universitySlug, id } = await params;
  const tenant = await requireUniversityAccess(universitySlug);
  const supabase = await createServerSupabaseClient();
  if (!supabase) notFound();

  const { data: resource } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .eq("university_id", tenant.university.id)
    .eq("environment", "production")
    .maybeSingle();

  if (!resource) {
    notFound();
  }

  const typedResource = resource as AcademicResource;
  const canDownload = canAccessResource(
    typedResource,
    tenant.membership,
    tenant.userId,
    tenant.isPlatformAdmin
  );

  const { data: savedRow } = await supabase
    .from("resource_saves")
    .select("resource_id")
    .eq("user_id", tenant.userId)
    .eq("resource_id", id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <PageHeader
        title={typedResource.title}
        subtitle={`${typedResource.subject_name || "General"} ${
          typedResource.subject_code ? `(${typedResource.subject_code})` : ""
        }`}
        badge={
          <Badge
            tone={
              typedResource.verification_status === "verified"
                ? "emerald"
                : typedResource.verification_status === "rejected"
                  ? "rose"
                  : "amber"
            }
          >
            {typedResource.verification_status}
          </Badge>
        }
        actions={
          <Link
            href={`/${universitySlug}/resources`}
            className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800"
          >
            ← Back to Resources
          </Link>
        }
      />

      {typedResource.resource_type === "ai_practice_paper" && (
        <AlertBanner
          tone="warning"
          title="AI-GENERATED PRACTICE PAPER — NOT AN ACTUAL PREVIOUS-YEAR PAPER"
        >
          This document is labelled as AI-generated study practice and is strictly separated from
          verified authentic university question papers.
        </AlertBanner>
      )}

      <Card className="space-y-5">
        <div className="grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-slate-500">Resource Type</p>
            <p className="mt-0.5 font-medium text-slate-200">{typedResource.resource_type}</p>
          </div>
          <div>
            <p className="text-slate-500">File</p>
            <p className="mt-0.5 font-medium text-slate-200">
              {typedResource.original_filename} ({formatFileSize(typedResource.file_size)})
            </p>
          </div>
          <div>
            <p className="text-slate-500">Academic Year / Exam</p>
            <p className="mt-0.5 font-medium text-slate-200">
              {typedResource.academic_year || "N/A"}{" "}
              {typedResource.exam_year ? `• ${typedResource.exam_year}` : ""}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Uploaded</p>
            <p className="mt-0.5 font-medium text-slate-200">
              {formatDate(typedResource.created_at)} • {typedResource.download_count} downloads
            </p>
          </div>
        </div>

        {typedResource.description && (
          <div className="border-t border-slate-800 pt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Description
            </h2>
            <p className="mt-1.5 text-sm text-slate-200">{typedResource.description}</p>
          </div>
        )}

        {(typedResource.provenance_notes || typedResource.source_url || typedResource.checksum) && (
          <div className="space-y-1.5 border-t border-slate-800 pt-4 text-xs text-slate-400">
            <h2 className="font-semibold uppercase tracking-wider text-slate-400">
              Provenance & Integrity
            </h2>
            {typedResource.provenance_notes && (
              <p>Provenance: {typedResource.provenance_notes}</p>
            )}
            {typedResource.checksum && (
              <p className="font-mono text-[11px] text-slate-500">
                SHA-256: {typedResource.checksum}
              </p>
            )}
            {typedResource.source_url && (
              <a
                href={typedResource.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-400 hover:underline"
              >
                Original Reference URL <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        <div className="border-t border-slate-800 pt-4">
          <ResourceActions
            resourceId={typedResource.id}
            universityId={tenant.university.id}
            initialSaved={Boolean(savedRow)}
            canDownload={canDownload}
          />
        </div>
      </Card>
    </div>
  );
}
