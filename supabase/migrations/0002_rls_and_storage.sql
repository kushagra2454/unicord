-- Unicord Row Level Security, Helper Functions, Role Protection & Storage Buckets
-- Security release blocker: RLS enabled on EVERY table. Never trust client-supplied roles or university_ids.

-- ---------------------------------------------------------------------------
-- 1. Security Helper Functions (SECURITY DEFINER with fixed search_path)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.is_platform_admin = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_university_membership(
  p_university_id uuid,
  p_roles text[] DEFAULT NULL,
  p_require_verified boolean DEFAULT false
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.university_memberships m
    WHERE m.university_id = p_university_id
      AND m.user_id = auth.uid()
      AND (p_roles IS NULL OR m.role = ANY(p_roles))
      AND (NOT p_require_verified OR m.verification_status = 'verified')
      AND m.verification_status <> 'rejected'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_university_staff(p_university_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_platform_admin() OR public.has_university_membership(
    p_university_id,
    ARRAY['university_admin', 'moderator'],
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_university_admin(p_university_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_platform_admin() OR public.has_university_membership(
    p_university_id,
    ARRAY['university_admin'],
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_community(p_community_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.communities c
    WHERE c.id = p_community_id
      AND c.environment = 'production'
      AND (
        c.visibility = 'public'
        OR (
          c.visibility = 'university_members'
          AND public.has_university_membership(c.university_id)
        )
        OR (
          c.visibility = 'private'
          AND (
            EXISTS (
              SELECT 1 FROM public.community_members cm
              WHERE cm.community_id = c.id AND cm.user_id = auth.uid()
            )
            OR public.is_university_staff(c.university_id)
          )
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_channel(p_channel_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.channels ch
    JOIN public.communities c ON c.id = ch.community_id
    WHERE ch.id = p_channel_id
      AND ch.environment = 'production'
      AND (
        (
          ch.channel_type <> 'private'
          AND public.can_access_community(c.id)
        )
        OR (
          ch.channel_type = 'private'
          AND (
            EXISTS (
              SELECT 1 FROM public.channel_members chm
              WHERE chm.channel_id = ch.id AND chm.user_id = auth.uid()
            )
            OR public.is_university_staff(ch.university_id)
          )
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(p_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_members cm
    WHERE cm.conversation_id = p_conversation_id
      AND cm.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. Trigger Guards Against Self-Promotion & Auth User Profile Creation
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name text;
  v_username text;
BEGIN
  v_full_name := COALESCE(NULLIF(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1));
  v_username := COALESCE(
    NULLIF(regexp_replace(lower(trim(new.raw_user_meta_data->>'username')), '[^a-z0-9_.-]', '', 'g'), ''),
    'student_' || substr(replace(new.id::text, '-', ''), 1, 8)
  );

  INSERT INTO public.profiles (id, full_name, username)
  VALUES (new.id, v_full_name, v_username)
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    IF NEW.is_platform_admin IS DISTINCT FROM OLD.is_platform_admin THEN
      RAISE EXCEPTION 'Platform admin flag cannot be modified by client users';
    END IF;
    IF NEW.environment IS DISTINCT FROM OLD.environment THEN
      RAISE EXCEPTION 'Profile environment cannot be modified';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_guard ON public.profiles;
CREATE TRIGGER trg_profiles_guard
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

CREATE OR REPLACE FUNCTION public.prevent_membership_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role' AND NOT public.is_university_admin(NEW.university_id) THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.role <> 'student' OR NEW.verification_status NOT IN ('pending', 'unverified') THEN
        RAISE EXCEPTION 'New memberships must start as student with pending/unverified status';
      END IF;
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.role IS DISTINCT FROM OLD.role
         OR NEW.verification_status IS DISTINCT FROM OLD.verification_status
         OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by
         OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at THEN
        RAISE EXCEPTION 'Only university admins can change membership role or verification status';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_membership_guard ON public.university_memberships;
CREATE TRIGGER trg_membership_guard
  BEFORE INSERT OR UPDATE ON public.university_memberships
  FOR EACH ROW EXECUTE FUNCTION public.prevent_membership_self_escalation();

-- ---------------------------------------------------------------------------
-- 3. Enable RLS on ALL Application Tables
-- ---------------------------------------------------------------------------

ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_activity ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 4. RLS Policies
-- ---------------------------------------------------------------------------

-- Universities & Public Metadata (strictly separate production vs demo)
CREATE POLICY "Public read active production universities"
  ON public.universities FOR SELECT
  USING (environment = 'production' AND (status = 'active' OR public.is_platform_admin()));

CREATE POLICY "Platform admins manage universities"
  ON public.universities FOR ALL
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

CREATE POLICY "Public read campuses"
  ON public.campuses FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.universities u WHERE u.id = university_id AND u.environment = 'production'));

CREATE POLICY "University admins manage campuses"
  ON public.campuses FOR ALL
  USING (public.is_university_admin(university_id))
  WITH CHECK (public.is_university_admin(university_id));

CREATE POLICY "Read university domains"
  ON public.university_domains FOR SELECT
  USING (public.has_university_membership(university_id) OR public.is_university_admin(university_id));

CREATE POLICY "University admins manage domains"
  ON public.university_domains FOR ALL
  USING (public.is_university_admin(university_id))
  WITH CHECK (public.is_university_admin(university_id));

-- Schools, Programmes, Academic Terms, Semesters, Subjects
CREATE POLICY "Public read schools of active production universities"
  ON public.schools FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.universities u WHERE u.id = university_id AND u.environment = 'production'));

CREATE POLICY "University admins manage schools"
  ON public.schools FOR ALL
  USING (public.is_university_admin(university_id))
  WITH CHECK (public.is_university_admin(university_id));

CREATE POLICY "Public read programmes"
  ON public.programmes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.universities u WHERE u.id = university_id AND u.environment = 'production'));

CREATE POLICY "University admins manage programmes"
  ON public.programmes FOR ALL
  USING (public.is_university_admin(university_id))
  WITH CHECK (public.is_university_admin(university_id));

CREATE POLICY "Public read academic terms"
  ON public.academic_terms FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.universities u WHERE u.id = university_id AND u.environment = 'production'));

CREATE POLICY "University admins manage academic terms"
  ON public.academic_terms FOR ALL
  USING (public.is_university_admin(university_id))
  WITH CHECK (public.is_university_admin(university_id));

CREATE POLICY "Read semesters"
  ON public.semesters FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.universities u WHERE u.id = university_id AND u.environment = 'production'));

CREATE POLICY "University admins manage semesters"
  ON public.semesters FOR ALL
  USING (public.is_university_admin(university_id))
  WITH CHECK (public.is_university_admin(university_id));

CREATE POLICY "Read subjects"
  ON public.subjects FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.universities u WHERE u.id = university_id AND u.environment = 'production'));

