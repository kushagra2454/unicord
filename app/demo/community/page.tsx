"use client";

import React, { useState } from "react";
import { Hash, Send } from "lucide-react";
import { useDemoState } from "@/app/demo/layout";
import { Badge, Button, Card, Input, PageHeader } from "@/components/ui/primitives";

const CHANNELS = ["general", "academic-doubts", "placements"];

export default function DemoCommunityPage() {
  const { state, setState } = useDemoState();
  const [activeChannel, setActiveChannel] = useState("general");
  const [draft, setDraft] = useState("");
  const [dmMessages, setDmMessages] = useState([
    { sender: "DEMO USER (Priya)", text: "Hey! Ready to review the DBMS sprint demo?" },
  ]);
  const [dmDraft, setDmDraft] = useState("");

  const channelMessages = state.messages.filter((m) => m.channel === activeChannel);

  function sendChannelMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: `demo-msg-${Date.now()}`,
          channel: activeChannel,
          senderName: "Professor Presenter (Demo)",
          senderBadge: "DEMO USER — SIMULATED PARTICIPANT",
          body: draft.trim(),
          timestamp: "Just now",
        },
      ],
    }));
    setDraft("");
  }

  function sendDm(e: React.FormEvent) {
    e.preventDefault();
    if (!dmDraft.trim()) return;
    setDmMessages((prev) => [
      ...prev,
      { sender: "Professor Presenter (Demo)", text: dmDraft.trim() },
    ]);
    setDmDraft("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demo Community & Direct Messaging"
        subtitle="Simulated Discord-inspired channels and private DM thread."
        badge={<Badge tone="demo">DEMO USER — SIMULATED CHAT</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="space-y-2 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Channels
          </p>
          {CHANNELS.map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => setActiveChannel(ch)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm cursor-pointer ${
                activeChannel === ch
                  ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/30"
                  : "text-slate-400 hover:bg-slate-800/60"
              }`}
            >
              <Hash className="h-4 w-4" />
              {ch}
            </button>
          ))}
        </Card>

        <Card className="flex h-[420px] flex-col justify-between p-0 overflow-hidden lg:col-span-2">
          <div className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-white">
            # {activeChannel}
          </div>
          <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
            {channelMessages.map((m) => (
              <div
                key={m.id}
                className="rounded-lg border border-slate-800 bg-[#090f1d] p-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-indigo-300">{m.senderName}</span>
                  <Badge tone="demo">{m.senderBadge}</Badge>
                  <span className="text-slate-500">{m.timestamp}</span>
                </div>
                <p className="mt-1 text-slate-200">{m.body}</p>
              </div>
            ))}
          </div>
          <form onSubmit={sendChannelMessage} className="flex gap-2 border-t border-slate-800 p-3">
            <Input
              placeholder={`Message #${activeChannel} as demo participant...`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Button type="submit">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>

        <Card className="flex h-[420px] flex-col justify-between p-0 overflow-hidden lg:col-span-1">
          <div className="border-b border-slate-800 px-4 py-3 text-xs font-semibold text-white">
            Simulated Direct Message
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-xs">
            {dmMessages.map((d, i) => (
              <div key={i} className="rounded-lg border border-slate-800 bg-[#090f1d] p-2.5">
                <p className="font-semibold text-amber-300">{d.sender}</p>
                <p className="mt-0.5 text-slate-200">{d.text}</p>
              </div>
            ))}
          </div>
          <form onSubmit={sendDm} className="flex gap-2 border-t border-slate-800 p-2.5">
            <Input
              placeholder="Demo DM..."
              value={dmDraft}
              onChange={(e) => setDmDraft(e.target.value)}
            />
            <Button type="submit">Send</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
