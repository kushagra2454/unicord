import Link from "next/link";
import { Users } from "lucide-react";
import { requireUniversityAccess } from "@/lib/auth/tenant";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Badge, Card, EmptyState, Input, PageHeader } from "@/components/ui/primitives";
import { StartDmButton } from "@/components/messaging/StartDmButton";

export const dynamic = "force-dynamic";

export default async function PeopleDirectoryPage({
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

  const { data: rows } = supabase
    ? await supabase
        .from("university_memberships")
        .select(
          "user_id, role, verification_status, programme, year_of_study, profiles!inner(id, full_name, username, bio, skills, privacy_settings)"
        )
        .eq("university_id", tenant.university.id)
        .neq("verification_status", "rejected")
        .limit(50)
    : { data: [] };

  const visiblePeers = (rows ?? []).filter((row) => {
    const p = row.profiles as unknown as {
      id: string;
      full_name: string;
      username: string;
      bio: string | null;
      skills: string[];
      privacy_settings?: { show_profile?: boolean };
    };
    if (!p || p.id === tenant.userId) return false;
    if (p.privacy_settings?.show_profile === false) return false;
    if (!q.trim()) return true;
    const term = q.trim().toLowerCase();
    return (
      p.full_name.toLowerCase().includes(term) ||
      p.username.toLowerCase().includes(term) ||
      (row.programme ?? "").toLowerCase().includes(term) ||
      (p.skills ?? []).some((s) => s.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Directory"
        subtitle={`Connect with consenting peers at ${tenant.university.name}. Emails and phone numbers remain private.`}
      />

      <Card>
        <form className="flex gap-2">
          <Input
            name="q"
            defaultValue={q}
            placeholder="Filter by name, username, programme, or skill..."
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Search
          </button>
        </form>
      </Card>

      {visiblePeers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visiblePeers.map((row) => {
            const p = row.profiles as unknown as {
              id: string;
              full_name: string;
              username: string;
              bio: string | null;
              skills: string[];
            };
            return (
              <Card key={p.id} className="flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/${universitySlug}/profile/${p.username}`}
                        className="text-base font-semibold text-white hover:text-indigo-300"
                      >
                        {p.full_name}
                      </Link>
                      <p className="text-xs text-slate-400">@{p.username}</p>
                    </div>
                    <Badge
                      tone={row.verification_status === "verified" ? "emerald" : "amber"}
                    >
                      {row.verification_status}
                    </Badge>
                  </div>
                  {row.programme && (
                    <p className="text-xs text-slate-300">
                      {row.programme} {row.year_of_study ? `• Year ${row.year_of_study}` : ""}
                    </p>
                  )}
                  {p.bio && <p className="line-clamp-2 text-xs text-slate-400">{p.bio}</p>}
                  {p.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {p.skills.slice(0, 5).map((s) => (
                        <Badge key={s} tone="neutral">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-slate-800 pt-2.5">
                  <Link
                    href={`/${universitySlug}/profile/${p.username}`}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    View Profile
                  </Link>
                  <StartDmButton
                    universityId={tenant.university.id}
                    universitySlug={universitySlug}
                    recipientId={p.id}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="No visible peers match this filter"
          description="Only students who have joined this university and enabled profile visibility appear here."
        />
      )}
    </div>
  );
}
