# UI/UX Audit — Post-Stage-3 Polish Pass

**Date:** 2026-08-05 · **Scope:** Homepage + all 11 in-app surfaces (Dashboard, Deals, Ideas,
Drafts, Calendar, Media Kit, Repurpose, Automations, Analytics, Team, Settings) · **Widths
tested:** 320px, 375px (mobile), and desktop (~1280px+).
**Method:** Live in-browser verification — computed styles, `scrollWidth`/`clientWidth`
overflow probing, DOM/accessibility-tree inspection, keyboard focus checks. Not a static code
read: several findings below were only visible by loading the real page, and one suspected bug
(a "blank" dashboard panel) turned out to be a false alarm once inspected live.

Findings are ranked by severity. **Fixed** means live-verified working after the change.
**Flagged** means identified, understood, and deliberately left for a separate follow-up because
fixing it well needs a decision or more design work than a polish pass should absorb.

---

## Summary

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | Homepage mobile nav: "Sign in" completely unreachable | High | ✅ Fixed |
| 2 | `DashboardHeader` action row silently clips off-screen on mobile (affects every page using it) | High | ✅ Fixed |
| 3 | Automations toggle copy contradicted its own dynamic status line | High | ✅ Fixed |
| 4 | Settings/reset-password "Confirm password" placeholder looked like a typed value | Medium | ✅ Fixed |
| 5 | Drafts editor toolbar scrolls horizontally on mobile with no visual affordance | Medium | 🚩 Flagged |
| 6 | "Delete account" has no visual danger styling | Medium | 🚩 Flagged |
| 7 | Dashboard 2-col metric grid leaves a trailing gap on odd counts | Low | 🚩 Flagged |
| 8 | Footer's disabled Privacy/Terms links rely on `title`-only tooltips | Low | 🚩 Flagged |

---

## 1. Homepage mobile nav — "Sign in" unreachable (High, Fixed)

**Where:** `components/home/NebulaNav.tsx`

The "Sign in" link was `hidden md:block` with no mobile fallback of any kind — not a hamburger
menu, not an icon, nothing. A returning user on a phone had no way to reach `/login` from the
homepage short of typing the URL directly. Confirmed via the accessibility tree at 375px width:
only the logo and "Start free" links were reachable.

**Fix:** made the link always visible, and tightened the right-side gap/padding (`gap-2 sm:gap-4`,
`px-3` on the Start Free pill) so both links plus the CTA still fit without overflow even at
320px — verified no page-level horizontal scroll at that width after the change (nav bounding box
ends 12px inside the 320px viewport, matching its own padding).

The `Product` / `How it works` / `Docs` / `GitHub` links are also hidden on mobile with no
menu — left as-is, since all four are anchor links to sections already on the same page and
remain reachable by scrolling. Worth a real mobile nav menu eventually, but not a broken user
journey the way "Sign in" was.

## 2. `DashboardHeader` action row clips on mobile (High, Fixed)

**Where:** `components/dash/DashboardHeader.tsx`

The `right` slot's wrapper div was `flex shrink-0 flex-wrap items-center gap-2.5` with no width
constraint. `shrink-0` let it render at its full unwrapped content width regardless of viewport,
and an ancestor's overflow clipping hid the excess rather than causing page scroll — so the
overflow was invisible rather than obviously broken. On the Deals page at 375px this meant the
"Needs follow-up (7)", "Select", and "Add deal" buttons were completely inaccessible; only the
Gmail badge and search field showed.

This component is shared by every page that passes a `right` prop, so the bug (and the fix)
applies broadly, not just to Deals.

**Fix:** `flex w-full flex-wrap items-center gap-2.5 sm:w-auto sm:shrink-0` — full width and free
to wrap on mobile, reverts to the original shrink-to-content behavior at `sm:` and up. Verified
live on Deals: all action buttons now wrap into visible rows on mobile, and desktop is pixel-identical
to before (single row, unchanged).

## 3. Automations toggle: copy contradicted itself (High, Fixed)

**Where:** `supabase/migrations/20260805000000_fix_follow_up_description.sql`,
`scripts/seed-demo-data.ts`

The "Deal gone quiet or invoice overdue" rule's static description said the toggle had no effect
"regardless of this toggle." That was true when it was written, but Stage 3.3 gave this exact
toggle a real, narrower effect (gating the daily scheduled check and its activity log) without
updating the older copy — so the static description and the dynamic status line directly below it
("turn on to have this run automatically") ended up saying opposite things on the same screen.

