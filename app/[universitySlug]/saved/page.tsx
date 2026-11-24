import Link from "next/link";
import { Bookmark } from "lucide-react";
import { requireUniversityAccess } from "@/lib/auth/tenant";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function SavedPage({
  params,
}: {
  params: Promise<{ universitySlug: string }>;
}) {
  const { universitySlug } = await params;
  const tenant = await requireUniversityAccess(universitySlug);
  const supabase = await createServerSupabaseClient();

  const [{ data: savedResources }, { data: savedOpps }] = supabase
    ? await Promise.all([
        supabase
          .from("resource_saves")
          .select("resource_id, resources(id, title, resource_type, subject_name)")
          .eq("user_id", tenant.userId),
        supabase
          .from("opportunity_saves")
          .select("opportunity_id, application_status, opportunities(id, title, organization)")
          .eq("user_id", tenant.userId),
      ])
    : [{ data: [] }, { data: [] }];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Items & Application Tracker"
        subtitle="Your bookmarked study materials and tracked opportunities."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-white">Saved Academic Resources</h2>
          {savedResources && savedResources.length > 0 ? (
            <div className="space-y-2">
              {savedResources.map((item) => {
                const res = item.resources as unknown as {
                  id: string;
                  title: string;
                  resource_type: string;
                  subject_name: string | null;
                } | null;
                if (!res) return null;
                return (
                  <Link
                    key={res.id}
                    href={`/${universitySlug}/resources/${res.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#090f1d] p-3 hover:border-indigo-500/40"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{res.title}</p>
                      <p className="text-xs text-slate-400">
                        {res.subject_name || "General"} • {res.resource_type}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Bookmark className="h-6 w-6" />}
              title="No saved resources"
              description="Bookmark lecture notes or PYQs to access them quickly here."
            />
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-white">Tracked Opportunities</h2>
          {savedOpps && savedOpps.length > 0 ? (
            <div className="space-y-2">
              {savedOpps.map((item) => {
                const opp = item.opportunities as unknown as {
                  id: string;
                  title: string;
                  organization: string;
                } | null;
                if (!opp) return null;
                return (
                  <Link
                    key={opp.id}
                    href={`/${universitySlug}/opportunities/${opp.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#090f1d] p-3 hover:border-indigo-500/40"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{opp.title}</p>
                      <p className="text-xs text-slate-400">{opp.organization}</p>
                    </div>
                    <Badge tone="indigo">{item.application_status}</Badge>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Bookmark className="h-6 w-6" />}
              title="No tracked opportunities"
              description="Save internships or hackathons to track your application progress."
            />
          )}
        </Card>
      </div>
    </div>
  );
}
