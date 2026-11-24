import Link from "next/link";
import { Building2, ExternalLink, MapPin } from "lucide-react";
import { getPublicUniversities } from "@/lib/data/queries";
import { Badge, Card, PageHeader } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function UniversitiesDirectoryPage() {
  const { universities, fromDatabase } = await getPublicUniversities();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Participating Universities"
        subtitle="Discover active campus tenants, verified official sources, and academic structures."
        badge={
          <Badge tone={fromDatabase ? "emerald" : "sky"}>
            {fromDatabase ? "Live Supabase Directory" : "Official Reference Metadata"}
          </Badge>
        }
        actions={
          <Link
            href="/onboarding/university"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Join a University
          </Link>
        }
      />

      <div className="grid gap-5 md:grid-cols-2">
        {universities.map((uni) => (
          <Card key={uni.id} className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{uni.name}</h2>
                    <p className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
                      {uni.city}, {uni.state}, {uni.country}
                    </p>
                  </div>
                </div>
                <Badge tone="emerald">Active Tenant</Badge>
              </div>

              <p className="text-sm leading-relaxed text-slate-300">{uni.description}</p>
              {uni.address && (
                <p className="text-xs text-slate-500">Campus: {uni.address}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
              <Link
                href={`/universities/${uni.slug}`}
                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Open Information Centre →
              </Link>
              {uni.official_website && (
                <a
                  href={uni.official_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
                >
                  Official Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
