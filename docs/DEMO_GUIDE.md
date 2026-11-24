# Professor Presentation & Demo Mode Guide (`/demo`)

## Overview

The `/demo` route provides an isolated evaluation environment so professors and reviewers can test every Unicord workflow without mixing simulated data into production student records.

## Permanent Safeguards

- Every `/demo/*` page renders the permanent top banner:
  `DEMO MODE — SIMULATED DATA — NOT LIVE UNIVERSITY RECORDS`
- All demo cards carry explicit labels (`DEMO — SIMULATED RESOURCE`, `DEMO — NOT AN AUTHENTIC PYQ`, `DEMO — EXAMPLE ONLY — NOT AN ACTIVE VACANCY`, `DEMO USER — SIMULATED PARTICIPANT`).
- Clicking **Reset Demo Data** restores the initial simulated state without touching any production database records.

## 10-Step Walkthrough

Use `/demo/tour` to step cleanly through:
1. Landing page & multi-university vision (`/`)
2. JECRC official information centre (`/universities/jecrc-university-jaipur`)
3. Demo dashboard (`/demo/dashboard`)
4. Academic resources & simulated upload (`/demo/resources`)
5. PYQ authenticity & AI practice labels (`/demo/pyqs`)
6. Community channels & DM preview (`/demo/community`)
7. Source-backed opportunities & expiry guard (`/demo/opportunities`)
8. AI Campus Assistant (`/demo/assistant`)
9. Admin moderation queue & demo reset (`/demo/admin`)
10. Real student account registration (`/signup`)
