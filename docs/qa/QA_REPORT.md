# CreatorFlow QA Report

Living document, updated each QA round. See `docs/qa/KNOWN_ISSUES.md` for anything deferred past the bounded fix-and-reverify loop. Findings use stable IDs (`QA-<MODULE>-NNN`) so fix commits and later rounds can reference them directly.

**Per-module checklist** (applied to every module below):
- **Functional correctness** — happy path works end-to-end; failure paths are visible to the user, not silent.
- **Error handling** — every mutation's result is checked and surfaced (toast/inline).
- **Accessibility** — keyboard nav, focus visible, labels on inputs, AA contrast, accessible names on icon-only buttons.
- **Visual consistency** — matches `docs/DESIGN_SYSTEM.md` (uses `components/ui/*`, no hand-copied classes for button/card/heading/avatar/badge/logo roles).
- **Responsive behavior** — no overflow/clipping at 375px, 768px, 1280px+.

---

## Round 1

Full pass across all 11 modules, run after Phase 1–3 (design system rollout + P0/P1 functional fixes) landed. Verified via: `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e` (10/10 passing), plus manual browser walkthrough of every unauthenticated screen and code review + build-time verification of authenticated in-app screens (an interactive re-walkthrough of the authenticated app was not re-run in this exact round after the last dev-server restart — see QA-DASH-001).

### Cross-cutting / App shell

- **QA-APP-001** (P1, Resolved) — `components/app/AppSidebar.tsx` had zero responsive treatment: a fixed `w-56` sidebar rendered on every viewport, including 375px mobile, where it consumed 60%+ of screen width with no way to collapse it (confirmed via live authenticated screenshot at the `mobile` preset). Fixed with a standard drawer pattern: sidebar is off-canvas (`-translate-x-full`) below `md`, a fixed mobile top bar with a hamburger toggle opens it as a slide-in overlay with backdrop, closes on link click or backdrop click. Verified live post-fix. Status: **Resolved**.
- **QA-APP-002** (P2, Deferred) — Individual board layouts (Deals' 3-column kanban, Drafts' fixed-width list+editor split) are fixed-width desktop layouts that don't reflow below ~768px — cramped, not broken (nothing is destructively clipped or unreachable). Full mobile redesign of every board is out of proportion for this QA round; deferred to `docs/qa/KNOWN_ISSUES.md` with reasoning.
- **QA-APP-003** (P1, Resolved) — Deals' "Draft AI reply"/"Review contract" trigger buttons still read as live-AI-implying labels even though the revealed panel and footer disclosure said "preview" — the button copy itself, the first thing a user sees, wasn't updated when QA-DEALS-001 was fixed. Corrected to "Draft reply — preview" / "Review contract — preview" so the preview-only framing is visible before the click, not just after. Status: **Resolved**.
- **QA-APP-004** (P2, Resolved) — Drafts' "AI assist" button had the same gap (QA-DRAFTS-002 only updated the inserted template text, not the trigger button). Relabeled "AI assist — preview" + added a `title` tooltip, since the toolbar has less room than Deals' full-width sidebar buttons. Status: **Resolved**.
- **QA-APP-005** (P2, Resolved) — Login's and Onboarding's `<header>` used a rigid `justify-between` two-item row; at 375px the "Don't have an account? Start free" / step indicator link crowded directly against the logo instead of wrapping. Fixed by adding `flex-wrap` + `gap` to both headers so the second item wraps to its own row on narrow viewports instead of squeezing. Verified live at the `mobile` preset. Status: **Resolved**.

### Marketing site (Landing, Pricing)

- **QA-MKT-001** (P2, Resolved) — Nav CTA and hero CTA previously rendered visibly different button shapes/padding. Fixed by routing both through `components/ui/button.tsx`; regression-guarded by a new Playwright assertion comparing computed `border-radius`/`background-color`. Status: **Resolved**.
- **QA-MKT-002** (P2, Resolved) — `LandingPricing.tsx` was dead code, `/pricing` had its own divergent inline pricing table. Wired `LandingPricing` into the homepage as a teaser linking to the full `/pricing` page (kept as two intentionally different views — teaser vs. full page — not a merge). Status: **Resolved**.
- Functional: all links resolve, no dead CTAs. Accessibility: heading hierarchy is sequential (h1 → h2), nav is keyboard-reachable. Responsive: checked at 375/768/1280, no horizontal overflow. No open findings.

