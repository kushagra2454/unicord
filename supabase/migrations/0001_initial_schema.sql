-- Unicord Initial Multi-University Schema
-- Strict multi-tenant isolation from the ground up, with environment separation ('production' | 'demo').

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. Core Platform & Multi-University Tenancy
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  official_website text,
  city text NOT NULL,
  state text NOT NULL,
  country text NOT NULL DEFAULT 'India',
  address text,
  description text,
  logo_path text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'archived')),
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'demo')),
  require_verified_domain boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.campuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  city text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.university_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  domain text NOT NULL,
  verification_method text NOT NULL DEFAULT 'manual_admin_review' CHECK (verification_method IN ('email_domain', 'manual_admin_review')),
  is_active boolean NOT NULL DEFAULT false,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (university_id, domain)
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  username text NOT NULL,
  avatar_path text,
  bio text DEFAULT '',
  skills text[] NOT NULL DEFAULT '{}',
  interests text[] NOT NULL DEFAULT '{}',
  portfolio_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  privacy_settings jsonb NOT NULL DEFAULT '{"show_profile": true, "show_skills": true, "show_online_status": false, "allow_dm_from": "university_members"}'::jsonb,
  active_university_id uuid REFERENCES public.universities(id) ON DELETE SET NULL,
  is_platform_admin boolean NOT NULL DEFAULT false,
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'demo')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_uidx ON public.profiles (lower(username));

CREATE TABLE IF NOT EXISTS public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  source_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (university_id, slug)
);

CREATE TABLE IF NOT EXISTS public.programmes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  level text NOT NULL DEFAULT 'undergraduate' CHECK (level IN ('undergraduate', 'postgraduate', 'diploma', 'doctoral', 'integrated', 'other')),
  duration text,
  source_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (university_id, school_id, name)
);

CREATE TABLE IF NOT EXISTS public.university_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('university_admin', 'moderator', 'verified_student', 'student', 'faculty_contributor', 'guest')),
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'unverified', 'rejected')),
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  programme text,
  year_of_study integer CHECK (year_of_study IS NULL OR (year_of_study >= 1 AND year_of_study <= 8)),
  semester integer CHECK (semester IS NULL OR (semester >= 1 AND semester <= 12)),
  joined_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  UNIQUE (university_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.academic_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  name text NOT NULL,
  academic_year text NOT NULL,
  start_date date,
  end_date date,
  source_url text NOT NULL,
  document_url text,
  last_checked_at timestamptz,
  status text NOT NULL DEFAULT 'verified_official' CHECK (status IN ('verified_official', 'pending_review', 'stale', 'unavailable', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.semesters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  programme_id uuid REFERENCES public.programmes(id) ON DELETE CASCADE,
  term_id uuid REFERENCES public.academic_terms(id) ON DELETE SET NULL,
  name text NOT NULL,
  sequence_number integer NOT NULL CHECK (sequence_number >= 1 AND sequence_number <= 12),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  programme_id uuid REFERENCES public.programmes(id) ON DELETE SET NULL,
  semester_id uuid REFERENCES public.semesters(id) ON DELETE SET NULL,
  name text NOT NULL,
  subject_code text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 2. Institutional Source Registry & Content
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.institutional_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  name text NOT NULL,
  source_url text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('overview', 'programs', 'academic_calendar', 'placements', 'clubs', 'notices', 'public_disclosure', 'career_cell', 'other')),
  permission_notes text NOT NULL DEFAULT 'Public official university webpage; store concise factual summaries and link to source.',
  fetch_method text NOT NULL DEFAULT 'http_get' CHECK (fetch_method IN ('http_get', 'rss', 'api', 'manual')),
  refresh_interval text NOT NULL DEFAULT '24h',
  last_fetched_at timestamptz,
  last_success_at timestamptz,
  last_http_status integer,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'stale', 'unavailable', 'paused')),
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'demo')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (university_id, source_url)
);

CREATE TABLE IF NOT EXISTS public.institutional_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  source_id uuid REFERENCES public.institutional_sources(id) ON DELETE SET NULL,
  category text NOT NULL CHECK (category IN ('about', 'school', 'programme', 'academic_calendar', 'notice', 'club', 'facility', 'placement', 'internship_programme', 'scholarship', 'contact', 'social')),
  title text NOT NULL,
  summary text NOT NULL,
  source_url text NOT NULL,
  source_organization text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  effective_at timestamptz,
  expires_at timestamptz,
  verification_status text NOT NULL DEFAULT 'pending_review' CHECK (verification_status IN ('verified_official', 'pending_review', 'stale', 'unavailable', 'rejected')),
  last_fetched_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'demo')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 3. Academic Resources & Authentic PYQs
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  programme_id uuid REFERENCES public.programmes(id) ON DELETE SET NULL,
  semester_id uuid REFERENCES public.semesters(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  subject_name text,
  subject_code text,
  title text NOT NULL,
  description text DEFAULT '',
  resource_type text NOT NULL CHECK (resource_type IN (
    'assignment', 'lecture_notes', 'pyq', 'ai_practice_paper',
    'syllabus', 'academic_calendar', 'lab_manual', 'practical_file',
    'reference', 'project_guide'
  )),
  exam_type text CHECK (exam_type IS NULL OR exam_type IN ('internal', 'mid_semester', 'end_semester', 'final', 'supplementary', 'other')),
  exam_year integer CHECK (exam_year IS NULL OR (exam_year >= 1990 AND exam_year <= 2100)),
  academic_year text,
  semester_label text,
  storage_path text NOT NULL,
  original_filename text NOT NULL,
  mime_type text NOT NULL,
  file_size bigint NOT NULL CHECK (file_size > 0),
  checksum text,
  source_url text,
  provenance_notes text,
  verification_status text NOT NULL DEFAULT 'pending_review' CHECK (verification_status IN ('pending_review', 'verified', 'unverified', 'rejected', 'unavailable')),
  tags text[] NOT NULL DEFAULT '{}',
  download_count integer NOT NULL DEFAULT 0 CHECK (download_count >= 0),
  helpful_count integer NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
  uploaded_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'demo')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.resource_saves (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, resource_id)
);

