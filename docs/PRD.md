# CreatorFlow (Enhanced, Free) — Product Requirements & Launch Deliverables

**Status:** Draft v1 · **Owner:** You (Product Owner) · **Product name:** CreatorFlow (locked)

---

## Problem Statement

Creators run the business side of their work — brand deals, content ideas, drafts, repurposing, performance tracking — out of Gmail, spreadsheets, and memory. Full-time creators spend the majority of their working hours on admin and distribution rather than making content, and the tools that exist to fix this either take a cut of every deal (Passionfroot: 5–15%), gate core functionality behind $15–$29+/month subscriptions with usage caps (OpusClip), or offer no team/permission model at all. Meanwhile, 96% of creators haven't reached sustainable income, and this exact segment — the pre-professional, growing creator — is underserved because existing tools are built for beginners-doing-nothing-serious-yet or established six-figure creators, with nothing solid in between.

**Who's affected:** Individual creators and very small teams (creator + 1 manager/VA) managing YouTube-centric businesses with recurring brand sponsorships.

**Cost of not solving it:** Missed/late-followed-up brand deals (direct lost revenue), hours per week lost to manual admin, and a fragmented view of what's actually working across content and monetization.

## Goals

1. **Reduce brand-deal admin time** — a creator should be able to track a deal from first email to paid invoice without leaving the product.
2. **Zero cost to the creator** — no subscription fee, no percentage cut of deals, ever, for the core product.
3. **Reach the underserved mid-tier creator** — positioning and pricing explicitly target creators earning under six figures, not the top 4%.
4. **Match or exceed the trust bar set by Brand Inbox and OpusClip's competitors** on data portability (no lock-in on cancel) and security (proper OAuth token handling).
5. **Ship a real team/permissions model at launch** — a gap every competitor researched (Passionfroot explicitly) has left open.

## Non-Goals (v1)