### Auth / Onboarding

- **QA-AUTH-001** (P0, Resolved) — Signup funnel was entirely fake; `app/onboarding/page.tsx` never called `signUpWithEmail`, so no account was ever created and "Go to Dashboard" bounced to `/login`. Fixed: real form wired to `signUpWithEmail`, branches on `data.session` (immediate sign-in vs. email-confirmation-required). Verified against the live Supabase project with throwaway credentials — account creation and sign-in both confirmed working. Covered by `tests/e2e/onboarding.spec.ts`. Status: **Resolved**.
- **QA-AUTH-002** (P1, Resolved) — Onboarding's YouTube/Gmail steps presented fake "Connect" toggles that implied a working OAuth connection. Relabeled to match Settings' honest disabled-with-tooltip pattern. Status: **Resolved**.
- **QA-AUTH-003** (P2, Resolved) — Login and Onboarding headings used an ad hoc scale with no radius/size relationship to the rest of the app. Formalized as `.text-auth-h1`, documented in `docs/DESIGN_SYSTEM.md` as a deliberate third scale (centered auth moment vs. dense in-app toolbar heading are different roles). Status: **Resolved**.
- **QA-AUTH-004** (P2, Deferred) — No password-reset flow exists (no `/reset-password` page or "Forgot password?" link). Not a P0 PRD acceptance criterion. Deferred to `docs/qa/KNOWN_ISSUES.md`.
- Error handling: invalid credentials on `/login` surface an inline error (verified live + `tests/e2e/login.spec.ts`); malformed-domain signup email re-enables the submit button and stays on the welcome step rather than silently advancing (`tests/e2e/onboarding.spec.ts`). Accessibility: all inputs have associated `<Label>`s, verified via `getByLabel` locators passing in Playwright. No other open findings.

### Dashboard

- **QA-DASH-001** (P1, Resolved) — Dashboard was migrated to `components/ui/*` (Card `variant="subtle"` to match its originally lighter shadow weight, PageHeader, Button) but hadn't been re-screenshotted against a live authenticated session since the migration landed. Verified live post-migration (desktop + mobile, logged in as the seeded demo account): stat cards, quick-actions, avatar chips, and badges all render correctly against the new components. Status: **Resolved**.
- Functional: stat cards, recent-activity feed, and quick-actions all read from real Supabase queries (no mock data left — verified via `lib/supabase/queries.ts` grep during Phase 1). No open functional findings.

### Deals

- **QA-DEALS-001** (P1, Resolved) — "Draft AI reply" and "Review contract" presented static template output as if it were a live AI result. Relabeled "Draft reply — preview" / "Contract review — preview" with explicit footer disclosure ("Preview only — built from a template and your rate card, not a live AI call. Nothing sends until you approve."). Status: **Resolved**.
- **QA-DEALS-002** (P0, Resolved) — `updateDealStage`/`createDeal`/`updateDeal` swallowed Supabase errors silently; kanban drag-and-drop could silently fail with no user feedback. Standardized on `ActionResult`, wired to `useToast()`. Status: **Resolved**.
- **QA-DEALS-003** (P0, Resolved) — Stage-move/add/edit calls used `startTransition` without awaiting the mutation, so `isPending` didn't reflect true completion and failures became unhandled rejections. Fixed by awaiting inside the transition callback. Status: **Resolved**.
- Visual: kanban columns migrated to `.swiss-grid`/`.hover-lift-editorial`, matching the shared card treatment. No open findings.

### Ideas

- **QA-IDEAS-001** (P0, Resolved) — "Turn into draft" navigated to `/drafts` unconditionally, even when `createDraftFromIdea` failed. Fixed to navigate only on success, toast on failure. Status: **Resolved**.
- **QA-IDEAS-002** (P0, Resolved) — `createIdea` swallowed errors (systemic `ActionResult` gap). Status: **Resolved**.
- No other open findings; empty state present and uses `components/ui/empty-state.tsx`.