CREATE TABLE IF NOT EXISTS public.resource_votes (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, resource_id)
);

CREATE TABLE IF NOT EXISTS public.resource_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 4. Discord-Inspired Community, Channels & Direct Messaging
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text DEFAULT '',
  visibility text NOT NULL DEFAULT 'university_members' CHECK (visibility IN ('public', 'university_members', 'private')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'demo')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (university_id, slug)
);

CREATE TABLE IF NOT EXISTS public.community_members (
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_role text NOT NULL DEFAULT 'member' CHECK (member_role IN ('owner', 'moderator', 'member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (community_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  channel_type text NOT NULL DEFAULT 'general' CHECK (channel_type IN ('general', 'academic_doubts', 'placements', 'coding', 'projects', 'events', 'clubs', 'buy_sell', 'announcements', 'private')),
  is_read_only boolean NOT NULL DEFAULT false,
  requires_verified_student boolean NOT NULL DEFAULT false,
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'demo')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (community_id, name)
);

CREATE TABLE IF NOT EXISTS public.channel_members (
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  attachment_path text,
  reply_to_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  edited_at timestamptz,
  deleted_at timestamptz,
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'demo')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.message_reactions (
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id, emoji)
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'demo')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversation_members (
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_at timestamptz,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  attachment_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.user_blocks (
  blocker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

-- ---------------------------------------------------------------------------
-- 5. Opportunities & Source Registry
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.opportunity_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  source_url text NOT NULL UNIQUE,
  source_type text NOT NULL CHECK (source_type IN ('employer_careers', 'ats_feed', 'hackathon_organizer', 'scholarship_provider', 'job_portal_api', 'university_placement', 'event_organizer', 'other')),
  terms_url text,
  permission_notes text NOT NULL,
  fetch_method text NOT NULL DEFAULT 'http_get' CHECK (fetch_method IN ('api', 'rss', 'sitemap', 'http_get', 'manual')),
  refresh_interval text NOT NULL DEFAULT '24h',
  freshness_window_hours integer NOT NULL DEFAULT 72,
  last_fetched_at timestamptz,
  last_http_status integer,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'demo')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid REFERENCES public.universities(id) ON DELETE CASCADE,
  source_id uuid REFERENCES public.opportunity_sources(id) ON DELETE SET NULL,
  external_id text,
  canonical_url text NOT NULL,
  title text NOT NULL,
  organization text NOT NULL,
  category text NOT NULL CHECK (category IN (
    'internship', 'full_time', 'part_time', 'remote_internship',
    'hackathon', 'coding_competition', 'case_competition',
    'scholarship', 'workshop_webinar', 'conference',
    'campus_event', 'volunteering', 'student_leadership'
  )),
  description text NOT NULL,
  work_mode text NOT NULL DEFAULT 'unspecified' CHECK (work_mode IN ('remote', 'onsite', 'hybrid', 'unspecified')),
  location text,
  stipend_text text,
  eligibility text,
  skills text[] NOT NULL DEFAULT '{}',
  source_url text NOT NULL,
  application_url text NOT NULL,
  posted_at timestamptz,
  deadline timestamptz,
  verification_status text NOT NULL DEFAULT 'pending_review' CHECK (verification_status IN (
    'verified_current', 'source_listed_unreviewed', 'pending_review',
    'stale', 'expired', 'closed', 'rejected'
  )),
  last_checked_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  submitted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'demo')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (environment, canonical_url)
);

CREATE TABLE IF NOT EXISTS public.opportunity_saves (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  application_status text NOT NULL DEFAULT 'saved' CHECK (application_status IN ('saved', 'planning', 'applied', 'assessment', 'interview', 'offer', 'rejected', 'closed')),
  private_notes text DEFAULT '',
  reminder_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, opportunity_id)
);

CREATE TABLE IF NOT EXISTS public.opportunity_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 6. Announcements, Notifications, Moderation & Audit Logs
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  source_url text,
  audience text NOT NULL DEFAULT 'all_members' CHECK (audience IN ('all_members', 'verified_students', 'public')),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'demo')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid REFERENCES public.universities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'direct_message', 'mention_reply', 'resource_status',
    'opportunity_match', 'deadline_reminder', 'university_announcement',
    'join_request_status'
  )),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid REFERENCES public.universities(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('resource', 'opportunity', 'message', 'direct_message', 'user', 'community', 'other')),
  target_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'demo')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid REFERENCES public.universities(id) ON DELETE SET NULL,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'demo')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 7. AI Campus Assistant & Rate Limiting
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  university_id uuid REFERENCES public.universities(id) ON DELETE CASCADE,
  persona text NOT NULL DEFAULT 'study_buddy' CHECK (persona IN ('study_buddy', 'campus_guide', 'placement_mentor', 'project_partner', 'opportunity_finder')),
  title text NOT NULL DEFAULT 'New AI Session',
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'demo')),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  source_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 8. Professor Demo Mode Tables (Strictly Demo Environment)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.demo_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  seed_version text NOT NULL DEFAULT 'v1',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.demo_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid REFERENCES public.demo_scenarios(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
