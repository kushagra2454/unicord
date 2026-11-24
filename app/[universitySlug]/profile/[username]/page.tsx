import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireUniversityAccess } from "@/lib/auth/tenant";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeExternalUrl } from "@/lib/utils";
import { Badge, Card, PageHeader } from "@/components/ui/primitives";
import { StartDmButton } from "@/components/messaging/StartDmButton";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ universitySlug: string; username: string }>;
}) {
  const { universitySlug, username } = await params;
  const tenant = await requireUniversityAccess(universitySlug);
  const supabase = await createServerSupabaseClient();
  if (!supabase) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", username)
    .eq("environment", "production")
    .maybeSingle();

  if (!profile) notFound();

  const { data: membership } = await supabase
    .from("university_memberships")
    .select("role, verification_status, programme, year_of_study, semester")
    .eq("university_id", tenant.university.id)
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!membership) notFound();

  const github = sanitizeExternalUrl(profile.portfolio_links?.github);
  const linkedin = sanitizeExternalUrl(profile.portfolio_links?.linkedin);

  return (
    <div className="space-y-6">
      <PageHeader
        title={profile.full_name}
        subtitle={`@${profile.username} • ${tenant.university.name}`}
        badge={
          <Badge tone={membership.verification_status === "verified" ? "emerald" : "amber"}>
            {membership.verification_status}
          </Badge>
        }
        actions={
          profile.id !== tenant.userId ? (
            <StartDmButton
              universityId={tenant.university.id}
              universitySlug={universitySlug}
              recipientId={profile.id}
            />
          ) : (
            <Link
              href="/settings"
              className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800"
            >
              Edit Profile
            </Link>
          )
        }
      />

      <Card className="space-y-4">
        {membership.programme && (
          <p className="text-sm text-slate-300">
            <strong>Programme:</strong> {membership.programme}{" "}
            {membership.year_of_study ? `• Year ${membership.year_of_study}` : ""}{" "}
            {membership.semester ? `• Sem ${membership.semester}` : ""}
          </p>
        )}
        {profile.bio && <p className="text-sm text-slate-200">{profile.bio}</p>}

        {profile.skills?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((s: string) => (
                <Badge key={s} tone="indigo">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {(github || linkedin) && (
          <div className="flex flex-wrap gap-3 border-t border-slate-800 pt-3 text-xs">
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-400 hover:underline"
              >
                GitHub <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-400 hover:underline"
              >
                LinkedIn <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
