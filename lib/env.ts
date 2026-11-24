export interface IntegrationStatus {
  supabaseUrlConfigured: boolean;
  supabaseAnonKeyConfigured: boolean;
  supabaseServiceRoleConfigured: boolean;
  supabaseReady: boolean;
  geminiConfigured: boolean;
  cronSecretConfigured: boolean;
  demoSupabaseConfigured: boolean;
}

export function getPublicEnv() {
  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "",
  };
}

export function getServerEnv() {
  const pub = getPublicEnv();
  return {
    ...pub,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "",
    geminiApiKey: process.env.GEMINI_API_KEY?.trim() || "",
    geminiModel: process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash",
    ingestionCronSecret: process.env.INGESTION_CRON_SECRET?.trim() || "",
    demoSupabaseUrl: process.env.NEXT_PUBLIC_DEMO_SUPABASE_URL?.trim() || "",
    demoSupabaseAnonKey: process.env.NEXT_PUBLIC_DEMO_SUPABASE_ANON_KEY?.trim() || "",
    demoServiceRoleKey: process.env.DEMO_SUPABASE_SERVICE_ROLE_KEY?.trim() || "",
  };
}

export function getIntegrationStatus(): IntegrationStatus {
  const env = getServerEnv();
  const supabaseUrlConfigured = Boolean(env.supabaseUrl && /^https?:\/\//.test(env.supabaseUrl));
  const supabaseAnonKeyConfigured = Boolean(env.supabaseAnonKey);
  const supabaseServiceRoleConfigured = Boolean(env.serviceRoleKey);

  return {
    supabaseUrlConfigured,
    supabaseAnonKeyConfigured,
    supabaseServiceRoleConfigured,
    supabaseReady: supabaseUrlConfigured && supabaseAnonKeyConfigured,
    geminiConfigured: Boolean(env.geminiApiKey),
    cronSecretConfigured: Boolean(env.ingestionCronSecret),
    demoSupabaseConfigured: Boolean(env.demoSupabaseUrl && env.demoSupabaseAnonKey),
  };
}
