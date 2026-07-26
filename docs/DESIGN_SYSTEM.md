# CreatorFlow Design System

**Superseded 2026-07-25.** The orange/black editorial system this file originally documented was fully replaced by a dark/green visual reset (Nexus Architecture as primary reference, Skymetrics dashboard screenshots as secondary reference for in-app data density), per explicit product direction. **`/DESIGN.md` at the project root is now the source of truth** for tokens, typography, motion, and component rules — read that file first. This file is kept as a historical/component-inventory reference; treat any color value below as stale.

## Tokens (`app/globals.css`)

Token *names* (`--color-carbon`, `--color-lavender`, etc.) are unchanged from the original system so every existing `bg-`/`text-` utility re-skinned automatically on the reset — only the underlying hex values changed. See `DESIGN.md`'s `Colors` section for current values (dark ground, `#22C55E` single accent) and `Typography` for the current Inter + JetBrains Mono system (Playfair Display is retired — no third typeface in the new world).

### Radius, shadow
- Radius scale `--radius-sm`(6px) through `--radius-full`(9999px) — unchanged by the reset. Pills (`rounded-full`) for every button/badge/toggle; `rounded-xl`(16px) for every card/panel; `rounded-xl` for form inputs.
- `--shadow-subtle`, `--shadow-subtle-2`, `--shadow-panel` — same three-tier recipe, now dark-mode-correct (opaque black shadows instead of the prior semi-transparent-on-white values).

## One voice now (was two)

The prior system deliberately ran two typographic voices (Playfair Display serif for marketing, Inter for the in-app product) sharing one component language. The 2026-07-25 reset retires that split: **Inter (display) + JetBrains Mono (everything else) applies everywhere**, marketing included — matching Nexus Architecture's single-voice system. See `DESIGN.md`'s Typography section for the current ramp.

## Shared components (`components/ui/*`)

| Component | Replaces |
|---|---|
| `Button` | 12 hand-copied `bg-lavender rounded-full` in-app instances + marketing's `.btn-editorial`/`.btn-editorial-compact` — one component, `variant` (`primary`/`secondary`/`ghost`/`destructive`), `size` (`sm`/`md`/`lg`), `loading`, icon slots |
| `Card` | 4+ divergent card-shadow recipes — wires `--shadow-panel`/`--shadow-subtle` to real call sites |
| `Avatar` | `rounded-full` vs `rounded-xl` initials-chip split — standardized on `rounded-full` |
| `PageHeader` | 3 unrelated heading scales — every in-app + auth page uses `.text-app-h1` via this component |
| `Input` / `Label` | in-app `rounded-xl` inputs vs. Login/Onboarding's unstyled sharp-corner inputs |
| `Badge` | 5 different pill/badge recipes — standardized on the bordered-uppercase-mono recipe |
| `Logo` | 5 hand-copied inline SVG logo marks with drifted strokeWidth/size |
| `OAuthGlyphs` | Gmail/YouTube glyphs with hardcoded hex + inconsistent strokeWidth |
| `EmptyState` | standardizes the icon+message+CTA empty-state pattern |
| `Toast` (+ `lib/toast.tsx`) | new — no notification system existed before this pass |

## Resolution ledger

Every inconsistency found in the pre-rollout audit, and its resolution:

