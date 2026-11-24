"use client";

import Link from "next/link";
import { useDemoState } from "@/app/demo/layout";
import { Badge, Card, PageHeader } from "@/components/ui/primitives";

export default function DemoDashboardPage() {
  const { state } = useDemoState();

  return (
    <div className="space-y-6">
      <PageHeader
        title="JECRC University (Demo Sandbox) Dashboard"
        subtitle="Simulated student dashboard demonstrating profile status, verified resources, chat, and opportunities."
        badge={<Badge tone="demo">DEMO — SIMULATED DATA</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-400">Simulated Resources</p>
          <p className="mt-1 text-2xl font-bold text-white">{state.resources.length}</p>
          <Link href="/demo/resources" className="text-xs text-indigo-400 hover:underline">
            Explore library →
          </Link>
        </Card>
        <Card>
          <p className="text-xs text-slate-400">Simulated Chat Messages</p>
          <p className="mt-1 text-2xl font-bold text-white">{state.messages.length}</p>
          <Link href="/demo/community" className="text-xs text-indigo-400 hover:underline">
            Open channels →
          </Link>
        </Card>
        <Card>
          <p className="text-xs text-slate-400">Example Opportunities</p>
          <p className="mt-1 text-2xl font-bold text-white">{state.opportunities.length}</p>
          <Link href="/demo/opportunities" className="text-xs text-indigo-400 hover:underline">
            View listings →
          </Link>
        </Card>
        <Card>
          <p className="text-xs text-slate-400">Pending Moderation Items</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {state.memberships.filter((m) => m.status === "pending").length +
              state.resources.filter((r) => r.status === "pending_review").length}
          </p>
          <Link href="/demo/admin" className="text-xs text-indigo-400 hover:underline">
            Review queue →
          </Link>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-white">Simulated Announcements</h2>
          {state.announcements.map((a) => (
            <div key={a.id} className="space-y-1 rounded-lg border border-slate-800 bg-[#090f1d] p-3">
              <Badge tone="demo">{a.label}</Badge>
              <p className="text-sm font-semibold text-white">{a.title}</p>
              <p className="text-xs text-slate-400">{a.body}</p>
            </div>
          ))}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-white">Simulated Opportunities Preview</h2>
          {state.opportunities.map((o) => (
            <div key={o.id} className="space-y-1 rounded-lg border border-slate-800 bg-[#090f1d] p-3">
              <div className="flex items-center justify-between gap-2">
                <Badge tone="demo">{o.label}</Badge>
                <Badge tone={o.status === "verified_current" ? "emerald" : "rose"}>
                  {o.status}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-white">{o.title}</p>
              <p className="text-xs text-slate-400">{o.organization}</p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
