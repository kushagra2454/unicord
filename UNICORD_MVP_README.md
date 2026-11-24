# UNICORD — Multi-University Student Network
### Product Requirements, Technical Architecture & Antigravity Build Specification

> **UNI + CORD** — A connected student ecosystem inspired by the university experience and the real-time communities of Discord.
>
> **Launch institution:** JECRC University, Jaipur, Rajasthan, India  
> **Product model:** Multi-university SaaS platform  
> **Build target:** Secure, full-stack, demonstrable MVP  
> **Primary principle:** Production data must be real, attributable and current. Demo data must be isolated and visibly labelled.

---

# 0. Read this first — non-negotiable product rules

Unicord must not be a static design, a frontend-only mockup, or a website full of invented listings. Build a working application with real authentication, persistent storage, authorization, file uploads, realtime communication, and a server-side AI integration.

The following rules override any conflicting implementation shortcut:

1. **No fabricated real-world content.** Never invent university facts, semester papers, internships, companies, job openings, stipends, deadlines, placement statistics, official announcements, faculty identities, clubs or student accounts.
2. **No fake live data.** If a source cannot be verified or fetched, show a transparent empty state or a clearly labelled demo example. Never silently substitute fictional records.
3. **Separate demo from production.** Demo mode must use a separate tenant and/or separate Supabase project/database. It must be visibly marked `DEMO — SIMULATED DATA`. Demo records must never enter production search, feeds, analytics or recommendations.
4. **Real authentication.** Users create their own accounts using Supabase Auth. No shared public password, fake login button, hardcoded production account, or authentication bypass.
5. **Multi-university from the database upward.** University, campus, membership, roles, resources, communities, academic structures and opportunity visibility must be tenant-aware from the first migration.
6. **No implied university endorsement.** Unicord is an independent platform concept unless a university formally approves it. Use university names and factual links responsibly. Do not use official logos or claim official affiliation without permission.
7. **Prove functionality.** A feature is not complete because a button looks clickable. It must perform its intended operation, enforce authorization, persist its result and have an error/loading/empty state.
8. **No secret leakage.** Supabase service-role keys, AI provider keys and ingestion credentials stay server-side.
9. **Respect source permissions.** Do not bypass login walls, CAPTCHAs, robots restrictions, copyright controls, or university ERP access restrictions. Prefer official APIs, feeds, public pages and authorized uploads.
10. **Be honest about freshness.** Every externally sourced opportunity or institutional fact should carry a source URL, last-checked timestamp and verification state.

---

# 1. ANTIGRAVITY MASTER PROMPT

Copy everything in this section into Google Antigravity. Ask the agent to inspect the current repository first, then implement the project in milestones. Do not stop after creating a plan.

---

## MASTER PROMPT — BUILD UNICORD

Act as a senior staff software engineer, SaaS architect, database architect, product designer, application security engineer and QA lead. Build **UNICORD**, a premium multi-university student community and academic opportunity platform.

The first launch tenant is **JECRC University, Jaipur, Rajasthan, India**. The architecture must support adding multiple universities later without redesigning the database.

### 1.1 What Unicord is

Unicord combines:
- A university-specific academic resource library.
- Authentic previous-year question papers (PYQs), organized by university, programme, semester, subject and exam.
- A Discord-inspired student community with channels, groups and direct messaging.
- A source-verified internships, jobs, hackathons, scholarships and events discovery platform.
- An AI assistant that can answer questions and search content a user is authorized to access.
- Student profiles, peer networking, project collaboration and study groups.
- University-specific information: academic calendars, schools, programmes, official notices, clubs and verified links.
- A presentation/demo environment for professors and evaluators.

### 1.2 First action: inspect, plan and build

1. Inspect the existing repository, package manager, current code, environment and installed dependencies.
2. Preserve useful existing code; do not blindly overwrite.
3. Write an implementation plan and milestone checklist.
4. Implement the application in working milestones. Do not finish with a plan alone.
5. Run lint, type-check, tests and production build. Fix errors.
6. Report features that are blocked by missing credentials, data sources, permissions or external API access.
7. Never claim a service is live or verified unless it was actually configured and tested.

### 1.3 Preferred stack

Use:
- Next.js App Router + React + strict TypeScript.
- Tailwind CSS + shadcn/ui.
- Supabase PostgreSQL.
- Supabase Auth.
- Supabase Realtime.
- Supabase Storage.
- Supabase Row Level Security.
- Server Actions / Route Handlers / Supabase Edge Functions for privileged operations.
- Gemini API for AI, called server-side only.
- Zod for input validation.
- React Hook Form where appropriate.
- Vercel-compatible deployment.

Use the current stable versions compatible with the generated project. Avoid unnecessary dependencies and services.

### 1.4 Visual identity

Product name: **Unicord**  
Meaning: **UNI**versity + Dis**CORD**  
Tagline: **One platform. Every campus. Endless connections.**

Design a polished, modern, premium student technology platform:
- Dark navy/charcoal base, restrained indigo/electric-blue accents.
- Optional polished light mode.
- Clear typography, subtle borders, rounded panels and consistent spacing.
- Desktop sidebar and responsive mobile navigation.
- Strong search and filtering experience.
- Accessible contrast, keyboard navigation, focus states and semantic HTML.
- Lucide icon system.
- Thoughtful loading skeletons, empty states, error states and confirmation dialogs.
- Avoid fake analytics, decorative charts without data, dead controls and excessive gradients.

Make the product feel like a serious combination of a campus portal, student network and opportunity marketplace—not a generic college ERP.

### 1.5 Multi-university tenancy

Design tenancy before building feature tables.

Entities:
- Platform.
- University.
- Campus.
- University membership.
- University-specific school/faculty.
- Programme.
- Academic year, term and semester.
- University community and channel.
- University resource.
- University announcement.
- University-specific configuration.

A user may:
- Create one Unicord account.
- Join one or multiple universities, subject to each university's membership/verification policy.
- Switch active university from a visible university switcher.
- Have different membership status and role at each university.
- Participate in a global community only if the product explicitly supports it.

