# CreatorFlow — 3-Stage Feature Roadmap

**Source:** Synthesized from `CreatorFlow as a Daily Driver: Cross-Platform Feature and UX Research` (11 ranked features + UX/navigation patterns).
**Purpose:** Turn that research into a buildable sequence. Every feature and pattern from the research is placed into exactly one stage below — nothing is dropped.
**How to use this:** Save this file into the repo (e.g. `docs/roadmap/CREATORFLOW_ROADMAP.md`) so Claude Code can reference it directly by path in future sessions. Each stage has its own **Exit Gate** — a checklist that must be true before the next stage starts. Don't start Stage 2 work until Stage 1's gate is fully green, and so on.

---

## At a glance

| Stage | Theme | What ships | Why this order |
|---|---|---|---|
| **1** | Daily Habit Loop | Today Dashboard · Global Quick-Capture · Seed-data Onboarding · core UX patterns | Cheapest, highest-leverage changes — gets people opening the app daily before anything else matters |
| **2** | Money & Creator-Specific Value | Deal→Invoice→Paid loop · Auto-Generated Media Kit · Content Calendar · Best-Time-to-Publish | Attaches the app to revenue and pitching — the two things creators can't afford to drop, so churn drops |
| **3** | Collaboration & Power Automation | Multi-view records · Approval-as-capability (5 roles) · Butler-style recurring automations · Visual automation builder (stretch) | Only worth building once there are real teams and repeat users generating enough usage data to need it |

Each stage builds on the last: Stage 2's Content Calendar reuses Stage 1's UX patterns; Stage 3's multi-view system generalizes the calendar Stage 2 shipped for Deals alone; Stage 3's approval system reuses the existing RBAC roles the app already has.

---

## Stage 1 — Daily Habit Loop (Foundation)

### Goal
Give people a reason to open CreatorFlow every single day, not just when a brand deal shows up. This is the cheapest stage and the one everything else depends on — a media kit or approval workflow is worthless if nobody opens the app to use it.

### 1.1 — "Today" Home Dashboard
**What it is:** A login-day snapshot that answers "what needs me today?" in one glance — deals needing follow-up, invoices overdue/awaiting payment, ideas captured this week, drafts in progress, next scheduled/repurposed content, and a YouTube momentum card (28-day views/subscribers).

**Why it matters:** This is the exact pattern that makes YouTube Studio a daily habit — a single glanceable snapshot rather than a wall of tables. The current Dashboard already has pieces of this (metrics, "Needs a next step" panel); this reorganizes and sharpens it into a true command-center view rather than a general metrics page.

**Implementation path:**
- Extend/restructure the existing `app/(app)/dashboard` page rather than building from scratch — it already queries deals/ideas/drafts/channel stats.
- Add the missing pieces: overdue-invoice count, "ideas captured this week," "drafts in progress," and a clear "next thing due" surface.
- Keep it role-aware — reuse the existing role-gating logic so a Manager sees deal-focused cards, an Editor sees content-focused cards, etc. (this pattern already exists from the RBAC work).

**Effort:** Medium. **Dependencies:** none new — built entirely on existing Deals/Ideas/Drafts/Analytics queries and the existing role system.

### 1.2 — Global Quick-Capture / Command Palette
**What it is:** A `Cmd/Ctrl+K` palette and a persistent "quick add" reachable from anywhere in the app to drop an Idea (with tags/voice), start a Draft, or create a Deal — without navigating to that page first.

**Why it matters:** Capture friction is the single biggest reason creators keep ideas scattered across Notes apps and voice memos instead of one tool. Removing that friction is what makes a tool the reflexive place to dump a thought the moment it happens.

**Implementation path:**
- A palette component mounted at the app-shell level (`app/(app)/layout.tsx`), listening for the keyboard shortcut globally.
- Actions: New Idea (reuse existing Ideas quick-capture, including the voice-input mic button already built), New Draft, New Deal, plus fuzzy search/navigation to any page.
- Respect role gating — a Designer shouldn't see "New Deal" as an option, matching existing nav restrictions.

**Effort:** Low–Medium. **Dependencies:** none new — wraps existing create actions for Ideas/Drafts/Deals.