CREATE POLICY "University admins manage subjects"
  ON public.subjects FOR ALL
  USING (public.is_university_admin(university_id))
  WITH CHECK (public.is_university_admin(university_id));

-- Profiles (respect privacy & university boundaries)
CREATE POLICY "Users read own profile or visible fellow university profiles"
  ON public.profiles FOR SELECT
  USING (
    environment = 'production'
    AND (
      id = auth.uid()
      OR public.is_platform_admin()
      OR (
        COALESCE((privacy_settings->>'show_profile')::boolean, true) = true
        AND EXISTS (
          SELECT 1
          FROM public.university_memberships m1
          JOIN public.university_memberships m2 ON m1.university_id = m2.university_id
          WHERE m1.user_id = auth.uid()
            AND m2.user_id = profiles.id
            AND m1.verification_status <> 'rejected'
            AND m2.verification_status <> 'rejected'
        )
      )
    )
  );

CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid() AND is_platform_admin = false AND environment = 'production');

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND is_platform_admin = false AND environment = 'production');

-- University Memberships
CREATE POLICY "Users read own or same-university memberships"
  ON public.university_memberships FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_university_staff(university_id)
    OR public.has_university_membership(university_id)
  );

CREATE POLICY "Users create own student membership"
  ON public.university_memberships FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'student'
    AND verification_status IN ('pending', 'unverified')
    AND EXISTS (SELECT 1 FROM public.universities u WHERE u.id = university_id AND u.environment = 'production' AND u.status = 'active')
  );

