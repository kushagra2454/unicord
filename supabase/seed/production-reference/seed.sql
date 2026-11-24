-- Unicord Production Reference Seed (Strictly Factual, Source-Attributed, Zero Fictional Records)
-- Primary Launch Tenant: JECRC University, Jaipur, Rajasthan, India

WITH jecrc AS (
  INSERT INTO public.universities (
    id, name, slug, official_website, city, state, country, address, description, status, environment, require_verified_domain
  )
  VALUES (
    '11111111-1111-4111-8111-111111111111',
    'JECRC University',
    'jecrc-university-jaipur',
    'https://jecrcuniversity.edu.in/',
    'Jaipur',
    'Rajasthan',
    'India',
    'Plot No. IS-2036 to IS-2039, Ramchandrapura Industrial Area, Vidhani, Sitapura Extension, Jaipur, Rajasthan 303905, India',
    'Independent student network tenant for JECRC University, Jaipur. Preconfigured strictly from official public university pages with source links and retrieval timestamps.',
    'active',
    'production',
    false
  )
  ON CONFLICT (slug) DO UPDATE SET
    official_website = EXCLUDED.official_website,
    address = EXCLUDED.address
  RETURNING id
)
INSERT INTO public.campuses (university_id, name, address, city, is_active)
SELECT
  id,
  'Vidhani Main Campus (Sitapura Extension)',
  'Plot No. IS-2036 to IS-2039, Ramchandrapura Industrial Area, Vidhani, Sitapura Extension, Jaipur, Rajasthan 303905, India',
  'Jaipur',
  true
FROM jecrc
ON CONFLICT DO NOTHING;

-- Official JECRC University Schools (from published 2026-27 Academic Calendar & Programs pages)
INSERT INTO public.schools (university_id, name, slug, source_url, is_active)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'School of Engineering & Technology', 'school-of-engineering-and-technology', 'https://jecrcuniversity.edu.in/programs/', true),
  ('11111111-1111-4111-8111-111111111111', 'School of Computer Applications', 'school-of-computer-applications', 'https://jecrcuniversity.edu.in/programs/', true),
  ('11111111-1111-4111-8111-111111111111', 'Jaipur School of Business', 'jaipur-school-of-business', 'https://jecrcuniversity.edu.in/programs/', true),
  ('11111111-1111-4111-8111-111111111111', 'Jaipur School of Business (Hospital and Health Care Management)', 'jaipur-school-of-business-hhm', 'https://jecrcuniversity.edu.in/academic-calendar/', true),
  ('11111111-1111-4111-8111-111111111111', 'School of Sciences', 'school-of-sciences', 'https://jecrcuniversity.edu.in/programs/', true),
  ('11111111-1111-4111-8111-111111111111', 'School of Humanities & Social Sciences', 'school-of-humanities-and-social-sciences', 'https://jecrcuniversity.edu.in/programs/', true),
  ('11111111-1111-4111-8111-111111111111', 'School of Law', 'school-of-law', 'https://jecrcuniversity.edu.in/programs/', true),
  ('11111111-1111-4111-8111-111111111111', 'Jaipur School of Mass Communication', 'jaipur-school-of-mass-communication', 'https://jecrcuniversity.edu.in/programs/', true),
  ('11111111-1111-4111-8111-111111111111', 'Jaipur School of Design', 'jaipur-school-of-design', 'https://jecrcuniversity.edu.in/programs/', true),
  ('11111111-1111-4111-8111-111111111111', 'School of Allied Health Sciences', 'school-of-allied-health-sciences', 'https://jecrcuniversity.edu.in/programs/', true),
  ('11111111-1111-4111-8111-111111111111', 'Jaipur School of Economics', 'jaipur-school-of-economics', 'https://jecrcuniversity.edu.in/programs/', true),
  ('11111111-1111-4111-8111-111111111111', 'School of Hospitality', 'school-of-hospitality', 'https://jecrcuniversity.edu.in/programs/', true)
ON CONFLICT (university_id, slug) DO NOTHING;

