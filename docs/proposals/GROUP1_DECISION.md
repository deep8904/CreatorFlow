# Group 1 — App shell + Dashboard · **BINDING DECISION**

**Status:** approved for implementation. Supersedes `GROUP1_DESIGN_A.md` and `GROUP1_DESIGN_B.md`.
**Scope:** `app/(app)/layout.tsx`, the sidebar, `app/(app)/dashboard/page.tsx`, plus two new
route-boundary files. Sets the in-app visual language for all nine `app/(app)/*` screens.
**Nature:** re-skin. No query, server action, auth, or RLS change. Every deep link preserved.

Build from this document. Where it contradicts either proposal, this document wins. Where it is
silent, prefer Design B's structure and Design A's density values, in that order.

---

## 1. Verdict

**Direction: B's structure, A's craft. A merge, weighted ~65 / 35 toward B.**

Both proposals are strong and both correctly diagnose that Nebula-as-shipped is a marketing scale
that must step down for an OPERATE surface. They differ on where the theatricality goes, and B is
right about it in a way that matters for the eight screens after this one.

**What B wins on, and why it decides the merge:**

1. **The non-sticky header is the single best structural idea in either document.** B's console
   frame makes the header a real flex member above the scroll pane. Nothing ever passes behind it,
   so nothing ever needs frosting — which makes the documented Chromium nested-`backdrop-filter`
   bug *structurally impossible* under `app/(app)/` rather than a trap a reviewer must catch on
   every future screen. A's sticky frosted header is fine on the dashboard and becomes a liability
   on a kanban with sticky column heads and a split editor with two independent scroll panes.
2. **A labelled rail is correct and A's 84px icon spine is not.** A's own spec concedes the tension
   and lands badly: 10px mono nav labels, an idle colour (`zinc-600`, 2.9:1 on the console ground)
   that fails the contrast floor, and a copy hack — shortening "Automations" to "Autos" — to make
   the geometry work. The Home audit scored *Recognition over recall* 4/4 specifically because
   "every nav item is a text label; no icon-only navigation anywhere." A's spine regresses a
   hard-won 4/4 to buy ~150px that only two of nine screens want. Horizontal pressure is a
   per-screen problem and gets a per-screen answer (§4.5, `FocusPane`).
3. **Three scalars do not justify a KPI tile row.** B's instrument strip is the honest response to
   the data volume and it generalises: every subsequent screen fills the same slot from data it
   already fetched. A's Ledger mega-card is beautiful and does not generalise — `/settings` and
   `/drafts` have no ledger, so the shell language would have one screen with a hero object and
   eight without.
4. **B's motion position is right for a screen opened daily.** A's 240ms stagger on data regions is
   restrained, but it is still a delay on the primary job, paid every visit, forever.

**What A wins on, and what it contributes:**

- The **Console sub-scale** as an explicit deliverable binding all nine screens (§3). A's framing —
  "Nebula ported literally into a data screen reads as a toy" — is the right mental model.
- The **effects budget** as a hard, countable rule.
- The **320px overflow audit** discipline, and `100dvh` over `h-screen`.
- **No row separators** — A's rounded inset hover plate resolves the "solid borders" conflict
  outright instead of granting B's argued exception (§2, ruling 6).
- The **nested `viewport` export** on `app/(app)/layout.tsx`, which actually fixes the
  `colorScheme: 'light'` problem for in-app routes without touching the root. B declared this
  unfixable in Group 1; A found the fix.
- The **states matrix**, skeleton discipline, and the `tabular-nums`-everywhere rule.

Neither proposal is shipped as written. Six items are struck from A and five from B (§10).

---

## 2. Rulings on the named conflicts