CREATE POLICY "Users update own academic info or admins manage memberships"
  ON public.university_memberships FOR UPDATE
  USING (user_id = auth.uid() OR public.is_university_admin(university_id))
  WITH CHECK (user_id = auth.uid() OR public.is_university_admin(university_id));

CREATE POLICY "Users leave university or admins remove membership"
  ON public.university_memberships FOR DELETE
  USING (user_id = auth.uid() OR public.is_university_admin(university_id));

-- Institutional Sources & Content
CREATE POLICY "Read production institutional sources"
  ON public.institutional_sources FOR SELECT
  USING (environment = 'production');

CREATE POLICY "Admins manage institutional sources"
  ON public.institutional_sources FOR ALL
  USING (public.is_university_admin(university_id))
  WITH CHECK (public.is_university_admin(university_id));

CREATE POLICY "Read verified institutional content or staff read all"
  ON public.institutional_content FOR SELECT
  USING (
    environment = 'production'
    AND (verification_status IN ('verified_official', 'stale') OR public.is_university_staff(university_id))
  );

CREATE POLICY "Staff manage institutional content"
  ON public.institutional_content FOR ALL
  USING (public.is_university_staff(university_id))
  WITH CHECK (public.is_university_staff(university_id));

-- Academic Resources & PYQs
CREATE POLICY "Members read verified resources, uploaders read own, staff read all"
  ON public.resources FOR SELECT
  USING (
    environment = 'production'
    AND (
      uploaded_by = auth.uid()
      OR public.is_university_staff(university_id)
      OR (
        verification_status = 'verified'
        AND public.has_university_membership(university_id)
      )
    )
  );

CREATE POLICY "Members upload resources to own university"
  ON public.resources FOR INSERT
  WITH CHECK (
    environment = 'production'
    AND uploaded_by = auth.uid()
    AND verification_status = 'pending_review'
    AND public.has_university_membership(university_id)
  );

CREATE POLICY "Uploaders update own pending resources or staff moderate"
  ON public.resources FOR UPDATE
  USING (
    (uploaded_by = auth.uid() AND verification_status = 'pending_review')
    OR public.is_university_staff(university_id)
  )
  WITH CHECK (
    (uploaded_by = auth.uid() AND verification_status = 'pending_review')
    OR public.is_university_staff(university_id)
  );

CREATE POLICY "Uploaders delete own pending resources or staff delete"
  ON public.resources FOR DELETE
  USING (
    (uploaded_by = auth.uid() AND verification_status IN ('pending_review', 'rejected'))
    OR public.is_university_staff(university_id)
  );

CREATE POLICY "Users manage own resource saves"
  ON public.resource_saves FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own resource votes"
  ON public.resource_votes FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users create resource reports and staff view"
  ON public.resource_reports FOR SELECT
  USING (reporter_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.resources r WHERE r.id = resource_id AND public.is_university_staff(r.university_id)
  ));

CREATE POLICY "Members report resources"
  ON public.resource_reports FOR INSERT
  WITH CHECK (
    reporter_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.resources r
      WHERE r.id = resource_id AND public.has_university_membership(r.university_id)
    )
  );

-- Communities, Channels & Messages
CREATE POLICY "Read accessible communities"
  ON public.communities FOR SELECT
  USING (public.can_access_community(id));

CREATE POLICY "Members create communities in own university"
  ON public.communities FOR INSERT
  WITH CHECK (
    environment = 'production'
    AND created_by = auth.uid()
    AND public.has_university_membership(university_id)
  );

CREATE POLICY "Staff or owners update communities"
  ON public.communities FOR UPDATE
  USING (created_by = auth.uid() OR public.is_university_staff(university_id))
  WITH CHECK (created_by = auth.uid() OR public.is_university_staff(university_id));

CREATE POLICY "Read community members"
  ON public.community_members FOR SELECT
  USING (public.can_access_community(community_id));

CREATE POLICY "Users join non-private communities or staff add"
  ON public.community_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND member_role = 'member'
    AND EXISTS (
      SELECT 1 FROM public.communities c
      WHERE c.id = community_id
        AND c.visibility IN ('public', 'university_members')
        AND public.has_university_membership(c.university_id)
    )
  );