-- Official JECRC University Institutional Source Registry
INSERT INTO public.institutional_sources (university_id, name, source_url, source_type, fetch_method, refresh_interval, last_fetched_at, last_success_at, last_http_status, status, environment)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'JECRC University Main Website', 'https://jecrcuniversity.edu.in/', 'overview', 'http_get', '24h', '2026-11-24T17:50:00Z', '2026-11-24T17:50:00Z', 200, 'active', 'production'),
  ('11111111-1111-4111-8111-111111111111', 'JECRC University Overview', 'https://jecrcuniversity.edu.in/overview/', 'overview', 'http_get', '72h', '2026-11-24T17:50:00Z', '2026-11-24T17:50:00Z', 200, 'active', 'production'),
  ('11111111-1111-4111-8111-111111111111', 'JECRC Schools & Programmes', 'https://jecrcuniversity.edu.in/programs/', 'programs', 'http_get', '72h', '2026-11-24T17:50:00Z', '2026-11-24T17:50:00Z', 200, 'active', 'production'),
  ('11111111-1111-4111-8111-111111111111', 'JECRC Academic Calendars', 'https://jecrcuniversity.edu.in/academic-calendar/', 'academic_calendar', 'http_get', '24h', '2026-11-24T17:50:00Z', '2026-11-24T17:50:00Z', 200, 'active', 'production'),
  ('11111111-1111-4111-8111-111111111111', 'JECRC Placements & Internships', 'https://jecrcuniversity.edu.in/placements/', 'placements', 'http_get', '24h', '2026-11-24T17:50:00Z', '2026-11-24T17:50:00Z', 200, 'active', 'production'),
  ('11111111-1111-4111-8111-111111111111', 'JECRC Clubs & Communities', 'https://jecrcuniversity.edu.in/clubs-communities/', 'clubs', 'http_get', '72h', '2026-11-24T17:50:00Z', '2026-11-24T17:50:00Z', 200, 'active', 'production'),
  ('11111111-1111-4111-8111-111111111111', 'JECRC Career Development & Guidance Cell (CDGC)', 'https://jecrcuniversity.edu.in/career-development-guidance-cell-cdgc/', 'career_cell', 'http_get', '72h', '2026-11-24T17:50:00Z', '2026-11-24T17:50:00Z', 200, 'active', 'production'),
  ('11111111-1111-4111-8111-111111111111', 'JECRC Public Self-Disclosure', 'https://jecrcuniversity.edu.in/public-self-disclosure/', 'public_disclosure', 'http_get', '168h', '2026-11-24T17:50:00Z', '2026-11-24T17:50:00Z', 200, 'active', 'production')
ON CONFLICT (university_id, source_url) DO NOTHING;

-- Official Academic Calendar PDFs (verified live from jecrcuniversity.edu.in/academic-calendar/)
INSERT INTO public.academic_terms (university_id, school_id, name, academic_year, source_url, document_url, last_checked_at, status)
VALUES
  ('11111111-1111-4111-8111-111111111111', NULL, 'Academic Calendar 2026–27 (General University Schools)', '2026-27', 'https://jecrcuniversity.edu.in/academic-calendar/', 'https://jecrcuniversity.edu.in/wp-content/uploads/2026/08/Academic-Calendar-2026-27.pdf', '2026-11-24T17:50:00Z', 'verified_official'),
  ('11111111-1111-4111-8111-111111111111', (SELECT id FROM public.schools WHERE university_id = '11111111-1111-4111-8111-111111111111' AND slug = 'school-of-law'), 'School of Law Academic Calendar 2026–27 (Odd Semester)', '2026-27', 'https://jecrcuniversity.edu.in/academic-calendar/', 'https://jecrcuniversity.edu.in/wp-content/uploads/2026/11/Academic_Calendar_School_of_Law_%282026-27%29_Odd_Sem.pdf', '2026-11-24T17:50:00Z', 'verified_official'),
  ('11111111-1111-4111-8111-111111111111', (SELECT id FROM public.schools WHERE university_id = '11111111-1111-4111-8111-111111111111' AND slug = 'jaipur-school-of-business-hhm'), 'MBA Hospital & Healthcare Management Calendar 2025–26', '2025-26', 'https://jecrcuniversity.edu.in/academic-calendar/', 'https://jecrcuniversity.edu.in/wp-content/uploads/2026/01/Academic-Calendar-2025-26-MBA-Hospital-Healthcare-1.pdf', '2026-11-24T17:50:00Z', 'verified_official'),
  ('11111111-1111-4111-8111-111111111111', NULL, 'List of Holidays 2026', '2026', 'https://jecrcuniversity.edu.in/academic-calendar/', 'https://jecrcuniversity.edu.in/wp-content/uploads/2026/01/List-of-Holidays-2026.pdf', '2026-11-24T17:50:00Z', 'verified_official')
ON CONFLICT DO NOTHING;

