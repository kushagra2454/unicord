import Link from "next/link";
import {
  BookOpen,
  Bot,
  Briefcase,
  Calendar,
  ExternalLink,
  FileQuestion,
  MessagesSquare,
  Upload,
} from "lucide-react";
import { requireUniversityAccess } from "@/lib/auth/tenant";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import {
  AlertBanner,
  Badge,
  Card,
  EmptyState,
  PageHeader,
} from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function UniversityDashboardPage({
  params,
}: {
  params: Promise<{ universitySlug: string }>;
}) {
  const { universitySlug } = await params;
  const tenant = await requireUniversityAccess(universitySlug);
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const [
    { data: resources },
    { data: pyqs },
    { data: calendars },
    { data: opportunities },
    { data: communities },
    { data: announcements },
  ] = await Promise.all([
    supabase
      .from("resources")
      .select("id, title, resource_type, subject_name, verification_status, created_at")
      .eq("university_id", tenant.university.id)
      .eq("environment", "production")
      .eq("verification_status", "verified")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("resources")
      .select("id")
      .eq("university_id", tenant.university.id)
      .eq("environment", "production")
      .eq("resource_type", "pyq")
      .eq("verification_status", "verified"),
    supabase
      .from("academic_terms")
      .select("id, name, academic_year, document_url, source_url, last_checked_at")
      .eq("university_id", tenant.university.id)
      .order("academic_year", { ascending: false })
      .limit(4),
    supabase
      .from("opportunities")
      .select("id, title, organization, category, deadline, verification_status, last_checked_at")
      .eq("environment", "production")
      .in("verification_status", ["verified_current", "source_listed_unreviewed"])
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("communities")
      .select("id, name, slug, description")
      .eq("university_id", tenant.university.id)
      .eq("environment", "production")
      .limit(4),
    supabase
      .from("announcements")
      .select("id, title, body, source_url, published_at")
      .eq("university_id", tenant.university.id)
      .eq("environment", "production")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(4),
  ]);

  const profileChecks = [
    Boolean(tenant.profile?.full_name),
    Boolean(tenant.profile?.bio),
    Boolean(tenant.profile?.skills?.length),
    Boolean(tenant.membership?.programme),
  ];
  const completionPct = Math.round(
    (profileChecks.filter(Boolean).length / profileChecks.length) * 100
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${tenant.profile?.full_name ?? "Student"}`}
        subtitle={`${tenant.university.name} • Membership: ${tenant.membership?.role ?? "member"} (${tenant.membership?.verification_status ?? "pending"})`}
        badge={
          <Badge
            tone={tenant.membership?.verification_status === "verified" ? "emerald" : "amber"}
          >
            {tenant.membership?.verification_status === "verified"
              ? "Verified Member"
              : "Pending Verification"}
          </Badge>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/${universitySlug}/upload`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Resource
            </Link>
            <Link
              href={`/${universitySlug}/assistant`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              <Bot className="h-3.5 w-3.5" />
              Ask AI
            </Link>
          </div>
        }
      />

      {tenant.membership?.verification_status !== "verified" && (
        <AlertBanner tone="warning" title="Verification Pending">
          Your membership at {tenant.university.name} is currently{" "}
          <strong>{tenant.membership?.verification_status ?? "pending"}</strong>. You can
          browse public institutional sources and upload pending submissions, while restricted
          student-only channels require administrator verification.
        </AlertBanner>
      )}

      {/* Quick Action Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="space-y-1">
          <p className="text-xs text-slate-400">Profile Completion</p>
          <p className="text-2xl font-bold text-white">{completionPct}%</p>
          <Link href="/settings" className="text-xs text-indigo-400 hover:underline">
            Update skills & bio →
          </Link>
        </Card>
        <Card className="space-y-1">
          <p className="text-xs text-slate-400">Verified Resources</p>
          <p className="text-2xl font-bold text-white">{resources?.length ?? 0}</p>
          <Link
            href={`/${universitySlug}/resources`}
            className="text-xs text-indigo-400 hover:underline"
          >
            Browse academic hub →
          </Link>
        </Card>
        <Card className="space-y-1">
          <p className="text-xs text-slate-400">Authentic PYQs</p>
          <p className="text-2xl font-bold text-white">{pyqs?.length ?? 0}</p>
          <Link
            href={`/${universitySlug}/pyqs`}
            className="text-xs text-indigo-400 hover:underline"
          >
            Open PYQ Centre →
          </Link>
        </Card>
        <Card className="space-y-1">
          <p className="text-xs text-slate-400">Active Communities</p>
          <p className="text-2xl font-bold text-white">{communities?.length ?? 0}</p>
          <Link
            href={`/${universitySlug}/community`}
            className="text-xs text-indigo-400 hover:underline"
          >
            Open real-time chat →
          </Link>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Academic Resources */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              Latest Verified Resources
            </h2>
            <Link
              href={`/${universitySlug}/resources`}
              className="text-xs text-indigo-400 hover:underline"
            >
              View all
            </Link>
          </div>
          {resources && resources.length > 0 ? (
            <div className="space-y-2.5">
              {resources.map((r) => (
                <Link
                  key={r.id}
                  href={`/${universitySlug}/resources/${r.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#090f1d] p-3 hover:border-indigo-500/40"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{r.title}</p>
                    <p className="text-xs text-slate-400">
                      {r.subject_name || "General"} • {r.resource_type}
                    </p>
                  </div>
                  <Badge tone="emerald">verified</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FileQuestion className="h-7 w-7" />}
              title="No verified academic resources yet"
              description="Upload lecture notes, lab manuals, or authentic PYQs for moderator review."
              action={
                <Link
                  href={`/${universitySlug}/upload`}
                  className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Upload First Resource
                </Link>
              }
            />
          )}
        </Card>

        {/* Official Academic Calendars & Notices */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <Calendar className="h-4 w-4 text-sky-400" />
              Sourced Academic Calendars & Notices
            </h2>
            <Link
              href={`/universities/${universitySlug}`}
              className="text-xs text-indigo-400 hover:underline"
            >
              Info Centre
            </Link>
          </div>
          {calendars && calendars.length > 0 ? (
            <div className="space-y-2.5">
              {calendars.map((cal) => (
                <div
                  key={cal.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-[#090f1d] p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{cal.name}</p>
                    <p className="text-xs text-slate-400">
                      {cal.academic_year} • Checked {formatDateTime(cal.last_checked_at)}
                    </p>
                  </div>
                  <a
                    href={cal.document_url || cal.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:underline"
                  >
                    PDF <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No calendar documents imported"
              description="Check the official university website directly for current dates."
            />
          )}

          {announcements && announcements.length > 0 ? (
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                University Notices
              </p>
              {announcements.map((a) => (
                <div key={a.id} className="rounded-lg border border-slate-800 bg-[#090f1d] p-3">
                  <p className="text-sm font-medium text-white">{a.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{a.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No official notice has been imported yet. Check{" "}
              {tenant.university.official_website ?? "the university site"} to confirm.
            </p>
          )}
        </Card>

        {/* Opportunities */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <Briefcase className="h-4 w-4 text-emerald-400" />
              Source-Checked Opportunities
            </h2>
            <Link
              href={`/${universitySlug}/opportunities`}
              className="text-xs text-indigo-400 hover:underline"
            >
              Explore all
            </Link>
          </div>
          {opportunities && opportunities.length > 0 ? (
            <div className="space-y-2.5">
              {opportunities.map((opp) => (
                <Link
                  key={opp.id}
                  href={`/${universitySlug}/opportunities/${opp.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#090f1d] p-3 hover:border-indigo-500/40"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{opp.title}</p>
                    <p className="text-xs text-slate-400">
                      {opp.organization} • Checked {formatDateTime(opp.last_checked_at)}
                    </p>
                  </div>
                  <Badge tone="sky">{opp.verification_status}</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No current source-verified opportunities ingested yet"
              description="Admins can run the source ingestion pipeline or submit verified listings with canonical URLs."
              action={
                <Link
                  href={`/${universitySlug}/opportunities`}
                  className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                >
                  Open Opportunities Hub
                </Link>
              }
            />
          )}
        </Card>

        {/* Communities */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <MessagesSquare className="h-4 w-4 text-indigo-400" />
              Campus Communities
            </h2>
            <Link
              href={`/${universitySlug}/community`}
              className="text-xs text-indigo-400 hover:underline"
            >
              Open chat
            </Link>
          </div>
          {communities && communities.length > 0 ? (
            <div className="space-y-2.5">
              {communities.map((comm) => (
                <Link
                  key={comm.id}
                  href={`/${universitySlug}/community/${comm.id}`}
                  className="block rounded-lg border border-slate-800 bg-[#090f1d] p-3 hover:border-indigo-500/40"
                >
                  <p className="text-sm font-semibold text-white">{comm.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{comm.description}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No communities available yet"
              description="Join or wait for your university administrator to configure initial channels."
            />
          )}
        </Card>
      </div>
    </div>
  );
}