**Fix:** rewrote the description to describe both halves honestly — the live Dashboard/Deals
detection needs no toggle, the scheduled check does. Applied via migration to all existing
accounts, updated the seed function in `schema.sql` for new accounts, and fixed
`scripts/seed-demo-data.ts` (which was also missing the `schedule`/`schedule_label` columns and
the Monday-digest automation entirely — re-seeding the demo account would have silently regressed
Stage 3.3's data). Verified live: toggling the rule on now shows a "Live" pill and a status line
that agrees with the description above it.

## 4. "Confirm password" placeholder looked like a real value (Medium, Fixed)

**Where:** `app/(app)/settings/SettingsBoard.tsx`, `app/reset-password/page.tsx`

The "New password" field's placeholder is descriptive ("At least 8 characters"). The "Confirm
password" field right next to it used `••••••••` as its placeholder — eight literal bullet
characters, visually indistinguishable from an already-typed password in an empty field. Confirmed
via DOM inspection that `value` was genuinely empty; this was a placeholder-only illusion.

**Fix:** changed both instances to `"Repeat the password"`, matching the descriptive style of the
field beside it. The login page's single password field still uses `••••••••`, which is left
alone — that's a normal convention for a sign-in field where the user already knows their
password, not a confirmation field where the emptiness needs to read clearly.

## 5. Drafts editor toolbar scrolls with no affordance (Medium, Flagged)

**Where:** `app/(app)/drafts/DraftsBoard.tsx`

On mobile, the editor's action row (Submit for review / mic / AI assist / Save / Delete) is
`overflow-x-auto` and genuinely reachable by swiping — confirmed `scrollWidth` (451px) exceeds
`clientWidth` (343px) — but there's no visual cue (fade, shadow, partial-button peek) that more
actions exist off-screen. A user could easily miss Save or Delete entirely.

**Why flagged instead of fixed:** the honest fix is a fade-mask treatment consistent with how this
codebase already handles other edge-fades (see the section-mask pattern in the homepage
components), not a quick class change. Worth doing, but it's a small design decision, not a
one-line correction.

## 6. "Delete account" has no danger styling (Medium, Flagged)

**Where:** `app/(app)/settings/SettingsBoard.tsx`

The permanently-destructive "Delete account" button uses the same orange outline treatment as
"Save changes" and "Update password." Nothing on screen visually signals "this one is different
and irreversible."

**Why flagged instead of fixed:** this app has a deliberate single-accent-color design language
(orange only, no red/danger color introduced anywhere else in the product). Adding a danger color
here would be the first exception to that rule — a call for you to make, not something to
decide unilaterally in a polish pass.

## 7. Dashboard metric grid leaves a trailing gap (Low, Flagged)

**Where:** `app/(app)/dashboard/page.tsx` (metric card grid, `MetricCard.tsx`)

Seven cards in a 2-column grid leaves the seventh ("Views, last 28 days") alone in its row with an
empty gap beside it. Purely cosmetic — common and often intentional in dashboards — not fixed
since resolving it means either spanning the last card across both columns or reordering, both of
which are design calls rather than obvious corrections.

## 8. Disabled footer links rely on `title`-only tooltips (Low, Flagged)

**Where:** `components/home/HomeFooter.tsx`

"Privacy" and "Terms" correctly render as inert, honestly-disabled text (not dead links) with a
"Not published yet" explanation — this part is already good and deliberate, per the code's own
comment. The explanation is only exposed via the `title` attribute, though, which doesn't reach
keyboard-only or touch-only users. A visible inline note or `aria-describedby` would be more
robust. Minor, since the current behavior ("disabled, non-clickable") is already communicated by
the `cursor-not-allowed` styling and dimmed color — the tooltip is a bonus, not the only signal.

---

## Confirmed non-issues (investigated, ruled out)

- **Dashboard "empty black boxes":** an early screenshot showed what looked like large empty
  panels below the channel-views chart. Live DOM inspection found real content (a "Deals by
  stage" funnel chart with genuine data) — the panels just have a very low-contrast background
  (`bg-white/[0.03]`) that reads as near-black at reduced screenshot scale. Not a rendering bug.
- **"Deals by stage" column-label overlap:** appeared to overlap under a CSS-zoom-simulated
  narrow viewport, but does not reproduce at any real device width (confirmed clean at true 375px
  mobile — the grid properly reflows to 2 columns there). The zoom hack produced an artificial
  in-between width no real device uses.
