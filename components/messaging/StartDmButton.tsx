"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/primitives";

export function StartDmButton({
  universityId,
  universitySlug,
  recipientId,
}: {
  universityId: string;
  universitySlug: string;
  recipientId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function startChat() {
    setLoading(true);
    try {
      const res = await fetch("/api/direct-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityId, recipientId }),
      });
      const json = (await res.json()) as { conversationId?: string };
      if (res.ok && json.conversationId) {
        router.push(`/${universitySlug}/messages?c=${json.conversationId}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="secondary" onClick={startChat} disabled={loading}>
      <MessageSquare className="h-3.5 w-3.5" />
      {loading ? "Opening..." : "Message"}
    </Button>
  );
}
