-- Unicord Isolated Demo Seed (Strictly Demo Environment — Never Appears in Production Queries)
-- All records carry environment = 'demo' and explicit demo labels.

INSERT INTO public.universities (
  id, name, slug, official_website, city, state, country, address, description, status, environment
)
VALUES (
  '99999999-9999-4999-8999-999999999999',
  'JECRC University (Demo Sandbox)',
  'jecrc-demo-sandbox',
  'https://jecrcuniversity.edu.in/',
  'Jaipur',
  'Rajasthan',
  'India',
  'Vidhani, Sitapura Extension, Jaipur (Simulated Demo Tenant)',
  'DEMO — SIMULATED TENANT FOR PROFESSOR PRESENTATION. Completely isolated from production student accounts and records.',
  'active',
  'demo'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.demo_scenarios (slug, name, description, seed_version, is_active)
VALUES
  ('student-journey', 'Student Onboarding & Resource Discovery', 'Demonstrates university switching, academic filtering, and PYQ verification badges.', 'v1', true),
  ('realtime-community', 'Realtime Student Community & Moderation', 'Demonstrates Discord-style channels, simulated chat participants, and moderation review.', 'v1', true),
  ('career-and-ai', 'Source-Backed Opportunities & Gemini Assistant', 'Demonstrates freshness states, application tracking, and RAG citations.', 'v1', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.opportunities (
  id, university_id, canonical_url, title, organization, category, description, work_mode, location,
  stipend_text, eligibility, skills, source_url, application_url, deadline, verification_status, environment
)
VALUES
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    '99999999-9999-4999-8999-999999999999',
    'https://demo.unicord.invalid/opportunities/swe-intern-sample',
    'DEMO — EXAMPLE ONLY — Software Engineering Intern (Simulated Listing)',
    'Simulated Tech Partner (Demo)',
    'internship',
    'DEMO — EXAMPLE ONLY — NOT AN ACTIVE VACANCY. Demonstrates how Unicord displays source attribution, last-checked timestamps, and application status tracking.',
    'hybrid',
    'Jaipur / Hybrid (Demo)',
    'Example stipend field (Demo only)',
    'B.Tech CSE / MCA 3rd & Final Year (Demo)',
    ARRAY['TypeScript', 'Next.js', 'PostgreSQL'],
    'https://demo.unicord.invalid/source/1',
    'https://demo.unicord.invalid/apply/1',
    now() + interval '21 days',
    'verified_current',
    'demo'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    '99999999-9999-4999-8999-999999999999',
    'https://demo.unicord.invalid/opportunities/expired-hackathon-sample',
    'DEMO — EXAMPLE ONLY — National Campus Hackathon (Expired State Demo)',
    'Simulated Hackathon Organizer (Demo)',
    'hackathon',
    'DEMO — EXAMPLE ONLY — NOT AN ACTIVE VACANCY. Demonstrates how Unicord marks past-deadline listings as expired so students never apply to closed roles.',
    'remote',
    'Online (Demo)',
    NULL,
    'All Undergraduate & Postgraduate Students (Demo)',
    ARRAY['AI/ML', 'React', 'Product Design'],
    'https://demo.unicord.invalid/source/2',
    'https://demo.unicord.invalid/apply/2',
    now() - interval '10 days',
    'expired',
    'demo'
  )
ON CONFLICT (environment, canonical_url) DO NOTHING;

INSERT INTO public.announcements (
  id, university_id, title, body, source_url, audience, status, environment
)
VALUES (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  '99999999-9999-4999-8999-999999999999',
  'DEMO — NOT AN OFFICIAL UNIVERSITY ANNOUNCEMENT: Odd Semester Schedule Walkthrough',
  'Simulated notice demonstrating tenant-scoped announcements with source attribution and audience targeting.',
  'https://jecrcuniversity.edu.in/academic-calendar/',
  'all_members',
  'published',
  'demo'
)
ON CONFLICT DO NOTHING;
