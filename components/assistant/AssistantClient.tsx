"use client";

import React, { useState } from "react";
import { Bot, ExternalLink, Send, Trash2 } from "lucide-react";
import { AlertBanner, Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import type { AIPersona } from "@/types/database";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ title: string; url: string; type: string }>;
}

const PERSONA_OPTIONS: Array<{ value: AIPersona; label: string; desc: string }> = [
  {
    value: "study_buddy",
    label: "Study Buddy",
    desc: "Step-by-step concept explanations and revision help.",
  },
  {
    value: "campus_guide",
    label: "Campus Guide",
    desc: "University schools, calendars, clubs, and sourced campus info.",
  },
  {
    value: "placement_mentor",
    label: "Placement Mentor",
    desc: "Interview preparation, resume feedback, and career guidance.",
  },
  {
    value: "project_partner",
    label: "Project Partner",
    desc: "Architecture brainstorming and project milestone planning.",
  },
  {
    value: "opportunity_finder",
    label: "Opportunity Finder",
    desc: "Matches authorized, non-expired internships & hackathons.",
  },
];

export function AssistantClient({
  universityId,
  universityName,
  geminiConfigured,
  initialConversations,
}: {
  universityId: string;
  universityName: string;
  geminiConfigured: boolean;
  initialConversations: Array<{ id: string; title: string; persona: string }>;
}) {
  const [persona, setPersona] = useState<AIPersona>("study_buddy");
  const [prompt, setPrompt] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState(initialConversations);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    const question = prompt.trim();
    setPrompt("");
    setError(null);
    setTurns((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universityId,
          conversationId,
          persona,
          prompt: question,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        conversationId?: string;
        answer?: string;
        citations?: Array<{ title: string; url: string; type: string }>;
      };
      if (!res.ok) {
        setError(json.error || "Unable to process AI request.");
        return;
      }
      if (json.conversationId && !conversationId) {
        setConversationId(json.conversationId);
        setConversations((prev) => [
          { id: json.conversationId!, title: question.slice(0, 60), persona },
          ...prev,
        ]);
      }
      setTurns((prev) => [
        ...prev,
        {
          role: "assistant",
          content: json.answer || "No response received.",
          citations: json.citations ?? [],
        },
      ]);
    } catch {
      setError("Network error while calling AI endpoint.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteConversation(id: string) {
    await fetch(`/api/ai/chat?conversationId=${id}`, { method: "DELETE" });
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (conversationId === id) {
      setConversationId(null);
      setTurns([]);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <Card className="space-y-4 lg:col-span-1">
        <div className="space-y-1.5">
          <label htmlFor="ai-persona" className="text-xs font-medium text-slate-300">
            AI Persona (Clearly Labelled AI)
          </label>
          <Select
            id="ai-persona"
            value={persona}
            onChange={(e) => setPersona(e.target.value as AIPersona)}
          >
            {PERSONA_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
          <p className="text-xs text-slate-400">
            {PERSONA_OPTIONS.find((p) => p.value === persona)?.desc}
          </p>
        </div>

        <div className="border-t border-slate-800 pt-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Saved Sessions
            </h2>
            <button
              type="button"
              onClick={() => {
                setConversationId(null);
                setTurns([]);
              }}
              className="text-xs text-indigo-400 hover:underline"
            >
              + New
            </button>
          </div>
          {conversations.length === 0 ? (
            <p className="text-xs text-slate-500">No saved AI sessions yet.</p>
          ) : (
            <div className="space-y-1.5">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-[#090f1d] px-2.5 py-2 text-xs"
                >
                  <span className="truncate text-slate-200">{c.title}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteConversation(c.id)}
                    className="text-slate-500 hover:text-rose-400"
                    title="Delete AI conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="flex h-[560px] flex-col justify-between p-0 overflow-hidden lg:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-semibold text-white">
              Unicord AI • {universityName}
            </span>
          </div>
          <Badge tone={geminiConfigured ? "emerald" : "amber"}>
            {geminiConfigured ? "Server Gemini API Ready" : "GEMINI_API_KEY Not Set"}
          </Badge>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {!geminiConfigured && (
            <AlertBanner tone="warning" title="Gemini API Key Missing">
              Set <code>GEMINI_API_KEY</code> in your server environment (<code>.env.local</code>)
              to enable live Gemini responses. Server retrieval and safety guardrails are active.
            </AlertBanner>
          )}

          {turns.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-400">
              Ask about {universityName} academic calendars, campus clubs, study concepts, or
              verified opportunities. AI can make mistakes — verify factual answers with the
              returned source links.
            </div>
          )}

          {turns.map((turn, idx) => (
            <div
              key={idx}
              className={
                turn.role === "user"
                  ? "ml-auto max-w-[85%] rounded-xl bg-indigo-600/20 border border-indigo-500/30 p-3.5 text-sm text-indigo-100"
                  : "mr-auto max-w-[90%] space-y-2 rounded-xl border border-slate-800 bg-[#090f1d] p-4 text-sm text-slate-200"
              }
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                {turn.role === "user" ? "You" : "Unicord AI (Automated Assistant)"}
              </p>
              <div className="whitespace-pre-wrap leading-relaxed">{turn.content}</div>
              {turn.citations && turn.citations.length > 0 && (
                <div className="border-t border-slate-800 pt-2">
                  <p className="text-[11px] font-semibold text-slate-400">
                    Authorized Source Links:
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {turn.citations.map((c) => (
                      <a
                        key={c.url + c.title}
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-800/70 px-2 py-0.5 text-[11px] text-indigo-300 hover:border-indigo-500"
                      >
                        {c.title} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 bg-[#090f1d] p-3">
          {error && (
            <AlertBanner tone="error" className="mb-2">
              {error}
            </AlertBanner>
          )}
          <form onSubmit={handleAsk} className="flex gap-2">
            <Input
              placeholder="Ask Study Buddy, Campus Guide, or Placement Mentor..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button type="submit" disabled={loading || !prompt.trim()}>
              <Send className="h-4 w-4" />
              {loading ? "Thinking..." : "Ask"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
