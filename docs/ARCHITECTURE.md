# System & Multi-University Tenancy Architecture

## Tenancy Model

Unicord is multi-tenant from the database upward:

- `universities` defines each institution tenant with `environment IN ('production', 'demo')`.
- `university_memberships` links `profiles.id` to `universities.id` with scoped `role` (`university_admin`, `moderator`, `verified_student`, `student`, `faculty_contributor`, `guest`) and `verification_status` (`pending`, `verified`, `unverified`, `rejected`).
- `schools`, `programmes`, `academic_terms`, `semesters`, `subjects`, `resources`, `communities`, `channels`, `messages`, `conversations`, `announcements`, `reports`, and `audit_logs` are all tenant-scoped via `university_id`.
- Cross-university access is blocked both in Next.js server components (`lib/auth/tenant.ts`) and in PostgreSQL RLS (`0002_rls_and_storage.sql`).

## Request & Auth Flow

1. `proxy.ts` (`lib/supabase/middleware.ts`) refreshes the Supabase SSR session cookie and redirects unauthenticated visitors away from protected campus routes to `/login`.
2. Server Components and API Route Handlers call `supabase.auth.getUser()` to verify the JWT server-side.
3. Privileged operations (`createSignedUrl`, ingestion upsert, admin deletion) execute server-side only using `SUPABASE_SERVICE_ROLE_KEY`.
