# Unicord Product Specification Summary

## Core Principles

1. **Zero fabricated real-world content:** Never invent university facts, PYQs, internships, stipends, deadlines, or announcements.
2. **Real authentication:** Users register with real Supabase Auth accounts; no shared demo passwords or auth bypasses in production.
3. **Multi-university tenancy:** Every tenant-owned record carries `university_id` and is protected by PostgreSQL Row Level Security.
4. **Honest states:** Empty sections show transparent empty states and direct official source links.
5. **Isolated Professor Demo (`/demo`):** Uses simulated records clearly labelled `DEMO MODE — SIMULATED DATA — NOT LIVE UNIVERSITY RECORDS`.

## MVP Modules

- **Public Hub (`/`, `/universities`, `/universities/[slug]`):** University directory and JECRC Information Centre with official schools, 2026–27 academic calendar PDFs, clubs, and CDGC/placement source links.
- **Academic Resource Hub & PYQ Centre (`/[universitySlug]/resources`, `/pyqs`, `/upload`):** Private bucket uploads, SHA-256 checksum duplicate detection, short-lived signed downloads, and mandatory provenance checks for PYQs.
- **Community & DMs (`/[universitySlug]/community`, `/messages`, `/people`):** University-scoped channels via Supabase Realtime and participant-only direct messaging.
- **Opportunities (`/[universitySlug]/opportunities`):** Source registry, canonical deduplication, freshness states, expiry guards, and personal application tracking.
- **AI Assistant (`/[universitySlug]/assistant`):** Study Buddy, Campus Guide, Placement Mentor, Project Partner, and Opportunity Finder powered by server-side Gemini with database retrieval and citations.
- **Admin & Moderation (`/[universitySlug]/admin`, `/platform-admin`):** Scoped verification queues, announcement publishing, source sync, report handling, and audit logging.