### 1.3 — Onboarding with Seed Data + Adaptive Checklist
**What it is:** A "Generate demo data" option so a fresh account never lands on a blank screen, plus a short adaptive checklist (connect Gmail/YouTube, add first deal, capture first idea, invite a teammate) that updates as steps get completed.

**Why it matters:** The consensus best practice across SaaS onboarding is reaching first value in minutes via sample data and a checklist instead of a blank slate — a blank dashboard is intimidating and creators bounce before ever seeing what the tool can do.

**Implementation path:**
- Reuse the existing `scripts/seed-demo-data.ts` pattern, scoped to insert one sample deal/idea/draft into a real new account rather than only the demo account.
- Add a lightweight checklist component on the new Today Dashboard (1.1) tracking real completion state (has the user connected Gmail/YouTube? added a deal? captured an idea? invited someone?) — read from existing tables, no new schema needed beyond maybe one `onboarding_checklist_dismissed` flag.
- This augments the existing onboarding wizard (Connect YouTube → Connect Gmail → Done) — it doesn't replace it.

**Effort:** Low. **Dependencies:** existing seed script, existing onboarding flow.

### Stage 1 UX patterns to weave in throughout
These aren't separate build items — they're standards every Stage 1 (and later) component should follow:
- **Glanceable "vital sign" cards over raw tables** — lead with numbers and status, not spreadsheets.
- **Zero-friction capture** — the quick-capture action must be reachable by keyboard from anywhere, no page navigation required.
- **Never-blank empty states** — every list/dashboard view needs a real next-step prompt when empty, not a bare "no data" message.
- **One-screen readability** — the Today Dashboard should not become a scroll marathon; if it's getting crowded, that's a sign to move a card to Stage 2's Content Calendar instead of stacking further.

### Stage 1 Exit Gate — all must be true before Stage 2 begins
- [ ] Today Dashboard live, verified in the browser, and is the default landing experience after login.
- [ ] Quick-capture reachable via keyboard shortcut from every page, tested for at least Idea/Draft/Deal creation.
- [ ] A genuinely fresh signup sees seed data or a working checklist, not a blank screen.
- [ ] All three features respect existing role gating (verified for at least 2 different roles).
- [ ] Zero regressions in existing Deals/Ideas/Drafts/Analytics functionality.
- [ ] `tsc`/`lint`/`build`/`test` all clean.

---

## Stage 2 — Money & Creator-Specific Value

### Goal
Attach CreatorFlow to the two things creators can't afford to drop: getting paid, and pitching the next deal. This is what turns "a nice tool" into "the tool I can't switch away from."

### 2.1 — Deal → Invoice → Paid Automation Loop
**What it is:** Extends the app's existing invoice/payment tracking with real follow-up automation: overdue-invoice flags and "needs follow-up" auto-detection based on how long a deal has sat untouched.

**Why it matters:** "Never miss a payment or follow-up" is the single strongest return-reason for creators managing brand deals — this is the exact gap tools like Follyo and Rella exist to fill.

**Implementation path:**
- No new schema needed — compute "needs follow-up" from existing `updated_at` + stage (e.g., "Negotiating" untouched for 5+ days, or an unpaid invoice past its due date).
- Surface these directly on the Today Dashboard (built in Stage 1) and as a filter/sort option in Deals.
- This is a natural extension of the existing Automations system (archive-on-paid, Gmail sponsorship detection) — same pattern, new rule.

**Effort:** Low–Medium. **Dependencies:** Stage 1's Today Dashboard (for surfacing), existing Deals/Automations infrastructure.

### 2.2 — Auto-Generated Media Kit
**What it is:** A shareable, auto-updating public page generated from the creator's real connected YouTube analytics plus their closed-deal history, with view tracking on the shared link.

**Why it matters:** This is the artifact creators currently rebuild by hand in Canva for every single pitch — automating it from real data (rather than static screenshots) is a genuine differentiator no generic PM tool offers, and it gives creators a reason to keep their YouTube connected even when they're not actively managing a deal.

**Implementation path:**
- New public route (e.g. `/mediakit/[shareToken]`) with a generated, non-guessable share token.
- Pull real data from the existing YouTube integration (channel stats, recent video performance) — this already exists from the OAuth work.
- Pull deal history from Deals (with a user-controlled toggle for whether dollar amounts are shown publicly or just "X brand partnerships completed").
- Add a simple view-count table for the share link, matching the pattern the research found in CreatorsJet/InfluenceFlow.

