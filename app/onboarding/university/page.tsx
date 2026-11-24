import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, CheckCircle2, Clock } from "lucide-react";
import { getCurrentUserContext, getPublicUniversities } from "@/lib/data/queries";
import { AlertBanner, Badge, Card, PageHeader } from "@/components/ui/primitives";
import { JoinUniversityForm } from "@/components/university/JoinUniversityForm";

export const dynamic = "force-dynamic";

export default async function UniversityOnboardingPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx.user) {
    redirect("/login?next=/onboarding/university");
  }

  const { universities } = await getPublicUniversities();

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6">
      <PageHeader
        title="University Membership & Onboarding"
        subtitle="Select your campus tenant or switch between your joined universities."
        actions={
          ctx.activeUniversity ? (
            <Link
              href={`/${ctx.activeUniversity.slug}/dashboard`}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Go to Dashboard →
            </Link>
          ) : null
        }
      />

      <AlertBanner tone="info" title="Verification Policy">
        New university memberships start as <strong>pending</strong> until confirmed by an
        authorized university administrator or verified institutional domain. You cannot assign
        yourself a moderator or verified badge.
      </AlertBanner>

      {ctx.memberships.length > 0 && (
        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-white">Your Memberships</h2>
          <div className="space-y-2.5">
            {ctx.memberships.map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-[#090f1d] p-3.5"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-indigo-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {m.universities?.name ?? m.university_id}
                    </p>
                    <p className="text-xs text-slate-400">
                      Role: {m.role} {m.programme ? `• ${m.programme}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    tone={m.verification_status === "verified" ? "emerald" : "amber"}
                  >
                    {m.verification_status === "verified" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {m.verification_status}
                  </Badge>
                  {m.universities?.slug && (
                    <Link
                      href={`/${m.universities.slug}/dashboard`}
                      className="rounded-lg border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800"
                    >
                      Open Campus
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="space-y-4">
        <h2 className="text-base font-semibold text-white">Join a Participating University</h2>
        <JoinUniversityForm universities={universities} />
      </Card>
    </div>
  );
}