### Drafts

- **QA-DRAFTS-001** (P1, Resolved) — No warning before navigating away with unsaved edits. Added `isDirty` tracking, `beforeunload` listener, and `window.confirm()` guards on select/new-draft actions, plus a visual "Unsaved changes" indicator. Status: **Resolved**.
- **QA-DRAFTS-002** (P1, Resolved) — "AI assist" presented a canned structure template as if it were live AI output. Relabeled "Structure template — preview only, not a live AI call." Status: **Resolved**.
- **QA-DRAFTS-003** (P2, Resolved) — Drafts had no `PageHeader`, unlike every other in-app module. Added. Status: **Resolved**.
- No open findings.

### Repurpose

- **QA-REPURPOSE-001** (P1, Resolved) — Pasting a real (non-seeded) video URL silently no-op'd with no feedback. Now shows `toast.info(...)` explaining the demo only recognizes pre-seeded videos. Status: **Resolved**.
- No open findings; existing "preview only" disclosure pattern was already honest and used as the template for Deals/Drafts fixes above.

### Automations

- **QA-AUTO-001** (P2, Resolved) — `toggleAutomation` had the same swallowed-error + un-awaited-`startTransition` bug as Deals. Fixed. Status: **Resolved**.
- **QA-AUTO-002** (P2, Deferred) — Automations has no backend trigger; toggling only flips a stored boolean. Already honestly labeled "coming in a future update" in the UI copy — not a bug, listed in `docs/qa/KNOWN_ISSUES.md` for completeness.
- No other open findings.

### Analytics

- Migrated top-videos list to `.swiss-grid`/`.hover-lift-editorial` for visual consistency with Deals' kanban cards (same underlying pattern, previously divergent). No functional mutations on this page (read-only), so no `ActionResult`/`startTransition` class of bug applies. No open findings.

### Team

