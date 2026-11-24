# UNICORD — Multi-University Student Network

**One platform. Every campus. Endless connections.**

Unicord combines a university-scoped academic library, provenance-verified previous-year question papers (PYQs), Discord-inspired real-time communities, participant-only direct messaging, source-checked internships and hackathons, and an authorized server-side Gemini AI campus assistant.

**Launch Institution:** JECRC University, Jaipur, Rajasthan, India (independent student platform concept; not an official JECRC portal).

---

## Architecture & Stack

- **Framework:** Next.js App Router + React 19 + strict TypeScript
- **Styling:** Tailwind CSS v4 + Lucide icons
- **Backend & Auth:** Supabase PostgreSQL, Supabase Auth, Supabase Storage (private buckets + signed URLs), Supabase Realtime, Row Level Security (RLS)
- **AI:** Google Gemini API (`@google/genai`) called strictly server-side with permission-aware retrieval
- **Validation:** Zod + React Hook Form
- **Deployment:** Vercel (`vercel.json` includes daily ingestion cron configuration)

---

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```
3. Run development server:
   ```bash
   npm run dev
   ```

---

## Supabase Setup Checklist

1. Create a **production** Supabase project and a separate **demo** Supabase project (recommended).
2. Apply SQL migrations in order from `supabase/migrations/`:
   - `0001_initial_schema.sql`
   - `0002_rls_and_storage.sql`
   - `0003_realtime_and_indexes.sql`
3. Apply reference seed:
   - Production: `supabase/seed/production-reference/seed.sql`
   - Demo only: `supabase/seed/demo/seed.sql`
4. Configure Auth redirect URLs in Supabase Dashboard:
   - `http://localhost:3000/auth/callback`
   - `https://<your-domain>/auth/callback`
5. Promote your initial platform admin securely via SQL:
   ```sql
   UPDATE public.profiles SET is_platform_admin = true WHERE id = '<auth-user-uuid>';
   ```

---

## Quality & Verification Commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

---

## Documentation Index

- [Product Spec](docs/PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Security & RLS](docs/SECURITY.md)
- [Data Sources & Provenance](docs/DATA_SOURCES.md)
- [Professor Demo Guide](docs/DEMO_GUIDE.md)
- [Operations](docs/OPERATIONS.md)