| # | Conflict | Ruling | Reasoning |
|---|---|---|---|
| 1 | Sidebar model — A's permanent 84px icon spine vs B's console-frame chrome with a labelled rail | **B.** Persistent, always-labelled rail: `md:w-[208px] lg:w-[236px]`. Never collapsible, no icon-only state, no toggle. | Icon literacy never builds in a tool opened a few times a week, and six of nine icons (Deals/Ideas/Drafts/Repurpose/Automations/Analytics) are mutually confusable at 16px. A's own spec needs `Automations` → `Autos` and puts nav labels at 10px in a colour that fails contrast. Collapse is rejected too: it is a persistent control the user must manage to solve a problem only two screens have. |
| 2 | Mobile: bottom tab bar (A) vs drawer (B) | **B — keep the off-canvas drawer.** No bottom tab bar. | Three reasons, any one sufficient. (a) Nine destinations do not split into 4 + More without a second nav model, a second focus surface, and a second set of aria semantics to maintain across nine screens. (b) A permanent 64px bottom bar occludes exactly the screens Groups 2–3 must build: the kanban's drag target zone and the split editor's action bar. (c) Brief §2a — mobile fixes already exist on those screens; changing the nav's *shape* is a behaviour change, not a re-skin. Removing A's bottom bar is also what buys back the vertical budget the header + strip spends (§4.4). A's *quality* fixes to mobile are adopted: `100dvh`, safe-area insets, real dialog semantics, focus trap, Escape, focus restoration, 48px drawer rows. |
| 3 | KPI tile row (A's Ledger card) vs header instrument strip (B) | **B — instrument strip in the header.** No KPI tile row, no Ledger mega-card. | The dashboard has three scalars and a whole `/analytics` screen for measurement. Three integers in `2.5rem` glass cards is a costume that pushes the actual work below the fold on a laptop. The strip is ~72px instead of ~250px, sits in the chrome where a returning user's eye already goes, and gives every later screen a slot to fill from data it already has. **This is a deliberate, argued override of brief §4's "row of KPI stat tiles"** — that section explicitly says structure-to-borrow from a generic reference, and the reference is a measurement product; CreatorFlow's dashboard is a worklist. |
| 4 | Motion budget | **B's near-zero, with A's degradation rigour.** Total in-app motion: one 240ms opacity fade on the content pane, colour transitions at 150ms, one 220ms drawer transform, one 200ms chevron nudge, one skeleton shimmer. **Zero infinite animations in-app**, except the skeleton shimmer and the single first-run `ShinyCTA`. | An entrance is paid once by a visitor and every single day by an operator. Struck: A's `NebulaReveal` stagger on data regions, A's attention ping dot, A's sparkline draw-on, B's measured spine travel (§10). |
| 5 | `backdrop-filter` budget | **Zero under `app/(app)/`, greppable.** Exactly one permitted instance: the mobile drawer scrim (`backdrop-blur-[2px]`), whose child panel is fully opaque `bg-[#0b0b0c]` and therefore not a nesting case. | Depth in-app comes from B's brightness ladder on a solid ground (§3.1), which also makes an *opaque* sticky element legal later if a screen genuinely needs one. A's "two owners max" is a rule that requires vigilance on every future screen; B's zero is a rule an engineer can `grep` for in CI. |
| 6 | Solid borders (A: none / B: argued exception for row separators) | **Neither. Rows get no separators at all.** | DESIGN.md's "no solid borders" governs the outline of an elevated surface. Ruling in three parts: **(a)** elevated surface outlines → `.nebula-border` + per-element `--nebula-border-gradient`, mandatory (console frame, `ConsolePanel`); **(b)** structural dividers → `.console-rule-x` / `.console-rule-y`, B's faded gradient hairline — adopted; **(c)** repeating row separators → **deleted**. Rows are separated by A's inset rounded hover plate and the 56px rhythm. This removes the DESIGN.md exception B asked for *and* removes the `::before` collision risk both proposals worried about. |

---

## 3. The Console tier — tokens binding all nine screens

Treat §3 as the deliverable that outlives this screen.

### 3.1 The brightness ladder (this replaces blur as the depth mechanism)

Declared on `.nebula-console` (the shell root), never on `:root` — the global Swiss token layer
must stay untouched.

```css
.nebula-console {
  --console-bezel:       #000000;   /* outside the frame                        */
  --console-frame:       #0a0a0b;   /* the pane ground                          */
  --console-rail:        #060607;   /* rail — darker than the pane              */
  --console-panel:       rgba(255,255,255,0.025);
  --console-panel-hover: rgba(255,255,255,0.045);
  --console-hair:        rgba(255,255,255,0.06);
  --console-hair-2:      rgba(255,255,255,0.10);
  --console-ink:         #f4f4f5;   /* zinc-100 — primary text                  */
  --console-dim:         #a1a1aa;   /* zinc-400 — secondary text                */
  --console-faint:       #71717a;   /* zinc-500 — labels; THE DARKEST TEXT ALLOWED */
  --console-accent:      #ea580c;
  --console-accent-2:    #fb923c;
  --console-pos:         #34d399;   /* emerald-400 — reserved, unused today     */
  --console-neg:         #fb7185;   /* rose-400   — reserved, unused today      */
}
```

Ascending inward: bezel `#000` → rail `#060607` → pane `#0a0a0b` → panel `+2.5%` → row hover `+4.5%`.

### 3.2 Radii — **always arbitrary values**

The global `--radius-*` scale still serves the old system (`--radius-full: 2px`). Any
`rounded-full` / `rounded-xl` / `rounded-lg` / `rounded-2xl` on this surface is a bug that renders
at 2px — this already shipped once as a real defect on the nav button.

`rounded-[1.5rem]` console frame + panels · `rounded-[10px]` nav rows, buttons, icon buttons ·
`rounded-[8px]` monogram, mark, row hover plates · `rounded-[6px]` skeleton bars ·
`rounded-[4px]` tags · `rounded-[2px]` spines and ticks · `rounded-[9999px]` pills.

`2.5rem` is a marketing radius. It does not appear in-app.

### 3.3 Type scale

Four fonts, four jobs, no overlap. **Manrope** = titles. **Inter** = anything read as a sentence or
a list item. **Geist Mono** = labels, tags, system state, *and every number*. **Geist Sans** =
button labels only (preserves DESIGN.md's `button: 'Geist'` contract).

| Role | Class string |
|---|---|
| Page title (h1) | `font-nebula-heading text-[20px] md:text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-white` |
| Eyebrow | `font-nebula-mono text-[10px] font-medium uppercase tracking-[0.2em] text-orange-400/85` |
| Page description | `font-nebula-ui text-[13.5px] leading-relaxed text-zinc-400` |
| Panel title (h2) | `font-nebula-heading text-[14px] font-semibold tracking-[-0.01em] text-zinc-100` |
| Group label (context column, metric labels, column heads) | `font-nebula-mono text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500` |
| **Metric value** | `font-nebula-mono text-[16px] sm:text-[20px] lg:text-[24px] font-medium tabular-nums tracking-[-0.02em] text-white` |
| Metric hint | `font-nebula-ui text-[11px] text-zinc-500` |
| Row primary | `font-nebula-ui text-[13.5px] font-medium tracking-[-0.01em] text-zinc-100` |
| Row secondary | `font-nebula-ui text-[12px] text-zinc-500` |
| Row value (money) | `font-nebula-mono text-[13px] font-medium tabular-nums text-zinc-100` |
| Nav row | `font-nebula-ui text-[13px] font-medium tracking-[-0.01em]` |
| Tag / chip | `font-nebula-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-zinc-300` |
| Button label | `font-nebula-tech text-[12.5px] font-medium tracking-[0.02em]` |
| Inline link | `font-nebula-ui text-[12px] font-medium text-orange-400 hover:text-orange-300` |

`tabular-nums` is **mandatory** on every number. Without it the right-aligned money column jitters
between rows.

### 3.4 Colour discipline — accessibility floor is part of the token set

**`text-zinc-600` (`#52525b`) is banned for any text node that carries meaning.** It measures
~2.9:1 on `#0a0a0b` and fails the AA floor. It is permitted only on an icon stroke that duplicates
an adjacent visible label (e.g. the row chevron). This strikes items from *both* proposals: A's
idle rail labels and column heads, and B's idea-status tags — the idea's status is information.

**`text-zinc-500` (`#71717a`, ~4.9:1) is the darkest text on this surface.** Verified passes:
zinc-400 ~9.2:1, orange-400 ~9.5:1, emerald-400 ~11:1.

**Orange means exactly one thing, everywhere in the app: "this is where you are, or this wants you
now."** It appears on: the active nav row's icon and spine, the queue urgency tick and overdue date
text, inline links, and the single first-run CTA. **Nothing else.**

**Stage and status tags are monochrome.** A's six-hue stage ramp is struck: in a single-accent
system, spending the palette on a dimension the user is not being asked to act on destroys the
signal orange is carrying. `--console-pos` / `--console-neg` are reserved tokens for genuine
directional deltas and are **unused on this screen** (§6.4 — no fabricated deltas).

### 3.5 Density

Panel header `h-[52px] px-5` · panel body `px-2 pb-2` (the `px-2` insets the row hover plate) ·
queue row `min-h-[56px] px-3 py-3` · context group row `min-h-[52px]` · grid gaps `gap-6 lg:gap-8` ·
nav row `h-10` · drawer nav row `h-12`. Never `80px` section padding in-app.

### 3.6 Focus and hover — three strings, exported, never retyped

Export from `components/console/tokens.ts` and interpolate:

```ts
export const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400'

// For elements flush against an `overflow-hidden` boundary, where an outward
// offset would be clipped (panel footer link, drawer edge rows).
export const FOCUS_INSET =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-orange-400'

export const EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]'
export const HOVER = `transition-colors duration-150 ${EASE}`
```

`outline` rather than `ring`: it follows `border-radius` in every supported browser, so it wraps
pills correctly, and it needs no per-ground `ring-offset-color` — one string works on both the rail
(`#060607`) and the pane (`#0a0a0b`). B's two-ground ring variants are struck as needless surface area.

### 3.7 Effects budget (hard, countable — A's rule, adopted verbatim in spirit)

- `backdrop-filter`: **0** under `app/(app)/`, except the mobile drawer scrim.
- `.nebula-grain`: **1** per viewport — the shell atmosphere layer.
- Radial glow: **1** per viewport — the shell atmosphere layer.
- `.nebula-border`: the console frame + `ConsolePanel`. Nothing else.
- Infinite animations: **0**, except `.console-skeleton` while loading and the one `ShinyCTA` on
  the first-run empty state.
- No `box-shadow` blur radius above `24px` in-app.

---

## 4. Shell specification

### 4.1 Skeleton — `app/(app)/layout.tsx`

Server component. `getCurrentProfile()`, `getAuthenticatedUser()`, the `Promise.all`, and the
`redirect('/login')` guard are **unchanged**.

```tsx
export const viewport = { colorScheme: 'dark', themeColor: '#000000' }
```

This nested `viewport` export overrides the root's `colorScheme: 'light'` for `(app)` routes only,
which is what stops the UA painting light native `<select>` / date controls and light default
scrollbars on Groups 2–4. It does **not** touch `app/layout.tsx` (still-light auth and marketing
routes depend on it). See §12, risk 1.

```
<div class="nebula-console relative h-[100dvh] w-full overflow-hidden overscroll-none
            bg-black font-nebula-ui text-zinc-200 antialiased
            selection:bg-orange-500/30 selection:text-orange-200
            lg:p-2.5 2xl:p-4">

  <SkipLink />                                          {/* first tabbable node */}

  <div aria-hidden class="nebula-grain pointer-events-none absolute inset-0 z-0">
    <div class="absolute inset-x-0 top-0 h-[420px]
                bg-[radial-gradient(ellipse_110%_70%_at_50%_-25%,rgba(234,88,12,0.10),transparent_62%)]" />
  </div>

  <div class="console relative z-10 flex h-full overflow-hidden bg-[#0a0a0b]
              lg:rounded-[1.5rem] lg:nebula-border"
       style="--nebula-border-gradient:
              linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02) 45%, rgba(234,88,12,0.10))">

    <ConsoleRail name={…} email={…} />                  {/* hidden below md */}
    <MobileNavDrawer name={…} email={…} />              {/* md:hidden        */}

    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <MobileTopBar />                                  {/* md:hidden, in normal flow */}
      {children}                                        {/* page owns ConsoleHeader + pane */}
    </div>
  </div>
</div>
```

Notes:
- `h-[100dvh]`, not `h-screen` — `h-screen` leaves a dead strip under mobile browser chrome.
- `bg-linen` is gone. The shell paints its own black ground, exactly as `app/page.tsx` does.
- `pt-14 md:pt-0` is gone. The mobile bar is a flex child in normal flow, so nothing is padded
  around it — one class of layout bug removed with no capability lost.
- The bezel + gradient frame engage at `lg` (1024), not `xl`. Below `lg` the console is full-bleed
  with square corners. This is the standard app-in-a-frame pattern and it is where the gradient
  border earns its place; below `lg` there is no viewport to spare for a bezel.

### 4.2 `ConsoleRail` (≥768px)

```html
<aside class="hidden md:flex w-[208px] lg:w-[236px] shrink-0 flex-col bg-[#060607]">

  <div class="flex h-14 shrink-0 items-center px-4">
    <Link href="/" class="group flex items-center gap-2.5 rounded-[8px] {FOCUS}">
      <ConsoleMark />
      <span class="font-nebula-heading text-[15px] font-semibold tracking-[-0.02em] text-white">
        CreatorFlow</span>
    </Link>
  </div>
  <div aria-hidden class="console-rule-x" />

  <nav aria-label="Primary" class="console-scroll min-h-0 flex-1 overflow-y-auto px-3 py-3">
    <ul class="flex flex-col gap-[2px]">…7 primary…</ul>
    <div aria-hidden class="console-rule-x my-3" />
    <ul class="flex flex-col gap-[2px]">…Team, Settings…</ul>
  </nav>

  <div aria-hidden class="console-rule-x" />
  <RailAccount name email />
</aside>
```

Nav arrays are the **existing `primaryNav` / `secondaryNav` from `AppSidebar.tsx`, verbatim** —
same nine destinations, same lucide icons, same order. Active predicate is unchanged:
`pathname === href || pathname.startsWith(href + '/')`.

`ConsoleMark` — the gradient-F mark used by the approved Home nav (`NebulaNav.tsx:31`), lifted
verbatim: `grid h-6 w-6 place-items-center rounded-[8px] bg-gradient-to-br from-orange-500
to-orange-700 font-nebula-tech text-[11px] font-bold text-white
shadow-[0_0_16px_-4px_rgba(234,88,12,0.7)]`, `aria-hidden`. **Do not import
`components/ui/logo.tsx`** — every path is hard-coded `#000000` and it renders invisible here
(confirmed). See §12, risk 2.

**`RailNavItem`** — `<li><Link>`, identical for both groups:

```
group relative flex h-10 items-center gap-2.5 rounded-[10px] px-3
font-nebula-ui text-[13px] font-medium tracking-[-0.01em]
transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
{FOCUS}

inactive:  text-zinc-400 hover:bg-white/[0.04] hover:text-white
active:    bg-white/[0.055] text-white   + aria-current="page"

icon (lucide, size 16, strokeWidth 1.75):
  inactive: text-zinc-500 group-hover:text-zinc-300
  active:   text-orange-400
```

**Active spine.** A 24×2px orange bar on the rail's left edge, rendered **as a child of the active
row** — no measurement, no offset arithmetic, no `useLayoutEffect`:

```html
{active && (
  <span aria-hidden
    class="absolute left-[-12px] top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-[2px]
           bg-orange-500 shadow-[0_0_12px_rgba(234,88,12,0.85)]" />
)}
```

`left-[-12px]` cancels the nav's `px-3` so the bar sits on the rail's own edge. It cross-fades with
the route change; it does not travel. B's measured travelling spine is struck (§10, B-1).

Active state is deliberately **not** a filled orange pill. Nine filled pills in a 236px column
reads as a toolbar, and it would spend orange on a dimension already carried by the plate + icon.

**`RailAccount`** (bottom, `h-16 px-3`): `Monogram size={28}`, then a `min-w-0 flex-1` block with
name (`truncate font-nebula-ui text-[12.5px] font-medium text-zinc-200`) and email
(`truncate font-nebula-mono text-[10.5px] text-zinc-500`), then a 40×40 sign-out icon button with
`aria-label="Sign out"` and `title="Sign out"`. The handler is lifted from `AppSidebar` **verbatim**:
`await signOut(); router.push('/'); router.refresh()`.

`Monogram`: `grid place-items-center rounded-[8px] bg-white/[0.07] ring-1 ring-inset ring-white/[0.08]
font-nebula-mono text-[11px] font-medium uppercase tracking-[0.06em] text-zinc-300` + initials.
Deterministic. **No colour-hash rainbow** — single-accent system.

### 4.3 Mobile (<768px)

**`MobileTopBar`** — `h-14 shrink-0 flex items-center gap-3 px-4 bg-[#060607]` with a
`console-rule-x` bottom edge. 40×40 hamburger carrying `aria-label="Open navigation menu"`,
`aria-expanded`, `aria-controls="app-drawer"`; then `ConsoleMark` + wordmark.

**`MobileNavDrawer`** —

- Scrim: `fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px]` — *the one permitted blur in the app*.
- Panel: `fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] bg-[#0b0b0c]` (fully opaque, so the
  scrim's blur is not a nesting case), `pb-[env(safe-area-inset-bottom)]`,
  `translate-x-0` / `-translate-x-full`, `transition-transform duration-220 ease-[cubic-bezier(0.16,1,0.3,1)]`.
- `role="dialog" aria-modal="true" aria-label="Navigation"`, `id="app-drawer"`.
- Focus moves to the close button on open, is **trapped** while open, and returns to the hamburger
  on close. `Escape` closes. Route change closes. `document.body` gets `overflow-hidden` while open.
- Nav rows are `h-12` (48px) at `text-[14px]`. No spine in the drawer — the filled plate is
  sufficient at 48px.
- The account block renders inline at the drawer's foot, same content as `RailAccount`.

All nine destinations remain reachable in one drawer open, exactly as today.

### 4.4 `ConsoleHeader` — owned by the page, not the layout

This is the contract every one of the nine screens implements. The layout cannot receive page data;
the page already has it. Each page renders its own header and fills the slots from what it already
fetched.

```tsx
<ConsoleHeader
  eyebrow="Dashboard"
  title={`Welcome back, ${firstName}`}
  description={…}
  actions={<CapturePills … />}
  metrics={<MetricStrip … />}
/>
```

```html
<header class="shrink-0">
  <div class="mx-auto w-full max-w-[1240px] 2xl:max-w-[1360px] px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col gap-4 pb-3 pt-4 md:pb-4 md:pt-5
                lg:flex-row lg:items-end lg:justify-between lg:gap-8">
      <div class="min-w-0">
        <p class="mb-2 hidden items-center gap-2 font-nebula-mono text-[10px] font-medium
                  uppercase tracking-[0.2em] text-orange-400/85 md:flex">
          <span aria-hidden class="h-1 w-1 rotate-45 bg-orange-500" />{eyebrow}
        </p>
        <h1 class="font-nebula-heading text-[20px] md:text-[26px] font-semibold
                   leading-[1.15] tracking-[-0.02em] text-white">{title}</h1>
        {description && (
          <p class="mt-2 hidden max-w-[52ch] font-nebula-ui text-[13.5px] leading-relaxed
                    text-zinc-400 md:block">{description}</p>)}
      </div>
      <div class="flex shrink-0 items-center gap-2">{actions}</div>
    </div>
  </div>
  {metrics && (<>
    <div aria-hidden class="console-rule-x" />
    <div class="mx-auto w-full max-w-[1240px] 2xl:max-w-[1360px] px-4 sm:px-6 lg:px-8">{metrics}</div>
    <div aria-hidden class="console-rule-x" />
  </>)}
</header>
```

**The header sits above the scroll pane in the flex column.** It never scrolls, never uses
`position: sticky`, and therefore never needs frosting. This is the structural decision that makes
ruling 5 free.

**Vertical chrome budget — binding for all nine screens: header + strip ≤ 200px at every
breakpoint.** Measured here: `<md` = top bar 56 + header ~60 (eyebrow and description suppressed) +
strip ~52 = **168px**. `md+` = 0 + ~104 + ~74 = **178px**. A screen with a heavy toolbar (e.g.
`/deals` search + filters) drops the strip rather than exceeding the budget. Rejecting the mobile
bottom tab bar (ruling 2) is what makes the mobile figure affordable.

### 4.5 Breakpoint behaviour

| Width | Bezel / frame | Rail | Content column | Header | Body grid |
|---|---|---|---|---|---|
| **320–639** | none, square corners | drawer (280px) + `h-14` top bar | `px-4`, ~288px usable | eyebrow + description **hidden**; title 20px; actions wrap to their own line; strip `grid-cols-3`, 9px labels / 16px values | single column, `gap-6` |
| **640–767** | none | drawer + top bar | `px-6` | as above, 10px labels / 20px values | single column |
| **768–1023** | none | persistent `w-[208px]` | `px-6`, ~512px usable | eyebrow + description visible; title 26px; actions right | single column — context groups stack **below** the queue |
| **1024–1279** | `lg:p-2.5`, `rounded-[1.5rem]`, `.nebula-border` | `w-[236px]` | `px-8`, capped `max-w-[1240px]` | title / actions on one line, strip on the hairline below | `lg:grid-cols-[minmax(0,1fr)_300px] gap-8` |
| **1280–1535** | same | `w-[236px]` | same | same | same; queue rows engage their 5-column form at `xl` |
| **≥1536** | `2xl:p-4` | `w-[236px]` | `max-w-[1360px]` | same | `2xl:grid-cols-[minmax(0,1fr)_340px]` |

The rail does **not** grow past `lg`. It is a fixed instrument.

**Horizontal-pressure escape hatch (for Groups 2–3, specified here so it is consistent):** a screen
that genuinely needs the rail's width defines `FocusPane` — a per-screen, per-session toggle that
sets the rail to `w-0 overflow-hidden` with a floating 40×40 restore button. It is **opt-in per
screen**, never a persistent chrome control, and it is not built in Group 1.

**320px overflow guard.** Every horizontal container is `min-w-0` + `flex-wrap`, or a `grid` with
`minmax(0,1fr)` tracks. The two genuine risks and their fixes:
1. Metric values — value cell is `min-w-0 truncate`, base `text-[16px]`, and `formatMoney` switches
   to compact notation at ≥ 100,000 (§6.2). Worst case `$99,999` = 7 chars ≈ 67px in a ~96px cell.
2. Long brand names — name cell `min-w-0 truncate`.

---

## 5. Component inventory

Everything new lives in **`components/console/`**. This is a new namespace on purpose:
`components/app/AppSidebar.tsx`, `components/ui/*` and `components/editorial/*` stay on disk and
untouched until Groups 2–6 migrate, and mixing old-token and new-token components in one folder is
exactly how the 2px-radius bug class spreads.

### Shell

| Component | File | Client? | Props | Builds on |
|---|---|---|---|---|
| `SkipLink` | `console/SkipLink.tsx` | no | — | new; targets `#console-main` |
| `ConsoleRail` | `console/ConsoleRail.tsx` | **yes** | `{ name: string; email: string }` | `usePathname()` exactly as `AppSidebar` does today |
| `RailNavItem` | inside `ConsoleRail.tsx` | — | `{ href, label, icon: LucideIcon, active }` | new |
| `RailAccount` | inside `ConsoleRail.tsx` | — | `{ name, email, variant?: 'rail' \| 'drawer' }` | wraps the existing `signOut()` from `lib/supabase/auth` |
| `MobileTopBar` | `console/MobileNav.tsx` | **yes** | `{ onOpen }` | — |
| `MobileNavDrawer` | `console/MobileNav.tsx` | **yes** | `{ name, email }` | `role="dialog"` + focus trap |
| `ConsoleMark` | `console/ConsoleMark.tsx` | no | `{ size?: number }` | the gradient-F from `NebulaNav.tsx:31` |
| `Monogram` | `console/Monogram.tsx` | no | `{ name: string; size?: 24 \| 28 \| 32 }` | replaces `ui/avatar` on dark |
| `ConsoleHeader` | `console/ConsoleHeader.tsx` | no | `{ eyebrow?: string; title: string; description?: string; actions?: ReactNode; metrics?: ReactNode }` | — |
| `MetricStrip` / `Metric` | `console/MetricStrip.tsx` | no | `Metric = { label: string; value: string; hint?: string; title?: string }` | `<dl>/<dt>/<dd>` |
| `CapturePills` | `console/CapturePills.tsx` | no | `{ items: { label, href, icon, srLabel }[] }` | plain `<Link>`s — **carries the deep links** |

### Dashboard

| Component | File | Props | Builds on |
|---|---|---|---|
| `ConsolePanel` | `console/ConsolePanel.tsx` | `{ title, count?, action?: { label, href }, footer?: ReactNode, children }` | `.nebula-border`, `rounded-[1.5rem]` |
| `QueueRow` | `console/QueueRow.tsx` | `{ href, name, meta, value?, tag?, urgency?: 'overdue' \| 'soon' \| null }` | `<li><Link>` |
| `ContextGroup` | `console/ContextGroup.tsx` | `{ title, action?: { label, href }, footnote?: string, children }` | no card — group label + `.console-rule-x` |
| `ContextRow` | `console/ContextGroup.tsx` | `{ href, title, tag }` | `<li><Link>` |
| `StageTag` | `console/StageTag.tsx` | `{ children }` | monochrome pill |
| `Sparkline` | `console/Sparkline.tsx` | `{ values: number[]; label: string }` | inline SVG, no library |
| `ConsoleButton` | `console/ConsoleButton.tsx` | `{ href?, onClick?, variant: 'primary' \| 'ghost'; children }` | `rounded-[9999px]`, `font-nebula-tech` |
| `PanelEmpty` | `console/PanelEmpty.tsx` | `{ title, body?, action?: { label, href } }` | — |
| `ConsoleEmpty` | `console/ConsoleEmpty.tsx` | — | the first-run hero; the **one** `ShinyCTA` in-app |
| `ConsoleSkeleton` | `console/ConsoleSkeleton.tsx` | — | `.console-skeleton` |
| `ConsoleError` | `console/ConsoleError.tsx` | **client**; `{ error, reset }` | — |

`ConsoleButton` primary:

```
inline-flex h-10 items-center gap-2 rounded-[9999px]
bg-gradient-to-b from-orange-500 to-orange-600 px-4
font-nebula-tech text-[12.5px] font-medium tracking-[0.02em] text-white
shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]
transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
hover:from-orange-400 hover:to-orange-500
{FOCUS}
```

`ConsoleButton` ghost:

```
inline-flex h-10 items-center gap-2 rounded-[9999px] border border-white/[0.10] bg-white/[0.03] px-4
font-nebula-tech text-[12.5px] font-medium text-zinc-200
transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
hover:bg-white/[0.07] hover:text-white
{FOCUS}
```

`ShinyCTA` appears **once** in the entire app: the first-run empty state (§8.1). It is a
marketing-weight object; repeating it would cheapen it and blow the effects budget.

---

## 6. Dashboard specification

### 6.1 Region map

```
MobileTopBar                          (<md only)
ConsoleHeader
  ├ eyebrow "Dashboard"  ·  h1 "Welcome back, {firstName}"  ·  description
  ├ actions: CapturePills   (3 deep links)
  └ metrics: MetricStrip    (3 cells)
──────────────────────────────────────────────────────────────
<main id="console-main">  ← the only scroll container
  ConsolePanel "Needs your attention"        minmax(0,1fr)   ┐
  ContextGroup "Recent ideas"                300px column    │ lg 2-up
  ContextGroup "This week's performance"     300px column    ┘
```

```html
<main id="console-main" class="console-scroll console-fade min-h-0 flex-1 overflow-y-auto overscroll-contain">
  <div class="mx-auto w-full max-w-[1240px] 2xl:max-w-[1360px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8
                2xl:grid-cols-[minmax(0,1fr)_340px]">
      <section aria-labelledby="queue-h">…the one panel…</section>
      <div class="flex flex-col gap-8">…two context groups…</div>
    </div>
  </div>
</main>
```

Below `lg` the context column stacks under the queue — correct priority on a phone: what needs me →
what I was thinking about → how the channel is doing.

**One card-shaped object per view.** The queue is the only `ConsolePanel`. Recent ideas and This
week's performance are typography on the console ground — group label, faded hairline, rows. The
eye gets a single target on load; there is no tile-scanning phase.

### 6.2 Header content and the metric strip

| Slot | Value | Fallback |
|---|---|---|
| eyebrow | `Dashboard` | — |
| title | `Welcome back, {firstName}` where `firstName = profile?.full_name?.split(' ')[0]` | `Welcome back` when `full_name` is null |
| description | `{needsAttention.length} deals need a next step.` | `Nothing needs a next step right now.` when 0; `1 deal needs a next step.` when 1 |

**"Good morning" is deleted.** It is hard-coded, server-rendered in UTC, and `profiles.timezone` is
never consulted — so it is wrong for a large share of users a large share of the time. Both
proposals independently flagged it. `Welcome back` is time-independent and carries the same warmth.

**`MetricStrip`** — `<dl class="grid grid-cols-3 py-2.5 sm:py-4">`, cells
`relative min-w-0 px-3 first:pl-0 last:pr-0 sm:px-5`, with a `.console-rule-y` rendered as an
`aria-hidden` sibling between cells (absolutely positioned, `inset-y-1`). Do **not** use a
`[&:not(:first-child)]` selector — render the divider explicitly.

| Cell | `<dt>` label | `<dd>` value | hint |
|---|---|---|---|
| 1 | `Open deals` | `openDeals.length` | `of {deals.length} total` |
| 2 | **`Collected to date`** | `formatMoney(revenueMtd)` | `across {paidCount} deals marked paid` — or `no deals marked paid yet` when 0 |
| 3 | `Ideas captured` | `ideas.length` | `{ideasInProgress} in progress` |

`paidCount = deals.filter(d => d.status === 'paid').length` — a length of an array the page already
builds; no new query.

**`formatMoney(dollars: number)`** — note `revenueMtd` is **already in dollars** (`dashboard/page.tsx:47-49`
divides by 100). Design B's `formatMoney(revenueMtdCents)` is a unit error; do not copy it.

```ts
const formatMoney = (d: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
    notation: d >= 100_000 ? 'compact' : 'standard',
  }).format(d)
```

Compact kicks in at 100,000 so the 320px cell never overflows. Put the full, uncompacted value in
`title` on the `<dd>` so nothing is hidden.

**`CapturePills`** — the three deep links move from the 3-card row into the header action cluster as
one segmented control. Three plain `<Link>`s, no menu, no popover, no new client state, so
`?new=1` behaves identically to today.

```html
<div class="flex items-center rounded-[9999px] border border-white/[0.08] bg-white/[0.03] p-1">
  <a href="/deals?new=1" aria-label="Log a deal" title="Log a deal"
     class="group inline-flex h-10 min-w-[40px] items-center justify-center gap-2
            rounded-[9999px] px-2.5 sm:px-3.5 font-nebula-ui text-[12.5px] font-medium text-zinc-400
            transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
            hover:bg-white/[0.07] hover:text-white {FOCUS_INSET}">
    <Plus size={14} class="text-orange-400/80 group-hover:text-orange-400" />
    <span class="hidden sm:inline">Deal</span>
  </a>
  … Idea → /ideas?new=1 · Draft → /drafts?new=1 …
</div>
```

Below `sm` the labels drop and the three become 40×40 icon buttons — still direct links, still 40px
targets, `aria-label` + `title` on each. Total 320px width: 3×40 + 8 = 128px, sitting under the
title on its own line. Icons: `Handshake`, `Lightbulb`, `FileText` (unchanged from the current
build) rather than three identical `Plus` glyphs.

### 6.3 "Needs your attention" — the one panel

Header (`h-[52px] px-5`, `.console-rule-x` bottom edge): `<h2 id="queue-h">` with the locked copy
**"Needs your attention"**, then a count tag
(`rounded-[4px] bg-white/[0.07] px-1.5 py-0.5 font-nebula-mono text-[10.5px] font-medium
tabular-nums text-zinc-300`), then `View all` → `/deals` on the right with the
`after:absolute after:inset-x-0 after:-inset-y-3` touch extender.

Body is a `<ul class="px-2 py-2">` of `QueueRow`s. **No separators** (ruling 6). The rows are
`slice(0, 5)` — the existing cap, unchanged.

```html
<li>
  <a href={`/deals?deal=${deal.id}`}
     class="group relative grid min-h-[56px] items-center gap-x-3 gap-y-1 rounded-[8px] px-3 py-3
            grid-cols-[2rem_minmax(0,1fr)_auto]
            xl:grid-cols-[2rem_minmax(0,1fr)_auto_6.5rem_1rem]
            transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
            hover:bg-white/[0.045] {FOCUS}">

    {urgency && <span aria-hidden class="absolute inset-y-2.5 left-0 w-[2px] rounded-[2px] bg-orange-500" />}

    <Monogram size={32} name={deal.brand_name ?? '?'} />

    <div class="min-w-0">
      <p class="truncate font-nebula-ui text-[13.5px] font-medium tracking-[-0.01em] text-zinc-100
                transition-colors group-hover:text-white">{deal.brand_name ?? 'Untitled deal'}</p>
      <p class="truncate font-nebula-ui text-[12px] text-zinc-500">
        {deal.deliverables ?? DEAL_STAGE_LABEL[deal.status] ?? '—'}
        {dueLabel && <> · <span class={urgency ? 'text-orange-400' : 'text-zinc-500'}>{dueLabel}</span></>}
      </p>
    </div>

    <span class="justify-self-end font-nebula-mono text-[13px] font-medium tabular-nums text-zinc-100">
      {money}</span>

    <StageTag class="hidden xl:inline-flex">{DEAL_STAGE_LABEL[deal.status]}</StageTag>
    <ChevronRight size={14} aria-hidden
      class="console-nudge hidden xl:block text-zinc-600 transition-transform duration-200
             ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:text-zinc-400" />
  </a>
</li>
```

The 5-column form engages at `xl`, **not `lg`** (both proposals said `lg`; at 1024 the queue column
is only ~372px after the rail, bezel, gutters and the 300px context column, which would crush a
5-track grid). At `lg` and below the row is the 3-track form and the stage falls back into the meta
line, so no information is lost.

`StageTag`: `inline-flex items-center rounded-[4px] bg-white/[0.06] px-2 py-1 font-nebula-mono
text-[10.5px] font-medium uppercase tracking-[0.1em] text-zinc-300`. Monochrome (§3.4).

**Panel footer**, rendered only when `openDeals.length > needsAttention.length`:

```html
<a href="/deals" class="flex h-11 items-center justify-center border-t-0 font-nebula-ui text-[12px]
   font-medium text-zinc-400 transition-colors hover:bg-white/[0.03] hover:text-white {FOCUS_INSET}">
  {openDeals.length - needsAttention.length} more open deals
</a>
```

preceded by a `.console-rule-x`. This makes the truncation visible instead of silent, from two
numbers already on the page.

**Due dates — adopted, with constraints.** `getDeals()` already returns `due_date`; rendering it is
presentation, not a data change, and it is the single strongest "what needs me today" signal in the
existing payload, which is exactly what brief §5 asks this screen to answer.

```ts
// Date-only column. Compare UTC day parts only — this page is server-rendered,
// and a local-time comparison is the same class of bug that made "Good morning" wrong.
function dueMeta(due: string | null) {
  if (!due) return { label: null, urgency: null }
  const d = new Date(due + 'T00:00:00Z')
  const today = new Date(); const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  const days = Math.round((d.getTime() - todayUTC) / 86_400_000)
  const label = days < 0 ? `Overdue` : days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow'
    : `Due ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(d)}`
  return { label, urgency: days < 0 ? 'overdue' as const : days <= 3 ? 'soon' as const : null }
}
```

Only `overdue` and `soon` (≤3 days) render the orange tick. Everything else is neutral. The label
is a plain word, never colour alone (§9).

### 6.4 Context column

**`ContextGroup`** — no card, no fill, no border. Group label (`font-nebula-mono text-[10px]
uppercase tracking-[0.18em] text-zinc-500`) + optional right-hand link, then a `.console-rule-x`,
then content.

**Recent ideas** — locked copy `Recent ideas`, link `View all` → `/ideas`. Three rows from the
existing `ideas.slice(0, 3)`. Each is `<Link href={`/ideas?open=${idea.id}`}>` — deep link preserved.

```html
<a class="group relative flex min-h-[52px] items-start justify-between gap-3 rounded-[8px] px-3 py-3
          transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
          hover:bg-white/[0.03] {FOCUS}">
  <span aria-hidden class="absolute inset-y-2.5 left-0 w-[2px] rounded-[2px] bg-orange-500 opacity-0
                           transition-opacity duration-150 group-hover:opacity-100" />
  <p class="line-clamp-2 font-nebula-ui text-[13px] font-medium leading-snug tracking-[-0.01em]
            text-zinc-300 transition-colors group-hover:text-white">{idea.title}</p>
  <span class="mt-0.5 shrink-0 font-nebula-mono text-[10.5px] uppercase tracking-[0.1em] text-zinc-400">
    {IDEA_STATUS_LABEL[idea.status]}</span>
</a>
```

`line-clamp-2`, not `truncate` — idea titles are sentences. Capped at two lines so a pasted
paragraph can't blow the column height. **Status tag is `text-zinc-400`, not `zinc-600`** (§3.4).

The orange hover tick is the same 2px bar as the rail spine and the queue urgency mark: **one shape,
one meaning, three contexts.**

**This week's performance** — locked copy, link `Full analytics` → `/analytics`.

```
Views                                            ← group sub-label, mono 10px
{formatCompact(weekViews)}                       ← mono 24px tabular
<Sparkline values={channelStats.map(s => s.views)} label="Daily views, last 7 days" />
──────────────────────────────
New subscribers   +{formatCompact(weekSubsGained)}      ← 2-col dl, mono 15px values
Total subscribers  {latestSubs !== null ? formatCompact(latestSubs) : '—'}
──────────────────────────────
Last 7 days.                                     ← footnote, mono 10px zinc-500
```

Sources are unchanged: `channelStats.reduce(views)`, `channelStats.reduce(subscribers_gained)`,
last row's `subscribers_total`. The sparkline plots the seven points the page **already fetches**
via `getChannelStats(7)` — the current screen throws the shape away and shows only the sum. No new
query, no invented metric.

**No delta chips.** An honest week-over-week delta needs 14 days; the page fetches 7. Changing that
argument is a query change and is out of re-skin scope. `--console-pos` / `--console-neg` stay
reserved; when `getChannelStats(14)` is accepted later, a chip drops in with no layout change.

**`Sparkline`** (`h-8 w-full`, `viewBox="0 0 120 32"`, `preserveAspectRatio="none"`,
`role="img"` + `aria-label`):
- `x = i * (120 / (n - 1))`, `y = 30 - ((v - min) / (max - min || 1)) * 26`.
- Area fill under a vertical `#ea580c` gradient `0.28 → 0`; line `stroke="#fb923c"`,
  `stroke-width="1.5"`, `stroke-linecap/linejoin="round"`, **`vector-effect="non-scaling-stroke"`**
  (required — `preserveAspectRatio="none"` would otherwise distort the line weight horizontally).
- Last point gets a `r=4` halo at 0.22 opacity plus an `r=1.8` solid dot.
- `values.length < 2` → render a flat `<line>` at `y=16` in `stroke-white/10`, not a path.
- All points equal → the `|| 1` guard already prevents division by zero; the line renders flat at
  the top of the band, which is correct.
- Gradient `id` via `useId()` so a second sparkline on a future screen can't collide.
- **No draw-on animation** (§10, A-5).

### 6.5 Copy inventory

Verbatim from `docs/DESIGN_BRIEF.md` §5 — do not paraphrase:
`Needs your attention` · `Recent ideas` · `This week's performance` ·
`Nothing here yet.` · `Connect Gmail to start tracking deals, or add your first idea to get going.`

New strings, all matching the brief's tone rule (direct, plain, respectful of time):
`Welcome back, {firstName}` · `{n} deals need a next step.` · `Nothing needs a next step right now.` ·
`Collected to date` · `across {n} deals marked paid` · `no deals marked paid yet` ·
`{n} more open deals` · `Last 7 days.` · `Nothing needs your attention right now.` ·
`All your open deals are delivered or paid.` · `No ideas captured yet.` · `Capture one` ·
`Connect YouTube to see your performance here.` · `We couldn't load this screen. Nothing was lost — try again.`

---

## 7. Motion plan

Global easing `cubic-bezier(0.16, 1, 0.3, 1)`. Never default easing.

| # | What | Spec | Reduced motion |
|---|---|---|---|
| 1 | Content pane arrival | `.console-fade` — `opacity 0→1` over **240ms**. No transform, no blur, **no stagger.** Covers hydration jitter and reads as "the screen turned on." | `animation: none; opacity: 1` |
| 2 | Shell chrome | **Nothing.** The rail, header and strip never animate on navigation. Persistent chrome that re-animates on every route change is nausea, not polish. | n/a |
| 3 | Rail active spine | Cross-fade with the route change, no travel | n/a (no transition to kill) |
| 4 | Hover / focus colour + background | `transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]` | kept — colour-only, no vestibular cost, and it is the accessible affordance |
| 5 | Queue chevron nudge | `.console-nudge` + `group-hover:translate-x-0.5`, 200ms | `transition: none` |
| 6 | Mobile drawer | panel `transform` 220ms; scrim `opacity` 180ms | transform → none; scrim opacity kept |
| 7 | Skeleton shimmer | `.console-skeleton`, 1.6s linear infinite | `animation: none`, bars held flat at `rgba(255,255,255,0.06)` |
| 8 | First-run `ShinyCTA` | inherits `.nebula-cta` | already killed by the existing rule at `globals.css:750-757` — **verified present**, covers `.nebula-cta`, `::after`, and `__label::before` |

**Total in-app motion budget: one 240ms fade, one 220ms transform, one 200ms nudge, and colour
transitions.** Anything beyond this on any of the nine screens needs a new decision.

Deliberately unused in-app: `nebula-reveal`, `columnReveal`, `nebula-marquee`,
`nebula-progressive-blur`, `nebula-typewriter`, `animate-ping`, `animate-bounce`, `animate-spin`
(except a genuine in-flight spinner, which this screen has none of), and the breathing glow outside
the one CTA.

Note the global rule at `globals.css:153-165` already clamps every `animation-duration` /
`transition-duration` to 0.01ms under reduced motion, so the colour transitions degrade for free.
Infinite loops still need explicit kills — that is what §11's media block is for.

---

## 8. States — every data region, all four

### 8.1 First run — `!hasAnyData` (no deals, no ideas)

Replaces the entire body grid. **The header, metric strip (all zeroes) and capture pills remain** —
orientation should not disappear just because the account is empty, and a zero is information.

This is the one Persuade moment inside Operate, so it gets the app's only `ShinyCTA`:

```html
<div class="mx-auto max-w-[34rem] py-16 text-center lg:py-24">
  <div aria-hidden class="mx-auto mb-7 grid h-14 w-14 place-items-center rounded-[1rem]
       border border-white/[0.08] bg-white/[0.03] text-orange-400">
    <Lightbulb size={22} strokeWidth={1.75} />
  </div>
  <h2 class="font-nebula-heading text-[20px] font-semibold tracking-[-0.02em] text-white">Nothing here yet.</h2>
  <p class="mx-auto mt-3 max-w-[38ch] font-nebula-ui text-[14px] leading-relaxed text-zinc-400">
    Connect Gmail to start tracking deals, or add your first idea to get going.
  </p>
  <div class="mt-9 flex flex-col items-center gap-5">
    <ShinyCTA href="/ideas?new=1" class="px-9 py-4 text-[13px]">Add your first idea</ShinyCTA>
    <a href="/settings" class="relative after:absolute after:inset-x-0 after:-inset-y-3 after:content-['']
       font-nebula-ui text-[13px] font-medium text-zinc-400 transition-colors hover:text-white {FOCUS}">
      Connect Gmail</a>
  </div>
</div>
```

The brief's sentence is rendered as **plain text with no inline link** — the two targets below it
are the actionable ones, and nesting a duplicate `/ideas?new=1` inside the paragraph would give the
same destination two competing affordances. (A proposed the inline link; struck for that reason.)

### 8.2 Per-region empty (data exists elsewhere)

| Region | Condition | Render |
|---|---|---|
| Needs your attention | `needsAttention.length === 0` | Inside the panel, keeping its header and `View all`: `py-10 text-center`, `font-nebula-ui text-[13px] text-zinc-400` — "Nothing needs your attention right now." + a second line at `text-[12px] text-zinc-500` — "All your open deals are delivered or paid." |
| Recent ideas | `recentIdeas.length === 0` | Under the group label, on the hairline: `py-6 text-[12.5px] text-zinc-500` — "No ideas captured yet." + inline orange link "Capture one" → `/ideas?new=1` |
| This week | `!youtubeConnected \|\| channelStats.length === 0` | Group label, then `py-5`: `text-[12.5px] text-zinc-400` — "Connect YouTube to see your performance here." (locked copy) + `ConsoleButton` **ghost** → `/settings` "Connect YouTube". No `ShinyCTA` — this is a secondary ask. |

The existing gates are unchanged. Metric strip values always render, showing `0` where appropriate.

### 8.3 Loading — `app/(app)/dashboard/loading.tsx` (**new file**, pure presentation)

The page is a server component doing five awaited queries, so Next's `loading.tsx` is the correct
hook. The route currently has none.

Render the **real** `ConsoleHeader` chrome (eyebrow `Dashboard`, title `Dashboard`, no name, no
description, no capture pills) so the frame does not jump, then skeletons that mirror the real
layout exactly:

- Metric strip: 3 cells — `h-2.5 w-16 rounded-[6px]` label bar + `mt-2 h-6 w-20 rounded-[6px]` value bar.
- Queue: the real `ConsolePanel` chrome + header text, then 5 rows of
  `h-8 w-8 rounded-[8px]` monogram block + `h-3 w-[38%] rounded-[6px]` name bar +
  `mt-2 h-2.5 w-[22%] rounded-[6px]` meta bar.
- Context column: 2 group labels + 3 title bars + one `h-8 w-full rounded-[6px]` sparkline block.

All bars carry `.console-skeleton`. **Widths are fixed percentages** — randomised widths shimmer
differently on every load and read as instability. Wrap in
`<div role="status" aria-busy="true"><span class="sr-only">Loading dashboard</span>…</div>`.

### 8.4 Error — `app/(app)/error.tsx` (**new file**, group-level, client boundary)

Group-level rather than route-level so all nine screens inherit it in one place.

```html
<ConsoleHeader title="Something went wrong" />
<main class="console-scroll min-h-0 flex-1 overflow-y-auto">
  <div role="alert" class="mx-auto max-w-[30rem] py-16 text-center">
    <p class="font-nebula-ui text-[14px] leading-relaxed text-zinc-400">
      We couldn't load this screen. Nothing was lost — try again.</p>
    <div class="mt-7 flex items-center justify-center gap-3">
      <ConsoleButton variant="ghost" onClick={reset}>Try again</ConsoleButton>
      <a href="/dashboard" class="… h-10 … text-zinc-400 hover:text-white {FOCUS}">Go to dashboard</a>
    </div>
    {process.env.NODE_ENV !== 'production' && (
      <pre class="console-scroll mt-8 max-h-40 overflow-auto rounded-[10px] border border-white/[0.08]
                  bg-black/50 p-4 text-left font-nebula-mono text-[11px] text-zinc-500">{error.message}</pre>)}
  </div>
</main>
```

No red slab. A failed load is recoverable; a red alarm surface on a black screen at 6am is
disproportionate. `error.message` and `error.digest` are **never** rendered in production — a raw
error string can leak query shape.

Note: the queries themselves swallow failures (`getIntegrations` returns `[]` on error,
`queries.ts:106`; every query returns `[]` on no-user or no-client), so this boundary catches
render and auth faults, not data faults. Degraded data therefore surfaces as the §8.2 empty states,
which is correct.

### 8.5 Dense / populated

| Risk | Handling |
|---|---|
| Long brand name ("Nordfeld Outdoor Equipment Co.") | grid cell is `min-w-0`, name `truncate`. Never wraps. |
| Long deliverables string | meta line `truncate`. |
| Paragraph pasted into an idea title | `line-clamp-2`. |
| Large revenue | `formatMoney` compact at ≥ 100,000 (`$1.3M`), full value in `title`. |
| Long email in the rail account block | `truncate` inside a `min-w-0` flex child; full value in `title`. |
| `rate_amount_cents === null` | `—` in `text-zinc-500`, never `$0`. |
| `brand_name === null` | `Untitled deal` — existing fallback, unchanged. |
| `deal.status === 'lost'` | `DEAL_STAGE_LABEL` has **no `lost` key** (confirmed). `needsAttention` filters `lost` out so it cannot reach this screen today, but every lookup must be written `DEAL_STAGE_LABEL[deal.status] ?? 'Lost'` so Group 2 does not ship `undefined`. |
| More than 5 attention deals | already capped by the existing `.slice(0, 5)`; the count tag shows the true `needsAttention` length and the panel footer surfaces the remainder. |
| `< 2` channel-stat rows | flat `<line>`, no path. |
| Very tall viewport | panel and groups do not stretch; the content column is top-aligned and the console ground fills the remainder. No stretched empty cards. |

---

## 9. Accessibility — the floor, restated as acceptance criteria

- **Skip link** — first tabbable node in the shell, targeting `#console-main`:
  `sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[9999px]
  focus:bg-orange-500 focus:px-4 focus:py-2 focus:font-nebula-ui focus:text-[13px] focus:text-white`.
  (This also closes a P2 left open by `UX_REVIEW_HOME.md` §7 — do not reintroduce the gap here.)
- **Landmarks** — `<nav aria-label="Primary">` on the rail and on the drawer's nav (only one is in
  the a11y tree at a time via `hidden md:flex` / `md:hidden`), `<header>`, `<main id="console-main">`,
  `<section aria-labelledby>` per region with the heading carrying the id.
- **Heading order** — exactly one `<h1>` per screen, in `ConsoleHeader`. `<h2>` per panel/group. No
  skipped levels.
- **`aria-current="page"`** on the active rail row and the active drawer row.
- **Focus ring** on every interactive element, using only the two strings in §3.6. Verify visibly on
  both grounds: `#060607` (rail) and `#0a0a0b` (pane).
- **Touch targets ≥ 40px** — nav rows 40, drawer rows 48, queue rows 56, context rows 52, capture
  pills 40×40, icon buttons 40×40. Inline links inside dense rows use the
  `relative after:absolute after:inset-x-0 after:-inset-y-3 after:content-['']` extender rather than
  growing the row (the Home page's own pattern — `UX_REVIEW_HOME.md` §3 item 6 fixed 20 targets this
  way; do not regress it).
- **Icon-only controls carry `aria-label`** — hamburger, drawer close, sign-out, capture pills below `sm`.
- **Decorative layers `aria-hidden`** — grain, radial glow, all `.console-rule-*`, the spine, the
  urgency tick, the sparkline halo, the chevron, the eyebrow diamond, the mark.
- **Colour is never the only signal** — urgency is the word "Overdue"/"Due today", not just an orange
  tick; stage is a word in a tag, not a hue; the count is a number, not a dot.
- **Contrast** — `text-zinc-600` banned for meaningful text (§3.4). Minimum text colour `zinc-500`.
- **Reduced motion** — every animation in §7 has a stated degradation; new class names go into the
  media block in §11.
- **No horizontal overflow at 320px** — verified per §4.5. Test method must exclude elements inside
  an `overflow-hidden` ancestor, per `UX_REVIEW_HOME.md` §4; a plain "does the page scroll sideways"
  check missed a clipped primary CTA last time.
- **Tab order** — skip link → rail (mark, nav, account) → header actions → queue → context column.
- **Drawer** — `role="dialog" aria-modal="true"`, focus trap, `Escape`, focus restored to the
  hamburger, `aria-expanded` on the hamburger.

---

## 10. Struck from the proposals

### From Design A

| # | Struck | Reason |
|---|---|---|
| A-1 | The permanent 84px icon spine, its 10px mono nav labels, and the `Automations` → `Autos` shortening | Nav labels at 10px in `zinc-600` (~2.9:1) breach the contrast floor; 10px uppercase mono is below comfortable reading for a primary navigation label; and needing to abbreviate a destination to make geometry work is a design failure, not a trade-off. Regresses `UX_REVIEW_HOME.md`'s 4/4 on *Recognition over recall*. |
| A-2 | The mobile bottom tab bar and `MoreSheet` | Second nav model + second dialog surface for nine screens; permanent 64px occlusion over the kanban drag zone and split-editor action bar; behaviour change to a surface brief §2a says already has mobile fixes. The "5 × 64px = 320px exactly" fit has zero tolerance for any locale, font-fallback, or safe-area variance. |
| A-3 | The `LedgerCard` hero (2.5rem mega-card with grain, bloom, and a welded action rail) | Does not generalise: eight of nine screens have no ledger, so the shell language would have one hero screen and eight plain ones. `2.5rem` and grain are marketing-tier devices; the effects budget (§3.7) allows one grain surface and it is the shell atmosphere. |
| A-4 | The attention count's `animate-ping` dot | An infinite animation permanently adjacent to a number the user is trying to read. The count *is* the signal; a pulsing ring adds nothing and violates the zero-infinite-animation rule. |
| A-5 | Sparkline `stroke-dasharray` draw-on | A line that draws itself withholds, for 900ms, the exact trend the user opened the screen to read. |
| A-6 | `NebulaReveal` staggered entrance on the data regions (`nebula-reveal--console`, 0→240ms stagger) | Restrained, but still a per-visit delay on the primary job, and the stagger makes the last region arrive last when all four are equally important. Replaced by one 240ms pane-level opacity fade. |
| A-7 | The per-route section counter (`01 /`, `02 /` …) | Implies an ordinal sequence through nine screens that does not exist and that the user never navigates. Decorative marketing device with a semantic cost. |
| A-8 | The six-hue stage chip ramp (orange for `negotiating`/`contracted`, emerald for `paid`, greys elsewhere) and the matching idea-status ramp | Spends a single-accent palette on a dimension the user is not asked to act on, and dilutes the one meaning orange carries in-app. Tags are monochrome (§3.4). |
| A-9 | The sticky frosted header (`bg-black/72 backdrop-blur-xl`) and the "two `backdrop-filter` owners" budget | Superseded by the non-sticky frame, which makes the count zero and the Chromium nesting bug structurally impossible rather than a standing review item. |
| A-10 | The inline `/ideas?new=1` link inside the empty-state sentence | Duplicates the primary CTA's destination two lines above it. |

### From Design B

| # | Struck | Reason |
|---|---|---|
| B-1 | The travelling rail spine with hard-coded `ROW/GAP/PAD/DIVIDER/STEP` arithmetic | Breaks silently the moment a nav item is added, the divider margin changes, a font metric shifts, or the nav scrolls — and it renders in the wrong place rather than not at all. Replaced by a spine rendered inside the active row (§4.2): same look, zero maths, cross-fade instead of travel. |
| B-2 | Solid `border-b border-white/[0.055]` row separators, and the argued DESIGN.md exception for them | Ruling 6: rows get no separators. The inset rounded hover plate plus the 56px rhythm does the work, the DESIGN.md exception becomes unnecessary, and the `::before` collision risk disappears. |
| B-3 | `text-zinc-600` on idea status tags (`§6.2`) and as the `—` null placeholder | ~2.9:1 on the console ground. The idea's status is information, not decoration. Raised to `zinc-400` / `zinc-500` (§3.4). |
| B-4 | `formatMoney(revenueMtdCents)` | Unit error — `revenueMtd` in `dashboard/page.tsx:47-49` is already divided by 100. Corrected in §6.2. |
| B-5 | `h-screen` on the shell root; the `xl` bezel threshold; `w-[248px]` rail at `xl`; the `lg` queue-row 5-track grid | `h-screen` leaves a dead strip under mobile browser chrome → `h-[100dvh]`. Bezel lowered to `lg` so the frame exists on ordinary laptops. Rail capped at `w-[236px]` — it is an instrument, not a container. Queue 5-track moved to `xl` because at 1024 the queue column is only ~372px. |

### Struck from both

| Struck | Reason |
|---|---|
| "Good morning" | Hard-coded, server-rendered in UTC, `profiles.timezone` never consulted. Both proposals independently flagged it; both are right. |
| Week-over-week delta chips | `getChannelStats(7)` cannot support a WoW comparison. Fabricating one would breach PRODUCT.md's no-fabricated-evidence rule. Both correctly refused; recorded here so nobody adds it back "to fill the space". |
| Any pricing surface, link, or CTA | None exists in the console and none is added. PRODUCT.md is absolute. |

---

## 11. CSS to append to `app/globals.css`

Append **below** the existing Nebula layer (which currently ends at line 758). Nothing above line
484 is touched. Scoped to `.nebula-console`, never `:root`.

```css
/* ============================================================================
   NEBULA CONSOLE — in-app tier (Group 1 decision). Same system, denser scale.
   Depth here comes from a brightness ladder on a solid ground, not from blur:
   there is deliberately NO backdrop-filter anywhere under app/(app)/ except
   the mobile drawer scrim, whose child panel is opaque.
   ========================================================================= */

.nebula-console {
  --console-bezel:       #000000;
  --console-frame:       #0a0a0b;
  --console-rail:        #060607;
  --console-panel:       rgba(255,255,255,0.025);
  --console-panel-hover: rgba(255,255,255,0.045);
  --console-hair:        rgba(255,255,255,0.06);
  --console-hair-2:      rgba(255,255,255,0.10);
  --console-ink:         #f4f4f5;
  --console-dim:         #a1a1aa;
  --console-faint:       #71717a;
  --console-accent:      #ea580c;
  --console-accent-2:    #fb923c;
  --console-pos:         #34d399;
  --console-neg:         #fb7185;
}

/* Faded structural hairlines. Honours DESIGN.md's "no solid borders" for
   internal rules without asking a 5-row list to wear mask-composite. */
.console-rule-x {
  height: 1px; width: 100%;
  background: linear-gradient(to right, transparent, var(--console-hair-2) 12%,
              var(--console-hair-2) 88%, transparent);
}
.console-rule-y {
  width: 1px; align-self: stretch;
  background: linear-gradient(to bottom, transparent, var(--console-hair-2) 18%,
              var(--console-hair-2) 82%, transparent);
}

/* Scrollbars. The global token layer is light-mode; UA defaults look broken on #0a0a0b. */
.console-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.14) transparent; }
.console-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
.console-scroll::-webkit-scrollbar-track { background: transparent; }
.console-scroll::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.12); border-radius: 9999px;
  border: 3px solid transparent; background-clip: content-box;
}
.console-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.22); background-clip: content-box;
}

/* The single content-pane entrance. Opacity only — no transform, no blur, no stagger. */
@keyframes consoleFade { from { opacity: 0; } to { opacity: 1; } }
.console-fade { animation: consoleFade 240ms cubic-bezier(0.16, 1, 0.3, 1) both; }

/* Skeleton sweep. */
@keyframes consoleSkel { 0% { background-position: -160% 0; } 100% { background-position: 260% 0; } }
.console-skeleton {
  background: linear-gradient(90deg,
    rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%);
  background-size: 220% 100%;
  animation: consoleSkel 1.6s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .console-fade,
  .console-skeleton { animation: none !important; }
  .console-fade     { opacity: 1 !important; }
  .console-skeleton { background: rgba(255, 255, 255, 0.06); }
  .console-nudge,
  .console-drawer   { transition: none !important; }
}
```

Also add `.console-fade`, `.console-skeleton`, `.console-nudge` and `.console-drawer` to the
**existing** kill-switch selector list at `globals.css:599-610`, so there is one place to audit
rather than two. (The block above is belt-and-braces; the existing list is the canonical one.)

---

## 12. File map

| File | Change |
|---|---|
| `app/(app)/layout.tsx` | Replace the `bg-linen` flex wrapper with the console shell (§4.1). Add `export const viewport = { colorScheme: 'dark', themeColor: '#000000' }`. Auth guard, `getCurrentProfile()`, `getAuthenticatedUser()` and the `Promise.all` are **untouched**. |
| `app/(app)/dashboard/page.tsx` | **Markup only.** All five `Promise.all` queries and every derived value (`youtubeConnected`, `weekViews`, `weekSubsGained`, `latestSubs`, `openDeals`, `revenueMtd`, `ideasInProgress`, `needsAttention`, `recentIdeas`, `hasAnyData`) stay byte-identical. Both label maps stay. Add only `paidCount` (a `.length` of an existing filter) and the pure `dueMeta` / `formatMoney` helpers. |
| `app/(app)/dashboard/loading.tsx` | **New.** Pure presentation. |
| `app/(app)/error.tsx` | **New.** Client boundary, group-level. |
| `app/globals.css` | Append §11 below line 758; extend the kill-switch list at 599-610. Nothing above line 484 changes. |
| `components/console/*` | New. |
| `components/app/AppSidebar.tsx` | No longer imported by `(app)/layout.tsx`. **Leave the file on disk** until Groups 2–5 have migrated; delete in Group 6. |
| `components/ui/logo.tsx` | **Do not touch in Group 1.** See risk 2. |
| `app/layout.tsx` | **Do not touch in Group 1.** See risk 1. |

---

## 13. Risks for the implementer

1. **Root layout is still light, and the nested `viewport` export only half-fixes it.**
   `app/layout.tsx:60-63` sets `colorScheme: 'light'` / `themeColor: '#FFFFFF'` and line 73 puts
   `bg-linen` on `<html>`. The route-group `viewport` export in §4.1 fixes native control and
   browser-UI colour for `(app)` routes. It does **not** remove `bg-linen` from `<html>`, so a white
   overscroll gutter can still flash during navigation. Mitigations already specced: `overscroll-none`
   on the shell root, `overscroll-contain` on the pane. **Do not remove `bg-linen` in Group 1** — the
   still-Swiss auth and marketing routes depend on it. Group 6 owns that one-line change.

2. **`components/ui/logo.tsx` hard-codes `#000000` on every path** — confirmed; it renders invisible
   on any dark surface. Group 1 routes around it with `ConsoleMark`. **Group 5 (auth) will hit the
   same wall**, as will any future dark surface. Decide it once, centrally, in Group 6: either give
   `Logo` a `tone?: 'ink' | 'inverse'` prop, or switch the fills to `currentColor` (visually
   near-identical on today's light surfaces, since they render it on near-black text colour) — but
   that is an application-code change to a component five other files import, and it is out of Group
   1's scope. Do not "fix it while you're in there."

3. **The demo YouTube integration is indistinguishable from a real one at the page level.**
   `scripts/seed-demo-data.ts:85-86` inserts an `integrations` row with `provider: 'youtube'` and
   `metadata: { demo: true }`, and the seeded `channel_stats_daily` numbers are explicitly "plausible,
   not real" (seed file header). `youtubeConnected` is therefore `true` in the demo account and the
   channel figures render as if live. **`IntegrationStatus` (`queries.ts:88-93`) does not expose
   `metadata`**, so the dashboard cannot detect this without a change to the `get-integrations` edge
   function — a data-flow change, out of re-skin scope. Group 1 ships the neutral `Last 7 days.`
   footnote (a window claim, not a provenance claim) and **files this as a P1 follow-up**: add a
   `demo: boolean` field to `IntegrationStatus`, populate it from `metadata.demo` in the edge
   function, and render a `Demo data` tag on the group heading. PRODUCT.md §2b requires it; it just
   cannot be satisfied honestly inside this group.

4. **"Connect Gmail" on the first-run empty state lands on an honestly-disabled control.**
   PRODUCT.md records that Settings correctly shows a disabled Connect state with a tooltip because
   no real OAuth credentials exist. The link is correct; do **not** make the empty state imply the
   connection will succeed, and do not add a "Connect Gmail" primary button that looks live.

5. **`DEAL_STAGE_LABEL` has no `lost` key** but `Deal['status']` includes `'lost'`
   (`types.ts:40`, added by `20260722120000_add_lost_deal_status.sql`). `needsAttention` filters it
   out so this screen is safe today. Write every lookup as
   `DEAL_STAGE_LABEL[deal.status] ?? 'Lost'` so Group 2's full `/deals` view does not ship
   `undefined` into the DOM.

6. **`due_date` is a date-only column and this page is server-rendered.** Use the UTC-only
   comparison in §6.3. A naive `new Date(due) < new Date()` is off by up to a day depending on server
   timezone — the same class of bug that made "Good morning" wrong.

7. **`preserveAspectRatio="none"` on the sparkline distorts stroke weight.**
   `vector-effect="non-scaling-stroke"` is not optional. Also give the gradient a `useId()`-derived
   id now, before a second sparkline lands in Group 3 and silently steals the fill.

8. **`.nebula-border` uses `::before`.** Never put it on an element that already owns `::before`
   (queue rows use `::before`-free absolute spans by design — keep it that way), and never nest it
   inside another `.nebula-border` element.

9. **Every `rounded-*` shorthand on this surface resolves to 2px.** `globals.css:70-76`. Grep the
   diff for `rounded-full|rounded-xl|rounded-2xl|rounded-3xl|rounded-lg|rounded-md|rounded-sm` under
   `components/console/` and `app/(app)/` before opening the PR. This has already shipped as a real
   defect once.

10. **CI guard worth adding with this group:** a grep that fails the build on
    `backdrop-blur` or `backdrop-filter` under `app/(app)/` and `components/console/`, with a single
    allowlisted line in `MobileNav.tsx`. Ruling 5 is only durable if it is enforced mechanically.

11. **Chrome budget.** §4.4 sets header + strip ≤ 200px at every breakpoint. Measure it during
    implementation at 375×667 and 1440×800. If a later screen's toolbar pushes past it, the strip is
    what gets dropped — not the title, and never by shrinking touch targets.

---

## 14. Acceptance checklist

- [ ] No horizontal scroll at 320, 375, 768, 1024, 1440 (method excludes `overflow-hidden` descendants).
- [ ] Zero `backdrop-filter` under `app/(app)/` except the one allowlisted drawer scrim.
- [ ] Zero `rounded-*` shorthands under `components/console/` and `app/(app)/`.
- [ ] Visible focus ring on every interactive element, checked on both `#060607` and `#0a0a0b`.
- [ ] `prefers-reduced-motion: reduce` leaves the screen fully readable, fully static, and with no
      element stuck at `opacity: 0`.
- [ ] All nine destinations reachable at 320px in one drawer open; focus trapped, `Escape` closes,
      focus returns to the hamburger.
- [ ] Deep links verified live: `/deals?new=1`, `/ideas?new=1`, `/drafts?new=1`, `/deals?deal=<id>`,
      `/ideas?open=<id>`.
- [ ] Sign-out still calls `signOut()` → `router.push('/')` → `router.refresh()` in that order.
- [ ] Every number carries `tabular-nums`.
- [ ] No text darker than `zinc-500` anywhere except a chevron stroke.
- [ ] Empty, loading, error and dense states all render for all three data regions.
- [ ] `tsc --noEmit` · `eslint` · `next build` · `vitest` · Playwright all pass on a cleared `.next`.