Every tenant-owned row must include a `university_id` or an equivalent tenant relationship. RLS must verify membership and role in that exact university. Never rely only on a client-supplied university ID.

Support:
- `platform_admin`
- `university_admin`
- `moderator`
- `verified_student`
- `student`
- `faculty_contributor` (only if enabled and verified)
- `guest` (limited public access)

Roles are scoped. A moderator at JECRC must not automatically become a moderator at another university.

### 1.6 Authentication and onboarding

Implement real Supabase Auth:
- Email/password signup.
- Login/logout.
- Email confirmation.
- Forgot/reset password.
- Session persistence.
- Secure auth callbacks.
- Server-side session checks.
- Protected routes.
- Helpful error messages.

Signup:
- Full name.
- Email.
- Password.
- Username.
- University selection or invitation.
- School/department.
- Programme.
- Year of study.
- Current semester.
- Optional profile photo.

Verification:
- Anyone may create a basic Unicord account.
- A university membership starts as `pending` or `unverified` unless verified.
- Do not assume a university email domain. Store verified domains as administrator-configured data after confirming them with the institution.
- Offer manual verification by an authorized university administrator where automatic verification is unavailable.
- Do not show a verified student badge before verification.
- Do not require a university email unless the selected university has explicitly configured that policy.
- Do not let a user assign their own membership role or verification status.

### 1.7 University selection and discovery

Build:
- `/universities` — discover participating universities.
- `/universities/[slug]` — university public profile and verified information.
- `/onboarding/university` — choose a university or request to add one.
- A university switcher in the authenticated app.
- University join request and invitation flow.
- University profile with official website, location, source links, schools/programmes, academic calendar links, campus resources and published notices.

For JECRC, preconfigure only information supported by official public sources. Store each factual item with source URL, retrieval time and review status.

### 1.8 JECRC University launch tenant

Create the first tenant:
- Name: JECRC University.
- Slug: `jecrc-university-jaipur`.
- City: Jaipur.
- State: Rajasthan.
- Country: India.
- Official website: `https://jecrcuniversity.edu.in/`.
- Campus address published by the university: Plot No. IS-2036 to IS-2039, Ramchandrapura Industrial Area, Vidhani, Sitapura Extension, Jaipur, Rajasthan 303905, India.

Official source registry:
- Main website: https://jecrcuniversity.edu.in/
- Overview: https://jecrcuniversity.edu.in/overview/
- Schools/programmes: https://jecrcuniversity.edu.in/programs/
- Academic calendars: https://jecrcuniversity.edu.in/academic-calendar/
- Placements/internships: https://jecrcuniversity.edu.in/placements/
- Clubs and communities: https://jecrcuniversity.edu.in/clubs-communities/
- Career Development & Guidance Cell: https://jecrcuniversity.edu.in/career-development-guidance-cell-cdgc/
- Public self-disclosure: https://jecrcuniversity.edu.in/public-self-disclosure/
- Official news/events and notices: use the university's current official site navigation and record exact source pages when imported.

Initial school categories from the university's published 2026–27 academic calendar:
1. School of Engineering & Technology.
2. School of Computer Applications.
3. Jaipur School of Business.
4. Jaipur School of Business (Hospital and Health Care Management).
5. School of Sciences.
6. School of Humanities & Social Sciences.
7. School of Law.
8. Jaipur School of Mass Communication.
9. Jaipur School of Design.
10. School of Allied Health Sciences.
11. Jaipur School of Economics.
12. School of Hospitality.

The calendar also lists separate first-year and later-year Law calendars. Model academic calendar documents as records linked to a school/programme and academic year. Do not flatten these distinctions.

Important:
- Confirm current naming and programme availability from official pages before displaying as current.
- Do not infer that all schools offer every programme.
- Do not create courses, semesters, subject codes or faculty profiles from assumptions.
- Use official academic calendar links and documents as source records.
- Do not scrape the ERP, student portal or private learning management systems.

### 1.9 University information centre

For every participating university, build an information centre with sections:
- About the university.
- Location and official contact links.
- Schools/faculties.
- Programmes and course links.
- Academic calendars.
- Examination notices and official circulars.
- Clubs and student communities.
- Campus facilities and support links.
- Placement/career cell.
- Internship programme information.
- Scholarships and official opportunities.
- Official social channels where verified.

Each item has:
- Title.
- Content or concise summary.
- Category.
- Official source URL.
- Source organization.
- Last fetched timestamp.
- Last human review timestamp.
- Verification state (`verified`, `pending_review`, `stale`, `unavailable`, `rejected`).
- Effective date / expiry date if applicable.

Do not copy whole copyrighted pages. Store concise factual summaries and links to the authoritative source. Make source attribution visible.

### 1.10 Academic resource hub

Routes:
- `/[university]/resources`
- `/[university]/resources/[resourceId]`
- `/[university]/pyqs`
- `/[university]/upload`

Categories:
- Assignments.
- Lecture notes.
- Previous-year question papers.
- Syllabus.
- Academic calendars.
- Lab manuals.
- Practical files.
- Reference documents.
- Project guides.

Filters:
- University.
- School.
- Programme.
- Academic year.
- Semester/term.
- Subject.
- Subject code.
- Resource type.
- Examination type.
- Paper year.
- Verification status.

Resource fields:
- Title, description, resource type.
- University, school, programme, subject.
- Subject code where known.
- Semester and academic year.
- Exam type: internal, mid-semester, end-semester, final, supplementary or other configured type.
- Original file name, storage path, MIME type and file size.
- Source URL / provenance.
- Uploader and upload date.
- Review status and reviewer.
- Download/view count.
- Tags and optional helpful votes.

Features:
- PDF upload and configured approved formats.
- Server-side validation of file size, MIME type and extension.
- Private Supabase Storage buckets by default.
- Short-lived signed URLs after authorization.
- Search, sort, pagination and filters.
- Save/bookmark resource.
- Report content.
- Uploader can edit/delete own pending submission.
- Moderator review queue.
- Duplicate detection using checksum where feasible.

#### Authentic PYQ rules

PYQ records must have provenance. Never generate or invent an actual university exam paper.

Statuses:
- `pending_review`
- `verified`
- `unverified`
- `rejected`
- `unavailable`

