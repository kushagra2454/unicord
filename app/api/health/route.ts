import { NextResponse } from "next/server";
import { getIntegrationStatus } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const status = getIntegrationStatus();
  let dbReachable = false;
  let dbError: string | null = null;

  if (status.supabaseReady) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from("universities").select("id").limit(1);
        dbReachable = !error;
        if (error) dbError = error.message;
      }
    } catch (err) {
      dbError = err instanceof Error ? err.message : "Database check failed";
    }
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    integrations: {
      supabaseConfigured: status.supabaseReady,
      supabaseServiceRoleConfigured: status.supabaseServiceRoleConfigured,
      databaseReachable: dbReachable,
      databaseError: dbError,
      geminiConfigured: status.geminiConfigured,
      cronSecretConfigured: status.cronSecretConfigured,
      demoSupabaseConfigured: status.demoSupabaseConfigured,
    },
  });
}
