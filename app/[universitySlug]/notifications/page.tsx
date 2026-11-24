import { Bell } from "lucide-react";
import { requireUniversityAccess } from "@/lib/auth/tenant";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ universitySlug: string }>;
}) {
  const { universitySlug } = await params;
  const tenant = await requireUniversityAccess(universitySlug);
  const supabase = await createServerSupabaseClient();

  const { data: notifications } = supabase
    ? await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", tenant.userId)
        .order("created_at", { ascending: false })
        .limit(30)
    : { data: [] };

  const list = notifications ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Resource moderation updates, direct messages, and university announcements."
      />

      {list.length > 0 ? (
        <div className="space-y-2.5">
          {list.map((n) => (
            <Card key={n.id} className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge tone="indigo">{n.type}</Badge>
                  <span className="text-xs text-slate-500">{formatDateTime(n.created_at)}</span>
                </div>
                <p className="text-sm text-slate-200">
                  {String((n.payload as Record<string, unknown>)?.message ?? "Activity update")}
                </p>
              </div>
              {!n.read_at && <Badge tone="amber">Unread</Badge>}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title="You're all caught up"
          description="Notifications appear here when your uploads are reviewed or when you receive messages."
        />
      )}
    </div>
  );
}
