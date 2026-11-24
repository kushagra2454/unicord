import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getIntegrationStatus } from "@/lib/env";
import {
  JECRC_OFFICIAL_CALENDAR_DOCS,
  JECRC_OFFICIAL_SCHOOLS,
  JECRC_OFFICIAL_SOURCES,
  JECRC_UNIVERSITY_META,
} from "@/lib/sources/jecrc";
import type {
  AcademicTerm,
  InstitutionalContent,
  Profile,
  School,
  University,
  UniversityMembership,
} from "@/types/database";

export async function getCurrentUserContext() {
  const status = getIntegrationStatus();
  if (!status.supabaseReady) {
    return {
      configured: false,
      user: null,
      profile: null as Profile | null,
      memberships: [] as UniversityMembership[],
      activeUniversity: null as University | null,
    };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return {
      configured: false,
      user: null,
      profile: null,
      memberships: [],
      activeUniversity: null,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      configured: true,
      user: null,
      profile: null,
      memberships: [],
      activeUniversity: null,
    };
  }

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("university_memberships")
      .select("*, universities(*), schools(*)")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: true }),
  ]);

  const typedMemberships = (memberships ?? []) as unknown as UniversityMembership[];
  const activeMembership =
    typedMemberships.find((m) => m.university_id === profile?.active_university_id) ??
    typedMemberships[0] ??
    null;

  return {
    configured: true,
    user,
    profile: (profile as Profile | null) ?? null,
    memberships: typedMemberships,
    activeUniversity: (activeMembership?.universities as University | undefined) ?? null,
  };
}

export async function getPublicUniversities(): Promise<{
  fromDatabase: boolean;
  universities: University[];
}> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("universities")
      .select("*")
      .eq("environment", "production")
      .eq("status", "active")
      .order("name");

    if (!error && data && data.length > 0) {
      return { fromDatabase: true, universities: data as University[] };
    }
  }

  // Fallback strictly to verified official JECRC reference metadata (not fabricated data)
  return {
    fromDatabase: false,
    universities: [
      {
        id: JECRC_UNIVERSITY_META.id,
        name: JECRC_UNIVERSITY_META.name,
        slug: JECRC_UNIVERSITY_META.slug,
        official_website: JECRC_UNIVERSITY_META.officialWebsite,
        city: JECRC_UNIVERSITY_META.city,
        state: JECRC_UNIVERSITY_META.state,
        country: JECRC_UNIVERSITY_META.country,
        address: JECRC_UNIVERSITY_META.address,
        description:
          "Launch tenant preconfigured from official JECRC University public web pages with visible source links and verification dates.",
        logo_path: null,
        status: "active",
        environment: "production",
        require_verified_domain: false,
        created_at: JECRC_UNIVERSITY_META.verifiedSnapshotTimestamp,
        updated_at: JECRC_UNIVERSITY_META.verifiedSnapshotTimestamp,
      },
    ],
  };
}

export async function getPublicUniversityBySlug(slug: string): Promise<{
  fromDatabase: boolean;
  university: University | null;
  schools: School[];
  calendars: AcademicTerm[];
  content: InstitutionalContent[];
  sources: { name: string; source_url: string; source_type: string; last_fetched_at: string | null }[];
}> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data: uni } = await supabase
      .from("universities")
      .select("*")
      .eq("slug", slug)
      .eq("environment", "production")
      .maybeSingle();

    if (uni) {
      const [{ data: schools }, { data: calendars }, { data: content }, { data: sources }] =
        await Promise.all([
          supabase.from("schools").select("*").eq("university_id", uni.id).order("name"),
          supabase
            .from("academic_terms")
            .select("*")
            .eq("university_id", uni.id)
            .order("academic_year", { ascending: false }),
          supabase
            .from("institutional_content")
            .select("*")
            .eq("university_id", uni.id)
            .in("verification_status", ["verified_official", "stale"])
            .order("category"),
          supabase
            .from("institutional_sources")
            .select("name, source_url, source_type, last_fetched_at")
            .eq("university_id", uni.id)
            .order("name"),
        ]);

      return {
        fromDatabase: true,
        university: uni as University,
        schools: (schools ?? []) as School[],
        calendars: (calendars ?? []) as AcademicTerm[],
        content: (content ?? []) as InstitutionalContent[],
        sources: (sources ?? []) as {
          name: string;
          source_url: string;
          source_type: string;
          last_fetched_at: string | null;
        }[],
      };
    }
  }

  if (slug !== JECRC_UNIVERSITY_META.slug) {
    return {
      fromDatabase: false,
      university: null,
      schools: [],
      calendars: [],
      content: [],
      sources: [],
    };
  }

  const { universities } = await getPublicUniversities();
  const jecrc = universities[0] ?? null;

  return {
    fromDatabase: false,
    university: jecrc,
    schools: JECRC_OFFICIAL_SCHOOLS.map((name, i) => ({
      id: `jecrc-school-${i + 1}`,
      university_id: JECRC_UNIVERSITY_META.id,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      source_url: "https://jecrcuniversity.edu.in/programs/",
      is_active: true,
    })),
    calendars: JECRC_OFFICIAL_CALENDAR_DOCS.map((c, i) => ({
      id: `jecrc-cal-${i + 1}`,
      university_id: JECRC_UNIVERSITY_META.id,
      school_id: null,
      name: c.title,
      academic_year: c.academicYear,
      start_date: null,
      end_date: null,
      source_url: c.sourcePage,
      document_url: c.documentUrl,
      last_checked_at: JECRC_UNIVERSITY_META.verifiedSnapshotTimestamp,
      status: "verified_official",
    })),
    content: JECRC_OFFICIAL_SOURCES.slice(0, 6).map((s, i) => ({
      id: `jecrc-src-${i + 1}`,
      university_id: JECRC_UNIVERSITY_META.id,
      category: s.sourceType,
      title: s.name,
      summary: s.summary,
      source_url: s.sourceUrl,
      source_organization: "JECRC University",
      metadata: {},
      effective_at: null,
      expires_at: null,
      verification_status: "verified_official",
      last_fetched_at: JECRC_UNIVERSITY_META.verifiedSnapshotTimestamp,
      reviewed_at: null,
    })),
    sources: JECRC_OFFICIAL_SOURCES.map((s) => ({
      name: s.name,
      source_url: s.sourceUrl,
      source_type: s.sourceType,
      last_fetched_at: JECRC_UNIVERSITY_META.verifiedSnapshotTimestamp,
    })),
  };
}
