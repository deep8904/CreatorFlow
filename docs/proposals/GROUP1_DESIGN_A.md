# Group 1 — App shell + Dashboard · Design proposal A

**Scope:** `app/(app)/layout.tsx`, `components/app/AppSidebar.tsx` (replaced), `app/(app)/dashboard/page.tsx`.
**System:** Nebula (`/DESIGN.md`) — black canvas, single orange accent, Manrope/Inter/Geist.
**Nature:** re-skin. No query, action, auth or RLS change. Every deep link preserved.

This document is written to be implemented from without follow-up questions. Class strings
are literal and copy-pasteable. Where I depart from the brief, it's called out in §11.

---

## 1. The bet

Four decisions, in order of how much they matter:

1. **The sidebar becomes a permanent 84px vertical *spine* — icon over micro-label, never
   collapsible.** The reference (and the obvious move) is a 224px sidebar with icon+label rows
   and a collapse toggle. I'm inverting it: compact by default, labels always visible *below*
   the icon, and no collapsed/expanded state at all. This buys ~150px of horizontal room that
   Group 2's kanban and Group 3's split editor need, keeps every destination one click away
   with no tooltip dependency and no hover-flyout, and deletes an entire class of bugs
   (persisted collapse state, animation on toggle, aria-expanded, layout thrash).

2. **On mobile, nothing is fixed at the top. Navigation moves to a bottom tab bar.**
   The current build has a fixed 56px header + hamburger + off-canvas drawer. A creator using
   this on a phone between shoots is thumb-driven; the drawer costs two taps for every move.
   Five bottom slots (Dashboard, Deals, Ideas, Drafts, More) plus a More sheet covering the
   remaining four destinations. The page title scrolls away with the content because it no
   longer has to compete with a nav.

3. **The dashboard leads with one object, not a tile row.** CreatorFlow's dashboard has three
   scalars, five deal rows, three idea rows and three channel numbers. Three separate KPI
   mega-cards for three flat integers produces a screen of expensive-looking emptiness. Instead:
   a single full-width `2.5rem` **Ledger card** carrying all three figures across hairline-split
   columns, with the three quick-actions welded into its footer rail. "Where you stand" and
   "what you do next" are one physical object.

4. **Numbers are Geist Mono, tabular, and they are the largest type on the page.** Manrope stays
   for headings, Inter for body. But the console's visual signature is a big mono numeral, not
   a big Manrope headline. That's what separates the in-app world from the marketing world while
   staying inside the system's four fonts.

Two engineering rules fall out of this and govern all nine in-app screens:

- **Exactly one `backdrop-filter` owner per stacking region.** The sticky header owns it; the
  Ledger card owns it in the scroll body. Nothing inside either may blur. (This is the documented
  Chromium trap — `components/home/FeatureShowcase.tsx:98-103` and `HomeFooter.tsx:69-73` both
  carry scars from it.)
- **One grain surface per viewport.** The Ledger card. Panels below are flat.

---

## 2. The Console sub-scale

Nebula as shipped on Home is a marketing scale: `80px` section padding, `2.5rem` radii, `18px`
body, `6rem` headings. Ported literally into a data screen it reads as a toy. This is the
in-app step-down. **Treat this table as the deliverable that binds all nine screens**, not just
this one.

### 2.1 Surfaces

| Role | Classes |
|---|---|
| Page canvas | `bg-black` |
| Rail | `bg-black` + right hairline (see §3.2) — **no blur** (it sits on opaque black; blur samples nothing and blanks children in Chromium) |
| Sticky header | `bg-black/72 backdrop-blur-xl` + bottom hairline. **The only blur in the shell.** |
| Hero card (Ledger) | `nebula-grain nebula-border rounded-[2.5rem] bg-gradient-to-br from-white/[0.07] to-white/[0.01] backdrop-blur-lg` |
| Standard panel | `nebula-border rounded-[1.5rem] bg-white/[0.025]` — **no blur, no grain** |
| Inset well (inside a panel) | `rounded-[1rem] bg-black/40` |
| Row | `rounded-[0.75rem]`, idle transparent, `hover:bg-white/[0.04]` |
| Chip / pill | `rounded-[9999px] border px-2.5 py-1` |

Gradient-border values (set as the `--nebula-border-gradient` inline style):

```
hero   linear-gradient(135deg, rgba(255,255,255,0.20), rgba(255,255,255,0), rgba(255,255,255,0.10))
panel  linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0), rgba(255,255,255,0.06))
accent linear-gradient(135deg, rgba(234,88,12,0.45), rgba(255,255,255,0), rgba(234,88,12,0.15))
```

### 2.2 Radii vocabulary (console tier)

`2.5rem` hero only · `1.5rem` panels · `1rem` inset wells · `0.875rem` rail tiles ·
`0.75rem` rows · `9999px` chips, avatars, buttons.

**Always arbitrary values.** `rounded-full`, `rounded-xl`, `rounded-2xl` all resolve to **2px**
through the legacy token layer (`app/globals.css:70-76`). Any `rounded-*` shorthand in this
codebase is a bug. Write `rounded-[9999px]`, `rounded-[1.5rem]`, `rounded-[0.75rem]`.

### 2.3 Type scale

| Role | Classes |
|---|---|
| Section counter / eyebrow | `font-nebula-mono text-[11px] uppercase tracking-[0.18em] text-orange-400/90` |
| Page title (h1) | `font-nebula-heading text-[17px] font-semibold tracking-[-0.02em] text-white` |
| Panel title (h2) | `font-nebula-heading text-[15px] font-semibold tracking-[-0.01em] text-white` |
| Stat label | `font-nebula-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500` |
| Primary figure | `font-nebula-mono text-[clamp(1.75rem,7vw,3.25rem)] font-medium leading-none tracking-[-0.03em] tabular-nums text-white` |
| Secondary figure | `font-nebula-mono text-[clamp(1.5rem,5.5vw,2.25rem)] font-medium leading-none tracking-[-0.03em] tabular-nums text-white` |
| Row primary | `font-nebula-ui text-[13.5px] font-medium leading-snug text-white` |
| Row secondary | `font-nebula-ui text-[12px] leading-snug text-zinc-500` |
| Row value | `font-nebula-mono text-[13px] tabular-nums text-white` |
| Body | `font-nebula-ui text-[13.5px] leading-relaxed text-zinc-400` |
| Chip | `font-nebula-mono text-[10px] font-medium uppercase tracking-[0.12em]` |
| Rail tile label | `font-nebula-mono text-[10px] uppercase tracking-[0.06em]` |