CREATE POLICY "Users leave communities"
  ON public.community_members FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Read accessible channels"
  ON public.channels FOR SELECT
  USING (public.can_access_channel(id));

CREATE POLICY "Staff manage channels"
  ON public.channels FOR ALL
  USING (public.is_university_staff(university_id))
  WITH CHECK (public.is_university_staff(university_id));

CREATE POLICY "Read channel members"
  ON public.channel_members FOR SELECT
  USING (public.can_access_channel(channel_id));

CREATE POLICY "Read messages in accessible channels"
  ON public.messages FOR SELECT
  USING (environment = 'production' AND public.can_access_channel(channel_id));

CREATE POLICY "Permitted members post channel messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    environment = 'production'
    AND sender_id = auth.uid()
    AND public.can_access_channel(channel_id)
    AND EXISTS (
      SELECT 1 FROM public.channels ch
      WHERE ch.id = channel_id
        AND ch.university_id = messages.university_id
        AND (NOT ch.is_read_only OR public.is_university_staff(ch.university_id))
        AND (
          NOT ch.requires_verified_student
          OR public.has_university_membership(ch.university_id, NULL, true)
          OR public.is_university_staff(ch.university_id)
        )
    )
  );

CREATE POLICY "Senders edit or soft-delete own messages, staff moderate"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid() OR public.is_university_staff(university_id))
  WITH CHECK (sender_id = auth.uid() OR public.is_university_staff(university_id));

CREATE POLICY "Read and manage reactions in accessible channels"
  ON public.message_reactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.messages m WHERE m.id = message_id AND public.can_access_channel(m.channel_id)));

CREATE POLICY "Members add reactions"
  ON public.message_reactions FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.messages m WHERE m.id = message_id AND public.can_access_channel(m.channel_id))
  );

CREATE POLICY "Users remove own reactions"
  ON public.message_reactions FOR DELETE
  USING (user_id = auth.uid());

-- Direct Messages (strictly participant-only; never visible to admins/public)
CREATE POLICY "Participants read conversations"
  ON public.conversations FOR SELECT
  USING (environment = 'production' AND public.is_conversation_participant(id));

CREATE POLICY "Members create conversations in shared university"
  ON public.conversations FOR INSERT
  WITH CHECK (environment = 'production' AND public.has_university_membership(university_id));

CREATE POLICY "Participants read conversation membership"
  ON public.conversation_members FOR SELECT
  USING (public.is_conversation_participant(conversation_id));

CREATE POLICY "Participants update own read timestamp"
  ON public.conversation_members FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Participants read direct messages"
  ON public.direct_messages FOR SELECT
  USING (public.is_conversation_participant(conversation_id));

CREATE POLICY "Participants send direct messages"
  ON public.direct_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid() AND public.is_conversation_participant(conversation_id));

CREATE POLICY "Senders edit own direct messages"
  ON public.direct_messages FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users manage own block list"
  ON public.user_blocks FOR ALL
  USING (blocker_id = auth.uid())
  WITH CHECK (blocker_id = auth.uid());

-- Opportunities & Sources
CREATE POLICY "Public read production opportunity sources"
  ON public.opportunity_sources FOR SELECT
  USING (environment = 'production');

CREATE POLICY "Platform admins manage opportunity sources"
  ON public.opportunity_sources FOR ALL
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

CREATE POLICY "Read production opportunities according to tenant & status"
  ON public.opportunities FOR SELECT
  USING (
    environment = 'production'
    AND (
      (
        verification_status IN ('verified_current', 'source_listed_unreviewed', 'stale', 'expired', 'closed')
        AND (university_id IS NULL OR public.has_university_membership(university_id))
      )
      OR (university_id IS NOT NULL AND public.is_university_staff(university_id))
      OR public.is_platform_admin()
    )
  );

CREATE POLICY "Staff or platform admins manage opportunities"
  ON public.opportunities FOR ALL
  USING (
    public.is_platform_admin()
    OR (university_id IS NOT NULL AND public.is_university_staff(university_id))
  )
  WITH CHECK (
    public.is_platform_admin()
    OR (university_id IS NOT NULL AND public.is_university_staff(university_id))
  );

