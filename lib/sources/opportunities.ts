import type { OpportunityCategory, OpportunityVerificationStatus } from "@/types/database";

export interface NormalizedOpportunityInput {
  externalId: string | null;
  canonicalUrl: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  description: string;
  workMode: "remote" | "onsite" | "hybrid" | "unspecified";
  location: string | null;
  stipendText: string | null;
  eligibility: string | null;
  skills: string[];
  sourceUrl: string;
  applicationUrl: string;
  postedAt: string | null;
  deadline: string | null;
  verificationStatus: OpportunityVerificationStatus;
  lastCheckedAt: string;
}

export interface IngestionRunReport {
  sourceName: string;
  sourceUrl: string;
  status: "success" | "failed" | "skipped";
  httpStatus: number | null;
  itemsFetched: number;
  items: NormalizedOpportunityInput[];
  checkedAt: string;
  error?: string;
}

function stripTags(raw: string): string {
  return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Fetches live public hackathon listings from Devpost's public JSON endpoint.
 * Returns normalized records with exact source URLs and retrieval timestamps.
 */
export async function fetchDevpostHackathons(limit = 12): Promise<IngestionRunReport> {
  const sourceUrl = "https://devpost.com/api/hackathons";
  const checkedAt = new Date().toISOString();
  try {
    const res = await fetch(`${sourceUrl}?status[]=open&per_page=${limit}`, {
      headers: {
        "User-Agent": "UnicordIngestion/1.0",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        sourceName: "Devpost Public Hackathons Feed",
        sourceUrl,
        status: "failed",
        httpStatus: res.status,
        itemsFetched: 0,
        items: [],
        checkedAt,
        error: `HTTP ${res.status}`,
      };
    }

    const data = (await res.json()) as {
      hackathons?: Array<{
        id?: number;
        title?: string;
        organization_name?: string;
        url?: string;
        submission_period_dates?: string;
        open_state?: string;
        displayed_location?: { location?: string };
        themes?: Array<{ name?: string }>;
        prize_amount?: string;
      }>;
    };

    const rawItems = Array.isArray(data.hackathons) ? data.hackathons : [];
    const items: NormalizedOpportunityInput[] = [];

    for (const h of rawItems.slice(0, limit)) {
      if (!h.title || !h.url) continue;
      const loc = h.displayed_location?.location || "Online";
      const isRemote = /online|remote/i.test(loc);
      const isOpen = h.open_state === "open";
      items.push({
        externalId: h.id ? `devpost:${h.id}` : null,
        canonicalUrl: h.url,
        title: h.title.trim(),
        organization: (h.organization_name || "Devpost Organizer").trim(),
        category: "hackathon",
        description: `Public hackathon listed on Devpost (${h.submission_period_dates || "see source for dates"}).`,
        workMode: isRemote ? "remote" : "hybrid",
        location: loc,
        stipendText: h.prize_amount ? stripTags(h.prize_amount) : null,
        eligibility: "See official Devpost rules",
        skills: (h.themes ?? []).map((t) => t.name || "").filter(Boolean).slice(0, 6),
        sourceUrl: h.url,
        applicationUrl: h.url,
        postedAt: null,
        deadline: null,
        verificationStatus: isOpen ? "source_listed_unreviewed" : "closed",
        lastCheckedAt: checkedAt,
      });
    }

    return {
      sourceName: "Devpost Public Hackathons Feed",
      sourceUrl,
      status: "success",
      httpStatus: res.status,
      itemsFetched: items.length,
      items,
      checkedAt,
    };
  } catch (err) {
    return {
      sourceName: "Devpost Public Hackathons Feed",
      sourceUrl,
      status: "failed",
      httpStatus: null,
      itemsFetched: 0,
      items: [],
      checkedAt,
      error: err instanceof Error ? err.message : "Fetch error",
    };
  }
}

/**
 * Fetches live public remote tech roles from RemoteOK's public JSON API.
 * Strictly preserves source URL and marks newly fetched items as source_listed_unreviewed until human review.
 */
export async function fetchRemoteOkListings(limit = 10): Promise<IngestionRunReport> {
  const sourceUrl = "https://remoteok.com/api";
  const checkedAt = new Date().toISOString();
  try {
    const res = await fetch(sourceUrl, {
      headers: {
        "User-Agent": "UnicordIngestion/1.0",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        sourceName: "RemoteOK Public API",
        sourceUrl,
        status: "failed",
        httpStatus: res.status,
        itemsFetched: 0,
        items: [],
        checkedAt,
        error: `HTTP ${res.status}`,
      };
    }

    const payload = (await res.json()) as Array<{
      id?: string;
      position?: string;
      company?: string;
      location?: string;
      tags?: string[];
      url?: string;
      apply_url?: string;
      date?: string;
      description?: string;
    }>;

    const items: NormalizedOpportunityInput[] = [];
    for (const row of payload.slice(1)) {
      if (!row.position || !row.company || !row.url) continue;
      const isIntern = /intern/i.test(row.position);
      const summary = row.description
        ? stripTags(row.description).slice(0, 260) + "..."
        : `Remote role at ${row.company}. Open original listing for full requirements.`;

      items.push({
        externalId: row.id ? `remoteok:${row.id}` : null,
        canonicalUrl: row.url,
        title: row.position.trim(),
        organization: row.company.trim(),
        category: isIntern ? "remote_internship" : "full_time",
        description: summary,
        workMode: "remote",
        location: row.location?.trim() || "Remote",
        stipendText: null,
        eligibility: "See original employer listing",
        skills: Array.isArray(row.tags) ? row.tags.slice(0, 6) : [],
        sourceUrl: row.url,
        applicationUrl: row.apply_url || row.url,
        postedAt: row.date || null,
        deadline: null,
        verificationStatus: "source_listed_unreviewed",
        lastCheckedAt: checkedAt,
      });

      if (items.length >= limit) break;
    }

    return {
      sourceName: "RemoteOK Public API",
      sourceUrl,
      status: "success",
      httpStatus: res.status,
      itemsFetched: items.length,
      items,
      checkedAt,
    };
  } catch (err) {
    return {
      sourceName: "RemoteOK Public API",
      sourceUrl,
      status: "failed",
      httpStatus: null,
      itemsFetched: 0,
      items: [],
      checkedAt,
      error: err instanceof Error ? err.message : "Fetch error",
    };
  }
}

export function computeFreshnessStatus(
  currentStatus: OpportunityVerificationStatus,
  deadline: string | null,
  lastCheckedAt: string,
  freshnessWindowHours = 72,
  now = new Date()
): OpportunityVerificationStatus {
  if (currentStatus === "rejected" || currentStatus === "closed") {
    return currentStatus;
  }
  if (deadline && new Date(deadline).getTime() < now.getTime()) {
    return "expired";
  }
  const ageHours = (now.getTime() - new Date(lastCheckedAt).getTime()) / (1000 * 60 * 60);
  if (ageHours > freshnessWindowHours && currentStatus === "verified_current") {
    return "stale";
  }
  return currentStatus;
}
