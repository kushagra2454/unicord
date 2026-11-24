# Security, RLS & Privacy Architecture

## Row Level Security (RLS)

RLS is enabled on all 38 application tables in `supabase/migrations/0002_rls_and_storage.sql`:

- **Anti-privilege-escalation triggers:**
  - `trg_profiles_guard` prevents non-service-role clients from altering `is_platform_admin` or `environment`.
  - `trg_membership_guard` forces new memberships to start as `role = 'student'` and `verification_status IN ('pending', 'unverified')`, and blocks non-admins from changing roles or verification statuses.
- **Cross-university isolation:** `has_university_membership(university_id)` verifies membership in the exact target university. A moderator at JECRC has zero privileges at any other university.
- **Direct Messages:** Only members listed in `conversation_members` can read or insert `direct_messages`. Admins and public search never see private DMs.
- **Private Storage Buckets:** `academic-resources`, `avatars`, `chat-attachments`, `university-assets`, and `demo-assets` are private by default. Authorized downloads use 60-second signed URLs from `/api/resources/[id]/download`.

## API Key & Rate Limit Controls

- `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `INGESTION_CRON_SECRET` are never prefixed with `NEXT_PUBLIC_`.
- Sliding-window rate limiting (`lib/rate-limit.ts`) protects AI (`/api/ai/chat`), uploads (`/api/resources/upload`), channel messages (`/api/messages`), direct messages (`/api/direct-messages`), and reports (`/api/reports`).
- Upload validation (`validateResourceUpload`) enforces <= 25 MB size, approved MIME types, approved extensions, and SHA-256 checksum deduplication.
