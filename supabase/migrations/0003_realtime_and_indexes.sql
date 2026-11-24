-- Unicord Performance Indexes, Updated-At Triggers & Realtime Publication

-- ---------------------------------------------------------------------------
-- 1. Indexes for Tenancy, Foreign Keys, Filters, Chronology & Search
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_universities_env_status ON public.universities (environment, status);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.university_memberships (user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_uni_status ON public.university_memberships (university_id, verification_status, role);

CREATE INDEX IF NOT EXISTS idx_schools_uni ON public.schools (university_id);
CREATE INDEX IF NOT EXISTS idx_programmes_uni_school ON public.programmes (university_id, school_id);
CREATE INDEX IF NOT EXISTS idx_academic_terms_uni ON public.academic_terms (university_id, academic_year);

CREATE INDEX IF NOT EXISTS idx_inst_content_uni_cat_status ON public.institutional_content (university_id, category, verification_status);

CREATE INDEX IF NOT EXISTS idx_resources_uni_status_type ON public.resources (university_id, verification_status, resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_filters ON public.resources (university_id, school_id, programme_id, exam_year, verification_status);
CREATE INDEX IF NOT EXISTS idx_resources_checksum ON public.resources (university_id, checksum) WHERE checksum IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_resources_search ON public.resources USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(subject_name, '') || ' ' || coalesce(subject_code, '')));

CREATE INDEX IF NOT EXISTS idx_communities_uni ON public.communities (university_id, visibility);
CREATE INDEX IF NOT EXISTS idx_channels_comm ON public.channels (community_id, university_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel_created ON public.messages (channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_conv_created ON public.direct_messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_members_user ON public.conversation_members (user_id);

CREATE INDEX IF NOT EXISTS idx_opportunities_env_status_deadline ON public.opportunities (environment, verification_status, deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_uni_cat ON public.opportunities (university_id, category, work_mode);
CREATE INDEX IF NOT EXISTS idx_opportunities_search ON public.opportunities USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(organization, '') || ' ' || coalesce(description, '')));

CREATE INDEX IF NOT EXISTS idx_announcements_uni_pub ON public.announcements (university_id, status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id, read_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_uni_status ON public.reports (university_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_uni_created ON public.audit_logs (university_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conv_user ON public.ai_conversations (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_msg_conv ON public.ai_messages (conversation_id, created_at ASC);

-- ---------------------------------------------------------------------------
-- 2. Updated-At Triggers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_universities_updated ON public.universities;
CREATE TRIGGER trg_universities_updated BEFORE UPDATE ON public.universities FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_inst_content_updated ON public.institutional_content;
CREATE TRIGGER trg_inst_content_updated BEFORE UPDATE ON public.institutional_content FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_resources_updated ON public.resources;
CREATE TRIGGER trg_resources_updated BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_opportunities_updated ON public.opportunities;
CREATE TRIGGER trg_opportunities_updated BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_opportunity_saves_updated ON public.opportunity_saves;
CREATE TRIGGER trg_opportunity_saves_updated BEFORE UPDATE ON public.opportunity_saves FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Enable Supabase Realtime for Messaging & Notifications
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