To mark a PYQ verified, a moderator must inspect the file and validate its university, subject, exam type and year using an authoritative source or credible documented provenance.

AI-created practice material must use a separate type and prominent label:
`AI-GENERATED PRACTICE PAPER — NOT AN ACTUAL PREVIOUS-YEAR PAPER`.

If no verified file exists, display:
`No verified paper is available for this subject yet. You can request one or contribute a copy for review.`

Do not display a fabricated document thumbnail, fake year, fake subject code or fake download count.

### 1.11 Real internships, jobs and opportunities

Build `/opportunities` and `/opportunities/[id]`.

Categories:
- Internships.
- Full-time jobs.
- Part-time work.
- Remote internships.
- Hackathons.
- Coding competitions.
- Case competitions.
- Scholarships.
- Workshops/webinars.
- Conferences.
- Campus events.
- Volunteering.
- Student leadership and clubs.

Every production listing must have:
- Real organization/event organizer.
- Exact role or event title.
- Description or concise source-based summary.
- Category.
- Location and work mode.
- Eligibility.
- Skills.
- Compensation/stipend only when stated by source.
- Application deadline only when stated by source.
- Original source URL.
- Direct application URL.
- Date published if source provides it.
- Date last checked by Unicord.
- Verification state.
- Expiry/closed state.

#### Data sourcing architecture

Create a source registry and ingestion pipeline. Prefer sources in this order:
1. Official employer career pages and official applicant-tracking-system job pages.
2. Official hackathon/event organizer websites.
3. Recognized internship/job platform APIs or permitted public feeds.
4. Official university placement/career announcements.
5. Other sources only after moderator review.

For each source:
- Store source name, source type, base URL, terms/permission notes, fetch method, update cadence and active state.
- Prefer official APIs, RSS feeds, sitemaps or documented feeds.
- Do not bypass robots restrictions, CAPTCHA, login walls, rate limits or technical access controls.
- Do not scrape where terms prohibit it.
- Use a server-side scheduled ingestion job only for permitted sources.
- Normalize records and deduplicate by source ID/canonical URL.
- Record fetch time and response status.
- Detect expired deadlines and closed listings.
- Require human review for low-confidence extraction.
- Do not mark a listing `verified` solely because an LLM extracted it.
- If a source becomes unreachable, keep the source link but mark the listing stale after the configured freshness window.
- Never imply university endorsement. A source-verified listing is not automatically a JECRC-approved opportunity.

If there is no reliable live API/feed, use a moderator/admin submission workflow and link to the original live listing. Do not fill the page with invented internships.

#### Opportunity freshness states

- `verified_current`
- `source_listed_unreviewed`
- `pending_review`
- `stale`
- `expired`
- `closed`
- `rejected`

Show a clear badge and “Last checked” timestamp. Use a configurable freshness policy by source type. Never say “currently open” if the source was not recently checked.

#### Student actions

- Save/bookmark.
- Track application status: saved, planning, applied, assessment, interview, offer, rejected, closed.
- Add private notes.
- Set deadline reminders.
- Filter by remote, location, category, programme and eligibility.
- Report scam, expired or misleading listing.
- Open original source/application URL in a new tab with safe external-link handling.

#### JECRC-specific career section

Use the official JECRC placement page as an authoritative starting point:
`https://jecrcuniversity.edu.in/placements/`

The page describes the university's placement and internship programme, campus recruitment training, recruiter information and placement contacts. Present these as university-published information with a visible source link and retrieval date. Do not transform a recruiter list into fabricated current vacancies.

Include a JECRC Career Resources panel:
- Official placements/internship page.
- Career Development & Guidance Cell.
- Official career/placement contact details only if they remain present on the current official page at the time of ingestion.
- University notices and application links.

Never hardcode an old internship as open. Never create an application form pretending to be an employer's official form.

### 1.12 Discord-inspired community and messaging

Routes:
- `/community`
- `/community/[communityId]`
- `/community/[communityId]/channels/[channelId]`
- `/messages`
- `/messages/[conversationId]`

Features:
- University-scoped communities.
- Public, university-member-only and private communities.
- Channels such as general, academic doubts, placements, coding, projects, events, clubs and buy/sell (admin-configurable).
- Channel descriptions and membership rules.
- Realtime messages via Supabase Realtime.
- Message history pagination.
- Sender profile and timestamp.
- Replies/threads where feasible.
- Reactions.
- Edit/delete own message.
- Attachments with private storage.
- Direct messaging.
- Unread counts and mentions.
- Search with permission checks.
- Report, mute and block.
- Moderator review queue and moderation actions.
- Optional online presence only with privacy controls.

RLS:
- Only members can read private community/channel messages.
- Only eligible members can post.
- Direct messages are visible only to participants.
- A moderator's access must be role-scoped to their university/community and follow documented moderation rules.
- Do not expose private DMs in public feeds or ordinary admin analytics.

### 1.13 Student profiles and networking

Profile fields:
- Display name and username.
- University memberships.
- School, programme, year and semester.
- Bio.
- Skills and interests.
- Projects and portfolio links.
- LinkedIn, GitHub and personal website.
- Avatar.
- Profile privacy settings.

Features:
- Search students within a university.
- Filter by programme, skills and interests.
- Study groups.
- Peer help requests.
- Project collaboration.
- Mentorship requests.
- Follow/connect only if a clear consent model is implemented.
- Block/report users.
- Hide email and phone by default.
- Do not expose student records to other universities without consent.

### 1.14 AI Campus Assistant

Route: `/assistant`

Provide:
- General academic concept explanations.
- Step-by-step study help.
- Assignment clarification support.
- Resource search.
- PYQ search.
- Opportunity discovery.
- University information lookup.
- Website help.
- Study plans and project brainstorming.

AI personas (clearly labelled AI, never impersonating people):
- Study Buddy.
- Placement Mentor.
- Campus Guide.
- Project Partner.

