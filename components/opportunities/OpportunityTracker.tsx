"use client";

import React, { useState } from "react";
import { BookmarkCheck, Flag } from "lucide-react";
import { AlertBanner, Button, Select, Textarea } from "@/components/ui/primitives";

export function OpportunityTracker({
  opportunityId,
  initialStatus,
  initialNotes,
}: {
  opportunityId: string;
  initialStatus?: string;
  initialNotes?: string;
}) {
  const [status, setStatus] = useState(initialStatus || "saved");
  const [notes, setNotes] = useState(initialNotes || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/opportunities/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId,
          applicationStatus: status,
          privateNotes: notes,
        }),
      });
      setMsg(res.ok ? "Application tracker updated." : "Failed to save tracker.");
    } finally {
      setSaving(false);
    }
  }

  async function handleReport() {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: "opportunity",
        targetId: opportunityId,
        reason: "Expired or misleading listing",
      }),
    });
    setMsg(
      res.ok
        ? "Reported to moderators for freshness verification."
        : "Unable to submit report."
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      {msg && <AlertBanner tone="info">{msg}</AlertBanner>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="opp-status" className="text-xs font-medium text-slate-300">
            Personal Application Status
          </label>
          <Select
            id="opp-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="saved">Saved</option>
            <option value="planning">Planning to Apply</option>
            <option value="applied">Applied</option>
            <option value="assessment">Assessment</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="opp-notes" className="text-xs font-medium text-slate-300">
          Private Notes (visible only to you)
        </label>
        <Textarea
          id="opp-notes"
          rows={3}
          placeholder="Referral contact, assessment link, preparation notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Button type="submit" disabled={saving}>
          <BookmarkCheck className="h-4 w-4" />
          {saving ? "Saving..." : "Save Tracking"}
        </Button>
        <Button type="button" variant="ghost" onClick={handleReport}>
          <Flag className="h-4 w-4" />
          Report Expired / Scam
        </Button>
      </div>
    </form>
  );
}