- **Brand-side discovery/marketplace** (Passionfroot's B2B GTM angle) — this is a creator-side tool only; not building anything for brands to browse creators.
- **Full video editing suite** (Descript-style) — Repurpose generates AI suggestions and simple clips, not a professional NLE.
- **Payment processing / invoicing rails** — v1 tracks deal status and payment status; it does not move money. (Revisit in v2 if there's real demand — Stripe Connect is the natural path.)
- **Mobile native apps** — responsive web only for v1.
- **Multi-platform social publishing automation** (Repurpose.io's cross-posting) — v1 generates repurposed content; the creator posts it manually. Auto-posting is a P2 future consideration.

## Personas & User Stories

**Primary: Solo Creator** (YouTube-centric, 10K–500K subscribers, some brand deal flow, no dedicated team)
- As a solo creator, I want to connect my Gmail so brand deal emails are automatically surfaced, so I stop missing sponsorship opportunities buried in my inbox.
- As a solo creator, I want an AI-drafted reply to a sponsorship inquiry based on my rate card, so I can respond fast without starting from scratch every time.
- As a solo creator, I want to see a contract's risk flags before I sign, so I don't agree to bad terms I didn't notice.
- As a solo creator, I want to capture a content idea the moment I think of it, so it doesn't get lost.
- As a solo creator, I want to see my YouTube performance alongside my deal pipeline, so I understand which content actually drives sponsorship interest.
- As a solo creator, I want to export all my data at any time, so I know I'm never locked in.

**Secondary: Creator + Manager/VA** (small team, 2–5 people)
- As a creator, I want to give my manager access to Deals and Automations but not my Settings/billing, so I can delegate admin without losing control.
- As a manager, I want my own login (not the creator's shared password), so my actions are attributable and I don't see everything the creator sees by default.

**Tertiary: Returning/evaluating creator** (top-of-funnel)
- As a prospective user, I want to understand what this does and that it's genuinely free in under a minute, so I decide whether to sign up.

## Feature Requirements

### 1. Auth & Onboarding — P0
- Email/password signup + login (Supabase Auth)
- Google OAuth "Sign in with Google" as an alternative signup path
- Onboarding flow: profile basics → connect YouTube (optional, can skip) → connect Gmail (optional, can skip) → land on Dashboard
- Acceptance: a new user can reach a working Dashboard in under 5 minutes without connecting any integration (integrations must be skippable, not blocking)

### 2. Dashboard (Home) — P0
- At-a-glance summary: open deals needing action, upcoming content ideas, recent performance snapshot
- Empty states for every section (new user with nothing connected yet must not see a blank/broken screen)

### 3. Ideas — P0
- Create/edit/archive content ideas with title, notes, tags, status (New / In Progress / Scheduled / Done)
- P1: AI-suggested ideas based on connected YouTube channel's past top performers
- P2: Idea-to-Draft one-click conversion

### 4. Drafts — P0
- Simple rich-text draft editor tied to an Idea
- P1: AI writing assistance (hook suggestions, outline generation)

### 5. Deals — P0 (the core differentiator, modeled on validated Brand Inbox pattern)
- Gmail connection via OAuth, with a classifier that surfaces likely brand-deal emails into a dedicated Deals inbox view (mirrors mail, never deletes/modifies the original)
- Deal record: linked email thread, brand contact, deliverables, rate, status pipeline (Inbound → Negotiating → Contracted → Delivered → Paid)
- P0: manual deal creation (not dependent on Gmail connection — someone without Gmail connected can still use Deals manually)
- **P1 — AI contract review**: upload a contract PDF, extract text, flag against baseline terms (payment terms, exclusivity, usage rights, kill fees, revisions, IP assignment) as Critical / Risk / Info
- **P1 — AI rate-aware reply drafting**: draft a reply to an inbound deal email using the creator's stored rate card; creator approves before send (never auto-sends)
- Acceptance: disconnecting Gmail at any time must not delete any Deal records already created

### 6. Repurpose — P1
- Input a YouTube video (from connected channel or by URL)
- AI-generated summary and suggested repurposing angles (clip-worthy moments, social post drafts, blog-post outline)
- **Must use a transcript-first pipeline** (fetch actual captions/transcript, then send transcript text to the AI — not URL-only analysis) for any feature claiming quote-level accuracy
- P2: automatic vertical clip generation (OpusClip-equivalent) — explicitly deferred, flagged as a major scope/cost driver if added later

### 7. Automations — P1
- Rule builder: trigger (e.g., "new Gmail deal classified") → action (e.g., "create Deal record," "notify me")
- P0 for launch is a small fixed set of pre-built automations (not a full custom rule builder) — full custom automation builder is P2

### 8. Analytics — P0
- YouTube Data/Analytics API integration: views, watch time, subscriber change, top videos
- Simple date-range comparison

### 9. Team & Permissions — P0 (explicit differentiator vs. Passionfroot)
- Invite a team member by email with a role: Owner (full access) or Member (configurable: can be scoped to Deals + Automations only, no Settings/billing access)
- Each team member has their own login — no shared credentials
- Acceptance: a Member-role user cannot access Settings, billing, or remove/invite other team members

### 10. Settings — P0
- Profile, connected integrations (with clear connect/disconnect status), team management, **data export** (download all your data as structured files at any time), account deletion

## Non-Functional / Platform Requirements

- **Free, capped tier at launch** (consistent with earlier hosting-model decision): generous limits (e.g., unlimited Deals/Ideas/Drafts, capped AI-feature usage per month) rather than feature-gating the core workflow
- **OAuth token security (P0, launch-blocking)**: Gmail/YouTube refresh tokens stored in a service-role-only schema, encrypted at rest; `access_type: offline` + `prompt: consent` requested explicitly at auth time; automatic refresh-before-expiry logic, since Supabase does not do this automatically
- **RLS on every table**, with the `integrations` table (OAuth tokens) held to a stricter policy than user-content tables
- **Abuse/rate-limiting** on signup and AI-feature usage, since this is a free, capped, hosted product
- **Data portability**: full data export must work even for a cancelled/deleted account's final export request
- **Testing**: automated tests for OAuth token refresh logic and the Gmail deal classifier at minimum — both were explicitly thin/absent in the original reference implementation

## Legal & Compliance Deliverables

- Privacy Policy and Terms of Service (must accurately describe Gmail/YouTube data access, since this is a public claim, not just an internal one)
- **Google OAuth app verification**: Gmail read-scope access requires Google's restricted-scope verification/CASA security assessment before general availability — this has a multi-week lead time and should start early, not at the end
- Explicit "we never sell your data" and "we never train models on your inbox" commitments if made publicly must be operationally true

## Launch Checklist (beyond the app itself)

- [ ] Marketing/landing site (see Designer Brief for content)
- [ ] Product name finalized and cleared for collision (see Open Questions)
- [ ] Docs site (setup guide, FAQ)
- [ ] Status page / uptime monitoring
- [ ] Support channel (email or community, e.g. Discord)
- [ ] Google OAuth verification submitted and approved
- [ ] Privacy Policy + ToS published
- [ ] Analytics on the marketing site itself to measure activation funnel

## Success Metrics

**Leading (weeks):**
- Signup → first integration connected (Gmail or YouTube): target 50%+ within first session
- Signup → first Deal or Idea created: target 60%+ within first week

**Lagging (months):**
- 30-day retention of activated users
- % of users with Gmail connected who create at least one Deal from a classified email (validates the classifier is actually useful, not noise)

## Open Questions

- **[Legal] Trademark/collision check on "CreatorFlow"** — name is locked per product decision; earlier research flagged this exact name is used by the source reference repo and by unrelated existing products. Recommend a lightweight trademark screen before wide public launch even though the name itself is final.
- **[Engineering] AI provider for contract review and repurposing** — Gemini (URL-native video, but summary-only) vs. an approach that always transcribes first; decide the default pipeline before building Repurpose.
- **[Legal] Google verification timeline** — needs a firm start date since it can gate the Gmail feature's public launch.
- **[Design] Team/roles granularity** — is a simple Owner/Member split sufficient for v1, or does a real user need more granular per-module permissions at launch?

## Timeline Considerations

Suggested phasing (building on the Clarasite sprint-planning pattern already used):
- **Phase 1 (P0 only)**: Auth, Onboarding, Dashboard, Ideas, Drafts, Deals (manual + Gmail classify, no AI contract review yet), Analytics, Team/Permissions, Settings — target MVP launch
- **Phase 2 (P1)**: AI contract review, AI reply drafting, Repurpose (transcript-first), Automations pre-built set, AI idea suggestions
- **Phase 3 (P2)**: Custom automation builder, auto-clip generation, idea-to-draft automation

No hard external deadline identified yet — flag if one exists (e.g., a launch event, a community commitment date) so phasing can be adjusted.
