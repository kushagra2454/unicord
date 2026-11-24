"use client";

import React, { useEffect, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";
import { AlertBanner, Badge, Button, Card, Input } from "@/components/ui/primitives";

export interface ChannelMessageItem {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  deleted_at: string | null;
  profiles?: { full_name: string; username: string } | null;
}

export function ChannelChatClient({
  universityId,
  channelId,
  channelName,
  currentUserId,
  canPost,
  initialMessages,
}: {
  universityId: string;
  channelId: string;
  channelName: string;
  currentUserId: string;
  canPost: boolean;
  initialMessages: ChannelMessageItem[];
}) {
  const [messages, setMessages] = useState<ChannelMessageItem[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let channelSub: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    try {
      const supabase = createClient();
      channelSub = supabase
        .channel(`room:${channelId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `channel_id=eq.${channelId}`,
          },
          (payload) => {
            const incoming = payload.new as ChannelMessageItem;
            setMessages((prev) =>
              prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
            );
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
            filter: `channel_id=eq.${channelId}`,
          },
          (payload) => {
            const updated = payload.new as ChannelMessageItem;
            setMessages((prev) =>
              prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
            );
          }
        )
        .subscribe();
    } catch {
      // Realtime unavailable when client env is missing
    }

    return () => {
      if (channelSub) {
        try {
          createClient().removeChannel(channelSub);
        } catch {
          // ignore
        }
      }
    };
  }, [channelId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universityId,
          channelId,
          body: body.trim(),
        }),
      });
      const json = (await res.json()) as { error?: string; message?: ChannelMessageItem };
      if (!res.ok) {
        setError(json.error || "Unable to send message");
        return;
      }
      if (json.message) {
        const msg = json.message;
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      }
      setBody("");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(messageId: string) {
    const supabase = createClient();
    await supabase
      .from("messages")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", messageId)
      .eq("sender_id", currentUserId);
  }

  return (
    <Card className="flex h-[540px] flex-col justify-between p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white"># {channelName}</span>
          <Badge tone="emerald">Supabase Realtime</Badge>
        </div>
        <span className="text-xs text-slate-500">{messages.length} messages</span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">
            No messages in #{channelName} yet. Start the conversation below.
          </p>
        ) : (
          messages
            .filter((m) => !m.deleted_at)
            .map((m) => (
              <div
                key={m.id}
                className="group flex items-start justify-between gap-3 rounded-lg border border-slate-800/70 bg-[#090f1d] px-3.5 py-2.5"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-indigo-300">
                      {m.profiles?.full_name ?? "Member"}
                    </span>
                    {m.profiles?.username && (
                      <span className="text-slate-500">@{m.profiles.username}</span>
                    )}
                    <span className="text-[11px] text-slate-600">
                      {formatDateTime(m.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{m.body}</p>
                </div>
                {m.sender_id === currentUserId && (
                  <button
                    type="button"
                    onClick={() => handleDelete(m.id)}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-500 hover:text-rose-400"
                    title="Delete your message"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))
        )}
      </div>

      <div className="border-t border-slate-800 bg-[#090f1d] p-3">
        {error && (
          <AlertBanner tone="error" className="mb-2">
            {error}
          </AlertBanner>
        )}
        {canPost ? (
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              placeholder={`Message #${channelName}...`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <Button type="submit" disabled={sending || !body.trim()}>
              <Send className="h-4 w-4" />
              Send
            </Button>
          </form>
        ) : (
          <p className="text-xs text-amber-300">
            Posting in this channel is restricted to verified members or moderators.
          </p>
        )}
      </div>
    </Card>
  );
}
