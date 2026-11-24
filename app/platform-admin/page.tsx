import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserContext, getPublicUniversities } from "@/lib/data/queries";
import { Badge, Card, PageHeader } from "@/components/ui/primitives";
import { PlatformAdminClient } from "@/components/admin/PlatformAdminClient";

export const dynamic = "force-dynamic";

export default async function PlatformAdminPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx.user || !ctx.profile?.is_platform_admin) {
    redirect("/dashboard");
  }

  const { universities } = await getPublicUniversities();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <PageHeader
        title="Platform Administration"
        subtitle="Manage participating university tenants across Unicord."
        badge={<Badge tone="sky">Platform Admin Only</Badge>}
        actions={
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800"
          >
            ← Back to App
          </Link>
        }
      />

      <PlatformAdminClient />

      <Card className="space-y-3">
        <h2 className="text-base font-semibold text-white">
          Active University Tenants ({universities.length})
        </h2>
        <div className="space-y-2">
          {universities.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#090f1d] px-3.5 py-2.5 text-sm"
            >
              <div>
                <p className="font-semibold text-white">{u.name}</p>
                <p className="text-xs text-slate-400">
                  /{u.slug} • {u.city}, {u.state}
                </p>
              </div>
              <Link
                href={`/${u.slug}/admin`}
                className="text-xs text-indigo-400 hover:underline"
              >
                University Admin →
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
