import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { requireUniversityAccess } from "@/lib/auth/tenant";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { DirectMessagesClient } from "@/components/messaging/DirectMessagesClient";

export const dynamic = "force-dynamic";

export default async function MessagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ universitySlug: string }>;
  searchParams: Promise<{ c?: string }>;
}) {
  const { universitySlug } = await params;
  const { c: activeConvId } = await searchParams;
  const tenant = await requireUniversityAccess(universitySlug);
  const supabase = await createServerSupabaseClient();

  const { data: memberships } = supabase
    ? await supabase
        .from("conversation_members")
        .select("conversation_id, conversations!inner(id, university_id, created_at)")
        .eq("user_id", tenant.userId)
        .eq("conversations.university_id", tenant.university.id)
    : { data: [] };

  const convIds = (memberships ?? []).map((m) => m.conversation_id);
  const selectedId = activeConvId && convIds.includes(activeConvId) ? activeConvId : convIds[0];

  let messages: Array<{
    id: string;
    conversation_id: string;
    sender_id: string;
    body: string;
    created_at: string;
  }> = [];

  if (supabase && selectedId) {
    const { data } = await supabase
      .from("direct_messages")
      .select("id, conversation_id, sender_id, body, created_at")
      .eq("conversation_id", selectedId)
      .order("created_at", { ascending: true })
      .limit(100);
    messages = data ?? [];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Direct Messages"
        subtitle="Private participant-only conversations within your active university."
        actions={
          <Link
            href={`/${universitySlug}/people`}
            className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Find Peers to Message
          </Link>
        }
      />

      {convIds.length > 0 && selectedId ? (
        <div className="grid gap-5 lg:grid-cols-4">
          <Card className="space-y-2 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Conversations
            </p>
            <div className="space-y-1.5">
              {convIds.map((cid, idx) => (
                <Link
                  key={cid}
                  href={`/${universitySlug}/messages?c=${cid}`}
                  className={`block rounded-lg px-3 py-2 text-xs font-medium ${
                    cid === selectedId
                      ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/30"
                      : "text-slate-400 hover:bg-slate-800/60"
                  }`}
                >
                  Conversation #{idx + 1}
                </Link>
              ))}
            </div>
          </Card>

          <div className="lg:col-span-3">
            <DirectMessagesClient
              key={selectedId}
              conversationId={selectedId}
              currentUserId={tenant.userId}
              peerName="Campus Peer"
              initialMessages={messages}
            />
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<MessageSquare className="h-8 w-8" />}
          title="No direct conversations yet"
          description="Visit the People directory to connect with fellow students in your university."
          action={
            <Link
              href={`/${universitySlug}/people`}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Browse Student Directory
            </Link>
          }
        />
      )}
    </div>
  );
}