| # | Finding | Resolution | Status |
|---|---|---|---|
| 1 | No shared in-app primary-button component | `<Button variant="primary">`, rolled out to Dashboard/Deals/Ideas/Drafts/Repurpose/Automations/Analytics/Team/Settings | Resolved |
| 2 | Button font-weight drift (semibold vs medium) | `Button` fixes `font-semibold` for primary, `font-medium` for secondary/ghost | Resolved |
| 3 | Button padding drift | `Button`'s `size` prop (`sm`/`md`/`lg`) fixes padding per size | Resolved |
| 4 | Button font-size drift | `Button`'s `size` prop fixes font-size | Resolved |
| 5 | Button shadow/glow drift (3 of 12 had it, rest didn't) | `Button variant="primary"` always gets the glow (new `.btn-editorial-md` CSS class) | Resolved |
| 6 | No shared secondary/outline button in-app (4 recipes) | `<Button variant="secondary">` | Resolved |
| 7 | Card shadow fragments into 4+ recipes | `<Card>` wired to `--shadow-panel`/`--shadow-subtle`; remaining hand-rolled shadow spots normalized to `var(--shadow-subtle)` directly | Resolved |
| 8 | Avatar radius split (`rounded-full` vs `rounded-xl`) | `<Avatar>` standardized on `rounded-full`, with a `tone="neutral"` variant added for pending/non-member states (Team's pending invite) | Resolved |
| 9 | 3 unrelated page-title scales (in-app / auth / marketing) | `<PageHeader>`/`.text-app-h1` for in-app; **refined during implementation** — auth pages (Login/Onboarding) kept as a deliberate third scale, formalized as `.text-auth-h1` (26px/600), rather than forced down to the 20px in-app title size. A centered "Welcome back" moment and a dense toolbar-adjacent page title are different roles; the fix was collapsing 26px+28px drift into one auth scale, not eliminating the auth scale entirely. | Resolved (refined) |
| 10 | Drafts has no page-level title | Sidebar-rail label upgraded to `.text-app-h1`, matching Deals' persistent-header pattern | Resolved |
| 11 | Form input radius (in-app `rounded-xl` vs Login/Onboarding none) | `<Input>` standardized on `rounded-xl`, used on Login, Deals modal, Repurpose, Team, Settings | Resolved |
| 12 | 2 unrelated marketing pill/badge recipes | `<Badge>` standardized on the bordered-uppercase-mono recipe (`variant="outline"`) with a `variant="filled"` accent state; applied to TrustBand, LandingPricing, and Pricing's hero badge | Resolved |
| 13 | Checklist icon-chip size drift within `LandingPricing.tsx` | One size decision (`h-4.5 w-4.5`/`size=9`), also applied to `/pricing`'s matching checklist | Resolved |
| 14 | Logo mark hand-copied 5x with drift | `<Logo>` component, applied to Nav, Footer, AppSidebar, Login (Onboarding pending in Phase 2's rewrite) | Resolved |
| 15 | OAuth glyphs: raw hex + inconsistent strokeWidth | `<OAuthGlyphs>` (`GmailGlyph`/`YouTubeGlyph`), `currentColor` + one strokeWidth constant; applied to Settings (Onboarding pending in Phase 2's rewrite) | Resolved |
| 16 | Orphaned shadcn `components/ui/button.tsx`, zero call sites | Replaced in place with the bespoke `Button`; `@base-ui/react` removed from `package.json` | Resolved |
| 17 | `.swiss-grid`/`.hover-lift-editorial` single-use | **Refined during implementation** — rather than forcing the swiss-grid hairline pattern onto Deals/Analytics (a structurally different list/kanban layout), their card shadows were unified via `<Card>`/`--shadow-subtle` instead, achieving the same "one shared card language" goal without a layout change that wasn't asked for | Resolved (refined) |
| 18 | `LandingPricing.tsx` dead code, `/pricing` reimplements it differently | **Refined during implementation** — inspecting the component showed it was built as a homepage *teaser* (its own "See full plan details" link points to `/pricing`), not a full-page replacement. Wired it into `app/page.tsx` as intended instead of using it to replace `/pricing`; `/pricing`'s own implementation was updated to use the same `Button`/`Badge`/checklist-size decisions so both stay visually consistent without being the same component | Resolved (refined) |
| 19 | Marketing serif voice never used in-app | Deliberate — see "Two-voice rule" above | Resolved (by decision) |
| 20 | `.label-eyebrow` tick-mark motif marketing-only | Deferred — the shared mono-uppercase label *system* (`.font-label`) is already used consistently in both marketing and in-app (stat labels, badges, form labels); only the eyebrow's decorative `::before` tick-mark line is marketing-exclusive. Lower-impact than the other 19 items (a decorative flourish, not a structural inconsistency) — punted to `docs/qa/KNOWN_ISSUES.md` as P2 rather than delaying the P0 functional fixes in Phase 2. | Deferred (P2) |

18 of 20 resolved in this pass; 2 refined from the original plan after closer inspection during implementation (see notes); 1 deliberate non-fix (two-voice rule); 1 deferred as low-impact polish. See `docs/qa/KNOWN_ISSUES.md` for the deferred item.
