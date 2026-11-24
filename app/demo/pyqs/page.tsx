"use client";

import React, { useState } from "react";
import { useDemoState } from "@/app/demo/layout";
import { AlertBanner, Badge, Card, Input, PageHeader } from "@/components/ui/primitives";

export default function DemoPyqsPage() {
  const { state } = useDemoState();
  const [search, setSearch] = useState("");

  const papers = state.resources.filter(
    (r) =>
      (r.type === "pyq" || r.type === "ai_practice_paper") &&
      (!search.trim() ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.subject.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demo PYQ Centre"
        subtitle="Demonstrates authentic PYQ provenance badges vs AI-generated practice material labels."
        badge={<Badge tone="demo">DEMO — NOT AN AUTHENTIC PYQ</Badge>}
      />

      <AlertBanner tone="warning" title="Non-Authentic Demo Examples">
        None of the papers on this demo route are real university exam papers. In production, PYQs
        require human provenance inspection before receiving the verified badge.
      </AlertBanner>

      <Card>
        <Input
          placeholder="Filter simulated papers by subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {papers.map((p) => (
          <Card key={p.id} className="space-y-2.5">
            <Badge tone={p.type === "ai_practice_paper" ? "amber" : "demo"}>
              {p.label}
            </Badge>
            <h2 className="text-base font-semibold text-white">{p.title}</h2>
            <p className="text-xs text-slate-400">
              {p.subject} ({p.subjectCode}) {p.examYear ? `• ${p.examYear}` : ""}
            </p>
            <Badge tone="emerald">Demo Status: {p.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
