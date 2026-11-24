import Link from "next/link";
import { notFound } from "next/navigation";
import { Hash } from "lucide-react";
import { requireUniversityAccess } from "@/lib/auth/tenant";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { canPostInChannel } from "@/lib/permissions/roles";
import { Card, PageHeader } from "@/components/ui/primitives";
import {
  ChannelChatClient,
  type ChannelMessageItem,
} from "@/components/community/ChannelChatClient";

export const dynamic = "force-dynamic";

export default async function CommunityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ universitySlug: string; id: string }>;
  searchParams: Promise<{ channel?: string }>;
}) {
  const { universitySlug, id } = await params;
  const { channel: requestedChannelId } = await searchParams;
  const tenant = await requireUniversityAccess(universitySlug);
  const supabase = await createServerSupabaseClient();
  if (!supabase) notFound();

  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("id", id)
    .eq("university_id", tenant.university.id)
    .eq("environment", "production")
    .maybeSingle();

  if (!community) notFound();

  const { data: channels } = await supabase
    .from("channels")
    .select("*")
    .eq("community_id", community.id)
    .order("name");

  const channelList = channels ?? [];
  const activeChannel =
    channelList.find((c) => c.id === requestedChannelId) ?? channelList[0] ?? null;

  let messages: ChannelMessageItem[] = [];
  if (activeChannel) {
    const { data: msgRows } = await supabase
      .from("messages")
      .select("id, sender_id, body, created_at, deleted_at, profiles(full_name, username)")
      .eq("channel_id", activeChannel.id)
      .order("created_at", { ascending: true })
      .limit(80);
    messages = (msgRows ?? []) as unknown as ChannelMessageItem[];
  }

  const canPost = activeChannel
    ? canPostInChannel(activeChannel, tenant.membership, tenant.isPlatformAdmin)
    : false;

  return (
    <div className="space-y-6">
      <PageHeader
        title={community.name}
        subtitle={community.description || "University-scoped community"}
        actions={
          <Link
            href={`/${universitySlug}/community`}
            className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800"
          >
            ← All Communities
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-4">
        <Card className="space-y-2 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Channels
          </p>
          <div className="space-y-1">
            {channelList.map((ch) => (
              <Link
                key={ch.id}
                href={`/${universitySlug}/community/${community.id}?channel=${ch.id}`}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  activeChannel?.id === ch.id
                    ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/30"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <Hash className="h-4 w-4 shrink-0" />
                <span className="truncate">{ch.name}</span>
              </Link>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-3">
          {activeChannel ? (
            <ChannelChatClient
              key={activeChannel.id}
              universityId={tenant.university.id}
              channelId={activeChannel.id}
              channelName={activeChannel.name}
              currentUserId={tenant.userId}
              canPost={canPost}
              initialMessages={messages}
            />
          ) : (
            <Card>
              <p className="text-sm text-slate-400">No channels found in this community.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
