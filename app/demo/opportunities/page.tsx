"use client";

import React, { useState } from "react";
import { ExternalLink } from "lucide-react";
import { useDemoState } from "@/app/demo/layout";
import { Badge, Card, PageHeader, Select } from "@/components/ui/primitives";

export default function DemoOpportunitiesPage() {
  const { state } = useDemoState();
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demo Opportunities & Freshness Guard"
        subtitle="Demonstrates source attribution, automatic expiry detection, and application status tracking."
        badge={<Badge tone="demo">DEMO — EXAMPLE ONLY — NOT AN ACTIVE VACANCY</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {state.opportunities.map((opp) => (
          <Card key={opp.id} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge tone="demo">{opp.label}</Badge>
              <Badge tone={opp.status === "verified_current" ? "emerald" : "rose"}>
                {opp.status}
              </Badge>
            </div>
            <h2 className="text-base font-semibold text-white">{opp.title}</h2>
            <p className="text-xs text-slate-400">
              {opp.organization} • {opp.workMode} ({opp.location}) • Deadline: {opp.deadlineText}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3">
              <Select
                value={statuses[opp.id] ?? "saved"}
                onChange={(e) =>
                  setStatuses((prev) => ({ ...prev, [opp.id]: e.target.value }))
                }
                className="w-44"
              >
                <option value="saved">Saved</option>
                <option value="planning">Planning</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
              </Select>
              <a
                href={opp.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline"
              >
                Reference Link <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
