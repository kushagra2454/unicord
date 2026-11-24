import { requireUniversityAccess } from "@/lib/auth/tenant";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getIntegrationStatus } from "@/lib/env";
import { PageHeader } from "@/components/ui/primitives";
import { AssistantClient } from "@/components/assistant/AssistantClient";

export const dynamic = "force-dynamic";

export default async function AssistantPage({
  params,
}: {
  params: Promise<{ universitySlug: string }>;
}) {
  const { universitySlug } = await params;
  const tenant = await requireUniversityAccess(universitySlug);
  const supabase = await createServerSupabaseClient();
  const status = getIntegrationStatus();

  const { data: conversations } = supabase
    ? await supabase
        .from("ai_conversations")
        .select("id, title, persona")
        .eq("user_id", tenant.userId)
        .eq("environment", "production")
        .order("created_at", { ascending: false })
        .limit(12)
    : { data: [] };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Campus Assistant"
        subtitle="Server-side Gemini integration with permission-aware database retrieval and source citations."
      />

      <AssistantClient
        universityId={tenant.university.id}
        universityName={tenant.university.name}
        geminiConfigured={status.geminiConfigured}
        initialConversations={conversations ?? []}
      />
    </div>
  );
}
