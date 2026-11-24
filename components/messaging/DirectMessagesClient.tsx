"use client";

import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";
import { AlertBanner, Button, Card, Input } from "@/components/ui/primitives";

interface DMRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export function DirectMessagesClient({
  conversationId,
  currentUserId,
  peerName,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  peerName: string;
  initialMessages: DMRow[];
}) {
  const [messages, setMessages] = useState<DMRow[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let sub: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    try {
      const supabase = createClient();
      sub = supabase
        .channel(`dm:${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "direct_messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const incoming = payload.new as DMRow;
            setMessages((prev) =>
              prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
            );
          }
        )
        .subscribe();
    } catch {
      // ignore if env missing
    }

    return () => {
      if (sub) {
        try {
          createClient().removeChannel(sub);
        } catch {
          // ignore
        }
      }
    };
  }, [conversationId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/direct-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, body: body.trim() }),
      });
      const json = (await res.json()) as { error?: string; directMessage?: DMRow };
      if (!res.ok) {
        setError(json.error || "Unable to send direct message");
        return;
      }
      if (json.directMessage) {
        const dm = json.directMessage;
        setMessages((prev) => (prev.some((m) => m.id === dm.id) ? prev : [...prev, dm]));
      }
      setBody("");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="flex h-[500px] flex-col justify-between p-0 overflow-hidden">
      <div className="border-b border-slate-800 px-4 py-3">
        <p className="text-sm font-semibold text-white">Conversation with {peerName}</p>
        <p className="text-[11px] text-slate-400">
          Participant-only encrypted transport & RLS isolated
        </p>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === currentUserId;
            return (
              <div
                key={m.id}
                className={
                  mine
                    ? "ml-auto max-w-[80%] rounded-xl bg-indigo-600/25 border border-indigo-500/30 px-3.5 py-2.5 text-sm text-indigo-100"
                    : "mr-auto max-w-[80%] rounded-xl bg-[#090f1d] border border-slate-800 px-3.5 py-2.5 text-sm text-slate-200"
                }
              >
                <p>{m.body}</p>
                <p className="mt-1 text-[10px] text-slate-500">
                  {formatDateTime(m.created_at)}
                </p>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-slate-800 bg-[#090f1d] p-3">
        {error && (
          <AlertBanner tone="error" className="mb-2">
            {error}
          </AlertBanner>
        )}
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            placeholder={`Message ${peerName}...`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button type="submit" disabled={sending || !body.trim()}>
            <Send className="h-4 w-4" />
            Send
          </Button>
        </form>
      </div>
    </Card>
  );
}
