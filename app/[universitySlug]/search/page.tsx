import Link from "next/link";
import { Search } from "lucide-react";
import { requireUniversityAccess } from "@/lib/auth/tenant";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Badge, Card, EmptyState, Input, PageHeader } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ universitySlug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { universitySlug } = await params;
  const { q = "" } = await searchParams;
  const tenant = await requireUniversityAccess(universitySlug);
  const supabase = await createServerSupabaseClient();
  const term = q.trim();

  const [resourcesRes, oppsRes, contentRes] =
    supabase && term
      ? await Promise.all([
          supabase
            .from("resources")
            .select("id, title, resource_type, subject_name")
            .eq("university_id", tenant.university.id)
            .eq("environment", "production")
            .eq("verification_status", "verified")
            .or(`title.ilike.%${term}%,subject_name.ilike.%${term}%`)
            .limit(10),
          supabase
            .from("opportunities")
            .select("id, title, organization, verification_status")
            .eq("environment", "production")
            .in("verification_status", ["verified_current", "source_listed_unreviewed"])
            .or(`title.ilike.%${term}%,organization.ilike.%${term}%`)
            .limit(10),
          supabase
            .from("institutional_content")
            .select("id, title, category, source_url")
            .eq("university_id", tenant.university.id)
            .eq("environment", "production")
            .ilike("title", `%${term}%`)
            .limit(10),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }];

  const resources = resourcesRes.data ?? [];
  const opps = oppsRes.data ?? [];
  const info = contentRes.data ?? [];
  const hasAny = resources.length > 0 || opps.length > 0 || info.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Search"
        subtitle={`Permission-aware search across ${tenant.university.name} resources, opportunities, and institutional info. Private DMs are never indexed here.`}
      />

      <Card>
        <form className="flex gap-2">
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search subjects, PYQs, internships, clubs, calendars..."
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Search
          </button>
        </form>
      </Card>

      {!term ? (
        <EmptyState
          icon={<Search className="h-8 w-8" />}
          title="Enter a keyword to search"
          description="Results respect your university membership and verification permissions."
        />
      ) : !hasAny ? (
        <EmptyState
          icon={<Search className="h-8 w-8" />}
          title={`No authorized results for "${term}"`}
          description="Try a different keyword or browse the resource library and opportunities hub."
        />
      ) : (
        <div className="space-y-4">
          {resources.map((r) => (
            <Card key={r.id} className="flex items-center justify-between">
              <div>
                <Link
                  href={`/${universitySlug}/resources/${r.id}`}
                  className="text-sm font-semibold text-white hover:text-indigo-300"
                >
                  {r.title}
                </Link>
                <p className="text-xs text-slate-400">{r.subject_name || "Resource"}</p>
              </div>
              <Badge tone="indigo">{r.resource_type}</Badge>
            </Card>
          ))}
          {opps.map((o) => (
            <Card key={o.id} className="flex items-center justify-between">
              <div>
                <Link
                  href={`/${universitySlug}/opportunities/${o.id}`}
                  className="text-sm font-semibold text-white hover:text-indigo-300"
                >
                  {o.title}
                </Link>
                <p className="text-xs text-slate-400">{o.organization}</p>
              </div>
              <Badge tone="emerald">{o.verification_status}</Badge>
            </Card>
          ))}
          {info.map((i) => (
            <Card key={i.id} className="flex items-center justify-between">
              <div>
                <a
                  href={i.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-white hover:text-indigo-300"
                >
                  {i.title}
                </a>
                <p className="text-xs text-slate-400">{i.category}</p>
              </div>
              <Badge tone="sky">Official Info</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
