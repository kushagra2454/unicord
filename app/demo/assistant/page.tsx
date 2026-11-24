"use client";

import React, { useState } from "react";
import { ExternalLink, Send } from "lucide-react";
import { Badge, Button, Card, Input, PageHeader, Select } from "@/components/ui/primitives";
import type { AIPersona } from "@/types/database";

export default function DemoAssistantPage() {
  const [persona, setPersona] = useState<AIPersona>("campus_guide");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<
    Array<{
      role: "user" | "assistant";
      content: string;
      mode?: string;
      citations?: Array<{ title: string; url: string }>;
    }>
  >([]);

  async function askDemoAi(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    const q = prompt.trim();
    setPrompt("");
    setTurns((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/demo/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona, prompt: q }),
      });
      const json = (await res.json()) as {
        answer?: string;
        mode?: string;
        citations?: Array<{ title: string; url: string }>;
      };
      setTurns((prev) => [
        ...prev,
        {
          role: "assistant",
          content: json.answer || "Unable to respond.",
          mode: json.mode,
          citations: json.citations,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demo AI Campus Assistant"
        subtitle="Calls Gemini server-side when GEMINI_API_KEY is configured, or provides a transparent scripted walkthrough."
        badge={<Badge tone="demo">DEMO AI SANDBOX</Badge>}
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={persona}
            onChange={(e) => setPersona(e.target.value as AIPersona)}
            className="sm:w-64"
          >
            <option value="campus_guide">Campus Guide</option>
            <option value="study_buddy">Study Buddy</option>
            <option value="placement_mentor">Placement Mentor</option>
            <option value="project_partner">Project Partner</option>
            <option value="opportunity_finder">Opportunity Finder</option>
          </Select>
          <button
            type="button"
            onClick={() => setPrompt("Where can I find the 2026-27 JECRC academic calendar?")}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
          >
            Try: Academic Calendar Query
          </button>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-800 bg-[#090f1d] p-4 min-h-[260px]">
          {turns.length === 0 && (
            <p className="text-xs text-slate-500">
              Ask a question to test the server-side AI endpoint and source citation rendering.
            </p>
          )}
          {turns.map((t, i) => (
            <div key={i} className="space-y-1.5 rounded-lg border border-slate-800 p-3 text-sm">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-indigo-300">
                  {t.role === "user" ? "Presenter" : "Unicord Demo AI"}
                </span>
                {t.mode && <Badge tone="sky">{t.mode}</Badge>}
              </div>
              <p className="whitespace-pre-wrap text-slate-200">{t.content}</p>
              {t.citations && t.citations.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {t.citations.map((c) => (
                    <a
                      key={c.url + c.title}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:underline"
                    >
                      {c.title} <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={askDemoAi} className="flex gap-2">
          <Input
            placeholder="Ask the demo AI assistant..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            <Send className="h-4 w-4" />
            {loading ? "Asking..." : "Send"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