**Effort:** Medium. **Dependencies:** existing YouTube OAuth integration, existing Deals data.

### 2.3 — Content Calendar (deliverables + usage-rights expiry)
**What it is:** A calendar view unifying draft due dates, deal deliverable due dates, usage-rights expiry dates, and scheduled repurposes — the "what's going live and what's due" view creators check every morning.

**Why it matters:** This is the view that makes a tool daily-open for planning, not just for logging what already happened.

**Implementation path:**
- Ship a scoped calendar view for Deals specifically in this stage (deliverable due dates, usage-rights expiry) — don't wait for Stage 3's full multi-view architecture.
- Pull in Draft due dates and scheduled Repurpose items if those concepts already exist; if Drafts has no due-date field yet, this is the point to add one.
- This calendar becomes the seed for Stage 3.1's generalized multi-view system — build it with that reuse in mind (a shared `CalendarView` component, not a one-off).

**Effort:** Medium. **Dependencies:** Stage 1 UX patterns, existing Deals data.

### 2.4 — Best Time to Publish
**What it is:** Recommended per-platform publish windows, computed from the creator's own historical YouTube performance data, surfaced inside Repurpose and as suggested calendar slots.

**Why it matters:** Turns Analytics from a passive report into an actionable daily prompt — the same job Later's "Best Time to Post" does, but grounded in the creator's own real data rather than generic benchmarks.

**Implementation path:**
- Analyze existing `channel_stats_daily`/`channel_videos` data for day-of-week/time-of-day performance patterns.
- Surface as suggested windows in Repurpose (mirroring the "highlighted colored boxes" pattern from the research).
- **Be honest about confidence:** this account only has YouTube data (single platform, potentially limited video count) — don't present a precise recommendation as more confident than the data supports. Show a "based on your last N videos" caveat, and don't ship this if the connected account has too few videos to produce a meaningful pattern (gate on a minimum sample size).

**Effort:** Medium. **Dependencies:** existing Analytics/YouTube data.

### Stage 2 Exit Gate — all must be true before Stage 3 begins
- [ ] Follow-up/overdue detection live and surfaced on Today Dashboard, verified with a real test deal.
- [ ] Media Kit generates real data from a connected account, share link works, view tracking confirmed.
- [ ] Content Calendar live for Deals, showing deliverable + usage-rights dates correctly.
- [ ] Best Time to Publish either shows honest data-backed suggestions or honestly declines to show anything below the minimum sample size — never fabricated confidence.
- [ ] Zero regressions in Stage 1 features.
- [ ] `tsc`/`lint`/`build`/`test` all clean.

---

## Stage 3 — Collaboration & Power Automation

### Goal
Deepen the app for real multi-person teams and repeat power users — this is where the 5-role RBAC system starts actually mattering day-to-day, not just as an access-control layer.

### 3.1 — Multi-View Records (board / calendar / gallery / table)
**What it is:** Let Ideas and Drafts (Deals already has kanban+list) render as board, calendar, gallery, or table — same underlying records, different lens, with the last-used view remembered per user.

**Why it matters:** This is the Notion/Airtable pattern that makes a tool flexible enough to match how each person actually thinks — a Designer might want gallery view for visual content, a Manager might want calendar view for deadlines.

**Implementation path:**
- Generalize the `CalendarView` component built in Stage 2.3 into a reusable view-switcher.
- Add board and gallery renderers over the existing Ideas/Drafts data (no new schema — just new presentation layers over existing records).
- Persist the last-used view per user per module (a small preference table or a `profiles` JSON column).
- Keep record counts reasonable for a self-hosted app — don't copy Airtable's low free-tier record ceilings; this should scale with what Supabase comfortably handles.

**Effort:** Medium–High. **Dependencies:** Stage 2.3's Content Calendar component.

### 3.2 — Approval-as-a-Capability for the 5 Roles
**What it is:** A real approval workflow — Designer/Editor submit drafts (or designs) into a "Pending Review" state; Manager/Owner approve or reject; Moderator gets comment-scoped access only.

**Why it matters:** This is what makes the existing 5-role system mean something in daily use, not just at the permissions-table level. It's the Buffer/Later pattern (Reviewer / Member / Restricted Member) mapped onto CreatorFlow's existing roles.