`tabular-nums` is mandatory on every figure and every value — otherwise the right-aligned money
column jitters between rows.

### 2.4 Colour semantics

Orange is the only accent. Emerald is the one sanctioned second hue, and only for "paid /
healthy" — precedent already exists on Home (`FeatureShowcase.tsx:17`, `DetailCards.tsx:157`).

Deal stage → chip tone map (a monochrome ramp where only the *action-needed* stages take orange):

| Stage | Chip classes |
|---|---|
| `inbound` | `border-white/10 bg-white/[0.06] text-zinc-400` |
| `negotiating` | `border-orange-500/25 bg-orange-500/[0.12] text-orange-200` |
| `contracted` | `border-orange-500/15 bg-orange-500/[0.07] text-orange-300/80` |
| `delivered` | `border-white/15 bg-white/[0.08] text-zinc-300` |
| `paid` | `border-emerald-500/20 bg-emerald-500/10 text-emerald-300` |
| `lost` | `border-white/[0.06] bg-white/[0.03] text-zinc-600` |

Idea status → chip tone map:

| Status | Chip classes |
|---|---|
| `new` | `border-white/10 bg-white/[0.06] text-zinc-400` |
| `in_progress` | `border-orange-500/25 bg-orange-500/[0.12] text-orange-200` |
| `scheduled` | `border-white/15 bg-white/[0.08] text-zinc-300` |
| `done` | `border-emerald-500/20 bg-emerald-500/10 text-emerald-300` |
| `archived` | `border-white/[0.06] bg-white/[0.03] text-zinc-600` |

Labels reuse the existing `IDEA_STATUS_LABEL` / `DEAL_STAGE_LABEL` maps verbatim.

### 2.5 Density

Panel header `px-5 py-4` · panel body `px-5 pb-5` · row `px-4 py-3` (min-height 52px) ·
hero card `p-6 sm:p-8 lg:p-10` · grid gaps `gap-4 lg:gap-5` · vertical section rhythm `mb-5`.
Never `80px` section padding inside the console.

### 2.6 The focus ring (one string, used everywhere)

```
focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400
```

Export it as `FOCUS` from `components/console/tokens.ts` and interpolate; do not retype it.
Offset is `2` in the console (Home uses `4` — too loose at console density). `outline` follows
`border-radius` in every browser we support, so it wraps pills correctly.

### 2.7 Effects budget (perf guard for a scrolling data screen)

- `backdrop-blur`: 2 elements maximum on screen — sticky header + Ledger card.
- `nebula-grain`: 1 element — Ledger card.
- Infinite animations: at most 1 — the attention-count ping dot, and only when count > 0.
- No `box-shadow` blur radii above `40px` anywhere in the console.

---

## 3. Shell — layout structure

### 3.1 Skeleton

```
<div  h-[100dvh] overflow-hidden bg-black text-white antialiased
      selection:bg-orange-500/30 selection:text-orange-200>
  <SkipLink />                          a11y, first tabbable
  <ConsoleRail />                       fixed left, w-84px, hidden below md
  <ConsoleTabBar />                     fixed bottom, md:hidden
  <div  flex min-w-0 flex-1 flex-col  md:pl-[84px]  h-full>
     <main id="main" flex-1 overflow-y-auto overscroll-contain
           pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0>
        {children}                      each page renders its own <ConsoleHeader/>
     </main>
  </div>
</div>
```

The inner scroll container is preserved from the current layout (`overflow-hidden` outer,
`overflow-y-auto` on `main`). This is load-bearing: `position: sticky` on the header resolves
against `main`, not the viewport.

`100dvh` rather than `h-screen` — `h-screen` leaves a dead strip under mobile browser chrome.

### 3.2 `ConsoleRail` (≥768px)

Fixed, `left-0 top-0 z-40 h-[100dvh] w-[84px]`, `bg-black`, flex column.

Right edge is a **fading gradient hairline**, not a border (DESIGN.md: no solid borders):

```
after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px
after:bg-gradient-to-b after:from-transparent after:via-white/12 after:to-transparent
```

Three stacked regions:

1. **Mark** — `h-[68px] grid place-items-center`. `<NebulaMark/>` wrapped in a `Link href="/"`,
   `aria-label="CreatorFlow home"`. 44×44 hit area.
2. **Nav** — `flex-1 min-w-0 overflow-y-auto [scrollbar-width:none] px-2 py-1 flex flex-col gap-0.5`.
   Seven primary tiles, a divider, two secondary tiles. Divider:
   `my-2 mx-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent`.
   The whole stack is 9 × 56 + gaps + mark + puck ≈ 665px, so it fits a 768px-tall viewport
   without scrolling; `overflow-y-auto` is the safety net for 640px-tall laptops.
3. **Account puck** — `px-2 pb-3 pt-2`, see §5.

**`RailTile` geometry.** `h-14 w-full` (56px — comfortably over the 40px floor),
`rounded-[0.875rem]`, `relative flex flex-col items-center justify-center gap-1`.

```
idle    text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300
active  bg-white/[0.06] text-white
icon    lucide, size 18, strokeWidth 1.75 · active: text-orange-400 strokeWidth 2
label   font-nebula-mono text-[10px] uppercase tracking-[0.06em]
        active text-white/90 · idle text-zinc-600 group-hover:text-zinc-400
```

Active indicator — an orange light bar on the tile's left edge, glowing:

```
before:absolute before:left-0 before:top-1/2 before:h-7 before:w-[2px]
before:-translate-y-1/2 before:rounded-r-[2px] before:bg-orange-500
before:shadow-[0_0_12px_rgba(234,88,12,0.75)]
```

Plus `aria-current="page"`. Active detection is the existing predicate, unchanged:
`pathname === href || pathname.startsWith(href + '/')`.

Nav content is the existing `primaryNav` / `secondaryNav` arrays verbatim — same nine
destinations, same lucide icons, same order.

Labels at 10px are the one thing to QA: they must not wrap. "Dashboard" (9ch) and "Automations"
(11ch) are the longest. At 10px Geist Mono with `tracking-[0.06em]`, "Automations" measures
~68px against a 68px inner width. Ship `Automations` as-is with `truncate` as insurance; if QA
shows a clip, the sanctioned shortening is **`Autos`** (not an ellipsis, not a wrap). All other
labels are unchanged.

### 3.3 `ConsoleHeader` (sticky, inside `main`)

Rendered by each page, not by the layout — this keeps the contextual-controls slot per-route
and avoids threading title props through the layout.

