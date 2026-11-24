import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { checkOfficialSource, JECRC_OFFICIAL_SOURCES, JECRC_UNIVERSITY_META } from "@/lib/sources/jecrc";
import {
  computeFreshnessStatus,
  fetchDevpostHackathons,
  fetchRemoteOkListings,
} from "@/lib/sources/opportunities";

async function isAuthorizedIngestionCaller(request: Request): Promise<{
  authorized: boolean;
  actorId: string | null;
}> {
  const { ingestionCronSecret } = getServerEnv();
  const authHeader = request.headers.get("authorization");
  if (ingestionCronSecret && authHeader === `Bearer ${ingestionCronSecret}`) {
    return { authorized: true, actorId: null };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { authorized: false, actorId: null };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { authorized: false, actorId: null };

  const [{ data: profile }, { data: adminMembership }] = await Promise.all([
    supabase.from("profiles").select("is_platform_admin").eq("id", user.id).maybeSingle(),
    supabase
      .from("university_memberships")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["university_admin"])
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    authorized: Boolean(profile?.is_platform_admin || adminMembership),
    actorId: user.id,
  };
}

export async function POST(request: Request) {
  const caller = await isAuthorizedIngestionCaller(request);
  if (!caller.authorized) {
    return NextResponse.json(
      { error: "Unauthorized. Requires valid INGESTION_CRON_SECRET or admin role." },
      { status: 403 }
    );
  }

  const [jecrcResults, devpostReport, remoteOkReport] = await Promise.all([
    Promise.all(JECRC_OFFICIAL_SOURCES.map((s) => checkOfficialSource(s))),
    fetchDevpostHackathons(10),
    fetchRemoteOkListings(8),
  ]);

  const admin = createAdminSupabaseClient();
  let persistedOpportunities = 0;

  if (admin) {
    for (const check of jecrcResults) {
      await admin
        .from("institutional_sources")
        .update({
          last_fetched_at: check.checkedAt,
          last_success_at: check.ok ? check.checkedAt : undefined,
          last_http_status: check.httpStatus,
          status: check.ok ? "active" : "stale",
        })
        .eq("university_id", JECRC_UNIVERSITY_META.id)
        .eq("source_url", check.sourceUrl);
    }

    const combinedItems = [...devpostReport.items, ...remoteOkReport.items];
    for (const item of combinedItems) {
      const { error } = await admin.from("opportunities").upsert(
        {
          university_id: null,
          external_id: item.externalId,
          canonical_url: item.canonicalUrl,
          title: item.title,
          organization: item.organization,
          category: item.category,
          description: item.description,
          work_mode: item.workMode,
          location: item.location,
          stipend_text: item.stipendText,
          eligibility: item.eligibility,
          skills: item.skills,
          source_url: item.sourceUrl,
          application_url: item.applicationUrl,
          posted_at: item.postedAt,
          deadline: item.deadline,
          verification_status: computeFreshnessStatus(
            item.verificationStatus,
            item.deadline,
            item.lastCheckedAt
          ),
          last_checked_at: item.lastCheckedAt,
          environment: "production",
        },
        { onConflict: "environment,canonical_url" }
      );
      if (!error) persistedOpportunities += 1;
    }

    await admin.from("audit_logs").insert({
      university_id: JECRC_UNIVERSITY_META.id,
      actor_id: caller.actorId,
      action: "source_ingestion_run",
      target_type: "source_registry",
      metadata: {
        jecrcChecked: jecrcResults.length,
        devpostFetched: devpostReport.itemsFetched,
        remoteOkFetched: remoteOkReport.itemsFetched,
        persistedOpportunities,
      },
      environment: "production",
    });
  }

  return NextResponse.json({
    ok: true,
    persistedToDatabase: Boolean(admin),
    persistedOpportunities,
    institutionalChecks: jecrcResults.map((r) => ({
      name: r.name,
      sourceUrl: r.sourceUrl,
      ok: r.ok,
      httpStatus: r.httpStatus,
      pdfCount: r.extractedPdfLinks.length,
      checkedAt: r.checkedAt,
    })),
    opportunityFeeds: [
      {
        name: devpostReport.sourceName,
        status: devpostReport.status,
        itemsFetched: devpostReport.itemsFetched,
        checkedAt: devpostReport.checkedAt,
      },
      {
        name: remoteOkReport.sourceName,
        status: remoteOkReport.status,
        itemsFetched: remoteOkReport.itemsFetched,
        checkedAt: remoteOkReport.checkedAt,
      },
    ],
  });
}

export async function GET(request: Request) {
  return POST(request);
}
