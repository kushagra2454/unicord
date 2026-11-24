"use client";

import { RotateCcw } from "lucide-react";
import { useDemoState } from "@/app/demo/layout";
import { Badge, Button, Card, PageHeader } from "@/components/ui/primitives";

export default function DemoAdminPage() {
  const { state, setState, resetDemo } = useDemoState();

  function updateMemberStatus(id: string, status: "verified" | "rejected") {
    setState((prev) => ({
      ...prev,
      memberships: prev.memberships.map((m) => (m.id === id ? { ...m, status } : m)),
    }));
  }

  function updateResourceStatus(id: string, status: "verified" | "rejected") {
    setState((prev) => ({
      ...prev,
      resources: prev.resources.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demo Moderation Queue"
        subtitle="Test approving simulated student verifications and academic uploads without affecting production."
        badge={<Badge tone="demo">DEMO ADMIN — ISOLATED</Badge>}
        actions={
          <Button type="button" variant="secondary" onClick={resetDemo}>
            <RotateCcw className="h-4 w-4" />
            Reset Demo State
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-white">Simulated Membership Queue</h2>
          {state.memberships.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-[#090f1d] p-3"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  {m.studentName} (@{m.username})
                </p>
                <p className="text-xs text-slate-400">{m.programme}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  tone={
                    m.status === "verified"
                      ? "emerald"
                      : m.status === "rejected"
                        ? "rose"
                        : "amber"
                  }
                >
                  {m.status}
                </Badge>
                <Button
                  type="button"
                  onClick={() => updateMemberStatus(m.id, "verified")}
                >
                  Verify
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => updateMemberStatus(m.id, "rejected")}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-white">Simulated Resource Queue</h2>
          {state.resources.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-[#090f1d] p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{r.title}</p>
                <p className="text-xs text-slate-400">{r.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  tone={
                    r.status === "verified"
                      ? "emerald"
                      : r.status === "rejected"
                        ? "rose"
                        : "amber"
                  }
                >
                  {r.status}
                </Badge>
                <Button
                  type="button"
                  onClick={() => updateResourceStatus(r.id, "verified")}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => updateResourceStatus(r.id, "rejected")}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
