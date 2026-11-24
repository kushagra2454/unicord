"use client";

import React, { useState } from "react";
import { useDemoState } from "@/app/demo/layout";
import { Badge, Button, Card, Input, PageHeader, Select } from "@/components/ui/primitives";

export default function DemoResourcesPage() {
  const { state, setState } = useDemoState();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newType, setNewType] = useState<"lecture_notes" | "pyq" | "lab_manual">(
    "lecture_notes"
  );

  const filtered = state.resources.filter((r) => {
    if (typeFilter && r.type !== typeFilter) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.subjectCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  function handleDemoUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newSubject.trim()) return;
    setState((prev) => ({
      ...prev,
      resources: [
        {
          id: `demo-res-${Date.now()}`,
          title: newTitle.trim(),
          subject: newSubject.trim(),
          subjectCode: "DEMO-NEW",
          school: "School of Engineering & Technology",
          type: newType,
          status: "pending_review",
          label:
            newType === "pyq"
              ? "DEMO — NOT AN AUTHENTIC PYQ"
              : "DEMO — SIMULATED RESOURCE",
          uploader: "DEMO PRESENTER",
        },
        ...prev.resources,
      ],
    }));
    setNewTitle("");
    setNewSubject("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demo Academic Resources"
        subtitle="Filter simulated campus uploads and test submitting a demo resource into the moderation queue."
        badge={<Badge tone="demo">DEMO — SIMULATED RESOURCES</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-4 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Search simulated title or subject..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All types</option>
              <option value="lecture_notes">Lecture Notes</option>
              <option value="pyq">Simulated PYQ</option>
              <option value="ai_practice_paper">AI Practice Paper</option>
              <option value="lab_manual">Lab Manual</option>
            </Select>
          </div>

          <div className="space-y-3">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="space-y-2 rounded-lg border border-slate-800 bg-[#090f1d] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge tone="demo">{r.label}</Badge>
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
                </div>
                <p className="text-base font-semibold text-white">{r.title}</p>
                <p className="text-xs text-slate-400">
                  {r.subject} ({r.subjectCode}) • {r.school} • Uploaded by {r.uploader}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-white">Simulate Resource Upload</h2>
          <p className="text-xs text-slate-400">
            Adds a simulated entry to demo state with status <code>pending_review</code>. Approve
            it inside <code>/demo/admin</code>.
          </p>
          <form onSubmit={handleDemoUpload} className="space-y-3">
            <Input
              required
              placeholder="Resource title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Input
              required
              placeholder="Subject name"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
            />
            <Select
              value={newType}
              onChange={(e) =>
                setNewType(e.target.value as "lecture_notes" | "pyq" | "lab_manual")
              }
            >
              <option value="lecture_notes">Lecture Notes</option>
              <option value="lab_manual">Lab Manual</option>
              <option value="pyq">Simulated PYQ</option>
            </Select>
            <Button type="submit" className="w-full">
              Add Simulated Upload
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