- **QA-TEAM-001** (P0, Resolved) — Invites could be sent and revoked, but nothing ever transitioned an invite to `accepted` or created the corresponding `team_members` row — the accept half of the feature didn't exist. Built `app/accept-invite/page.tsx` (4 states: missing param / unauthenticated / invalid-or-expired / valid-pending-accept) + `accept_team_invite()` SECURITY DEFINER function + scoped RLS SELECT policy. Verified the accept path against the real Supabase backend. Status: **Resolved**.
- **QA-TEAM-002** (P0, Resolved) — Security linter flagged `accept_team_invite` as callable by the `anon` role. Fixed via follow-up migration revoking anon EXECUTE; confirmed the revoke itself returned success (the linter's cached snapshot briefly still showed the stale warning — assessed as advisor cache lag, not a failed revoke). Status: **Resolved**.
- **QA-TEAM-003** (P2, Resolved) — Pending-invite avatar chips used the same accent tone as real members, making invited-but-not-joined members visually indistinguishable. Added `tone="neutral"` to `components/ui/avatar.tsx` for this state. Status: **Resolved**.
- Covered by `tests/e2e/accept-invite.spec.ts` (missing-param, unauthenticated-with-invite, next-param-preservation). No open findings.

### Settings

- **QA-SET-001** (P0, Resolved) — Profile name field allowed saving an empty string. Added trim + non-empty validation both client-side (disable submit) and server-side (`updateProfile` returns `{ error: "Your name can't be empty." }`). Status: **Resolved**.
- **QA-SET-002** (P1, Resolved) — `disconnectIntegration`'s result was called but discarded — a failed disconnect looked identical to a successful one. Wired to `useToast()`. Status: **Resolved**.
- **QA-SET-003** (P1, Resolved) — Data export copy claimed "everything" but only exported a subset of tables. Extended `app/api/export/route.ts` to include `channel_stats_daily`, `channel_videos`, `repurposed_content`, and `connected_accounts` — the last one routed through the `get-integrations` edge function rather than a direct table query, per CLAUDE.md's stricter-policy requirement for the `integrations` table. Status: **Resolved**.
- No open findings.

---

## Round 2

Full live pass across all 11 modules (logged in as the seeded demo account), re-checking Round 1 fixes for regressions and screening every remaining screen not yet screenshotted live this session. Verified: Dashboard, Deals (incl. reply/contract preview panel), Ideas, Drafts (incl. AI-assist trigger + mobile), Repurpose (incl. the new no-match toast), Automations, Analytics, Team, Settings, Login/Onboarding (incl. mobile), and the mobile sidebar drawer end-to-end (open → navigate → auto-close, and backdrop-click-to-close).

- **QA-DATA-001** (P1, Resolved — data, not code) — Analytics showed the "Connect YouTube" empty state and Settings' "Connected accounts" showed nothing, even though the account is the seeded demo user. Traced via direct DB query (`integrations` table had 0 rows for the demo user, while `deals`/`channel_stats_daily`/`channel_videos` all had their expected seeded row counts) — the two `integrations` rows the seed script inserts had been consumed at some point during this session's interactive testing (most likely a prior "Disconnect" click against the real backend). Not a code defect — `getIntegrations()`/the `get-integrations` edge function/RLS policy all worked exactly as designed once the underlying data existed. Fixed by re-inserting the two rows to match the original seed recipe exactly. Status: **Resolved**.
- **QA-DATA-002** (P2, Noted, not fixed) — Because there's no real OAuth (by design, see `docs/qa/KNOWN_ISSUES.md`), clicking "Disconnect" on the demo account's Gmail/YouTube integration in Settings is irreversible through the UI — there's no working "Connect" flow to restore it, only the honest disabled-with-tooltip state. This is correct behavior (no fake reconnect), but worth flagging as a live-demo footgun: don't click "Disconnect" during an investor walkthrough, since recovering from it requires a database fix, not a UI action.
- No new P0/P1 UI regressions found from the Round 1 fix batch. All labels, toasts, and the mobile drawer work as intended live.

## Round 3 — Deep record-management audit

Rounds 1–2 verified visual consistency, functional wiring, and error handling. Round 3 was triggered by a user report that Ideas have no way to edit or change status after creation, and asked a deeper question: for every record type, does the product support full create/read/update/delete/status-transition the way a comparable SaaS record manager (Jira, Airtable) would? Methodology: read every board component + every mutation in `lib/supabase/actions.ts` + every query in `lib/supabase/queries.ts` to get ground-truth on what each entity can actually do; reproduce every gap live against the seeded demo account; cross-check `pg_policies` on the live Supabase project to determine whether each gap is a missing RLS policy or a missing application layer on top of an already-ready database.

**Result: 31 findings** (7 P0, 12 P1, 12 P2 — 2 of the 31 are historical/already-fixed entries kept for index continuity). Full detail, evidence, and a prioritized fix roadmap are in the standalone report: **[CreatorFlow Production Readiness & Functional QA Audit](https://claude.ai/code/artifact/9ed931a2-412c-47ef-b9fc-69e0ee702da1)**.

Headline findings:
- **Ideas** (QA confirms the user's report): `createIdea` is the *only* mutation for this entity — no update, no delete, no status-change path exists anywhere in the code. `status`, `notes`, and `tags` are schema fields with no writer beyond the initial insert. The status filter tabs (New/In Progress/Scheduled/Done) are consequently dead ends for any user-created idea.
- **Drafts**: title can never be renamed after creation (`updateDraftContent` only ever writes `body`); no delete.
- **Team**: an accepted member can never be removed or have their role changed — `team_members` already has the RLS policies for both (`Owner removes non-owner team members`, `Owner updates team members`), but no server action or UI was ever built on top of them.
- **Deals**: the best-built module (full edit modal, working stage pipeline) — remaining gaps are narrower: no delete, no "Lost/Declined" terminal stage.
- **Cross-cutting**: no search anywhere in the product, no notification system, no bulk actions.

Critically, the RLS cross-check found that **almost none of the P0/P1 gaps are database-blocked** — `ideas`, `drafts`, and `deals` all carry `cmd = ALL` ownership policies (full CRUD already permitted), and `team_members` already has the exact DELETE/UPDATE policies TEAM-001/002 need. This is application-layer work (new server actions modeled directly on the existing `updateDeal` pattern, plus UI), not new migrations or security work, with the single exception of DEAL-002 (a genuine schema change to add a "lost" pipeline stage).

### Round 3 — Fix pass

All 7 P0 and 12 P1 findings from the audit above are **Resolved**, plus one P2 quick win (REPUR-001):

- **IDEA-001/002/003/004/005** (Resolved) — added `updateIdea`/`deleteIdea` to `actions.ts`; `IdeasBoard.tsx` cards now open an edit modal (title, notes, tags, status pills) on click, matching the `DealModal` pattern, plus a delete action. Status changes and deletes verified to persist server-side via a live Playwright run against the demo account (not just client state).
- **IDEA-006** (Resolved) — moot once status actually changes; filter tabs now correctly populate.
- **DRAFT-001/002** (Resolved) — `updateDraftContent` now accepts an optional `title`; the draft header is an inline-editable input. Added `deleteDraft` + a delete button with `window.confirm`. Verified live: rename persists across reload, delete removes the record.
- **DRAFT-003/004** (Deferred — see `KNOWN_ISSUES.md`) — draft lifecycle status and full-text search are larger features, not folded into this pass.
- **TEAM-001/002** (Resolved) — added `removeMember`/`updateMemberRole`, modeled on the existing RLS policies (`Owner removes non-owner team members`, `Owner updates team members`). Accepted-member rows now show a role `<select>` and a "Remove" action, gated to `team.isOwner`; a member can't change their own role (server-checked). Not live-clicked against a real second member this round (would have required either burning the exhausted email-invite rate limit or a direct DB seed) — verified via `tsc`/`lint`/`build` and code inspection against the identical, already-proven pattern used for Ideas/Deals.
- **TEAM-003** (Resolved) — inviting someone as Owner now requires an extra `window.confirm` naming exactly what Owner access grants.
- **DEAL-001** (Resolved) — added `deleteDeal` + a delete icon button next to "Edit deal", confirm-gated.
- **DEAL-002** (Resolved) — migration `20260722120000_add_lost_deal_status.sql` extends the `deals_status_check` constraint with `'lost'`; `Deal['status']` type updated; Deals board renders it as a 6th, visually muted kanban column; pipeline-value total and Dashboard's "needs attention"/"open deals" counts now exclude `lost`. Verified live: moving a deal to Lost persists its status pill across reload.
- **DEAL-003/DASH-001** (Resolved) — Dashboard's "Needs your attention" and "Recent ideas" rows now deep-link to `/deals?deal=<id>` / `/ideas?open=<id>`, which the respective boards read on mount to auto-open that record.
- **DEAL-004** (Resolved) — moving a deal backward in the pipeline (or to Lost) now requires confirmation; plain forward moves don't.
- **SET-001/SET-002** (Resolved) — added `/forgot-password` and `/reset-password` pages reusing the existing `/auth/callback` PKCE-exchange route (`resetPasswordForEmail` → email link → session → `updateUser({password})`); Settings gained an in-session "Update password" card and an editable email field wired to `updateUser({email})` (Supabase's own confirm-new-address flow). Request flow verified live end-to-end (the demo project's dev-tier email quota was already exhausted from earlier testing, which itself confirms the request reached Supabase's auth service and got a real response rather than failing silently).
- **XCUT-001** (Resolved, partial) — added a client-side substring search box to Ideas and Deals (the two list-shaped modules named in the finding); Drafts/Automations/Team were not in scope for this pass.
- **REPUR-001** (Resolved) — footer copy no longer claims "AI-generated," matches the honest preview-only framing used elsewhere.
- **SET-003/SET-004/SET-005, XCUT-002/XCUT-003, TEAM-004, DRAFT-003/004** — still deferred; see `docs/qa/KNOWN_ISSUES.md`.

Verification: `tsc --noEmit`, `eslint`, `vitest`, `next build`, and the full Playwright suite (10/10) all pass. The delete/status-change flows are gated behind native `window.confirm()`, which blocks the interactive browser tool used for manual QA in this project — those were instead verified with a throwaway Playwright spec (written, run, and deleted in this session) that handles the dialog programmatically and asserts against a page reload, proving the change is persisted server-side and not just client state. Ideas, Deals (Lost stage + delete), and Drafts (rename + delete) all passed on a clean dev-server run.

## Round 4 — Fix verification + deeper pass

Triggered by the same user report (Ideas status editing) repeated verbatim after the Round 3 fix landed — treated as a request to actually re-verify rather than re-explain. Live-reproduced the exact original scenario against a brand-new idea (not the one used during development): create → open → edit notes + status New→Done → save → persists across reload. Confirmed fixed. Also re-verified both Dashboard deep-links (deal and idea) live.

Went deeper from there and found four more issues, three fixed in this round:

- **R4-001** (P1, Resolved) — Round 3's new search boxes broke both the Ideas and Deals headers on mobile: Ideas' search input rendered fully off-canvas at 375px (confirmed via `getBoundingClientRect()`, `x: 399–579px` on a 375px viewport), Deals' "Add deal" button was pushed mostly off-screen behind the search box. Root cause: both header rows were `flex justify-between` with no `flex-wrap` — the same class of bug fixed for the Login/Onboarding headers in Round 1, reintroduced here. Fixed with `flex-wrap` + a full-width search input when wrapped.
- **R4-002** (P2, Resolved) — none of the three modals (`IdeaModal`, `DealModal`, Settings' delete-account confirm) closed on Escape. Added a shared `lib/useEscapeKey.ts` hook, wired into all three.
- **R4-003** (P0, **fix authored, not applied**) — Team invites are completely non-functional in production. Sending an invite fails; server logs show the real error was swallowed: `permission denied for table users`. Root cause: the RLS policy `"Invited user can view their own pending invite"` (added in the Round-1-era accept-invite migration) queries `auth.users` directly in its `USING` clause — RLS policies run as the querying role (`authenticated`), which has no grant on `auth.users`, and since Postgres evaluates every applicable policy on a `SELECT`, this one throwing breaks *every* authenticated query against `team_invites`, including the owner's own view of their pending invite. This has been broken since the migration that added it — Round 3's send/revoke code was written and typechecked correctly but never actually exercised against a live invite until this round. Fix: `supabase/migrations/20260722130000_fix_team_invites_email_rls_permission.sql`, using `auth.jwt() ->> 'email'` instead of querying the table (the standard Supabase pattern, no grant needed). **The Supabase MCP connection was unreachable for the rest of this session (confirmed via multiple unrelated calls) and there was no local Postgres/CLI fallback, so this migration could not be applied live. It needs to be applied before Team invites will work at all.**
- **R4-004** (P2, Resolved) — while investigating R4-003, found `getTeam()`, `getAccountId()`, and `sendTeamInvite()`'s duplicate-invite pre-check all used `.maybeSingle()` without checking its returned error, meaning an unexpected multi-row match (a real risk under RLS bugs or races) would silently look identical to "no matching row" instead of surfacing anything. Not the root cause of R4-003 in this instance (confirmed via a temporary debug log — exactly one `team_members` row, correctly resolved), but a real latent bug pattern, fixed by switching all three to `.limit(1)` with explicit first-element access.

**Updated Team status**: the remove-member/change-role code from Round 3 is unchanged and still believed correct (same proven pattern as Ideas/Deals, passes `tsc`/`lint`/`build`), but it is now confirmed **unreachable** — R4-003 blocks the invite step that would ever produce a second member to test it against. Apply the migration, then do one real invite → accept → remove/role-change click-through.

Full detail (reproduction steps, evidence, root-cause trace) is in the updated standalone report: **[CreatorFlow Production Readiness & Functional QA Audit](https://claude.ai/code/artifact/9ed931a2-412c-47ef-b9fc-69e0ee702da1)**.

## Round 5 — Supabase reconnected: applied the fix, then found three more bugs by actually using it

The Supabase MCP connection came back. This round applied R4-003's migration and then did what Round 4 couldn't: a real invite → accept → remove-member → change-role click-through against the live database, using a throwaway second `auth.users` account already present from earlier session testing (`deep8776@gmail.com`) rather than fighting the project's exhausted email-send quota again. Each mutation was verified by querying the table directly afterward, not by trusting the UI — Round 4 already burned time on one Playwright locator false-positive, so this round didn't repeat that mistake.

- **R4-003 applied and verified** — migration landed; `editor@creatorflow.demo`'s original seeded pending invite (present since before this whole session, and invisible the entire time due to the bug) became visible immediately, with a working Revoke button. Sent a fresh invite, revoked it, sent another, ran it through `/accept-invite` → signup redirect (correctly preserved the invite via `next`) — everything downstream of the RLS fix works exactly as designed.
- **R5-001** (P0, Resolved) — promoting a member to Owner was fundamentally broken, independent of R4-003: `team_members` carries *two* partial unique indexes (`team_members_one_owner_per_account`, `team_members_one_member_per_account` — the free-plan seat cap, enforced at the DB layer). `updateMemberRole`'s plain `UPDATE` always violated one of them (confirmed live, `23505`), and — this took two more attempts to get right — neither a same-order nor a single combined `UPDATE ... CASE` statement fixed it either, because Postgres checks a partial unique index as each row is written, even within one statement; only a genuine `DEFERRABLE` constraint defers that, and partial unique indexes can't be declared deferrable in Postgres at all. The working fix, in `transfer_account_ownership()`: delete both rows, then insert two new ones with the roles swapped — between the delete and the insert there's nothing left to collide with. Verified by direct SQL impersonation (`set_config('request.jwt.claims', ...)`) before ever touching the UI again, then re-verified through the real UI with Playwright.
- **R5-002** (P1, Resolved — product-correctness fix, not just a bug) — promoting someone to Owner silently demotes the caller (the schema allows exactly one owner), which flatly contradicts the product's own tagline, "Bring in a collaborator without giving up control." Added a `window.confirm` naming exactly what's being given up before the transfer runs, matching the pattern already used for Owner-role invites.
- **R5-003** (P1, Resolved) — the anon-execute revokes for `accept_team_invite` (originally "fixed" back in the Round 1-era work) and the new `transfer_account_ownership` were both silently ineffective. `revoke execute ... from anon` targets the `anon` role directly, but `CREATE FUNCTION` grants `EXECUTE` to `PUBLIC` by default, and `anon` inherits through PUBLIC membership — a role-specific revoke doesn't touch a PUBLIC-level grant. Confirmed via `has_function_privilege()` before and after: the original "fix" left `anon` fully able to execute `accept_team_invite` the entire time. Correct fix: revoke from `PUBLIC`, then explicitly re-grant to `authenticated` (which still needs it). Also fixed `update_updated_at()`, a pre-existing trigger function the security advisor flagged for a missing `search_path` — same hardening already applied to every function written this session, just never backfilled onto that one.
- `removeMember` — re-verified for real this round (Round 3 built it, Round 4 could only confirm it via code review). Removed the test member, confirmed via direct SQL query that the `team_members` row was actually gone, not just hidden client-side.

Migrations added: `20260722140000_transfer_account_ownership.sql`, `20260722150000_revoke_public_grant_team_ownership_functions.sql`, `20260722160000_fix_update_updated_at_search_path.sql`. All applied live and mirrored locally. Demo account restored to its intended state afterward: Deep as sole owner, `editor@creatorflow.demo` showing as the one pending invite (matching the original seed), no test data left behind (confirmed via SQL, not assumed).

Verification: `tsc --noEmit`, `eslint`, `vitest`, `next build`, full Playwright suite (10/10) all pass. Supabase's own security advisor now shows zero findings for anything touched this session — the four remaining anon-executable warnings (`is_account_member`, `is_account_owner`, `handle_new_team_owner`, `handle_new_user`) are pre-existing and deliberately left alone; see `docs/qa/KNOWN_ISSUES.md` for why.

## Round 6 — Full visual reset (2026-07-25)

Per explicit product direction, replaced the orange/black editorial system with a dark/green visual world (`nexus-architecture-DESIGN.md` as primary reference, Skymetrics dashboard screenshots as secondary reference for in-app data density). Process followed the `impeccable` skill's `init` → `new-work` flow: wrote `PRODUCT.md` (product truth, sourced from `docs/PRD.md`/`docs/DESIGN_BRIEF.md` rather than a live interview, since both were already extensively documented) and `DESIGN.md` (the new visual authority) before any code changed.

**What changed**: `app/globals.css` token values (colors flipped dark/green, font-serif retired, added `:focus-visible` and `prefers-reduced-motion` support — closing the accessibility audit's two real P1/P2 findings rather than carrying them into the new build), `components/ui/logo.tsx` + `app/icon.svg` (orange → green), `app/layout.tsx` viewport metadata, plus four stray hardcoded-orange spots found via a full-codebase grep sweep (`DealsBoard.tsx`, `IdeasBoard.tsx`, `Hero.tsx`, `DotGrid.tsx` — the last three used decimal-RGB `249, 115, 22` rather than hex, missed by an initial hex-only search). `components/ui/toast.tsx` also dropped its `border-l-4` side-tab accent (a P3 finding from the same-day `/impeccable audit`) in favor of icon-color-only severity.

Because the entire codebase was built on CSS custom properties this session, the token swap alone correctly re-skinned every screen with zero further edits needed — verified live in the browser across Landing, Login, Dashboard, Analytics, Deals (desktop + mobile), Team, Settings, and Repurpose. Analytics' existing stat-tile/chart pattern (bignum + green delta chip + bar chart) already matches Skymetrics' vocabulary closely.

**What's explicitly not done**: the more ambitious structural additions `DESIGN.md` describes — sparklines inside stat tiles, a collapsible icon-only sidebar, a sitewide orchestrated staggered-motion pass beyond marketing's existing `.reveal-up`. Scoped down mid-session in favor of shipping a fully verified foundation. See `docs/qa/KNOWN_ISSUES.md`.

Verification: `tsc --noEmit`, `eslint`, `next build`, `vitest` (3/3), full Playwright suite (10/10) all pass. Two spec failures mid-round (`login.spec.ts`, `onboarding.spec.ts` — submit button stuck disabled) were the known Turbopack HMR-staleness issue from earlier rounds, not a real regression — confirmed by killing the dev server, clearing `.next`, and re-running clean (all green). Not yet committed to git — left for the user to review first.

## Round 7 — Close out the audit's action list (2026-07-25)

Executed the 5 recommended actions from the same-day `/impeccable audit`, checking each against the redesign's actual current state first rather than assuming they were still open:

- **Zero-focus-indicator fields** (Drafts title/body, Ideas title) — genuinely still broken (`outline-none`, no replacement survived the token rebuild since it's a component-level `className`, not something the global `:focus-visible` CSS could override at equal specificity). Fixed with explicit `focus-visible:outline` rings on all 3, plus the same treatment on `components/ui/input.tsx` (Input + Textarea) and the 4 remaining `outline-none` search/select fields (Team's role select + search, Deals' search, Ideas' search) that only had a subtle border-color change before.
- **`prefers-reduced-motion`** — already shipped in Round 6's token rebuild, verified still in place.
- **Deals/Drafts mobile reflow** — genuinely reworked, not just re-verified: Deals' kanban columns now use `scroll-snap-type: x mandatory` with `85vw`-wide columns below `sm` (confirmed via computed style: `scrollSnapType: "x mandatory"`, `colWidth: "318.75px"` at 375px viewport) so swiping between stages reads as deliberate; desktop keeps the original fixed 228px columns unchanged. Drafts' list+editor split becomes a real single-view-at-a-time flow below `md` (list first, tap a draft to open the editor, back arrow returns to the list) instead of a cramped always-both-visible split — this surfaced a real bug (the editor header's title and action buttons overlapped at 375px once the back arrow was added), caught via live screenshot and fixed by stacking the header into two rows below `md`.
- **Hero.tsx hex extraction** — the earlier "fix" only corrected the hex value (orange → green), it didn't actually extract it into the token system as the audit asked. Now references `var(--color-lavender)` directly.
- **Toast `border-l-4`** — already removed in Round 6.

Verification: `tsc --noEmit`, `eslint`, `next build`, `vitest` (3/3), full Playwright suite (10/10) all pass — cache cleared and dev server restarted fresh before the e2e run. Both mobile fixes verified live at 375px viewport (screenshots + a computed-style check for the scroll-snap CSS), not assumed from the diff.