```
sticky top-0 z-30 flex h-[60px] items-center gap-4
bg-black/72 backdrop-blur-xl px-4 sm:px-6 lg:px-10
after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px
after:bg-gradient-to-r after:from-transparent after:via-white/12 after:to-transparent
```

Left cluster (`flex min-w-0 items-baseline gap-3`):

- Section counter — `<span aria-hidden class="font-nebula-mono text-[11px] tracking-[0.18em] text-orange-400/90">01</span>`
  followed by `<span aria-hidden class="text-white/15">/</span>`. Borrowed from the Nebula
  section-counter detail (`NEBULA_REFERENCE_NOTES.md §5`). Fixed per route: Dashboard `01`,
  Deals `02`, Ideas `03`, Drafts `04`, Repurpose `05`, Automations `06`, Analytics `07`,
  Team `08`, Settings `09`. Decorative — `aria-hidden`, hidden below `sm`.
- `<h1>` at the page-title scale.

Right cluster (`ml-auto flex shrink-0 items-center gap-2`) — the `children` slot. Dashboard
passes nothing today; Deals/Analytics will pass search and range controls in later groups.

**Nothing inside this bar may declare `backdrop-filter`.**

Header height is 60px, so `scroll-mt-[60px]` is the anchor offset for any in-page target.

### 3.4 `ConsoleTabBar` (<768px)

`fixed inset-x-0 bottom-0 z-40 md:hidden`, `bg-black/85 backdrop-blur-xl`,
`pb-[env(safe-area-inset-bottom)]`, top hairline mirroring the rail's edge treatment.

`grid grid-cols-5`, each slot `flex h-16 flex-col items-center justify-center gap-1`
(64px — over the floor). Icon 19, label `font-nebula-mono text-[9.5px] uppercase tracking-[0.05em]`.

Slots: Dashboard · Deals · Ideas · Drafts · **More**.

Active state is a **top** light bar (mirror of the rail's left bar):
`before:absolute before:inset-x-4 before:top-0 before:h-[2px] before:rounded-b-[2px] before:bg-orange-500 before:shadow-[0_0_10px_rgba(234,88,12,0.7)]`
plus `text-white` / `text-orange-400` icon, `aria-current="page"`.

**More** opens `MoreSheet` — a bottom sheet, not a side drawer:

```
overlay  fixed inset-0 z-50 bg-black/70
panel    fixed inset-x-0 bottom-0 z-50 rounded-t-[1.75rem] bg-zinc-950 pb-[env(safe-area-inset-bottom)]
         nebula-border with the panel gradient
```

Contents: a 4px grab handle, then Repurpose / Automations / Analytics / Team / Settings as
full-width 52px rows (icon 18 + `font-nebula-ui text-[14px]`), then a hairline, then the
account block with sign-out. Dismiss: overlay tap, `Escape`, or route change. Focus is trapped
while open and returns to the More button on close; `aria-modal="true"`, `role="dialog"`,
`aria-label="More destinations"`.

All nine destinations remain reachable on mobile — capability preserved, one tap for the four
hot ones instead of two for all nine.

### 3.5 Breakpoint behaviour

| Width | Shell |
|---|---|
| **320** | Bottom tab bar (5 × 64px slots at 64px each = 320px exactly; icons+labels centred, no overflow). No fixed top chrome. `main` padding `px-4`, `pb-[calc(64px+safe-area)]`. Header still sticky but full-bleed and 60px; counter hidden. |
| **768** | Rail appears (`md:`), tab bar hides. `main` gets `md:pl-[84px]`, `px-6`. Usable content width 684px. |
| **1024** | `lg:` grid splits engage. `main` `px-8`. |
| **1440** | Content column caps at `max-w-[1180px] mx-auto`, `xl:px-14`. Rail unchanged at 84px — it is a fixed instrument, it does not grow with the viewport. |
| **≥1536** | `2xl:max-w-[1320px]`. |

The content column wrapper used by every console page:

```
mx-auto w-full max-w-[1180px] 2xl:max-w-[1320px] px-4 sm:px-6 lg:px-8 xl:px-14 pb-16 pt-6
```

---

## 4. Dashboard — layout structure

### 4.1 Region map

```
ConsoleHeader            01 / Dashboard
──────────────────────────────────────────────────────────────
LedgerCard               col-span-12   the hero object
  ├ eyebrow + name line
  ├ 3 figures, hairline-split
  └ action rail: Log a deal · Capture an idea · Start a draft
──────────────────────────────────────────────────────────────
NeedsAttention           lg:col-span-7   ledger list, ≤5 rows
RecentIdeas              lg:col-span-5   3 rows            ┐ stacked
ThisWeek                 lg:col-span-5   3 stats + spark   ┘ in the right column
```

Grid: `grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5`.

- Ledger: `md:col-span-2 lg:col-span-12`
- Needs attention: `md:col-span-2 lg:col-span-7 lg:row-span-2`
- Recent ideas: `md:col-span-1 lg:col-span-5`
- This week: `md:col-span-1 lg:col-span-5`

The **7/5 asymmetry** is deliberate — the reference's symmetric 2-up gives the deal list and the
idea list equal weight, and they are not equal. Deals are the money.

### 4.2 The Ledger card

```html
<section class="nebula-grain nebula-border relative overflow-hidden rounded-[1.75rem]
                bg-gradient-to-br from-white/[0.07] to-white/[0.01] backdrop-blur-lg
                sm:rounded-[2.5rem]"
         style="--nebula-border-gradient: linear-gradient(135deg,rgba(255,255,255,.2),rgba(255,255,255,0),rgba(255,255,255,.1))">

  <!-- static orange bloom, bottom-left. NOT animated. -->
  <div aria-hidden class="pointer-events-none absolute -bottom-1/3 -left-1/4 h-2/3 w-2/3
       bg-[radial-gradient(ellipse_at_center,rgba(234,88,12,0.22),transparent_70%)]"></div>

  <div class="relative z-10 p-6 sm:p-8 lg:p-10"> … </div>
</section>
```

Radius steps down to `1.75rem` below `sm` so the corner doesn't eat the first figure at 320px.

**Head line** (`mb-6 sm:mb-8`):
`<p class="font-nebula-mono text-[11px] uppercase tracking-[0.18em] text-orange-400/90">Where you stand</p>`
then `<p class="mt-2 font-nebula-heading text-[20px] font-semibold tracking-[-0.02em] text-white sm:text-[24px]">{firstName}</p>`.

The current build's "Good morning" is a lie for two-thirds of the day (it's hard-coded, not
time-derived). Presentation-only fix: drop the time claim. The name alone is warmer and always
true.

