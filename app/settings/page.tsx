import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserContext } from "@/lib/data/queries";
import { PageHeader } from "@/components/ui/primitives";
import { SettingsForm } from "@/components/profile/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx.user) {
    redirect("/login?next=/settings");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <PageHeader
        title="Account & Privacy Settings"
        subtitle={`Signed in as ${ctx.user.email ?? "student"}`}
        actions={
          <Link
            href={
              ctx.activeUniversity
                ? `/${ctx.activeUniversity.slug}/dashboard`
                : "/onboarding/university"
            }
            className="rounded-lg border border-slate-700 px-3.5 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            ← Back to Campus
          </Link>
        }
      />

      <SettingsForm profile={ctx.profile} />
    </div>
  );
}