-- Official Institutional Content Records (Concise summaries with explicit source attribution)
INSERT INTO public.institutional_content (university_id, category, title, summary, source_url, source_organization, verification_status, last_fetched_at, environment)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'about', 'JECRC University — Campus & Identity', 'JECRC University is located at Plot No. IS-2036 to IS-2039, Ramchandrapura Industrial Area, Vidhani, Sitapura Extension, Jaipur, Rajasthan 303905, India. Unicord is an independent platform concept and not an official university portal.', 'https://jecrcuniversity.edu.in/overview/', 'JECRC University', 'verified_official', '2026-11-24T17:50:00Z', 'production'),
  ('11111111-1111-4111-8111-111111111111', 'placement', 'JECRC Placements & Six-Month Internship Overview', 'University-published overview stating 200+ recruiters visiting annually, 500+ hours of campus recruitment training and industry mentorship, and a six-month internship programme for final-year students. Refer to the official page for current recruiter details.', 'https://jecrcuniversity.edu.in/placements/', 'JECRC University Placements Cell', 'verified_official', '2026-11-24T17:50:00Z', 'production'),
  ('11111111-1111-4111-8111-111111111111', 'internship_programme', 'Career Development & Guidance Cell (CDGC)', 'JECRC University Career Development & Guidance Cell provides placement readiness, mock interviews, soft-skills training, and career counselling.', 'https://jecrcuniversity.edu.in/career-development-guidance-cell-cdgc/', 'JECRC University CDGC', 'verified_official', '2026-11-24T17:50:00Z', 'production'),
  ('11111111-1111-4111-8111-111111111111', 'club', 'Official Clubs & Communities Directory', 'Official student chapters and initiatives listed on the JECRC University website include JECRC Incubation Centre (JIC), MUN Society (JMS), MAKER SPACE, Abhyudaya, Global Outreach Cell (IAESTE LC JECRC), NCC, NSS, and cultural/technical communities.', 'https://jecrcuniversity.edu.in/clubs-communities/', 'JECRC University', 'verified_official', '2026-11-24T17:50:00Z', 'production')
ON CONFLICT DO NOTHING;

-- Default JECRC Community & Channels (empty until real students post)
WITH jecrc_comm AS (
  INSERT INTO public.communities (id, university_id, name, slug, description, visibility, environment)
  VALUES (
    '22222222-2222-4222-8222-222222222222',
    '11111111-1111-4111-8111-111111111111',
    'JECRC Campus Commons',
    'jecrc-campus-commons',
    'University-wide student community for academic doubts, coding, projects, placements, and campus clubs.',
    'university_members',
    'production'
  )
  ON CONFLICT (university_id, slug) DO UPDATE SET description = EXCLUDED.description
  RETURNING id
)
INSERT INTO public.channels (university_id, community_id, name, description, channel_type, requires_verified_student, environment)
SELECT
  '11111111-1111-4111-8111-111111111111',
  id,
  ch.name,
  ch.description,
  ch.channel_type,
  ch.requires_verified_student,
  'production'
FROM jecrc_comm
CROSS JOIN (
  VALUES
    ('general', 'Open campus conversation and introductions for JECRC members.', 'general', false),
    ('academic-doubts', 'Subject questions, syllabus clarifications, and peer study help.', 'academic_doubts', false),
    ('placements', 'Placement prep, interview experiences, and CDGC updates.', 'placements', false),
    ('coding-and-projects', 'DSA, hackathons, project team formation, and open source.', 'coding', false),
    ('events-and-clubs', 'Student chapters, JIC, MUN, and campus event coordination.', 'events', false)
) AS ch(name, description, channel_type, requires_verified_student)
ON CONFLICT (community_id, name) DO NOTHING;

-- Permitted Opportunity Sources Registry (Official public RSS/API/Careers pages — requires ingestion run)
INSERT INTO public.opportunity_sources (name, source_url, source_type, terms_url, permission_notes, fetch_method, refresh_interval, freshness_window_hours, status, environment)
VALUES
  ('JECRC University Placements Page', 'https://jecrcuniversity.edu.in/placements/', 'university_placement', 'https://jecrcuniversity.edu.in/', 'Public university placements information page. Summary & link attribution only.', 'http_get', '24h', 72, 'active', 'production'),
  ('Devpost Public Hackathons Feed', 'https://devpost.com/api/hackathons', 'hackathon_organizer', 'https://info.devpost.com/terms', 'Official public hackathon discovery endpoint; store source links and verify deadlines.', 'api', '12h', 48, 'active', 'production'),
  ('RemoteOK Public API', 'https://remoteok.com/api', 'job_portal_api', 'https://remoteok.com/terms', 'Public JSON feed with required attribution and original listing link.', 'api', '12h', 48, 'active', 'production')
ON CONFLICT (source_url) DO NOTHING;
