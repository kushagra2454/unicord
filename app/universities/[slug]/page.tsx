import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  Calendar,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  MapPin,
} from "lucide-react";
import { getPublicUniversityBySlug } from "@/lib/data/queries";
import { formatDateTime } from "@/lib/utils";
import { AlertBanner, Badge, Card, PageHeader } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function UniversityProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicUniversityBySlug(slug);

  if (!data.university) {
    notFound();
  }

  const { university, schools, calendars, content, sources } = data;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <PageHeader
        title={university.name}
        subtitle={`${university.city}, ${university.state}, ${university.country}`}
        badge={<Badge tone="emerald">Source-Attributed Info Centre</Badge>}
        actions={
          <div className="flex items-center gap-2">
            {university.official_website && (
              <a
                href={university.official_website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
              >
                <Globe className="h-4 w-4" />
                Official Site
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <Link
              href="/signup"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Join Campus
            </Link>
          </div>
        }
      />

      <AlertBanner tone="info" title="Independent Platform Notice">
        Unicord is an independent student community concept and is not an official{" "}
        {university.name} portal unless formally authorized. Every institutional fact below
        links directly to its official public source.
      </AlertBanner>

      {/* About & Campus */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="space-y-3 lg:col-span-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Building2 className="h-4 w-4 text-indigo-400" />
            About & Campus Address
          </div>
          <p className="text-sm leading-relaxed text-slate-300">{university.description}</p>
          {university.address && (
            <p className="flex items-start gap-2 text-xs text-slate-400">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
              <span>{university.address}</span>
            </p>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Quick Campus Navigation</h2>
          <div className="flex flex-col gap-2 text-sm">
            <Link
              href={`/${university.slug}/dashboard`}
              className="rounded-lg border border-slate-800 bg-[#090f1d] px-3 py-2 text-slate-200 hover:border-indigo-500/40"
            >
              Student Dashboard →
            </Link>
            <Link
              href={`/${university.slug}/resources`}
              className="rounded-lg border border-slate-800 bg-[#090f1d] px-3 py-2 text-slate-200 hover:border-indigo-500/40"
            >
              Academic Resource Library →
            </Link>
            <Link
              href={`/${university.slug}/pyqs`}
              className="rounded-lg border border-slate-800 bg-[#090f1d] px-3 py-2 text-slate-200 hover:border-indigo-500/40"
            >
              Authentic PYQ Centre →
            </Link>
            <Link
              href={`/${university.slug}/opportunities`}
              className="rounded-lg border border-slate-800 bg-[#090f1d] px-3 py-2 text-slate-200 hover:border-indigo-500/40"
            >
              Career & Opportunities →
            </Link>
          </div>
        </Card>
      </div>

      {/* Schools / Faculties */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <GraduationCap className="h-4 w-4 text-indigo-400" />
            Official Schools & Faculties ({schools.length})
          </h2>
          <a
            href="https://jecrcuniversity.edu.in/programs/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline"
          >
            Source: Official Programs Page <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => (
            <div
              key={school.id}
              className="rounded-lg border border-slate-800 bg-[#090f1d] px-3.5 py-2.5 text-sm text-slate-200"
            >
              {school.name}
            </div>
          ))}
        </div>
      </Card>

      {/* Academic Calendars */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <Calendar className="h-4 w-4 text-sky-400" />
            Official Academic Calendars & Holidays
          </h2>
          <Badge tone="sky">Document Provenance Tracked</Badge>
        </div>
        <div className="space-y-3">
          {calendars.map((cal) => (
            <div
              key={cal.id}
              className="flex flex-col justify-between gap-3 rounded-lg border border-slate-800 bg-[#090f1d] p-3.5 sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-white">{cal.name}</p>
                  <Badge tone="neutral">{cal.academic_year}</Badge>
                  <Badge tone="emerald">{cal.status}</Badge>
                </div>
                <p className="text-xs text-slate-400">
                  Last checked: {formatDateTime(cal.last_checked_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {cal.document_url && (
                  <a
                    href={cal.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600/20 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-600/30"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Official PDF
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Verified Institutional Summaries & Source Registry */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-white">
            University Information Highlights
          </h2>
          <div className="space-y-3">
            {content.map((item) => (
              <div
                key={item.id}
                className="space-y-1.5 rounded-lg border border-slate-800 bg-[#090f1d] p-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <Badge tone="emerald">{item.verification_status}</Badge>
                </div>
                <p className="text-xs leading-relaxed text-slate-300">{item.summary}</p>
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <span>Checked: {formatDateTime(item.last_fetched_at)}</span>
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-400 hover:underline"
                  >
                    Original Source <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-white">Official Source Registry</h2>
          <p className="text-xs text-slate-400">
            Every institutional record is traced to these public official URLs. Unicord never
            scrapes private ERPs or student portals.
          </p>
          <div className="space-y-2">
            {sources.map((src) => (
              <a
                key={src.source_url}
                href={src.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#090f1d] px-3.5 py-2.5 text-xs hover:border-indigo-500/40"
              >
                <div>
                  <p className="font-medium text-slate-200">{src.name}</p>
                  <p className="text-slate-500">{src.source_url}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
              </a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