**Figures** — `grid grid-cols-1 sm:grid-cols-3`, split by hairlines rather than gaps:

```
divide-y divide-white/[0.07] sm:divide-x sm:divide-y-0
cell: py-5 first:pt-0 sm:px-6 sm:first:pl-0 sm:py-0 sm:last:pr-0
```

| # | Label (mono) | Value | Sub |
|---|---|---|---|
| 1 | `OPEN DEALS` | `openDeals.length` | `{n} need a nudge` when `needsAttention.length > 0`, else `All moving` |
| 2 | `PAID TO DATE` | `$` + `revenueMtd.toLocaleString()` | `{paidCount} deals closed` |
| 3 | `IDEAS CAPTURED` | `ideas.length` | `{ideasInProgress} in progress` |

Figure 2 is the **primary** — `text-[clamp(1.75rem,7vw,3.25rem)]`. Figures 1 and 3 use the
secondary size. This is the "one primary metric per view" rule from the brief: money is it.

Sub-line: `mt-2 font-nebula-ui text-[12px] text-zinc-500`.

> **Label change, flagged.** The current label is *Revenue MTD*, but the computation
> (`dashboard/page.tsx:47-49`) sums **every** paid deal with no date filter — there is no
> month-to-date logic anywhere. The label is currently false. I am fixing it in presentation
> only, by relabelling to **PAID TO DATE**, which is exactly what the existing expression
> computes. Adding a real month filter would be a data change and is out of re-skin scope.
> See §11.

**Action rail** — welded to the card's bottom edge, above the card's padding floor:

```
mt-8 grid grid-cols-1 gap-2 border-t border-white/[0.07] pt-6 sm:grid-cols-3
```

Three `<Link>`s, hrefs **unchanged**: `/deals?new=1`, `/ideas?new=1`, `/drafts?new=1`.

```
group flex min-h-[52px] items-center gap-3 rounded-[0.75rem] border border-white/[0.08]
bg-white/[0.03] px-4 py-3 transition-colors duration-300
hover:border-orange-500/30 hover:bg-orange-500/[0.06]
focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400
```

Inside: an icon well
`grid h-8 w-8 shrink-0 place-items-center rounded-[0.625rem] border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors group-hover:border-orange-500/30 group-hover:text-orange-300`
(lucide 15px), then `font-nebula-ui text-[13px] font-medium text-white`, then a trailing
`ArrowRight` 13px `text-zinc-600 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-orange-400`.

Icons: `Handshake`, `Lightbulb`, `FileText` — unchanged from the current build.

### 4.3 Needs your attention (`lg:col-span-7`)

Panel header (`ConsolePanel` header slot):

- `<h2>` "Needs your attention" — locked copy from `docs/DESIGN_BRIEF.md §5`.
- A count chip immediately after the title:
  `ml-2 rounded-[9999px] border border-orange-500/25 bg-orange-500/[0.12] px-2 py-0.5 font-nebula-mono text-[10px] tabular-nums text-orange-200`.
  When count > 0 it carries a ping dot (the one sanctioned infinite animation, §7).
- Right: `View all` → `/deals`,
  `font-nebula-ui text-[12px] font-medium text-zinc-400 transition-colors hover:text-orange-300`
  plus the focus ring and an `after:absolute after:inset-x-0 after:-inset-y-3` touch extender.

Body is a **column-header row + a `<ul>` of link rows**, not a `<table>`:

```html
<div aria-hidden class="grid grid-cols-[1fr_auto] items-center gap-3 px-4 pb-2
     sm:grid-cols-[1fr_7rem_6rem]">
  <span class="font-nebula-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">Brand</span>
  <span class="hidden text-right … sm:block">Value</span>
  <span class="text-right …">Stage</span>
</div>
```

Each row (`LedgerRow`) is a `<Link href={`/deals?deal=${deal.id}`}>` — **deep link preserved**:

```
console-row group relative grid min-h-[52px] grid-cols-[1fr_auto] items-center gap-3
rounded-[0.75rem] px-4 py-3 transition-[background-color,transform] duration-300
ease-[cubic-bezier(0.16,1,0.3,1)]
hover:translate-x-[2px] hover:bg-white/[0.04]
focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400
sm:grid-cols-[1fr_7rem_6rem]
```

Cells:
1. `min-w-0` — brand name at the row-primary scale with `truncate`; below it the deliverable
   (`deal.deliverables`) at the row-secondary scale with `truncate`, falling back to the due
   date (`Due {date}`) and then to nothing. No placeholder text if both are null.
2. Value — `hidden text-right sm:block`, `font-nebula-mono text-[13px] tabular-nums text-white`.
   `rate_amount_cents` formatted via
   `Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0})`.
   Null → `<span class="text-zinc-700">—</span>`.
3. Stage — `<StageChip status>` right-aligned, `justify-self-end`.

The `.console-row::before` edge-light (a 2px orange bar growing top-down on hover/focus) is
defined in §10. **Rows must never carry `.nebula-border`** — both use `::before` and would
collide.

Row separators: none. The rounded hover surface does the work; hairlines between five rows in a
dark panel is noise.

**Departure from the brief, flagged:** §4 of the brief asks for a "compact sortable data table"
with sticky headers. Five rows, capped by an existing `.slice(0, 5)`, with a per-row deep link,
do not need sorting or a sticky header, and a real `<table>` fights the mobile stacking in §8.
A semantic list with table-like alignment is keyboard-navigable for free and stacks cleanly.
Sortable tables belong in Group 2's `/deals` view where the full set lives.

### 4.4 Recent ideas (`lg:col-span-5`)

Standard panel. Header: "Recent ideas" (locked copy) + `View all` → `/ideas`.
Three `IdeaRow`s from the existing `ideas.slice(0, 3)`.

Row = `<Link href={`/ideas?open=${idea.id}`}>` — **deep link preserved**. Same
`console-row` treatment, `grid-cols-[1fr_auto]`:

1. `line-clamp-2 font-nebula-ui text-[13.5px] font-medium leading-snug text-white`
2. `<StatusChip status>`, `shrink-0 self-start`

`line-clamp-2` rather than `truncate` — idea titles are sentences, and one line loses too much.
Cap at two lines so a paragraph pasted into the title field can't blow the panel height.

### 4.5 This week's performance (`lg:col-span-5`)

Standard panel. Header: "This week's performance" (locked copy) + `Full analytics` → `/analytics`.

Connected state — three `StatLine` rows, stacked, **not** a 3-across divide (at 5/12 columns a
3-across split gives ~90px per cell and the numbers collide):