Technical rules:
- Gemini API called only from a secure server-side route or Edge Function.
- Store API key server-side.
- Add per-user rate limits and usage limits.
- Use retrieval from Unicord's database for university facts, resources and opportunities.
- Retrieval must enforce the same access permissions as the UI.
- Include citations/links to the underlying source records for factual university and opportunity answers.
- If no source is available, say so.
- Never invent a university rule, PYQ or live internship.
- Do not send passwords, tokens, private messages or unnecessary personal information to the model.
- Make AI chat history user-controlled and deletable.
- Explain that AI can make mistakes.
- Provide graceful missing-key, quota and network error states.

### 1.15 Demo and professor presentation mode

Create a dedicated route:
`/demo`

This is a first-class presentation feature, not a hidden login bypass.

It must include:
- A public demo landing page explaining that this is a simulated presentation environment.
- A guided tour with steps.
- A visible banner on every demo page: `DEMO MODE — SIMULATED DATA — NOT LIVE UNIVERSITY RECORDS`.
- A demo dashboard.
- Demo academic resources and mock PYQ cards labelled `DEMO — NOT AN AUTHENTIC PYQ`.
- Demo chat with simulated demo participants labelled `DEMO USER`.
- Demo opportunity cards labelled `DEMO — EXAMPLE ONLY — NOT AN ACTIVE VACANCY`.
- Demo AI assistant clearly labelled as demo, with a real API connection only if configured; otherwise provide a transparent scripted walkthrough, not a fake claim of live AI.
- Demo upload flow using a demo-only storage bucket/project or a local non-production flow.
- Demo admin moderation queue with simulated records.
- Reset demo data button for the presentation.
- A presenter control panel to move between scenarios.
- A short “How Unicord works” overview for the professor.

#### Demo security and data isolation

Preferred approach:
- Use a separate Supabase project for demo and production.
- Configure a distinct demo environment and credentials.
- Use separate demo seed scripts.
- Use demo-only users and records.
- Do not allow demo records to be copied into production through ordinary UI.
- Do not reuse production student records in the demo.
- Never expose a demo admin account with production access.

If only one Supabase project is available during development, enforce a dedicated demo tenant and a strict `environment = demo` discriminator, with server-side authorization and RLS. A separate project is strongly preferred before public deployment.

Demo mode must not pretend to be a live student account. If a professor wants to test real signup, provide a separate real registration flow that creates a real account with ordinary student permissions.

### 1.16 Dashboard

Route: `/dashboard`

Include:
- Welcome and selected university.
- Profile completion.
- Latest verified academic resources.
- PYQ coverage and subject filters.
- Upcoming academic dates only when sourced from a real calendar.
- Saved and matching opportunities.
- Deadlines.
- Joined communities and unread messages.
- University notices with source links.
- AI assistant shortcut.
- Quick actions: upload resource, ask AI, find internship, start discussion.

Do not create fabricated “upcoming deadlines” or “official announcements”. If no current source data exists, show an empty state and the source link.

### 1.17 Notifications

In-app notification types:
- Direct message.
- Mention/reply.
- Resource approved/rejected.
- Opportunity matching selected interests.
- Application deadline reminder.
- University announcement.
- Join request status.

Email/push notifications are optional and must require configured providers and user opt-in.

### 1.18 Admin and moderation

Routes:
- `/admin`
- `/admin/universities`
- `/admin/memberships`
- `/admin/resources`
- `/admin/opportunities`
- `/admin/sources`
- `/admin/announcements`
- `/admin/reports`
- `/admin/audit-logs`

Platform admins:
- Add/unpublish universities.
- Configure source registry and ingestion jobs.
- Manage platform-level settings.

University admins:
- Manage that university's schools, programmes and academic metadata.
- Review student verification requests.
- Manage university communities and announcements.
- Approve/reject resources and opportunities.
- Assign scoped moderators.

Moderators:
- Review reports and content.
- Cannot promote themselves or grant platform-admin privileges.

Every sensitive action must be logged with actor, action, target, tenant and timestamp. Avoid logging private message contents or secrets.

### 1.19 Search

Global search should support:
- Resources.
- PYQs.
- Students (subject to privacy).
- Communities/channels.
- Opportunities.
- University information.
- Announcements.

Search results must be tenant-aware and permission-aware. Add filters, pagination, loading and empty states. Never expose a private resource or message through search snippets.

### 1.20 Database schema

Use SQL migrations under `supabase/migrations`. Normalize the schema and include constraints, indexes, timestamps and foreign keys.

Core platform/tenancy:
1. `universities`
   - `id`, `name`, `slug`, `official_website`, `city`, `state`, `country`, `address`
   - `description`, `logo_path`, `status`, `created_at`, `updated_at`

2. `campuses`
   - `id`, `university_id`, `name`, `address`, `city`, `is_active`

3. `university_domains`
   - `id`, `university_id`, `domain`, `verification_method`, `is_active`
   - Domains are added only after institutional confirmation.

4. `profiles`
   - `id` UUID referencing `auth.users`
   - `full_name`, `username`, `avatar_path`, `bio`
   - `skills`, `interests`, `portfolio_links`, `privacy_settings`
   - `created_at`, `updated_at`

5. `university_memberships`
   - `id`, `university_id`, `user_id`
   - `role`, `verification_status`, `school_id`, `programme`, `year_of_study`, `semester`
   - `joined_at`, `reviewed_by`, `reviewed_at`
   - Unique `(university_id, user_id)` unless multiple programme memberships are intentionally supported.

6. `schools`
   - `id`, `university_id`, `name`, `slug`, `is_active`

7. `programmes`
   - `id`, `university_id`, `school_id`, `name`, `level`, `duration`, `is_active`

8. `academic_terms`
   - `id`, `university_id`, `name`, `academic_year`, `start_date`, `end_date`, `source_url`, `status`

9. `semesters`
   - `id`, `university_id`, `programme_id`, `term_id`, `name`, `sequence_number`

10. `subjects`
    - `id`, `university_id`, `programme_id`, `semester_id`, `name`, `subject_code`, `is_active`

University information:
11. `institutional_sources`
    - `id`, `university_id`, `name`, `source_url`, `source_type`, `permission_notes`
    - `fetch_method`, `refresh_interval`, `last_fetched_at`, `last_success_at`, `status`

