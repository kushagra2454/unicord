# Operations & Maintenance Guide

## Health & Monitoring

- `GET /api/health` reports live status for Supabase configuration, database reachability, Gemini API key presence, ingestion cron secret, and demo isolation configuration (without exposing secrets).

## Scheduled Source Ingestion

- `vercel.json` defines a daily cron (`0 6 * * *`) targeting `/api/ingestion/run`.
- Configure `INGESTION_CRON_SECRET` in Vercel environment variables so automated cron requests are authenticated via `Authorization: Bearer <INGESTION_CRON_SECRET>`.

## Backups & Incident Response

- Enable daily automated PostgreSQL backups and Point-in-Time Recovery (PITR) on the production Supabase project.
- Review `audit_logs` and `reports` regularly inside `/[universitySlug]/admin`.
- Before public launch, ensure demo seed records are applied only to the dedicated demo Supabase project (or isolated strictly via `environment = 'demo'`).