```html
<div class="divide-y divide-white/[0.06]">
  <!-- each row -->
  <div class="flex items-end justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
    <div class="min-w-0">
      <p class="font-nebula-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Views this week</p>
      <p class="mt-1.5 font-nebula-mono text-[20px] leading-none tabular-nums text-white">128.4K</p>
    </div>
    <Sparkline …/>   <!-- row 1 only -->
  </div>
</div>
```

| Label | Value | Source (unchanged) |
|---|---|---|
| `VIEWS THIS WEEK` | `formatCompact(weekViews)` | `channelStats.reduce(views)` |
| `NEW SUBSCRIBERS` | `+` + `formatCompact(weekSubsGained)` | `channelStats.reduce(subscribers_gained)` |
| `TOTAL SUBSCRIBERS` | `formatCompact(latestSubs)` or `—` | last row's `subscribers_total` |

**Sparkline.** `getChannelStats(7)` already returns per-day rows; the current screen throws the
shape away and shows only the sum. Plotting `channelStats.map(s => s.views)` as a 7-point
sparkline is a different rendering of data the page *already fetches* — no new query, no
invented metric. `h-8 w-20 shrink-0`, `stroke-[#fb923c] stroke-[1.5] fill-none`,
`stroke-linecap="round" stroke-linejoin="round"`, `preserveAspectRatio="none"`,
plus a soft area fill `fill-[url(#sparkFade)]` at 12% orange. `aria-hidden` — the number beside
it carries the meaning.

Below the three rows, a provenance line — required by §2b, because these figures are seeded:

```html
<p class="mt-4 font-nebula-mono text-[10px] leading-relaxed text-zinc-600">
  Cached channel figures. Live YouTube sync is not connected.
</p>
```

Show this line only when `!youtubeConnected` (i.e. the numbers are the seeded
`channel_stats_daily` rows rather than a live pull). This is the honest-labelling rule applied.

Not-connected state — see §8.

---

## 5. Component inventory

Everything new lives in `components/console/`. Nothing in `components/ui/*`,
`components/editorial/*` or `components/app/*` is imported by these screens; those stay in
place, untouched, until their own groups land.

### Shell

| Component | File | Props | Builds on |
|---|---|---|---|
| `ConsoleShell` | `console/ConsoleShell.tsx` (server) | `{ children, name, email }` | plain layout; replaces the `bg-linen` flex wrapper in `app/(app)/layout.tsx` |
| `ConsoleRail` | `console/ConsoleRail.tsx` (client) | `{ name, email }` | new; consumes `usePathname()` exactly as `AppSidebar` does today |
| `RailTile` | inside `ConsoleRail.tsx` | `{ href, label, icon: LucideIcon, active }` | new |
| `ConsoleTabBar` | `console/ConsoleTabBar.tsx` (client) | `{ name, email }` | new |
| `MoreSheet` | inside `ConsoleTabBar.tsx` | `{ open, onClose, name, email }` | new; `role="dialog"` |
| `ConsoleHeader` | `console/ConsoleHeader.tsx` (server) | `{ index: string, title: string, children?: ReactNode }` | new; `children` = contextual controls slot |
| `AccountPuck` | `console/AccountPuck.tsx` (client) | `{ name, email, variant?: 'rail' \| 'sheet' }` | wraps the existing `signOut()` from `lib/supabase/auth`; identical `router.push('/'); router.refresh()` sequence |
| `NebulaAvatar` | `console/NebulaAvatar.tsx` | `{ name, size?: 'sm' \| 'md' }` | new; initials on `bg-gradient-to-br from-zinc-700 to-zinc-900 ring-1 ring-white/10`, `rounded-[9999px]`, `font-nebula-mono` |
| `NebulaMark` | `console/NebulaMark.tsx` | `{ size?: number }` | the gradient-F mark already used in `NebulaNav.tsx:31` and `HomeFooter.tsx:79` |
| `SkipLink` | `console/SkipLink.tsx` | — | new |

**`AccountPuck` (rail variant)** — a 56px button, not a row: `NebulaAvatar` centred, opening a
popover anchored right. Popover: `rounded-[1rem] bg-zinc-950 nebula-border p-3 w-56`, showing
name (`text-[13px] font-medium text-white truncate`), email (`text-[11px] text-zinc-500 truncate`),
hairline, then Settings link and a Sign out button
(`text-[13px] text-zinc-400 hover:text-white`, `min-h-[40px]`). `Escape` closes, focus returns.
The sheet variant renders the same content inline, no popover.

> **Found bug.** `components/ui/logo.tsx` hard-codes `#000000` on every path. On a black canvas
> the current logo is invisible. Hence `NebulaMark` rather than reusing `Logo` — and note that
> whoever takes Group 5 (auth screens) hits the same wall.

### Dashboard

| Component | File | Props | Builds on |
|---|---|---|---|
| `LedgerCard` | `console/LedgerCard.tsx` | `{ name, figures: Figure[], actions: QuickAction[] }` | `.nebula-border` + `.nebula-grain`, `2.5rem` mega-card |
| `Figure` (type) | — | `{ label, value, sub?, emphasis?: 'primary' \| 'default' }` | — |
| `QuickAction` (type) | — | `{ label, href, icon: LucideIcon }` | — |
| `ConsolePanel` | `console/ConsolePanel.tsx` | `{ title, count?, action?: { label, href }, children, className? }` | `.nebula-border`, `1.5rem` panel |
| `LedgerRow` | `console/LedgerRow.tsx` | `{ href, primary, secondary?, value?, chip: ReactNode }` | `.console-row` |
| `IdeaRow` | `console/IdeaRow.tsx` | `{ href, title, chip }` | `.console-row` |
| `StageChip` | `console/Chips.tsx` | `{ status: Deal['status'] }` | pill + §2.4 map |
| `StatusChip` | `console/Chips.tsx` | `{ status: Idea['status'] }` | pill + §2.4 map |
| `Sparkline` | `console/Sparkline.tsx` | `{ points: number[], className? }` | inline SVG, no library |
| `StatLine` | `console/StatLine.tsx` | `{ label, value, spark?: number[] }` | — |
| `PanelEmpty` | `console/PanelEmpty.tsx` | `{ icon, title, body?, action?: { label, href } }` | — |
| `ConsoleButton` | `console/ConsoleButton.tsx` | `{ href?, onClick?, variant: 'primary' \| 'ghost', size?: 'sm' \| 'md', children }` | pill, `rounded-[9999px]` |
| `Skeleton` | `console/Skeleton.tsx` | `{ className }` | `.nebula-skel` |
| `DashboardSkeleton` | `console/DashboardSkeleton.tsx` | — | composes `Skeleton` |
| `ConsoleError` | `console/ConsoleError.tsx` (client) | `{ title?, description?, onRetry }` | panel + `ConsoleButton` |

