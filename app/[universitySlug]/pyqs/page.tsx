import Link from "next/link";
import { FileQuestion, Upload } from "lucide-react";
import { requireUniversityAccess } from "@/lib/auth/tenant";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import {
  AlertBanner,
  Badge,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Select,
} from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function PyqCentrePage({
  params,
  searchParams,
}: {
  params: Promise<{ universitySlug: string }>;
  searchParams: Promise<{ q?: string; examType?: string; year?: string }>;
}) {
  const { universitySlug } = await params;
  const { q = "", examType = "", year = "" } = await searchParams;
  const tenant = await requireUniversityAccess(universitySlug);
  const supabase = await createServerSupabaseClient();

  let pyqs: Array<{
    id: string;
    title: string;
    subject_name: string | null;
    subject_code: string | null;
    exam_type: string | null;
    exam_year: number | null;
    verification_status: string;
    provenance_notes: string | null;
    created_at: string;
  }> = [];

  if (supabase) {
    let query = supabase
      .from("resources")
      .select(
        "id, title, subject_name, subject_code, exam_type, exam_year, verification_status, provenance_notes, created_at"
      )
      .eq("university_id", tenant.university.id)
      .eq("environment", "production")
      .eq("resource_type", "pyq")
      .order("exam_year", { ascending: false });

    if (examType) query = query.eq("exam_type", examType);
    if (year && /^\d{4}$/.test(year)) query = query.eq("exam_year", Number(year));
    if (q.trim()) {
      query = query.or(
        `title.ilike.%${q.trim()}%,subject_name.ilike.%${q.trim()}%,subject_code.ilike.%${q.trim()}%`
      );
    }

    const { data } = await query.limit(40);
    pyqs = data ?? [];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authentic PYQ Centre"
        subtitle={`Verified previous-year question papers for ${tenant.university.name}.`}
        badge={<Badge tone="emerald">Provenance Enforced</Badge>}
        actions={
          <Link
            href={`/${universitySlug}/upload`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            <Upload className="h-3.5 w-3.5" />
            Contribute Authentic PYQ
          </Link>
        }
      />

      <AlertBanner tone="info" title="Authentic PYQ Verification Policy">
        Unicord never generates or invents university exam papers. A PYQ receives the{" "}
        <strong>verified</strong> badge only after a moderator inspects the file and confirms
        its university, subject, exam type, and year.
      </AlertBanner>

      <Card>
        <form className="grid gap-3 sm:grid-cols-4">
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search subject name or code..."
            className="sm:col-span-2"
          />
          <Select name="examType" defaultValue={examType}>
            <option value="">All exam types</option>
            <option value="end_semester">End-Semester</option>
            <option value="mid_semester">Mid-Semester</option>
            <option value="internal">Internal</option>
            <option value="final">Final</option>
            <option value="supplementary">Supplementary</option>
          </Select>
          <div className="flex gap-2">
            <Input
              name="year"
              defaultValue={year}
              placeholder="Year (e.g. 2025)"
              type="number"
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Filter
            </button>
          </div>
        </form>
      </Card>

      {pyqs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {pyqs.map((p) => (
            <Card key={p.id} className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <Badge tone="sky">
                  {p.exam_type || "exam"} {p.exam_year ? `• ${p.exam_year}` : ""}
                </Badge>
                <Badge tone={p.verification_status === "verified" ? "emerald" : "amber"}>
                  {p.verification_status}
                </Badge>
              </div>
              <Link
                href={`/${universitySlug}/resources/${p.id}`}
                className="block text-base font-semibold text-white hover:text-indigo-300"
              >
                {p.title}
              </Link>
              <p className="text-xs text-slate-400">
                {p.subject_name} {p.subject_code ? `(${p.subject_code})` : ""}
              </p>
              {p.provenance_notes && (
                <p className="text-xs text-slate-500">Provenance: {p.provenance_notes}</p>
              )}
              <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                <span>Added {formatDate(p.created_at)}</span>
                <Link
                  href={`/${universitySlug}/resources/${p.id}`}
                  className="font-medium text-indigo-400 hover:underline"
                >
                  Open Paper →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileQuestion className="h-8 w-8" />}
          title="No verified paper is available for this subject yet."
          description="You can request one in #academic-doubts or contribute a verified copy for moderator review."
          action={
            <Link
              href={`/${universitySlug}/upload`}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Contribute a Copy for Review
            </Link>
          }
        />
      )}
    </div>
  );
}
