"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ShieldCheck } from "lucide-react";
import {
  AlertBanner,
  Badge,
  Button,
  Card,
  Input,
  Textarea,
} from "@/components/ui/primitives";
import { formatDateTime } from "@/lib/utils";

interface AdminConsoleProps {
  universityId: string;
  isAdmin: boolean;
  pendingMembers: Array<{
    id: string;
    role: string;
    verification_status: string;
    programme: string | null;
    profiles?: { full_name: string; username: string } | null;
  }>;
  pendingResources: Array<{
    id: string;
    title: string;
    resource_type: string;
    subject_name: string | null;
    verification_status: string;
    provenance_notes: string | null;
  }>;
  openReports: Array<{
    id: string;
    target_type: string;
    reason: string;
    status: string;
    created_at: string;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    target_type: string;
    created_at: string;
  }>;
}

export function AdminConsoleClient({
  universityId,
  isAdmin,
  pendingMembers,
  pendingResources,
  openReports,
  auditLogs,
}: AdminConsoleProps) {
  const router = useRouter();
  const [statusMsg, setStatusMsg] = useState<{ tone: "success" | "error"; text: string } | null>(
    null
  );
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeBody, setNoticeBody] = useState("");
  const [noticeSource, setNoticeSource] = useState("");
  const [ingesting, setIngesting] = useState(false);

  async function dispatchAction(payload: Record<string, unknown>) {
    setStatusMsg(null);
    const res = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ universityId, ...payload }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setStatusMsg({ tone: "error", text: json.error || "Action failed" });
      return false;
    }
    setStatusMsg({ tone: "success", text: "Action recorded and logged to audit trail." });
    router.refresh();
    return true;
  }

  async function runSourceIngestion() {
    setIngesting(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/ingestion/run", { method: "POST" });
      const json = (await res.json()) as {
        error?: string;
        persistedOpportunities?: number;
      };
      if (!res.ok) {
        setStatusMsg({ tone: "error", text: json.error || "Ingestion failed" });
        return;
      }
      setStatusMsg({
        tone: "success",
        text: `Source check completed. Persisted/updated ${json.persistedOpportunities ?? 0} opportunity listings.`,
      });
      router.refresh();
    } finally {
      setIngesting(false);
    }
  }

  async function handlePublishNotice(e: React.FormEvent) {
    e.preventDefault();
    const ok = await dispatchAction({
      action: "publish_announcement",
      title: noticeTitle,
      body: noticeBody,
      sourceUrl: noticeSource,
      audience: "all_members",
    });
    if (ok) {
      setNoticeTitle("");
      setNoticeBody("");
      setNoticeSource("");
    }
  }

  return (
    <div className="space-y-6">
      {statusMsg && <AlertBanner tone={statusMsg.tone}>{statusMsg.text}</AlertBanner>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Student Verification Queue */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              Membership Verification Queue ({pendingMembers.length})
            </h2>
            <Badge tone={isAdmin ? "emerald" : "amber"}>
              {isAdmin ? "Admin Controls Active" : "View Only (Moderator)"}
            </Badge>
          </div>
          {pendingMembers.length === 0 ? (
            <p className="text-xs text-slate-500">No pending membership verifications.</p>
          ) : (
            <div className="space-y-2.5">
              {pendingMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-[#090f1d] p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {m.profiles?.full_name ?? "Student"} (@{m.profiles?.username ?? "user"})
                    </p>
                    <p className="text-xs text-slate-400">
                      {m.programme || "Programme unspecified"} • {m.verification_status}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() =>
                          dispatchAction({
                            action: "review_membership",
                            membershipId: m.id,
                            verificationStatus: "verified",
                            role: "verified_student",
                          })
                        }
                      >
                        Verify
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() =>
                          dispatchAction({
                            action: "review_membership",
                            membershipId: m.id,
                            verificationStatus: "rejected",
                          })
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Academic Resource & PYQ Moderation */}
        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-white">
            Resource & PYQ Review Queue ({pendingResources.length})
          </h2>
          {pendingResources.length === 0 ? (
            <p className="text-xs text-slate-500">No pending resources awaiting review.</p>
          ) : (
            <div className="space-y-2.5">
              {pendingResources.map((r) => (
                <div
                  key={r.id}
                  className="space-y-2 rounded-lg border border-slate-800 bg-[#090f1d] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white">{r.title}</p>
                    <Badge tone="indigo">{r.resource_type}</Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    {r.subject_name || "General"} •{" "}
                    {r.provenance_notes || "No provenance notes provided"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() =>
                        dispatchAction({
                          action: "review_resource",
                          resourceId: r.id,
                          verificationStatus: "verified",
                        })
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() =>
                        dispatchAction({
                          action: "review_resource",
                          resourceId: r.id,
                          verificationStatus: "rejected",
                        })
                      }
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Source Registry Ingestion */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              Source Registry & Feed Ingestion
            </h2>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-400">
            Re-checks official JECRC pages and ingests permitted public opportunity feeds
            (Devpost, RemoteOK) with canonical deduplication.
          </p>
          <Button type="button" onClick={runSourceIngestion} disabled={ingesting}>
            <RefreshCw className={`h-4 w-4 ${ingesting ? "animate-spin" : ""}`} />
            {ingesting ? "Checking Official Sources..." : "Run Source Verification & Sync"}
          </Button>
        </Card>

        {/* Publish University Notice */}
        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-white">Publish University Notice</h2>
          <form onSubmit={handlePublishNotice} className="space-y-3">
            <Input
              required
              placeholder="Notice title"
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
            />
            <Textarea
              required
              rows={2}
              placeholder="Concise factual summary..."
              value={noticeBody}
              onChange={(e) => setNoticeBody(e.target.value)}
            />
            <Input
              type="url"
              placeholder="Official source URL (optional)"
              value={noticeSource}
              onChange={(e) => setNoticeSource(e.target.value)}
            />
            <Button type="submit">Publish Notice</Button>
          </form>
        </Card>
      </div>

      {/* Reports & Audit Logs */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-white">
            Open Reports ({openReports.length})
          </h2>
          {openReports.length === 0 ? (
            <p className="text-xs text-slate-500">No open reports.</p>
          ) : (
            <div className="space-y-2">
              {openReports.map((rep) => (
                <div
                  key={rep.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-[#090f1d] p-3 text-xs"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {rep.target_type}: {rep.reason}
                    </p>
                    <p className="text-slate-500">{formatDateTime(rep.created_at)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        dispatchAction({
                          action: "resolve_report",
                          reportId: rep.id,
                          status: "resolved",
                        })
                      }
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-white">Recent Audit Logs</h2>
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-500">No audit entries recorded yet.</p>
          ) : (
            <div className="space-y-1.5 text-xs">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded border border-slate-800 bg-[#090f1d] px-3 py-2"
                >
                  <span className="font-mono text-indigo-300">{log.action}</span>
                  <span className="text-slate-500">{formatDateTime(log.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