12. `institutional_content`
    - `id`, `university_id`, `source_id`, `category`, `title`, `summary`, `source_url`
    - `effective_at`, `expires_at`, `verification_status`, `last_fetched_at`, `reviewed_at`

Resources:
13. `resources`
    - `id`, `university_id`, `school_id`, `programme_id`, `semester_id`, `subject_id`
    - `title`, `description`, `resource_type`, `exam_type`, `exam_year`, `academic_year`
    - `storage_path`, `original_filename`, `mime_type`, `file_size`, `checksum`
    - `source_url`, `provenance_notes`, `verification_status`
    - `uploaded_by`, `reviewed_by`, `reviewed_at`, `created_at`, `updated_at`

14. `resource_saves`
    - `user_id`, `resource_id`, `created_at`

15. `resource_reports`
    - `id`, `resource_id`, `reporter_id`, `reason`, `details`, `status`, `created_at`

Community:
16. `communities`
    - `id`, `university_id`, `name`, `slug`, `description`, `visibility`, `created_by`, `created_at`

17. `community_members`
    - `community_id`, `user_id`, `member_role`, `joined_at`

18. `channels`
    - `id`, `university_id`, `community_id`, `name`, `description`, `channel_type`, `created_at`

19. `channel_members`
    - `channel_id`, `user_id`, `joined_at`

20. `messages`
    - `id`, `university_id`, `channel_id`, `sender_id`, `body`, `attachment_path`
    - `reply_to_id`, `edited_at`, `deleted_at`, `created_at`

21. `conversations`
    - `id`, `university_id`, `created_at`

22. `conversation_members`
    - `conversation_id`, `user_id`

23. `direct_messages`
    - `id`, `conversation_id`, `sender_id`, `body`, `attachment_path`
    - `created_at`, `edited_at`, `deleted_at`

Opportunities:
24. `opportunity_sources`
    - `id`, `name`, `source_url`, `source_type`, `terms_url`, `permission_notes`
    - `fetch_method`, `refresh_interval`, `last_fetched_at`, `status`

25. `opportunities`
    - `id`, `university_id` nullable for platform-wide listings
    - `source_id`, `external_id`, `canonical_url`
    - `title`, `organization`, `category`, `description`, `work_mode`, `location`
    - `stipend_text`, `eligibility`, `skills`
    - `source_url`, `application_url`, `posted_at`, `deadline`
    - `verification_status`, `last_checked_at`, `expires_at`, `created_at`, `updated_at`

26. `opportunity_saves`
    - `user_id`, `opportunity_id`, `application_status`, `private_notes`, `created_at`, `updated_at`

27. `opportunity_reports`
    - `id`, `opportunity_id`, `reporter_id`, `reason`, `details`, `status`, `created_at`

Administration:
28. `announcements`
    - `id`, `university_id`, `title`, `body`, `source_url`, `audience`
    - `status`, `published_at`, `created_by`

29. `notifications`
    - `id`, `university_id`, `user_id`, `type`, `payload`, `read_at`, `created_at`

30. `reports`
    - `id`, `university_id`, `reporter_id`, `target_type`, `target_id`, `reason`, `details`, `status`, `created_at`

31. `audit_logs`
    - `id`, `university_id`, `actor_id`, `action`, `target_type`, `target_id`, `metadata`, `created_at`

AI:
32. `ai_conversations`
    - `id`, `user_id`, `university_id`, `title`, `created_at`, `deleted_at`

33. `ai_messages`
    - `id`, `conversation_id`, `role`, `content`, `source_refs`, `created_at`

Demo:
34. `demo_scenarios`
    - `id`, `name`, `description`, `seed_version`, `is_active`

35. `demo_activity`
    - `id`, `scenario_id`, `event_type`, `payload`, `created_at`

Add indexes for tenant IDs, foreign keys, search fields, opportunity deadline/status, resource filters, message chronology and membership lookups. Add uniqueness constraints for usernames, university slugs, source canonical URLs and memberships where appropriate.

### 1.21 RLS and application security

Security is a release blocker.

- Enable RLS on every application table.
- Use helper functions to check university membership and scoped roles.
- Users may update only their own profile and permitted profile fields.
- Users cannot update their own role, verification status or university admin privileges.
- Users can read university data only according to the university's visibility and their membership.
- Private community/channel messages are member-only.
- Direct messages are participant-only.
- Resource storage paths are checked against resource ownership and tenant.
- Opportunity writes are restricted to authorized contributors/moderators/admins.
- Only university admins can manage their university's configuration.
- Only platform admins can create or remove university tenants.
- Demo data is isolated from production.
- Never trust client-supplied `user_id`, `university_id`, `role`, verification flags or storage paths.
- Check authorization server-side and in RLS.
- Use private buckets and signed URLs.
- Validate and sanitize user-generated content.
- Protect against XSS, CSRF where relevant, injection, IDOR, spam and abusive uploads.
- Add rate limits to auth-sensitive, AI, message, upload, search and report endpoints.
- Keep secrets out of logs.
- Add secure account deletion and data export workflows.
- Document moderation and retention policy.

### 1.22 Storage buckets

Create and document:
- `avatars`
- `university-assets`
- `academic-resources`
- `chat-attachments`
- `demo-assets`

Use private buckets by default. Public access requires a deliberate documented decision. Apply per-tenant authorization and file-size/type validation.

### 1.23 Environment variables

Create `.env.example` with placeholders:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=

