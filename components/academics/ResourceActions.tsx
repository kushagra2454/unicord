"use client";

import React, { useState } from "react";
import { Bookmark, Download, Flag } from "lucide-react";
import { AlertBanner, Button } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/client";

export function ResourceActions({
  resourceId,
  universityId,
  initialSaved,
  canDownload,
}: {
  resourceId: string;
  universityId: string;
  initialSaved: boolean;
  canDownload: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [downloading, setDownloading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("Incorrect subject or metadata");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleDownload() {
    setDownloading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/resources/${resourceId}/download`);
      const json = (await res.json()) as { signedUrl?: string; error?: string };
      if (!res.ok || !json.signedUrl) {
        setFeedback(json.error || "Unable to generate download link.");
        return;
      }
      window.open(json.signedUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  }

  async function toggleSave() {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      if (saved) {
        await supabase
          .from("resource_saves")
          .delete()
          .eq("user_id", user.id)
          .eq("resource_id", resourceId);
        setSaved(false);
      } else {
        await supabase
          .from("resource_saves")
          .insert({ user_id: user.id, resource_id: resourceId });
        setSaved(true);
      }
    } catch {
      setFeedback("Unable to update bookmark.");
    }
  }

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        universityId,
        targetType: "resource",
        targetId: resourceId,
        reason,
      }),
    });
    if (res.ok) {
      setFeedback("Report submitted to university moderators.");
      setReportOpen(false);
    } else {
      setFeedback("Could not submit report.");
    }
  }

  return (
    <div className="space-y-3">
      {feedback && <AlertBanner tone="info">{feedback}</AlertBanner>}
      <div className="flex flex-wrap gap-2.5">
        <Button onClick={handleDownload} disabled={!canDownload || downloading}>
          <Download className="h-4 w-4" />
          {downloading ? "Generating Signed URL..." : "Download File"}
        </Button>
        <Button type="button" variant="secondary" onClick={toggleSave}>
          <Bookmark className="h-4 w-4" />
          {saved ? "Saved" : "Save"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setReportOpen(!reportOpen)}>
          <Flag className="h-4 w-4" />
          Report
        </Button>
      </div>

      {reportOpen && (
        <form
          onSubmit={submitReport}
          className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-[#090f1d] p-3"
        >
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="rounded-lg border border-slate-700 bg-[#070b14] px-3 py-1.5 text-xs text-slate-100"
          >
            <option>Incorrect subject or metadata</option>
            <option>Unauthentic or fabricated PYQ</option>
            <option>Copyrighted textbook violation</option>
            <option>Corrupted or unreadable file</option>
          </select>
          <Button type="submit" variant="danger">
            Submit Report
          </Button>
        </form>
      )}
    </div>
  );
}
