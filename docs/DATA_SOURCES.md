# Data Sources, Provenance & Freshness Policy

## JECRC University Official Source Registry

Preconfigured strictly from live public pages at `https://jecrcuniversity.edu.in/`:

- Overview: `https://jecrcuniversity.edu.in/overview/`
- Schools & Programmes: `https://jecrcuniversity.edu.in/programs/`
- Academic Calendars: `https://jecrcuniversity.edu.in/academic-calendar/` (including 2026–27 PDFs and separate School of Law calendar)
- Placements & Internships: `https://jecrcuniversity.edu.in/placements/`
- Clubs & Communities: `https://jecrcuniversity.edu.in/clubs-communities/`
- Career Development & Guidance Cell (CDGC): `https://jecrcuniversity.edu.in/career-development-guidance-cell-cdgc/`
- Public Self-Disclosure: `https://jecrcuniversity.edu.in/public-self-disclosure/`

Unicord does not scrape private ERPs, student portals, or login-walled systems.

## Opportunity Ingestion Pipeline

`/api/ingestion/run` (protected by `INGESTION_CRON_SECRET` or admin session) respects source permissions and fetches permitted public feeds:

- Devpost Public Hackathons API (`https://devpost.com/api/hackathons`)
- RemoteOK Public API (`https://remoteok.com/api`)

Every listing stores `canonical_url`, `source_url`, `application_url`, `last_checked_at`, and `verification_status`. Newly ingested external items enter as `source_listed_unreviewed` until human moderation, and expired deadlines automatically resolve to `expired`.