# Optional source ingestion configuration
INGESTION_CRON_SECRET=
```

Never commit `.env.local`, real keys or service credentials. Never expose service-role or Gemini keys in `NEXT_PUBLIC_` variables.

For demo isolation, prefer a separate `.env.demo.local` or separate deployment/project with its own Supabase credentials. Do not mix production and demo secrets.

### 1.24 Routes

Public:
- `/` — product landing page.
- `/universities` — university directory.
- `/universities/[slug]` — public university profile.
- `/login`
- `/signup`
- `/forgot-password`
- `/auth/callback`
- `/terms`
- `/privacy`

Authenticated:
- `/dashboard`
- `/[universitySlug]/dashboard`
- `/[universitySlug]/resources`
- `/[universitySlug]/resources/[id]`
- `/[universitySlug]/pyqs`
- `/[universitySlug]/upload`
- `/[universitySlug]/community`
- `/[universitySlug]/community/[id]`
- `/[universitySlug]/messages`
- `/[universitySlug]/opportunities`
- `/[universitySlug]/opportunities/[id]`
- `/[universitySlug]/people`
- `/[universitySlug]/profile/[username]`
- `/[universitySlug]/notifications`
- `/[universitySlug]/saved`
- `/[universitySlug]/assistant`
- `/settings`

Demo:
- `/demo`
- `/demo/tour`
- `/demo/dashboard`
- `/demo/resources`
- `/demo/pyqs`
- `/demo/community`
- `/demo/opportunities`
- `/demo/assistant`
- `/demo/admin`

Administration:
- `/platform-admin`
- `/platform-admin/universities`
- `/[universitySlug]/admin`
- `/[universitySlug]/admin/members`
- `/[universitySlug]/admin/resources`
- `/[universitySlug]/admin/opportunities`
- `/[universitySlug]/admin/sources`
- `/[universitySlug]/admin/notices`
- `/[universitySlug]/admin/reports`
- `/[universitySlug]/admin/audit-logs`

### 1.25 Testing

Implement:
- TypeScript type-check.
- ESLint.
- Production build.
- Unit tests for validation and permissions.
- Integration tests for critical server operations.
- E2E smoke tests for auth, tenant switching, resource upload, realtime chat, opportunity saving and demo mode.
- RLS tests using different user identities.
- Mobile/responsive checks.

Minimum acceptance tests:
1. User can register, confirm email and log in.
2. Logged-out user cannot access protected application routes.
3. A user can join JECRC and has the correct membership state.
4. A user cannot change their own university role.
5. JECRC member cannot access another university's private resources without membership.
6. User can upload a resource and track review status.
7. Unauthorized user cannot download a private resource.
8. Only verified/authenticated permitted members can post in restricted channels.
9. Two authorized users can exchange realtime messages.
10. Non-participant cannot read a direct conversation.
11. Opportunity source and last-checked timestamp are visible.
12. Expired opportunity is not displayed as currently open.
13. AI search does not reveal unauthorized content.
14. Demo banner is visible on every demo route.
15. Demo records never appear in production queries.
16. Student account cannot access admin functions.
17. Production build, lint and type-check pass.

### 1.26 Required project documentation

Create:
- `README.md` — setup, architecture, commands, environment, Supabase, migrations, storage, testing, deployment.
- `docs/PRODUCT_SPEC.md` — product requirements and scope.
- `docs/ARCHITECTURE.md` — system and tenancy architecture.
- `docs/SECURITY.md` — RLS, roles, threat model, storage and data privacy.
- `docs/DATA_SOURCES.md` — source registry, freshness, provenance and verification.
- `docs/DEMO_GUIDE.md` — professor presentation walkthrough and demo reset.
- `docs/OPERATIONS.md` — backups, monitoring, ingestion and incident handling.
- `.env.example`.
- SQL migrations.
- Seed scripts split into `production_reference_seed` and `demo_seed`.

Do not seed fictional production content.

**Now build Unicord. Inspect the repository, create a milestone plan, and implement the working MVP.**

---

# 2. Product vision and scope

## 2.1 Mission

Give students from different universities one reliable digital place to access academic resources, communicate with peers, discover opportunities and use AI-assisted learning tools.

## 2.2 Core product modules

| Module | Main purpose | Data requirement |
|---|---|---|
| University directory | Discover and join institutions | Official university information |
| University hub | Schools, programmes, calendars, notices | Official source records |
| Academic library | Assignments, notes, syllabus, PDFs | Student/faculty uploads with review |
| PYQ centre | Authentic previous exam papers | Verified paper provenance |
| Community | Channels and group discussion | Real authenticated users |
| Direct messages | Private student communication | Real authenticated users |
| Opportunities | Internships, jobs, hackathons, scholarships | Live/checked external sources |
| AI assistant | Academic help and platform search | Real model API + permission-aware retrieval |
| Student profiles | Networking and collaboration | User-submitted, privacy-controlled data |
| Demo centre | Professor presentation | Isolated simulated records |
| Admin | Verification and moderation | Scoped roles and audit logs |

## 2.3 MVP release priorities

### P0 — Required before the professor demo
- Landing page and Unicord branding.
- Supabase signup/login/logout.
- JECRC tenant and university onboarding.
- Dashboard.
- Academic resource listing and upload.
- PYQ filters and authenticity labels.
- Realtime channel chat with two real demo/test accounts.
- Opportunity listing with real source links or honest empty states.
- AI assistant connected to a configured model API.
- `/demo` presentation centre with isolated simulated data.
- Responsive UI and working navigation.
- Security rules and RLS.

### P1 — After the core demo
- Direct messages.
- Student directory.
- Saved resources and opportunities.
- Application tracking.
- Notifications.
- Admin moderation and verification.
- Source ingestion scheduler.
- AI resource retrieval and citations.

### P2 — Expansion
- More universities.
- University-specific integrations with written authorization.
- Peer mentorship and study-group matching.
- Email/push notifications.
- Mobile PWA.
- Calendar integrations.
- Verified university partner accounts.

---

# 3. Verified JECRC University reference data

Use these official public pages as the initial source registry. Re-fetch them during implementation and store the date of retrieval. If a page changes or is unavailable, mark the data stale rather than assuming it remains current.

| Information | Official source |
|---|---|
| University overview | https://jecrcuniversity.edu.in/overview/ |
| Main website | https://jecrcuniversity.edu.in/ |
| Schools and programmes | https://jecrcuniversity.edu.in/programs/ |
| Academic calendars | https://jecrcuniversity.edu.in/academic-calendar/ |
| Placements and internships | https://jecrcuniversity.edu.in/placements/ |
| Clubs and communities | https://jecrcuniversity.edu.in/clubs-communities/ |
| Career Development & Guidance Cell | https://jecrcuniversity.edu.in/career-development-guidance-cell-cdgc/ |
| Public self-disclosure | https://jecrcuniversity.edu.in/public-self-disclosure/ |

## 3.1 Official academic calendar

The official academic calendar page publishes academic calendars for 2026–27 and earlier academic years. The 2026–27 list includes:
- School of Engineering & Technology.
- School of Computer Applications.
- Jaipur School of Business.
- Jaipur School of Business (Hospital and Health Care Management).
- School of Sciences.
- School of Humanities & Social Sciences.
- School of Law (first year).
- School of Law (second year onwards).
- Jaipur School of Mass Communication.
- Jaipur School of Design.
- School of Allied Health Sciences.
- Jaipur School of Economics.
- School of Hospitality.

Store each calendar as its own official source record, with academic year, school, source page, document URL and last-checked date. Do not assume all programmes share the same examination dates.

## 3.2 University-published career information

The official placements page currently describes:
- 200+ recruiters visiting annually.
- 500+ hours of campus recruitment training and industry mentorship.
- A six-month internship programme for final-year students across disciplines.
- University-published recruiter names and placement information.
- Placement/career contact details.

These figures and statements must be attributed to the university and should be refreshed from the official page. Do not turn recruiter names into current job vacancies. Do not independently claim the figures are audited.

## 3.3 Official clubs and campus communities

Use the official clubs/communities page as the starting point. Import only the clubs whose names, descriptions and active status can be verified from current official content. Historical club lists in older reports must not be treated as proof that a club is currently active.

## 3.4 Official university identity

Use the official university name and address from the current university website. Avoid confusing JECRC University with JECRC Foundation, JECRC College, or another JECRC campus/entity. Each institution must have its own correctly identified record if it is ever added to Unicord.

---

# 4. Real data policy — how Unicord avoids fake information

## 4.1 Source-of-truth model

Every production fact that comes from outside a student's own submission must be attributable to a source record.

A source record should include:
- Organization/source name.
- Canonical source URL.
- Source type.
- Permission/terms notes.
- Fetch method.
- Last fetch time.
- Last successful fetch time.
- HTTP/status outcome where applicable.
- Human reviewer and review date.
- Freshness policy.
- Current verification status.

## 4.2 Data statuses

Use clear states, not a generic “verified” label for everything.

Institutional content:
- `verified_official`
- `pending_review`
- `stale`
- `unavailable`
- `rejected`

Academic resources:
- `verified`
- `pending_review`
- `unverified`
- `rejected`

Opportunities:
- `verified_current`
- `source_listed_unreviewed`
- `pending_review`
- `stale`
- `expired`
- `closed`
- `rejected`

Demo content:
- `demo_simulated`

## 4.3 What to show when real data is unavailable

Do not fill empty sections with fabricated records. Use useful empty states:
- “No verified PYQ is available for this subject yet.”
- “No current source-verified internship matches these filters.”
- “No official notice has been imported yet.”
- “This source could not be checked recently. Open the original source to confirm.”

Provide a request/contribution workflow where appropriate.

## 4.4 Human verification

Human review is required for:
- PYQ authenticity.
- Unclear university notices.
- Opportunities extracted from unstructured sources.
- Suspected scams.
- Any content claiming official university endorsement.

An AI model may assist extraction and classification, but it must not independently certify authenticity.

---

# 5. Opportunity discovery — live, source-backed listings

A truly current opportunities page requires reliable source access, scheduled refreshes and source permissions. A README or static seed file cannot guarantee that an internship remains open tomorrow.

Implement a maintainable source pipeline:
1. Register a permitted source.
2. Fetch via official API, RSS, public feed or permitted page.
3. Parse and normalize listing fields.
4. Deduplicate using canonical URL/source ID.
5. Store source evidence and fetch timestamp.
6. Run validation.
7. Send low-confidence items to moderation.
8. Recheck according to source-specific freshness rules.
9. Mark expired/closed/stale when appropriate.
10. Display original source and direct application link.

Do not scrape a site if its terms prohibit it. Do not bypass authentication, CAPTCHAs, rate limits or robots controls.

## 5.1 Initial trusted source categories

The admin should be able to add and review:
- Official company career pages.
- Official company applicant-tracking pages.
- Official hackathon organizers.
- Official scholarship providers.
- Recognized internship/job portals with permitted API/feed access.
- Official JECRC placement/career announcements.
- Official event and workshop organizers.

Do not claim an integration is live until the API/feed has been configured and tested.

## 5.2 Student opportunity workflow

A student should be able to:
- Filter by internship, job, remote, location, skills, eligibility and deadline.
- Open the original listing.
- Open the actual application URL.
- Save an opportunity.
- Track application status.
- Add private notes.
- Receive reminders if notifications are enabled.
- Report expired or suspicious opportunities.

No opportunity should have a fake application form or a made-up stipend.

---

# 6. Demo centre — professor presentation mode

The demo centre is designed to make the project easy to evaluate without misrepresenting data.

## 6.1 Demo landing page

Show:
- What Unicord does.
- Which features are implemented.
- A guided walkthrough.
- A clear disclaimer that demo records are simulated.
- A link to real account registration.

## 6.2 Suggested professor walkthrough

| Step | What to demonstrate | Expected result |
|---|---|---|
| 1 | Unicord landing page | Explain multi-university vision |
| 2 | University switcher | Select JECRC University demo tenant |
| 3 | Demo dashboard | See clearly labelled sample cards |
| 4 | Academic resources | Filter sample demo resources |
| 5 | PYQ centre | Show verification labels and demo-only sample |
| 6 | Community | Send a message as a demo participant |
| 7 | Opportunities | Show sample card disclaimer and source-link structure |
| 8 | AI assistant | Ask a question; use real model if configured |
| 9 | Admin moderation | Approve/reject a simulated contribution |
| 10 | Real signup | Show the separate real Supabase registration page |

## 6.3 Demo content labels

Examples:
- `DEMO — SIMULATED RESOURCE`
- `DEMO — NOT AN AUTHENTIC PYQ`
- `DEMO — EXAMPLE ONLY — NOT AN ACTIVE VACANCY`
- `DEMO USER — SIMULATED PARTICIPANT`
- `DEMO — NOT AN OFFICIAL UNIVERSITY ANNOUNCEMENT`

Use consistent visible labels, not tiny footnotes.

## 6.4 Demo reset

Provide a reset action restricted to the demo environment. It should restore the demo seed state and remove demo-created messages/uploads as appropriate. It must never touch production data.

## 6.5 Demo versus production matrix

| Feature | Production | Demo |
|---|---|---|
| Login | Real Supabase Auth | Separate demo account or demo-only access |
| Students | Real consenting users | Simulated users labelled demo |
| Resources | Actual submissions and verified sources | Simulated examples |
| PYQs | Verified only when authenticated | Explicitly labelled mock examples |
| Chat | Real authenticated messages | Simulated chat |
| Opportunities | Current source-backed listings | Example cards only |
| AI | Real API when configured | Real API or transparent scripted walkthrough |
| Admin | Scoped real permissions | Isolated demo moderation |
| Database | Production tenant data | Separate demo project/tenant |

A demo session must not have production privileges. A real professor account may sign up through the standard signup flow and receive ordinary permissions until verified/authorized.

---

# 7. Technical implementation guidance

## 7.1 Suggested directory structure

```text
unicord/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── (platform)/
│   ├── (university)/
│   ├── demo/
│   ├── platform-admin/
│   └── api/
├── components/
│   ├── ui/
│   ├── shell/
│   ├── university/
│   ├── academics/
│   ├── pyqs/
│   ├── community/
│   ├── messaging/
│   ├── opportunities/
│   ├── assistant/
│   └── demo/
├── features/
│   ├── auth/
│   ├── tenancy/
│   ├── resources/
│   ├── messaging/
│   ├── opportunities/
│   ├── ai/
│   └── moderation/
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── rls/
│   ├── validation/
│   ├── sources/
│   ├── permissions/
│   └── utils/
├── types/
├── hooks/
├── supabase/
│   ├── migrations/
│   ├── seed/
│   │   ├── production-reference/
│   │   └── demo/
│   └── config.toml
├── docs/
├── tests/
├── public/
├── .env.example
└── README.md
```

Adapt this structure to the framework's conventions. Do not create empty scaffolding solely to match this diagram.

## 7.2 Environment

Create `.env.example`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=

INGESTION_CRON_SECRET=
```