`ConsoleButton` primary:

```
inline-flex min-h-[40px] items-center gap-2 rounded-[9999px]
bg-gradient-to-b from-orange-500 to-orange-600 px-4 font-nebula-tech text-[12px]
font-medium uppercase tracking-[0.12em] text-white
shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]
transition-[transform,box-shadow] duration-300
hover:-translate-y-px hover:shadow-[0_0_24px_-6px_rgba(234,88,12,0.6)]
active:translate-y-px
focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300
```

`ShinyCTA` (the six-layer signature) is used **once** in the console: the full-page empty state
in §8.1. It is a marketing-weight object; repeating it next to every panel would cheapen it and
blow the effects budget. Everything else uses `ConsoleButton`.

---

## 6. File map (what an implementer touches)

| File | Change |
|---|---|
| `app/(app)/layout.tsx` | swap `bg-linen` wrapper for `ConsoleShell`; add `export const viewport = { colorScheme: 'dark', themeColor: '#000000' }`. Auth guard, `getCurrentProfile()` and `getAuthenticatedUser()` untouched. |
| `components/app/AppSidebar.tsx` | no longer imported by `(app)/layout.tsx`. Leave the file on disk until Groups 2–5 have migrated, then delete in Group 6. |
| `app/(app)/dashboard/page.tsx` | markup only. All five `Promise.all` queries, every derived value (`openDeals`, `revenueMtd`, `ideasInProgress`, `needsAttention`, `recentIdeas`, `weekViews`, `weekSubsGained`, `latestSubs`, `youtubeConnected`, `hasAnyData`), and both label maps stay byte-identical. |
| `app/(app)/dashboard/loading.tsx` | **new** — `DashboardSkeleton`. |
| `app/(app)/dashboard/error.tsx` | **new** — client boundary rendering `ConsoleError`. |
| `app/globals.css` | append the console block in §10 to the existing Nebula layer. Nothing above line 484 is touched. |
| `components/console/*` | new. |

---

## 7. Motion plan

Global easing `cubic-bezier(0.16, 1, 0.3, 1)`; never default easing.

