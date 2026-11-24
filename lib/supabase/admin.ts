import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env";

/**
 * Privileged service-role client. Server-side only.
 * Never import this file into a Client Component.
 */
export function createAdminSupabaseClient() {
  const { supabaseUrl, serviceRoleKey } = getServerEnv();
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