CREATE POLICY "Users manage own opportunity saves"
  ON public.opportunity_saves FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users report opportunities and staff view"
  ON public.opportunity_reports FOR SELECT
  USING (reporter_id = auth.uid() OR public.is_platform_admin());

CREATE POLICY "Authenticated users report opportunities"
  ON public.opportunity_reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

-- Announcements, Notifications, Reports & Audit Logs
CREATE POLICY "Read published announcements"
  ON public.announcements FOR SELECT
  USING (
    environment = 'production'
    AND (
      (
        status = 'published'
        AND (
          audience = 'public'
          OR (audience = 'all_members' AND public.has_university_membership(university_id))
          OR (audience = 'verified_students' AND public.has_university_membership(university_id, NULL, true))
        )
      )
      OR public.is_university_staff(university_id)
    )
  );

CREATE POLICY "Staff manage announcements"
  ON public.announcements FOR ALL
  USING (public.is_university_staff(university_id))
  WITH CHECK (public.is_university_staff(university_id));

CREATE POLICY "Users read and mark own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users create reports and staff review"
  ON public.reports FOR SELECT
  USING (
    reporter_id = auth.uid()
    OR (university_id IS NOT NULL AND public.is_university_staff(university_id))
    OR public.is_platform_admin()
  );

CREATE POLICY "Authenticated users file reports"
  ON public.reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid() AND environment = 'production');

CREATE POLICY "Staff update reports"
  ON public.reports FOR UPDATE
  USING (
    (university_id IS NOT NULL AND public.is_university_staff(university_id))
    OR public.is_platform_admin()
  )
  WITH CHECK (
    (university_id IS NOT NULL AND public.is_university_staff(university_id))
    OR public.is_platform_admin()
  );

CREATE POLICY "Staff read scoped audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    public.is_platform_admin()
    OR (university_id IS NOT NULL AND public.is_university_staff(university_id))
  );

-- AI Conversations (strictly user-owned)
CREATE POLICY "Users manage own AI conversations"
  ON public.ai_conversations FOR ALL
  USING (user_id = auth.uid() AND environment = 'production')
  WITH CHECK (user_id = auth.uid() AND environment = 'production');

CREATE POLICY "Users read and insert own AI messages"
  ON public.ai_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.ai_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));

CREATE POLICY "Users insert own AI messages"
  ON public.ai_messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.ai_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));

-- Demo Scenarios (read-only public demo metadata; isolated from production tables)
CREATE POLICY "Public read active demo scenarios"
  ON public.demo_scenarios FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read demo activity"
  ON public.demo_activity FOR SELECT
  USING (true);

-- ---------------------------------------------------------------------------
-- 5. Storage Buckets & Policies (Private by Default)
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('university-assets', 'university-assets', false, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf']),
  ('academic-resources', 'academic-resources', false, 26214400, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'text/markdown', 'image/png', 'image/jpeg']),
  ('chat-attachments', 'chat-attachments', false, 10485760, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'text/plain']),
  ('demo-assets', 'demo-assets', false, 5242880, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

-- Storage object policies: path convention `<university_id>/<user_id>/<filename>`
CREATE POLICY "Users manage own avatars"
  ON storage.objects FOR ALL
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Members read avatars of same university"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Members upload own academic resources to tenant folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'academic-resources'
    AND auth.uid()::text = (storage.foldername(name))[2]
    AND public.has_university_membership(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "Staff or authorized resource readers access academic resources"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'academic-resources'
    AND EXISTS (
      SELECT 1 FROM public.resources r
      WHERE r.storage_path = name
        AND r.environment = 'production'
        AND (
          r.uploaded_by = auth.uid()
          OR public.is_university_staff(r.university_id)
          OR (r.verification_status = 'verified' AND public.has_university_membership(r.university_id))
        )
    )
  );

CREATE POLICY "Members upload chat attachments in own tenant"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-attachments'
    AND auth.uid()::text = (storage.foldername(name))[2]
    AND public.has_university_membership(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "Members read chat attachments in own tenant"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-attachments'
    AND public.has_university_membership(((storage.foldername(name))[1])::uuid)
  );