**Implementation path:**
- Add a `status` field to Drafts (`draft` / `pending_review` / `approved` / `changes_requested`) — small, additive schema change.
- Manager/Owner get approve/reject actions in the Drafts UI; Editor/Designer get a "submit for review" action.
- Tie into the existing notification-bell pattern for "your draft was approved/needs changes."
- Define role precedence explicitly up front (who can override whom) to avoid the ambiguous-access-tier confusion the research flagged as a common complaint in tools with similar systems.

**Effort:** Medium. **Dependencies:** existing RBAC system (already built), existing notification pattern.

### 3.3 — Butler-Style Recurring & Escalation Automations
**What it is:** Extends the existing Automations engine (currently 3 event-based rules) with recurring, schedule-based rules and escalation rules — e.g., "deal untouched 7 days → flag it," "every Monday, summarize what's due this week."

**Why it matters:** This is the Trello Butler pattern — plain-language rules that handle the small recurring maintenance work nobody wants to do manually, extending the automation muscle the app already has rather than inventing a new system.

**Implementation path:**
- Extend the existing Automations table/UI to support a `recurring` or `condition-based` rule type alongside the current event-based ones.
- Reuse Stage 2.1's "needs follow-up" detection logic as the first escalation rule.
- Keep rule definitions simple and human-readable, matching Butler's plain-language framing — resist turning this into a full workflow-builder (that's 3.4, and it's explicitly a later/optional stretch).

**Effort:** Low–Medium. **Dependencies:** existing Automations infrastructure, Stage 2.1's follow-up logic.

### 3.4 — Visual/AI Automation Builder (stretch goal — optional within Stage 3)
**What it is:** A flow-chart-style builder for creators to compose their own trigger → condition → action automations, eventually with a natural-language/AI-assisted layer.

**Why it matters:** This is the direction tools like Kit are heading (their MCP-based read/write automation), but it's real product surface area — only worth building once the core loops from Stages 1–3.3 are proven sticky.

**Implementation path:** Explicitly deferred detail — this is a "later" item. Only scope it out in full once Stage 3.1–3.3 are shipped and there's real signal that users want to build custom rules beyond what the fixed rule set offers.

**Effort:** High. **Dependencies:** everything above; treat as optional, not a hard requirement to close out Stage 3.

### Stage 3 Exit Gate
- [ ] Multi-view switching works for Ideas and Drafts, verified across all 4 view types.
- [ ] Approval workflow tested end-to-end with at least 2 real roles (submit → approve/reject → notification).
- [ ] At least one recurring/escalation automation live and verified firing correctly.
- [ ] Visual automation builder (3.4) explicitly scoped as done/deferred based on real usage signal — not built blindly.
- [ ] Zero regressions in Stage 1 and Stage 2 features.
- [ ] `tsc`/`lint`/`build`/`test` all clean.

---

## Appendix — Full Coverage Map

Cross-reference confirming every item from the original research report is placed in exactly one stage.

| # | Feature / Pattern (from research) | Stage | Section |
|---|---|---|---|
| 1 | Today Home Dashboard | 1 | 1.1 |
| 2 | Global Quick-Capture / Command Palette | 1 | 1.2 |
| 10 | Onboarding with seed data + adaptive checklist | 1 | 1.3 |
| — | Glanceable vital-sign cards | 1 | UX patterns |
| — | Zero-friction capture | 1 | UX patterns |
| — | Never-blank empty states | 1 | UX patterns |
| — | One-screen readability | 1 | UX patterns |
| 5 | Deal → Invoice → Paid automation loop | 2 | 2.1 |
| 3 | Auto-Generated Media Kit | 2 | 2.2 |
| 7 | Content Calendar (deliverables + usage-rights) | 2 | 2.3 |
| 4 | Best Time to Publish | 2 | 2.4 |
| 6 | Multi-view records (board/calendar/gallery/table) | 3 | 3.1 |
| 8 | Approval-as-a-capability for 5 roles | 3 | 3.2 |
| 9 | Butler-style recurring & escalation automations | 3 | 3.3 |
| 11 | Visual/AI automation builder | 3 | 3.4 (stretch) |
| — | Same data, multiple lenses | 3 | 3.1 |
| — | Density with restraint (Jira anti-pattern) | 1–3 | Standing principle, all stages |

Nothing from the research report is unaccounted for.
