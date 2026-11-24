import Link from "next/link";
import { BookOpen, Upload } from "lucide-react";
import { requireUniversityAccess } from "@/lib/auth/tenant";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate, formatFileSize } from "@/lib/utils";
import {
  Badge,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Select,
} from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function ResourcesPage({
  params,
  searchParams,
}: {
  params: Promise<{ universitySlug: string }>;
  searchParams: Promise<{ q?: string; type?: string; school?: string }>;
}) {
  const { universitySlug } = await params;
  const { q = "", type = "", school = "" } = await searchParams;
  const tenant = await requireUniversityAccess(universitySlug);
  const supabase = await createServerSupabaseClient();

  const [{ data: schools }, resourcesRes] = supabase
    ? await Promise.all([
        supabase
          .from("schools")
          .select("id, name")
          .eq("university_id", tenant.university.id)
          .order("name"),
        (() => {
          let query = supabase
            .from("resources")
            .select("*")
            .eq("university_id", tenant.university.id)
            .eq("environment", "production")
            .order("created_at", { ascending: false })
            .limit(40);

          if (type) query = query.eq("resource_type", type);
          if (school) query = query.eq("school_id", school);
          if (q.trim()) {
            query = query.or(
              `title.ilike.%${q.trim()}%,subject_name.ilike.%${q.trim()}%,subject_code.ilike.%${q.trim()}%`
            );
          }
          return query;
        })(),
      ])
    : [{ data: [] }, { data: [] }];

  const resources = resourcesRes.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Resource Hub"
        subtitle={`Tenant-scoped study materials for ${tenant.university.name}.`}
        actions={
          <Link
            href={`/${universitySlug}/upload`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Resource
          </Link>
        }
      />

      <Card>
        <form className="grid gap-3 sm:grid-cols-4">
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search title, subject, code..."
            className="sm:col-span-2"
          />
          <Select name="type" defaultValue={type}>
            <option value="">All resource types</option>
            <option value="lecture_notes">Lecture Notes</option>
            <option value="assignment">Assignment</option>
            <option value="pyq">PYQ</option>
            <option value="ai_practice_paper">AI Practice Paper</option>
            <option value="syllabus">Syllabus</option>
            <option value="lab_manual">Lab Manual</option>
            <option value="project_guide">Project Guide</option>
          </Select>
          <div className="flex gap-2">
            <Select name="school" defaultValue={school}>
              <option value="">All schools</option>
              {(schools ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
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

      {resources.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((r) => (
            <Card key={r.id} className="flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge tone="indigo">{r.resource_type}</Badge>
                  <Badge
                    tone={
                      r.verification_status === "verified"
                        ? "emerald"
                        : r.verification_status === "rejected"
                          ? "rose"
                          : "amber"
                    }
                  >
                    {r.verification_status}
                  </Badge>
                </div>
                {r.resource_type === "ai_practice_paper" && (
                  <p className="text-[11px] font-semibold text-amber-300">
                    AI-GENERATED PRACTICE PAPER — NOT AN ACTUAL PREVIOUS-YEAR PAPER
                  </p>
                )}
                <Link
                  href={`/${universitySlug}/resources/${r.id}`}
                  className="block text-base font-semibold text-white hover:text-indigo-300"
                >
                  {r.title}
                </Link>
                <p className="text-xs text-slate-400">
                  {r.subject_name || "General"}
                  {r.subject_code ? ` (${r.subject_code})` : ""} •{" "}
                  {formatFileSize(r.file_size)}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-2.5 text-xs text-slate-500">
                <span>Uploaded {formatDate(r.created_at)}</span>
                <Link
                  href={`/${universitySlug}/resources/${r.id}`}
                  className="font-medium text-indigo-400 hover:underline"
                >
                  Inspect & Download →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="No matching academic resources found"
          description="Only verified submissions or your own pending uploads appear here. Contribute notes or manuals to start building your campus library."
          action={
            <Link
              href={`/${universitySlug}/upload`}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Upload a Resource
            </Link>
          }
        />
      )}
    </div>
  );
}
