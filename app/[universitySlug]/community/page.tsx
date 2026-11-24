import Link from "next/link";
import { Hash, MessagesSquare } from "lucide-react";
import { requireUniversityAccess } from "@/lib/auth/tenant";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ universitySlug: string }>;
}) {
  const { universitySlug } = await params;
  const tenant = await requireUniversityAccess(universitySlug);
  const supabase = await createServerSupabaseClient();

  const { data: communities } = supabase
    ? await supabase
        .from("communities")
        .select("*, channels(*)")
        .eq("university_id", tenant.university.id)
        .eq("environment", "production")
        .order("name")
    : { data: [] };

  const list = communities ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Communities"
        subtitle={`Discord-inspired channels scoped to ${tenant.university.name}.`}
      />

      {list.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {list.map((comm) => (
            <Card key={comm.id} className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-white">{comm.name}</h2>
                  <p className="text-xs text-slate-400">{comm.description}</p>
                </div>
                <Badge tone="indigo">{comm.visibility}</Badge>
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Channels
                </p>
                {Array.isArray(comm.channels) && comm.channels.length > 0 ? (
                  comm.channels.map(
                    (ch: { id: string; name: string; description: string }) => (
                      <Link
                        key={ch.id}
                        href={`/${universitySlug}/community/${comm.id}?channel=${ch.id}`}
                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#090f1d] px-3 py-2 text-sm text-slate-200 hover:border-indigo-500/40"
                      >
                        <span className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-indigo-400" />
                          {ch.name}
                        </span>
                        <span className="text-xs text-slate-500">Open →</span>
                      </Link>
                    )
                  )
                ) : (
                  <p className="text-xs text-slate-500">No channels configured yet.</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<MessagesSquare className="h-8 w-8" />}
          title="No communities available yet"
          description="University administrators can create student communities and channels from the admin console."
        />
      )}
    </div>
  );
}
