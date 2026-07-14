# CreatorFlow — Project Context for Claude Code

This file is read automatically at the start of every Claude Code session in this repo. Full detail lives in `/docs` (see below) — this is the summary Claude Code needs to make good decisions without being re-briefed every session.

## What This Is

CreatorFlow is a **free** tool for content creators to manage brand sponsorship deals, content ideas, drafts, video repurposing, and channel analytics — with no cut taken from any deal, ever. Target user: creators serious about their channel but not yet earning six figures (explicitly not the top-earner segment).

## Reference Docs (read these before starting new feature work)

- `/docs/PRD.md` — full product requirements, P0/P1/P2 scope per module, success metrics
- `/docs/DESIGN_BRIEF.md` — all screen copy and content (already final, don't invent new copy)
- `/docs/DESIGN_TOKENS.md` or `design.pdf` — visual design system

*(Copy the three files already produced — `CreatorFlow_PRD_and_Launch_Deliverables.md`, `CreatorFlow_UIUX_Designer_Brief.md`, and the design tokens file — into a `/docs` folder in this repo so Claude Code can reference them directly.)*

## Tech Stack (decided)

- Frontend: React + Tailwind (from v0 export), Vite or Next.js
- Backend: Supabase — Postgres, Auth, Row Level Security, Edge Functions
- Integrations: Gmail OAuth (deal classification), YouTube Data/Analytics API
- AI: Gemini for contract review and video repurposing analysis

## Non-Negotiable Security Requirements

These came out of dedicated research and are launch-blocking — do not skip or simplify these even under time pressure:

1. **Gmail/YouTube refresh tokens** must be stored in a service-role-only Postgres schema, not accessible via the public API, ideally encrypted with pgcrypto or Supabase Vault.
2. **Supabase does not auto-refresh Google provider tokens.** Build explicit refresh-before-expiry logic — do not assume the session handles this.
3. Google OAuth calls must request `access_type: offline` and `prompt: consent`, or no refresh token is returned at all.
4. **Every table needs RLS.** The `integrations` table (OAuth tokens) needs a stricter policy than user-content tables — reads should go through edge functions, not direct client queries.
5. AI video analysis (`analyze-video`) should fetch the actual transcript/captions first, then send that text to Gemini — do not rely on URL-only video understanding for anything requiring quote-level accuracy.

## Scope Discipline

- P0 modules for launch: Auth, Onboarding, Dashboard, Ideas, Drafts, Deals (manual + Gmail classify), Analytics, Team & Permissions, Settings.
- P1 (fast-follow, not launch-blocking): AI contract review, AI reply drafting, Repurpose, Automations, AI idea suggestions.
- Do not build P2 items (custom automation builder, auto-clip generation) without an explicit go-ahead — see `/docs/PRD.md` Non-Goals section.

## Testing Priorities

At minimum, automated tests are required for: OAuth token refresh logic, and the Gmail deal classifier. Both were flagged as commonly thin/absent in comparable implementations — don't skip them here.

## Voice/Copy Rule

All user-facing copy should come from `/docs/DESIGN_BRIEF.md`. If a screen needs copy not covered there, match its tone: direct, plain, respectful of the creator's time — not corporate, not hype-y.