The demo deployment should use a separate Supabase project and separate credentials. Never prefix secret variables with `NEXT_PUBLIC_`.

## 7.3 Local setup

Document actual generated scripts. Typical commands:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Quality checks (only if scripts exist):
```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## 7.4 Supabase setup checklist

- Create production Supabase project.
- Create a separate demo Supabase project.
- Configure Auth email confirmation and SMTP.
- Configure allowed redirect URLs.
- Apply migrations.
- Enable RLS on all application tables.
- Create storage buckets and policies.
- Enable Realtime for required tables.
- Create first platform admin using a secure server-side procedure.
- Configure backup and monitoring.
- Test with separate user accounts and tenants.

---

# 8. Definition of done

The MVP is not ready for presentation until:
- [ ] A new user can register using a real email.
- [ ] Login/logout and session persistence work.
- [ ] Password reset works.
- [ ] JECRC University appears as the first tenant.
- [ ] University membership and verification status are visible.
- [ ] A user cannot promote themselves to admin.
- [ ] Tenant switching works.
- [ ] A JECRC member cannot read another tenant's private resources without membership.
- [ ] Academic resources can be searched and filtered.
- [ ] A user can upload a file and see its review state.
- [ ] Unauthorized users cannot download private resources.
- [ ] PYQ authenticity labels are enforced.
- [ ] Realtime chat works between two separate authenticated accounts.
- [ ] Private messages are participant-only.
- [ ] Opportunities show source, last-checked time and real application links.
- [ ] Expired opportunities are not presented as active.
- [ ] AI uses a server-side API key.
- [ ] AI retrieval respects tenant and resource permissions.
- [ ] Demo has a visible disclaimer on every route.
- [ ] Demo records never appear in production results.
- [ ] Demo reset does not affect production.
- [ ] Admin routes reject ordinary students.
- [ ] Mobile UI is usable.
- [ ] Empty, loading and error states work.
- [ ] Lint, type-check, tests and production build pass.

---

# 9. Operational requirements

Before public release:
- Confirm permission to use university marks/logos and any official data.
- Confirm current school, programme and academic calendar metadata.
- Review university privacy and acceptable-use requirements.
- Verify every active opportunity and its application link.
- Review file sharing rights for academic documents.
- Establish moderation/report response procedures.
- Configure account deletion and data export.
- Configure backups, logging and monitoring.
- Review all RLS policies.
- Remove demo seed data from production.
- Publish privacy and terms pages after legal/owner review.

Never advertise Unicord as an official JECRC product unless written authorization is obtained.

---

# 10. Future multi-university onboarding

When adding a university:
1. Confirm the institution's legal/public name and official website.
2. Create a tenant record.
3. Add campuses and verified official source registry.
4. Import school/programme metadata from official sources.
5. Import academic calendar links and documents with provenance.
6. Configure allowed email domains only after confirmation.
7. Appoint an authorized university administrator.
8. Set moderation policy and verification process.
9. Configure communities and initial channels.
10. Test tenant isolation and RLS.
11. Launch with source-backed information only.

Never clone JECRC's schools, subjects, semesters or calendar into another university.

---

# 11. Suggested presentation opening

“Unicord stands for University plus Discord. The idea is to bring the important parts of student life into one platform. Students can access academic resources and previous-year papers, connect with other students through real-time communities, discover internships and events, and use an AI assistant for academic help. We are starting with JECRC University, but the architecture supports multiple universities. The demo environment lets you explore the workflows safely, while real users have separate accounts and production data.”

---

# 12. Final engineering instruction

Build a **small but genuinely functional multi-tenant product** rather than a large fake prototype. Prioritize authentication, tenant isolation, academic resource workflows, real-time chat, source-backed opportunities, and a clearly isolated professor demo. If a real source or credential is unavailable, report that limitation and show a transparent empty state. Never fabricate data to make the interface look populated.

**End of Unicord specification.**
