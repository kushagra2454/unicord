"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertBanner, Button, Input, Select } from "@/components/ui/primitives";
import type { University } from "@/types/database";

export function JoinUniversityForm({ universities }: { universities: University[] }) {
  const router = useRouter();
  const [universityId, setUniversityId] = useState(universities[0]?.id ?? "");
  const [programme, setProgramme] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("1");
  const [semester, setSemester] = useState("1");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null
  );

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/tenancy/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universityId,
          programme: programme.trim() || null,
          yearOfStudy: Number(yearOfStudy),
          semester: Number(semester),
        }),
      });
      const json = (await res.json()) as { error?: string; alreadyMember?: boolean };
      if (!res.ok) {
        setMessage({ tone: "error", text: json.error || "Unable to submit join request." });
        return;
      }

      const selected = universities.find((u) => u.id === universityId);
      setMessage({
        tone: "success",
        text: json.alreadyMember
          ? "You already have a membership record for this university."
          : "Membership request created with status: pending.",
      });
      if (selected) {
        router.push(`/${selected.slug}/dashboard`);
        router.refresh();
      }
    } catch {
      setMessage({ tone: "error", text: "Network error while joining university." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleJoin} className="space-y-4">
      {message && <AlertBanner tone={message.tone}>{message.text}</AlertBanner>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="join-uni" className="text-xs font-medium text-slate-300">
            Select university
          </label>
          <Select
            id="join-uni"
            value={universityId}
            onChange={(e) => setUniversityId(e.target.value)}
          >
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.city}, {u.state}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="join-programme" className="text-xs font-medium text-slate-300">
            Programme (optional)
          </label>
          <Input
            id="join-programme"
            placeholder="e.g., B.Tech Computer Science & Engineering"
            value={programme}
            onChange={(e) => setProgramme(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="join-year" className="text-xs font-medium text-slate-300">
            Year of study
          </label>
          <Select
            id="join-year"
            value={yearOfStudy}
            onChange={(e) => setYearOfStudy(e.target.value)}
          >
            {[1, 2, 3, 4, 5].map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="join-sem" className="text-xs font-medium text-slate-300">
            Semester
          </label>
          <Select id="join-sem" value={semester} onChange={(e) => setSemester(e.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={loading || !universityId}>
        {loading ? "Joining..." : "Join University"}
      </Button>
    </form>
  );
}