| # | What | Trigger | Spec | Reduced-motion |
|---|---|---|---|---|
| 1 | **Shell** | route change | **Nothing.** Rail, header and tab bar never animate. Persistent chrome that re-animates on every navigation is nausea, not polish. | n/a |
| 2 | Rail active indicator | route change | Cross-fade only, `transition-opacity duration-200`. No sliding/shared-layout indicator — it requires measurement and breaks on scroll. | `transition: none` |
| 3 | Rail tile hover | pointer | `transition-colors duration-200` on bg/text | unaffected (colour only) |
| 4 | Content entrance | mount, `IntersectionObserver` | `NebulaReveal` with the `nebula-reveal--console` modifier (0.55s, not 1s). Stagger: Ledger `0ms` → Attention `80ms` → Ideas `160ms` → Week `240ms`. Total ≤ 240ms; the last panel must not still be arriving when a fast user has already read the first. | `.nebula-reveal` is already in the kill switch (`globals.css:599-610`); the modifier inherits it. Lands on end state. |
| 5 | Row hover/focus | pointer / keyboard | `translate-x-[2px]` + `bg-white/[0.04]` over `300ms`; the `::before` orange edge-light grows `scaleY(0) → 1` over `400ms` from `transform-origin: top` | transforms and transitions suppressed; hover background still applies (it's the accessible affordance) |
| 6 | Quick-action hover | pointer | border/bg to orange `300ms`; arrow `translate-x-0.5` | colour only |
| 7 | Attention ping dot | count > 0 | `animate-ping` ring + solid core, exactly as `NebulaNav`/`DetailCards` do it. **The only infinite animation in the console.** | killed — add `.console-ping` to the kill list |
| 8 | Sparkline draw-on | reveal | `stroke-dasharray/dashoffset` over `900ms`, `backwards`, once | `stroke-dasharray: none; animation: none` — renders complete |
| 9 | Skeleton sweep | loading | `.nebula-skel`, 1.6s linear infinite | flat `rgba(255,255,255,.05)`, no sweep |
| 10 | Ledger bloom | — | **static.** No breathing. | n/a |
| 11 | Figures | mount | **No count-up.** Numbers arrive readable on frame one; the blur→sharp of the reveal is the whole entrance. Animating a revenue figure delays reading real money for showmanship. | n/a |
| 12 | `MoreSheet` | open/close | `translate-y-full → 0` over `320ms`; overlay `opacity` `200ms` | no transform; sheet appears/disappears instantly |

---

## 8. States

### 8.1 Empty — no data at all (`!hasAnyData`)

The current build renders a small grey box. That's a wasted first-run moment. Replace with a
full-width hero using the **Ledger card shell** (same grain, border and bloom), so a brand-new
account still sees the object that will later hold their numbers rather than a different,
sadder screen:

- Eyebrow `WHERE YOU STAND`
- `<h2 class="font-nebula-heading text-[24px] font-semibold tracking-[-0.02em] text-white sm:text-[30px]">Nothing here yet.</h2>`
- Body, locked copy from `DESIGN_BRIEF.md §5`:
  "Connect Gmail to start tracking deals, or add your first idea to get going."
  Render "add your first idea" as an inline `<Link href="/ideas?new=1">` — orange, underlined on
  hover, with an `after:absolute after:inset-x-0 after:-inset-y-3` touch extender.
- `<ShinyCTA href="/ideas?new=1">Capture an idea</ShinyCTA>` — its one console appearance.
- Below it the three quick-action tiles, unchanged, so all three deep links stay reachable.

The three panels are **not** rendered in this state.

### 8.2 Empty — per region (data exists, region doesn't)

| Region | Condition | Content |
|---|---|---|
| Needs attention | `needsAttention.length === 0` | `PanelEmpty` — `CheckCircle2` 18px `text-emerald-400/70`, "Nothing needs your attention right now." No action. |
| Recent ideas | `recentIdeas.length === 0` | `PanelEmpty` — `Lightbulb` 18px `text-zinc-500`, "No ideas captured yet." Action: `ConsoleButton` ghost → `/ideas?new=1` "Capture an idea". |
| This week | `!youtubeConnected \|\| channelStats.length === 0` | `PanelEmpty` — `Link2` 18px, "Connect YouTube to see your performance here." (locked copy). Action: `ConsoleButton` primary → `/settings` "Connect YouTube". |

`PanelEmpty` shell: `flex flex-col items-center gap-3 px-5 py-10 text-center`, icon in a
`grid h-10 w-10 place-items-center rounded-[0.75rem] border border-white/[0.08] bg-white/[0.03]`
well, title `font-nebula-ui text-[13px] text-zinc-400`, body `text-[12px] text-zinc-600`.

Figures in the Ledger card **always render**, showing `0` where appropriate. A zero is
information; hiding it is not.

### 8.3 Loading — `app/(app)/dashboard/loading.tsx`

The page is a server component doing five awaited queries, so Next's `loading.tsx` is the
correct hook. Skeleton mirrors the real layout exactly (no layout shift on swap):

- `ConsoleHeader` renders for real — the title is static, it should never skeleton.
- Ledger card: real card shell (border, grain, bloom all present), with
  `<Skeleton class="h-3 w-24 rounded-[4px]" />` for each label,
  `<Skeleton class="h-11 w-32 rounded-[6px] sm:h-14 sm:w-40" />` for each figure,
  `<Skeleton class="h-[52px] w-full rounded-[0.75rem]" />` ×3 for the action rail.
- Attention panel: real panel shell + header text, 5 × `h-[52px] rounded-[0.75rem]` skeletons.
- Ideas panel: 3 × `h-[44px]`. Week panel: 3 × `h-[46px]`.

Skeleton element: `nebula-skel rounded-[6px]`. Wrap the whole thing in
`<div role="status" aria-busy="true"><span class="sr-only">Loading dashboard</span>…</div>`.

### 8.4 Error — `app/(app)/dashboard/error.tsx`

Client boundary. `ConsoleError` renders inside the standard content column:

```
nebula-border rounded-[1.5rem] bg-white/[0.025] px-6 py-10 text-center
--nebula-border-gradient: linear-gradient(135deg,rgba(234,88,12,.45),rgba(255,255,255,0),rgba(234,88,12,.15))
```

`AlertTriangle` 20px `text-orange-400` in the icon well; title "That didn't load."
(`font-nebula-heading text-[17px] text-white`); body "Something went wrong fetching your
dashboard. Try again — nothing was lost." (`text-[13px] text-zinc-500`); `ConsoleButton`
primary calling `reset()` with label "Try again". `role="alert"` on the container. Never print
the raw error string — it can leak query shape.

Note that the queries themselves swallow failures (`getIntegrations` returns `[]` on error,
`queries.ts:106`), so this boundary catches render/auth faults, not data faults. Degraded
data therefore surfaces as the empty states in §8.2, which is correct.

### 8.5 Dense / populated

| Risk | Handling |
|---|---|
| Long brand name ("Nordfeld Outdoor Equipment Co.") | row cell 1 is `min-w-0`, name `truncate`. Never wraps. |
| 6-figure revenue (`$128,500`) | primary figure is `clamp(1.75rem, 7vw, 3.25rem)` + `tabular-nums`; at 320px that's 22.4px — `$128,500` fits in 288px of content width with room. |
| Long deliverable string | row cell 1 secondary line `truncate`. |
| Paragraph pasted into an idea title | `line-clamp-2`. |
| Long email in the account puck | `truncate` inside a `min-w-0` flex child; full value in `title`. |
| More than 5 attention deals | already capped by the existing `.slice(0, 5)`. The count chip shows the *true* total (`deals.filter(...).length`), so "5 shown of 9" is honest — chip reads `9`, list shows 5, `View all` covers the rest. |
| Null `rate_amount_cents` | em-dash in `text-zinc-700`, never `$0`. |
| Null `brand_name` | "Untitled deal" (existing fallback, unchanged). |
| Zero-value sparkline (all points equal) | flat line at 50% height; guard division by zero when normalising (`range === 0 → 0.5`). |
| < 2 channel-stat rows | render the value, omit the sparkline (a 1-point polyline draws nothing). |

### 8.6 320px overflow audit

Every horizontal-risk element and its guard:

- Tab bar: 5 × 64px = 320px exactly, `grid-cols-5`, labels `text-[9.5px]` centred with `truncate`.
- Ledger figures: `grid-cols-1` below `sm` — three stacked rows, hairline-separated.
- Ledger action rail: `grid-cols-1` below `sm`.
- Attention rows: `grid-cols-[1fr_auto]` below `sm` — the value column is `hidden sm:block`,
  so at 320px a row is `brand (truncate) | stage chip`. The value moves onto the secondary line
  as `{deliverable} · {value}`. **No horizontal scroll, no table.**
- Content padding `px-4`, panel padding `px-4` below `sm`.
- Every `grid`/`flex` child that contains text carries `min-w-0`.

---

## 9. Accessibility

- **Skip link** — first tabbable node in `ConsoleShell`:
  `sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[9999px] focus:bg-orange-500 focus:px-4 focus:py-2 focus:font-nebula-ui focus:text-[13px] focus:text-white`,
  targeting `#main`.
- **Landmarks** — `<nav aria-label="Primary">` on the rail, `<nav aria-label="Primary">` on the
  tab bar (only one is in the a11y tree at a time via `hidden md:flex` / `md:hidden`),
  `<main id="main">`, `<header>` for `ConsoleHeader`, `<section aria-labelledby>` per panel with
  the `<h2>` carrying the id.
- **Heading order** — one `<h1>` per screen (in `ConsoleHeader`), `<h2>` per panel and on the
  Ledger card's name line. No skipped levels.
- **`aria-current="page"`** on the active rail tile and active tab.
- **Focus ring** on every interactive element, using the §2.6 string and nothing else.
- **Touch targets** — rail tile 56px, tab slot 64px, rows `min-h-[52px]`, quick actions
  `min-h-[52px]`, buttons `min-h-[40px]`, `View all` links use the `after:-inset-y-3` extender
  rather than padding that would distort the panel header.
- **Icon-only controls** — mark link, account puck, More button, sheet close: all carry
  `aria-label`.
- **Decoration** `aria-hidden` — section counter, bloom div, grain (pseudo-element, inherently
  hidden), sparkline, ping ring, all chip dots, column-header row.
- **Chips are not links.** A stage chip inside a row link must not be independently focusable.
- **Reduced motion** — every animation in §7 has a stated degradation; new class names are
  added to the existing kill switch (§10).
- **Colour is never the only signal** — stage is a *word* in the chip, not just a hue; the
  attention count is a number, not just a dot.
- **Contrast** — `text-zinc-500` (`#71717a`) on `#000` is 5.1:1 ✅. `text-zinc-600` (`#52525b`)
  is 3.1:1 — **restricted to 10px non-essential labels and disabled/null placeholders only**,
  never body text. `text-orange-400` (`#fb923c`) on black is 8.9:1 ✅.
  `text-orange-200` on `rgba(234,88,12,.12)` over black ≈ 12:1 ✅.
- **`MoreSheet`** — focus trap, `Escape` to close, focus restored to the More button,
  `role="dialog" aria-modal="true"`.
- **`prefers-contrast: more`** (nice-to-have) — bump the gradient-border alphas by pointing
  `--nebula-border-gradient` at a 0.35/0.20 variant.

---

## 10. CSS to append to the Nebula layer

Append below the existing block in `app/globals.css` (which currently ends at line 758).
Nothing above line 484 is touched.

```css
/* ============================================================================
   NEBULA CONSOLE — in-app sub-scale (Group 1). Same system, denser tier.
   ========================================================================= */

/* Console entrance: shorter than the marketing 1s. Keeps `.nebula-reveal`
   alongside it so the existing reduced-motion kill switch still catches it. */
.nebula-reveal--console { animation-duration: 0.55s; }

/* Row edge-light — a 2px orange bar growing top-down on hover/focus.
   Rows must NOT also carry .nebula-border: both own ::before. */
.console-row::before {
  content: '';
  position: absolute;
  left: 0; top: 6px; bottom: 6px;
  width: 2px;
  border-radius: 2px;
  background: #ea580c;
  box-shadow: 0 0 10px rgba(234, 88, 12, 0.6);
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}
.console-row:hover::before,
.console-row:focus-visible::before { transform: scaleY(1); }

/* Sparkline draw-on. --spark-len is set inline from the measured path length,
   or simply overshot (e.g. 200) — dashoffset clamps harmlessly. */
@keyframes nebulaDraw { from { stroke-dashoffset: var(--spark-len, 200); } to { stroke-dashoffset: 0; } }
.nebula-spark path {
  stroke-dasharray: var(--spark-len, 200);
  animation: nebulaDraw 0.9s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

/* Skeleton sweep. */
@keyframes nebulaSkel { 0% { background-position: -160% 0; } 100% { background-position: 260% 0; } }
.nebula-skel {
  background: linear-gradient(90deg,
    rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%);
  background-size: 220% 100%;
  animation: nebulaSkel 1.6s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .nebula-spark path,
  .nebula-skel,
  .console-ping { animation: none !important; }
  .nebula-spark path { stroke-dasharray: none; stroke-dashoffset: 0; }
  .nebula-skel { background: rgba(255, 255, 255, 0.05); }
  .console-row::before { transition: none; }
}
```

Also add `.console-ping`, `.nebula-skel` and `.nebula-spark` to the **existing** kill-switch
selector list at `globals.css:599-607`, so there is one place to audit rather than two.

---

## 11. Where this pushes against §2 — called out

1. **"Revenue MTD" is currently a false label.** `dashboard/page.tsx:47-49` sums every deal with
   `status === 'paid'`, with no date filter. I relabel to **PAID TO DATE** — a presentation-only
   change that makes the label match the existing expression. The alternative (adding a real
   month filter) is a data change and is out of re-skin scope. **This needs a yes/no before
   implementation.** If the intent was genuinely month-to-date, that's a separate bug ticket.

2. **A derived stat on the channel panel.** I plot the 7-day `views` series as a sparkline. This
   is not an invented metric — `getChannelStats(7)` already returns it and the page already
   fetches it; the current screen just discards the shape. No new query. I deliberately did
   **not** add a delta chip ("+12% WoW"), because 7 days of data cannot support a
   week-over-week comparison and I will not fabricate one.

3. **Departure from brief §4's "compact sortable data table".** Five rows, an existing
   `.slice(0, 5)` cap, and a per-row deep link do not need sorting or sticky headers, and a real
   `<table>` fights the 320px stacking. I use a semantic list with table-like grid alignment.
   Sortable tables belong in Group 2's full `/deals` view.

4. **Departure from brief §4's "collapsible to icon-only" sidebar.** I ship the icon-only state
   permanently and delete the collapse. Stated trade-off: labels render at 10px instead of
   13.5px. Mitigation is that they are *always* present — no tooltip, no hover-flyout, no
   discoverability cliff — and every destination stays one click away. Accepting this is the
   central call in this proposal.

5. **Mobile navigation changes shape** (hamburger drawer → bottom tab bar + More sheet). No
   capability is lost: all nine destinations remain reachable. But it *is* a behavioural change
   to a surface the brief says already has mobile fixes, so it wants an explicit sign-off.
   Group 2's kanban must budget `pb-[calc(64px+env(safe-area-inset-bottom))]`.

6. **The root layout is still light.** `app/layout.tsx:73` puts `bg-linen` on `<html>` and
   `app/layout.tsx:60-63` sets `colorScheme: 'light'` / `themeColor: '#FFFFFF'`. The console
   shell paints `bg-black` over it, and a route-group `viewport` export in
   `app/(app)/layout.tsx` fixes the browser UI colour — but during navigation and on overscroll
   the white `<html>` background can flash through. The clean fix is one line at the root
   (`bg-black` on `<html>`, or removing the `bg-linen` class), which is shared with the
   still-Swiss auth and marketing routes. **Recommendation: leave the root alone for now,
   accept the overscroll flash, and remove `bg-linen` in Group 6 cleanup once nothing depends
   on it.** Interim mitigation: `overscroll-contain` on `main` (already specced) and
   `overscroll-none` on the shell root.

7. **`components/ui/logo.tsx` is unusable on dark.** Every path is hard-coded `#000000`. Group 1
   routes around it with `NebulaMark`; Group 5 (auth) will hit the same wall. Either give `Logo`
   a `tone` prop or standardise on `NebulaMark` — worth deciding once, centrally, rather than
   twice.

8. **Nothing here touches pricing.** No pricing surface exists in the console and none is added.
   AI features are not referenced on the dashboard at all, so the preview-labelling requirement
   doesn't bind on this screen — it binds on Repurpose in Group 3.

9. **Seeded channel data is labelled.** `channel_stats_daily` is seeded, not live
   (`queries.ts:186-187`). The panel carries "Cached channel figures. Live YouTube sync is not
   connected." whenever `!youtubeConnected`, satisfying §2b's honest-labelling rule.
