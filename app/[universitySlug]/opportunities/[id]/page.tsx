import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireUniversityAccess } from "@/lib/auth/tenant";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isOpportunityActive } from "@/lib/permissions/roles";
import { formatDate, formatDateTime, sanitizeExternalUrl } from "@/lib/utils";
import { AlertBanner, Badge, Card, PageHeader } from "@/components/ui/primitives";
import { OpportunityTracker } from "@/components/opportunities/OpportunityTracker";
import type { Opportunity } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ universitySlug: string; id: string }>;
}) {
  const { universitySlug, id } = await params;
  const tenant = await requireUniversityAccess(universitySlug);
  const supabase = await createServerSupabaseClient();
  if (!supabase) notFound();

  const [{ data: opp }, { data: saveRow }] = await Promise.all([
    supabase
      .from("opportunities")
      .select("*")
      .eq("id", id)
      .eq("environment", "production")
      .maybeSingle(),
    supabase
      .from("opportunity_saves")
      .select("*")
      .eq("user_id", tenant.userId)
      .eq("opportunity_id", id)
      .maybeSingle(),
  ]);

  if (!opp) notFound();
  const typed = opp as Opportunity;
  const active = isOpportunityActive(typed);
  const sourceUrl = sanitizeExternalUrl(typed.source_url);
  const appUrl = sanitizeExternalUrl(typed.application_url);

  return (
    <div className="space-y-6">
      <PageHeader
        title={typed.title}
        subtitle={`${typed.organization} • ${typed.category}`}
        badge={
          <Badge tone={active ? "emerald" : "amber"}>{typed.verification_status}</Badge>
        }
        actions={
          <Link
            href={`/${universitySlug}/opportunities`}
            className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800"
          >
            ← All Opportunities
          </Link>
        }
      />

      {!active && (
        <AlertBanner tone="warning" title="Freshness Warning">
          This listing is marked <strong>{typed.verification_status}</strong> and is not
          guaranteed to be open. Always check the original source URL before applying.
        </AlertBanner>
      )}

      <Card className="space-y-5">
        <div className="grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-slate-500">Work Mode & Location</p>
            <p className="mt-0.5 font-medium text-slate-200">
              {typed.work_mode} {typed.location ? `• ${typed.location}` : ""}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Stipend / Compensation</p>
            <p className="mt-0.5 font-medium text-slate-200">
              {typed.stipend_text || "Not specified by source"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Deadline</p>
            <p className="mt-0.5 font-medium text-slate-200">{formatDate(typed.deadline)}</p>
          </div>
          <div>
            <p className="text-slate-500">Last Checked</p>
            <p className="mt-0.5 font-medium text-slate-200">
              {formatDateTime(typed.last_checked_at)}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Description
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-200">{typed.description}</p>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-slate-800 pt-4 text-xs">
          {appUrl && (
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500"
            >
              Open Official Application URL <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 font-medium text-slate-200 hover:bg-slate-700"
            >
              View Original Source <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        <div className="border-t border-slate-800 pt-4">
          <OpportunityTracker
            opportunityId={typed.id}
            initialStatus={saveRow?.application_status}
            initialNotes={saveRow?.private_notes ?? ""}
          />
        </div>
      </Card>
    </div>
  );
}
