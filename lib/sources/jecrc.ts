export interface JecrcSourceDefinition {
  name: string;
  sourceUrl: string;
  sourceType:
    | "overview"
    | "programs"
    | "academic_calendar"
    | "placements"
    | "clubs"
    | "career_cell"
    | "public_disclosure";
  summary: string;
}

export const JECRC_UNIVERSITY_META = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "JECRC University",
  slug: "jecrc-university-jaipur",
  officialWebsite: "https://jecrcuniversity.edu.in/",
  city: "Jaipur",
  state: "Rajasthan",
  country: "India",
  address:
    "Plot No. IS-2036 to IS-2039, Ramchandrapura Industrial Area, Vidhani, Sitapura Extension, Jaipur, Rajasthan 303905, India",
  verifiedSnapshotTimestamp: "2026-11-24T17:50:00Z",
} as const;

export const JECRC_OFFICIAL_SOURCES: JecrcSourceDefinition[] = [
  {
    name: "JECRC University Main Website",
    sourceUrl: "https://jecrcuniversity.edu.in/",
    sourceType: "overview",
    summary: "Official institutional homepage and navigation.",
  },
  {
    name: "University Overview",
    sourceUrl: "https://jecrcuniversity.edu.in/overview/",
    sourceType: "overview",
    summary: "Official university overview, vision, mission, and campus address.",
  },
  {
    name: "Schools & Programmes",
    sourceUrl: "https://jecrcuniversity.edu.in/programs/",
    sourceType: "programs",
    summary: "Official list of JECRC University schools and degree programmes.",
  },
  {
    name: "Academic Calendars",
    sourceUrl: "https://jecrcuniversity.edu.in/academic-calendar/",
    sourceType: "academic_calendar",
    summary: "Published 2026–27 and earlier school-specific academic calendar PDFs.",
  },
  {
    name: "Placements & Internships",
    sourceUrl: "https://jecrcuniversity.edu.in/placements/",
    sourceType: "placements",
    summary:
      "University-published overview of campus recruitment training, six-month internship programme, and recruiter relationships.",
  },
  {
    name: "Clubs & Communities",
    sourceUrl: "https://jecrcuniversity.edu.in/clubs-communities/",
    sourceType: "clubs",
    summary: "Official student chapters, technical societies, and cultural communities.",
  },
  {
    name: "Career Development & Guidance Cell (CDGC)",
    sourceUrl: "https://jecrcuniversity.edu.in/career-development-guidance-cell-cdgc/",
    sourceType: "career_cell",
    summary: "CDGC placement readiness, counselling, and career preparation overview.",
  },
  {
    name: "Public Self-Disclosure",
    sourceUrl: "https://jecrcuniversity.edu.in/public-self-disclosure/",
    sourceType: "public_disclosure",
    summary: "Statutory disclosures and official university governance documents.",
  },
];

export const JECRC_OFFICIAL_SCHOOLS = [
  "School of Engineering & Technology",
  "School of Computer Applications",
  "Jaipur School of Business",
  "Jaipur School of Business (Hospital and Health Care Management)",
  "School of Sciences",
  "School of Humanities & Social Sciences",
  "School of Law",
  "Jaipur School of Mass Communication",
  "Jaipur School of Design",
  "School of Allied Health Sciences",
  "Jaipur School of Economics",
  "School of Hospitality",
] as const;

export const JECRC_OFFICIAL_CALENDAR_DOCS = [
  {
    title: "Academic Calendar 2026–27 (General University Schools)",
    academicYear: "2026-27",
    schoolName: null,
    sourcePage: "https://jecrcuniversity.edu.in/academic-calendar/",
    documentUrl:
      "https://jecrcuniversity.edu.in/wp-content/uploads/2026/08/Academic-Calendar-2026-27.pdf",
  },
  {
    title: "School of Law Academic Calendar 2026–27 (Odd Semester)",
    academicYear: "2026-27",
    schoolName: "School of Law",
    sourcePage: "https://jecrcuniversity.edu.in/academic-calendar/",
    documentUrl:
      "https://jecrcuniversity.edu.in/wp-content/uploads/2026/11/Academic_Calendar_School_of_Law_%282026-27%29_Odd_Sem.pdf",
  },
  {
    title: "List of Holidays 2026",
    academicYear: "2026",
    schoolName: null,
    sourcePage: "https://jecrcuniversity.edu.in/academic-calendar/",
    documentUrl:
      "https://jecrcuniversity.edu.in/wp-content/uploads/2026/01/List-of-Holidays-2026.pdf",
  },
  {
    title: "MBA Hospital & Healthcare Management Academic Calendar 2025–26",
    academicYear: "2025-26",
    schoolName: "Jaipur School of Business (Hospital and Health Care Management)",
    sourcePage: "https://jecrcuniversity.edu.in/academic-calendar/",
    documentUrl:
      "https://jecrcuniversity.edu.in/wp-content/uploads/2026/01/Academic-Calendar-2025-26-MBA-Hospital-Healthcare-1.pdf",
  },
] as const;

export interface LiveSourceCheckResult {
  sourceUrl: string;
  name: string;
  httpStatus: number | null;
  ok: boolean;
  pageTitle: string | null;
  extractedPdfLinks: { url: string; label: string }[];
  checkedAt: string;
  error?: string;
}

/**
 * Performs a respectful HTTP GET against a single official public page.
 * Never bypasses login walls, CAPTCHAs, or ERP endpoints.
 */
export async function checkOfficialSource(
  source: JecrcSourceDefinition
): Promise<LiveSourceCheckResult> {
  const checkedAt = new Date().toISOString();
  try {
    const res = await fetch(source.sourceUrl, {
      method: "GET",
      headers: {
        "User-Agent": "UnicordSourceVerifier/1.0 (+https://unicord.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

    const html = res.ok ? await res.text() : "";
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch?.[1]?.replace(/\s+/g, " ").trim() ?? null;

    const seenUrls = new Set<string>();
    const extractedPdfLinks: { url: string; label: string }[] = [];
    for (const match of html.matchAll(
      /href=["']([^"']*\.pdf[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi
    )) {
      const url = match[1];
      if (!url || seenUrls.has(url)) continue;
      seenUrls.add(url);
      const label = (match[2] ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      extractedPdfLinks.push({ url, label: label || "PDF Document" });
      if (extractedPdfLinks.length >= 15) break;
    }

    return {
      sourceUrl: source.sourceUrl,
      name: source.name,
      httpStatus: res.status,
      ok: res.ok,
      pageTitle,
      extractedPdfLinks,
      checkedAt,
    };
  } catch (err) {
    return {
      sourceUrl: source.sourceUrl,
      name: source.name,
      httpStatus: null,
      ok: false,
      pageTitle: null,
      extractedPdfLinks: [],
      checkedAt,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}
