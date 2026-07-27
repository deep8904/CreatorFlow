# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary — Solo Creator**: a YouTube-centric creator, roughly 10K–500K subscribers, with some brand-deal flow but no dedicated team. Serious about their channel but not yet earning six figures — explicitly not the top-earner segment. Runs the business side of their work (brand deals, ideas, drafts, repurposing, performance tracking) out of Gmail, spreadsheets, and memory today.

**Secondary — Creator + Manager/VA**: a small team (2–5 people) where the creator delegates admin (Deals, Automations) to a manager without giving up Settings/billing control. Each team member has their own login.

**Tertiary — Prospective/evaluating creator**: top-of-funnel visitor who needs to understand what the product does and that it's genuinely free in under a minute.

## Product Purpose

CreatorFlow reduces the admin overhead of running a creator business — brand-deal tracking (inbox to paid invoice), content-idea capture, drafting, video repurposing, and channel analytics — so creators spend less time on admin and more time making content. Success is measured by signup → first integration connected (Gmail/YouTube), signup → first Deal or Idea created within a week, and 30-day retention of activated users.

## Positioning

Free, forever, with **no cut taken from any deal** — the mechanism that differentiates it from Passionfroot (5–15% cut) and OpusClip-style tools ($15–29+/mo with usage caps). It also ships a real team/permissions model at launch (Owner vs. scoped Member roles), a gap every researched competitor — Passionfroot explicitly — has left open. It targets the underserved mid-tier creator: past the "hobbyist with nothing serious yet" stage, well below the top 4% six-figure segment that existing tools implicitly assume.

**Open source (product-owner decision, 2026-07-25):** CreatorFlow is going open source for the community. There are no paid tiers and no pricing. **No pricing content, links, or CTAs may appear on any marketing surface** — this supersedes any earlier plan for a `/pricing` page or a pricing section on the Home page.

## Operating Context

Creators manage brand-sponsorship emails in Gmail, track deal status manually or in spreadsheets, and separately check YouTube Studio for performance. CreatorFlow's Deals module classifies brand-deal emails out of a connected Gmail inbox (never modifies/deletes the original mail) into a pipeline: Inbound → Negotiating → Contracted → Delivered → Paid. Manual deal creation works without Gmail connected. Repurpose take a YouTube video and needs a transcript-first pipeline (real captions, not URL-only video understanding) for any feature claiming quote-level accuracy. Integrations (Gmail, YouTube) are explicitly skippable during onboarding — a new user must reach a working Dashboard without connecting anything.

## Capabilities and Constraints

- **Launch scope (P0)**: Auth, Onboarding, Dashboard, Ideas, Drafts, Deals (manual + Gmail classify), Analytics, Team & Permissions, Settings.
- **Fast-follow (P1, not yet live)**: AI contract review, AI rate-aware reply drafting, Repurpose (transcript-first), a small fixed set of pre-built Automations, AI idea suggestions.
- **Explicitly out of scope (P2/non-goal)**: brand-side discovery marketplace, full video-editing NLE, payment processing/invoicing rails (v1 tracks status only, moves no money — **there is no checkout or billing flow in this product**), native mobile apps, cross-platform auto-posting, custom automation rule builder, auto-clip generation.
- **Security constraints (launch-blocking)**: Gmail/YouTube refresh tokens live in a service-role-only schema, encrypted at rest; OAuth requests `access_type: offline` + `prompt: consent` explicitly; Supabase does not auto-refresh provider tokens, so explicit refresh-before-expiry logic is required; RLS on every table, with `integrations` held to a stricter policy than user-content tables.
- **Team/permissions**: Owner (full access) vs. Member (can be scoped to exclude Settings/billing and team management) — each with their own login, never shared credentials.
- **Data portability**: full data export must work even for a cancelled/deleted account's final export request — no lock-in on cancel.
- Real AI features (contract review, reply drafting, transcript analysis, Gmail classification) are not live in the current build; where a demo/static version exists in the UI, it must be honestly labeled as a preview, not presented as live.

## Brand Commitments

- Name is locked: **CreatorFlow**.
- **Visual identity — superseded a third time, 2026-07-25**: the Swiss Modernism system is discarded per explicit user direction. Current visual authority is `DESIGN.md`, taken from the user-supplied "Nebula" reference (`DESIGN.md` + `generated-page.html`): black canvas, orange `#ea580c`/`#fb923c` accent, Manrope headings + Inter UI + Geist technical, glassmorphism, grain, border beams, grid-curtain reveals, pill buttons, `2.5rem` mega-cards. **Scoped to the Home page only** for now (`app/page.tsx` + `components/home/*`); in-app and auth surfaces stay on the prior token layer until the Home page is approved. The CreatorFlow name and "F" mark stay.
- **Voice (binding, unaffected by the visual reset)**: direct, plain, respectful of the creator's time — explicitly not corporate, not hype-y. All user-facing copy should match `docs/DESIGN_BRIEF.md`'s tone. The visual reset borrows Nexus Architecture's palette/type/motion system, not its enterprise-infrastructure copy voice or its testimonial/tiers content — CreatorFlow has no real testimonials, customers, or pricing tiers to show (see Evidence on Hand), and none will be fabricated.
- Full existing documentation: `docs/PRD.md` (product requirements), `docs/DESIGN_BRIEF.md` (screen copy/content, considered final), `docs/DESIGN_SYSTEM.md` (component/token system built this session), `docs/qa/QA_REPORT.md` and `docs/qa/KNOWN_ISSUES.md` (QA history and deliberately deferred items).

## Evidence on Hand

- A seeded demo account (`deep@creatorflow.demo`) with realistic sample deals, ideas, drafts, and a pending team invite — used for QA and demos. No real customer testimonials, case studies, or press exist; do not fabricate any (a risk specifically worth flagging since one of the two visual references under study is a testimonial-driven template).
- No real Gmail/YouTube OAuth credentials are connected in this environment (Settings honestly shows a disabled "Connect" state with a tooltip rather than faking a live connection).
- No payment/billing UI exists anywhere in the current build — confirmed absent, not just undocumented.

## Product Principles

1. Zero cost, zero cut, always — every design and product decision should reinforce (not undermine) the "genuinely free" claim.
2. Solo-creator-first: the primary user has no team by default: empty states, onboarding, and single-user flows must be first-class, not an afterthought bolted onto a team-oriented shell.
3. Never claim a live capability that is actually a static/demo preview (AI features) — honesty over impressiveness.
4. Respect the creator's time in both product and copy: direct over decorative, useful over hype-y.
5. Data belongs to the creator: exportable, portable, no lock-in, at any account state.

## Accessibility & Inclusion

No product-specific accessibility requirement beyond standard WCAG AA has been established. A recent technical audit (`/impeccable audit`, 2026-07-25) found real, verified gaps here — 3 form fields with no visible focus indicator, weak focus contrast elsewhere, and no `prefers-reduced-motion` support — that should be treated as a real constraint on this redesign, not just a legacy cleanup item deferred again.
