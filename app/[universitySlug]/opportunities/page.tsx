import Link from "next/link";
import { Briefcase, ExternalLink } from "lucide-react";
import { requireUniversityAccess } from "@/lib/auth/tenant";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isOpportunityActive } from "@/lib/permissions/roles";
import { formatDate, formatDateTime, sanitizeExternalUrl } from "@/lib/utils";
import {
  AlertBanner,
  Badge,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Select,
} from "@/components/ui/primitives";
import type { Opportunity } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ universitySlug: string }>;
  searchParams: Promise<{ q?: string; category?: string; workMode?: string }>;
}) {
  const { universitySlug } = await params;
  const { q = "", category = "", workMode = "" } = await searchParams;
  const tenant = await requireUniversityAccess(universitySlug);
  const supabase = await createServerSupabaseClient();

  let list: Opportunity[] = [];
  if (supabase) {
    let query = supabase
      .from("opportunities")
      .select("*")
      .eq("environment", "production")
      .in("verification_status", [
        "verified_current",
        "source_listed_unreviewed",
        "stale",
        "expired",
        "closed",
      ])
      .order("last_checked_at", { ascending: false })
      .limit(40);

    if (category) query = query.eq("category", category);
    if (workMode) query = query.eq("work_mode", workMode);
    if (q.trim()) {
      query = query.or(
        `title.ilike.%${q.trim()}%,organization.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%`
      );
    }

    const { data } = await query;
    list = (data ?? []) as Opportunity[];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Internships, Jobs & Opportunities"
        subtitle="Every listing carries its canonical source URL, freshness state, and last-checked timestamp."
      />

      {/* JECRC Career Resources Panel (only university-published factual links) */}
      <Card className="border-indigo-500/20 bg-[#0b1120] space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white">
            {tenant.university.name} Career Resources
          </h2>
          <Badge tone="sky">Official Reference Links</Badge>
        </div>
        <p className="text-xs text-slate-400">
          University placement pages describe campus recruitment training, six-month internship
          programmes, and CDGC readiness support. Source-verified external listings below are not
          automatically university-endorsed.
        </p>
        <div className="flex flex-wrap gap-3 pt-1 text-xs">
          <a
            href="https://jecrcuniversity.edu.in/placements/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-indigo-400 hover:underline"
          >
            JECRC Placements & Internships <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://jecrcuniversity.edu.in/career-development-guidance-cell-cdgc/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-indigo-400 hover:underline"
          >
            Career Development & Guidance Cell (CDGC) <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </Card>

      <Card>
        <form className="grid gap-3 sm:grid-cols-4">
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search role, organization, skill..."
            className="sm:col-span-2"
          />
          <Select name="category" defaultValue={category}>
            <option value="">All categories</option>
            <option value="internship">Internship</option>
            <option value="remote_internship">Remote Internship</option>
            <option value="full_time">Full-Time Job</option>
            <option value="hackathon">Hackathon</option>
            <option value="scholarship">Scholarship</option>
            <option value="campus_event">Campus Event</option>
          </Select>
          <div className="flex gap-2">
            <Select name="workMode" defaultValue={workMode}>
              <option value="">Any work mode</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </Select>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Filter
            </button>
          </div>
        </form>
      </Card>

      {list.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((opp) => {
            const active = isOpportunityActive(opp);
            const appUrl = sanitizeExternalUrl(opp.application_url);
            const srcUrl = sanitizeExternalUrl(opp.source_url);
            return (
              <Card key={opp.id} className="flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge tone="indigo">{opp.category}</Badge>
                    <Badge
                      tone={
                        active
                          ? "emerald"
                          : opp.verification_status === "expired" ||
                              opp.verification_status === "closed"
                            ? "rose"
                            : "amber"
                      }
                    >
                      {opp.verification_status}
                    </Badge>
                  </div>
                  <Link
                    href={`/${universitySlug}/opportunities/${opp.id}`}
                    className="block text-base font-semibold text-white hover:text-indigo-300"
                  >
                    {opp.title}
                  </Link>
                  <p className="text-xs font-medium text-slate-300">
                    {opp.organization} • {opp.work_mode}
                    {opp.location ? ` (${opp.location})` : ""}
                  </p>
                  <p className="line-clamp-2 text-xs text-slate-400">{opp.description}</p>
                  <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
                    <span>Last checked: {formatDateTime(opp.last_checked_at)}</span>
                    {opp.deadline && <span>Deadline: {formatDate(opp.deadline)}</span>}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-2.5 text-xs">
                  <Link
                    href={`/${universitySlug}/opportunities/${opp.id}`}
                    className="font-medium text-indigo-400 hover:underline"
                  >
                    Details & Tracker →
                  </Link>
                  <div className="flex items-center gap-3">
                    {srcUrl && (
                      <a
                        href={srcUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200"
                      >
                        Source <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {appUrl && active && (
                      <a
                        href={appUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-emerald-400 hover:underline"
                      >
                        Apply Externally <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <AlertBanner tone="info" title="No active source-verified listings stored yet">
            Unicord does not fabricate internships or stipends. Platform or university admins can
            trigger the permitted source ingestion endpoint (<code>/api/ingestion/run</code>) from
            the Admin Sources panel to fetch live feeds from registered sources.
          </AlertBanner>
          <EmptyState
            icon={<Briefcase className="h-8 w-8" />}
            title="No current source-verified opportunity matches these filters."
            description="Check the official JECRC Placements & CDGC links above or ask an administrator to sync registered opportunity feeds."
          />
        </div>
      )}
    </div>
  );
}
