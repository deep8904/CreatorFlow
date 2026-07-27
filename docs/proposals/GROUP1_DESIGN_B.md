# Group 1 — App shell + Dashboard · Design B ("The Console")

Independent proposal. Scope: `app/(app)/layout.tsx`, the sidebar, and
`app/(app)/dashboard/page.tsx`. Re-skin only — no data flow, query, action, or
route changes.

Copy is taken verbatim from `docs/DESIGN_BRIEF.md` §5 where it exists
("Needs your attention", "Recent ideas", "This week's performance", and the
empty-state sentence). New strings are marked `[new copy]` and match the
brief's tone rule.

---

## 0. The position (read this first — everything else follows from it)

### 0.1 Atmosphere is a property of the room, not the furniture

The Home page earns its theatricality: a visitor scrolls once, is persuaded, and
leaves. The dashboard is opened every day by someone who already bought in and
wants out in forty seconds. So the answer to "how much Nebula belongs here" is
not *less of everything* — that produces a beige dark-mode admin panel that
looks like a different product. It is: **apply the Nebula atmosphere exactly
once, at the shell, and make the interior flat.**

Concretely, this proposal spends the entire theatrical budget on a single
structure — a black outer bezel containing one inset, rounded, grain-and-glow
"console" — and then declares the interior a **flat surface zone**:

| Nebula device | Where it lives in-app | Why |
|---|---|---|
| Grain (`.nebula-grain`) | Once, on the shell atmosphere layer | Free (static), carries the world |
| Radial orange glow | Once, top of the shell, behind everything | Ditto |
| Gradient border (`.nebula-border`) | The console frame (≥1280) + the one dashboard panel | Structural, static |
| `2.5rem`/`1.5rem` radii | Console frame `1.75rem`, panel `1.5rem` | Shape vocabulary survives |
| Manrope / Inter / Geist Mono | Everywhere | The strongest carrier of identity, and free |
| `cubic-bezier(0.16, 1, 0.3, 1)` | Every transition | Free |
| Orange `#ea580c` / `#fb923c` | Active nav, urgency, one CTA | Free |
| **`backdrop-filter`** | **Nowhere** (one exception: mobile drawer scrim) | See 0.2 |
| **`nebula-reveal` staggered entrances** | **Nowhere in `app/(app)`** | See 0.3 |
| `.nebula-cta` (ShinyCTA) | **Exactly one place**: the first-run empty state | See 0.4 |
| `.nebula-marquee`, `.nebula-progressive-blur`, typewriter, ping/bounce/breathe | Nowhere | Persuade-only devices |

That table is the design. The rest of this document is its consequences.

### 0.2 Zero `backdrop-filter` in the app shell — by structure, not by vigilance

The brief's "never nest backdrop-filter" trap exists because the Home page has a
floating nav with content scrolling under it. **The console has no such
relationship.** The header is a real frame member in a flex column; nothing ever
passes behind it. So there is nothing to frost.

This is the single biggest reason to prefer the console frame over a
conventional sticky-glass top bar: the Chromium blanking bug becomes
*structurally impossible* rather than something a reviewer has to catch on
every future screen. The rule an engineer can grep for:

> **No `backdrop-blur-*` / `backdrop-filter` anywhere under `app/(app)/`.**
> The only permitted instance is the mobile drawer scrim, whose child panel is
> fully opaque (`bg-[#0b0b0c]`) and therefore not a nested-blur case.

Depth in-app comes from **stacked opacity on a black ground** instead — four
values, ascending inward (§3.1). It reads as depth, costs nothing, and never
blanks.

### 0.3 No entrance animation on data. Ever.

The current dashboard staggers its stat cards in (`RevealUp delay={0|1|2}`).
I am removing that, and I want to be explicit about why, because the existing
code comments defend it.

A marketing entrance is paid once by a visitor who has never seen the content.
A dashboard entrance is paid **every single visit, forever, by someone who
already knows what the numbers are and is trying to read them.** A 1s
`translateY(30px) + blur(8px)` on a revenue figure is, functionally, a
one-second delay on the primary job of the screen. Staggering it makes the third
number arrive last — and the third number is as important as the first.

Replacement: one `opacity 0→1` over 260ms on the content pane as a whole, no
transform, no blur, no stagger. It covers hydration jitter and reads as "the
screen turned on." Everything inside arrives together, in place, readable.

### 0.4 The KPI tile row is deleted

The reference dashboard (§4 of the brief) opens with a row of KPI stat tiles.
I am not building it. CreatorFlow's dashboard has **three** numbers, and there
is a whole `/analytics` screen for measurement. Three numbers in three
`2.5rem` glass cards spanning the full width is a costume: it dresses a
worklist as a NOC display and pushes the actual work — the deals that need a
reply — below the fold on a laptop.

Instead the three numbers become a **mono instrument strip inside the page
header**, on the header's own bottom hairline: label above, tabular figure
below, hairline-divided, ~72px tall total. Same information, one sixth of the
vertical budget, and it sits in the chrome where a returning user's eye already
goes for orientation.

That reclaims roughly 180px at the top of the page, which is spent on the queue.

### 0.5 One panel per view

The dashboard renders **exactly one card-shaped object**: the "Needs your
attention" queue. Recent ideas and This week's performance are rendered as
typography on the console ground — labelled hairline-separated groups, no
border, no fill. This is the brief's own "one primary metric per view" guidance
applied to layout rather than to metrics, and it is the opposite of the
reference's everything-is-a-tile grid.

The practical effect: the eye has a single target on load. There is no
tile-scanning phase.

---

## 1. Shell layout

### 1.1 Structure

```
app/(app)/layout.tsx  (server component — unchanged data: getCurrentProfile + getAuthenticatedUser)

<div class="nebula-console relative h-screen w-full overflow-hidden bg-black
            font-nebula-ui text-zinc-200 antialiased
            selection:bg-orange-500/30 selection:text-orange-200
            xl:p-3 2xl:p-4">

  ├── <a href="#console-main" class="skip-link">Skip to content</a>       ← new, a11y
  │
  ├── <div aria-hidden class="nebula-grain pointer-events-none absolute inset-0 z-0">   ← ATMOSPHERE, once
  │     <div class="absolute inset-x-0 top-0 h-[420px]
  │                 bg-[radial-gradient(ellipse_110%_70%_at_50%_-25%,rgba(234,88,12,0.10),transparent_62%)]" />
  │   </div>
  │
  └── <div class="console relative z-10 flex h-full overflow-hidden
                  bg-[#0a0a0b] xl:rounded-[1.75rem] xl:nebula-border">
        ├── <AppRail />          ← md+ persistent, 200/236/248px
        ├── <MobileRailDrawer /> ← below md, off-canvas
        └── <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
              ├── <MobileTopBar />   ← below md only, h-14, in normal flow
              └── {children}          ← page owns its ConsoleHeader + scroll pane
            </div>
      </div>
</div>
```

`--nebula-border-gradient` on `.console`:
`linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02) 45%, rgba(234,88,12,0.10))`

Two things to note against the current implementation:

- The existing `pt-14 md:pt-0` compensation for a `fixed` mobile bar is gone.
  The bar is now a flex child in normal flow, so nothing has to be padded around
  it. No capability lost; one class of layout bug removed.
- The layout no longer sets `bg-linen`. It sets its own black ground, exactly as
  `app/page.tsx` does, so the dark world stays self-contained.

### 1.2 Breakpoint behaviour

| Width | Bezel | Rail | Content pane | Header |
|---|---|---|---|---|
| **320–639** | none, `rounded-none` | off-canvas drawer (280px) + `h-14` top bar | `px-4`, single column | title stacked over actions; metric strip `grid-cols-3`, 9px labels |
| **640–767** | none | off-canvas drawer | `px-6` | same, 10px labels |
| **768–1023** | none | persistent `w-[200px]` | `px-6`, single column (context rail stacks below the queue) | title left / actions right |
| **1024–1279** | none | persistent `w-[236px]` | `px-8`, `grid-cols-[minmax(0,1fr)_300px] gap-8` | title / actions on one line, metrics on the hairline below |
| **1280–1535** | `p-3`, `rounded-[1.75rem]`, gradient border | `w-[248px]` | content `max-w-[1240px]` centred | as above |
| **≥1536** | `p-4` | `w-[248px]` | `max-w-[1320px]`, context rail `320px` | as above |

**320px overflow guard.** Every horizontal container in this design is
`min-w-0` + `flex-wrap` or a `grid` with `minmax(0,1fr)` tracks. The two places
that can actually overflow, and their fixes:

1. Metric values (`$1,284,000` at 24px is ~105px, cell is ~84px at 320).
   Fix: value cell is `min-w-0 truncate`, base size `text-[16px]`, and
   `formatMoney()` switches to `Intl` compact notation at ≥ 100,000.
2. Long brand names in queue rows. Fix: name cell `min-w-0` + `truncate`.

### 1.3 Why the rail does not collapse

The reference sidebar collapses to icon-only. I am rejecting that.

Collapse solves horizontal pressure — it exists for apps where a wide data grid
fights a wide nav. CreatorFlow has nine destinations and, in Group 1, no
horizontally-pressured screen. What collapse *costs* is real: an icon-only rail
makes every destination depend on icon literacy, and literacy never builds in a
tool opened a few times a week. Six of the nine icons here (Deals/Ideas/Drafts/
Repurpose/Automations/Analytics) are mutually confusable at 16px.

So: **always labelled, never collapsible.** The rail is instead made *narrow and
typographically dense* (200–248px, 13px rows, 40px tall) so it costs less
without costing legibility. If Group 2's kanban needs the width, it can opt into
a full-bleed pane on its own screen — that is a per-screen decision, not a
persistent chrome control the user has to manage.

---

## 2. Component inventory

New files under `components/app/`. Old `AppSidebar.tsx` is replaced (its logic —
pathname matching, mobile open state, `signOut` + `router.push('/')` +
`router.refresh()` — is carried over verbatim).

| Component | File | Client? | Props | Built on |
|---|---|---|---|---|
| `AppRail` | `components/app/AppRail.tsx` | yes | `{ name: string; email: string }` | new; `.console-rule-x`, `RailSpine` |
| `RailNav` | (inside `AppRail.tsx`) | — | `{ items, activeHref }` | plain `<ul>` + `<Link>` |
| `RailSpine` | (inside `AppRail.tsx`) | — | `{ offset: number \| null }` | plain span, `transform` only |
| `RailAccount` | (inside `AppRail.tsx`) | — | `{ name, email }` | `Monogram` |
| `MobileTopBar` | `components/app/MobileRail.tsx` | yes | `{ onOpen }` | — |
| `MobileRailDrawer` | `components/app/MobileRail.tsx` | yes | `{ open, onClose, children }` | `role="dialog"` + focus trap |
| `ConsoleHeader` | `components/app/ConsoleHeader.tsx` | no | `{ eyebrow?, title, description?, actions?: ReactNode, metrics?: ReactNode }` | — |
| `MetricStrip` / `Metric` | `components/app/MetricStrip.tsx` | no | `Metric: { label, value, hint? }` | `<dl>/<dt>/<dd>` |
| `CapturePills` | `components/app/CapturePills.tsx` | no | `{ items: {label, href, icon, srLabel}[] }` | `<Link>` — **carries the deep links** |
| `ConsolePanel` | `components/app/ConsolePanel.tsx` | no | `{ title, count?, action?: {label,href}, padding?: 'none'\|'md', children }` | `.nebula-border` |
| `QueueRow` | `components/app/QueueRow.tsx` | no | `{ href, name, meta, value?, tag, urgency?: 'overdue'\|'soon'\|null }` | `<li><Link>` |
| `RailGroup` / `RailListItem` | `components/app/RailGroup.tsx` | no | `{ label, action?, children }` | no card — hairlines only |
| `Sparkline` | `components/app/Sparkline.tsx` | no | `{ values: number[]; label: string }` | inline SVG |
| `StageTag` | `components/app/StageTag.tsx` | no | `{ children, tone?: 'neutral' \| 'accent' }` | — |
| `Monogram` | `components/app/Monogram.tsx` | no | `{ name: string; size?: 28 \| 36 }` | replaces `ui/avatar` on dark |
| `ConsoleEmpty` | `components/app/ConsoleEmpty.tsx` | no | `{ title, body, primary?, secondary? }` | optional `ShinyCTA` |
| `ConsoleSkeleton` | `components/app/ConsoleSkeleton.tsx` | no | `{ rows?: number }` | — |

**Not used on this surface** (they belong to the old Swiss token layer and are
still imported by Groups 2–5 — do not delete them yet):
`components/ui/card`, `components/ui/empty-state`, `components/ui/avatar`,
`components/ui/button`, `components/editorial/RevealUp`,
`components/editorial/MetricCounter`, `components/editorial/DotGrid`,
and the `.app-container` / `.text-app-h1` / `.font-label` utilities.

---

## 3. Concrete styling

### 3.1 Tokens

Add to `app/globals.css` in a new `NEBULA CONSOLE` block **after** the existing
Nebula layer. Scoped to `.nebula-console`, never `:root`, so the old Swiss token
layer is untouched:

```css
.nebula-console {
  --console-bezel:      #000000;
  --console-frame:      #0a0a0b;   /* the inset console ground              */
  --console-rail:       #060607;   /* rail — darker than the pane           */
  --console-panel:      rgba(255,255,255,0.025);
  --console-panel-hover:rgba(255,255,255,0.045);
  --console-hair:       rgba(255,255,255,0.06);
  --console-hair-2:     rgba(255,255,255,0.10);
  --console-ink:        #f4f4f5;   /* zinc-100  — primary                   */
  --console-dim:        #a1a1aa;   /* zinc-400  — secondary                 */
  --console-faint:      #71717a;   /* zinc-500  — labels, tertiary          */
  --console-accent:     #ea580c;
  --console-accent-2:   #fb923c;
  --console-pos:        #34d399;   /* emerald-400 — up only                 */
  --console-neg:        #fb7185;   /* rose-400   — down only                */
}
```

Brightness ladder, ascending inward — this is what replaces blur as the depth
mechanism: bezel `#000` → rail `#060607` → pane `#0a0a0b` → panel
`+2.5% white` → row hover `+4.5% white`.

**Radius rule for this surface: every radius is an arbitrary value.** The global
`--radius-*` scale still serves the old system (`--radius-full: 2px`), so
`rounded-full` / `rounded-xl` / `rounded-lg` are banned here. Vocabulary:
`rounded-[1.75rem]` console · `rounded-[1.5rem]` panel · `rounded-[10px]` nav
row & buttons · `rounded-[8px]` monogram/mark · `rounded-[6px]` skeleton bars ·
`rounded-[4px]` tags · `rounded-[2px]` spine · `rounded-[9999px]` pills.

### 3.2 Type scale

| Role | Class string |
|---|---|
| Page title (H1) | `font-nebula-heading text-[22px] md:text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-white` |
| Eyebrow | `font-nebula-mono text-[10px] font-medium uppercase tracking-[0.2em] text-orange-400/85` |
| Page description | `font-nebula-ui text-[13.5px] leading-relaxed text-zinc-400` |
| Panel title | `font-nebula-heading text-[14px] font-semibold tracking-[-0.01em] text-zinc-100` |
| Section label (rail groups, metric labels) | `font-nebula-mono text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500` |
| Metric value | `font-nebula-heading text-[16px] sm:text-[20px] lg:text-[24px] font-semibold tabular-nums tracking-[-0.03em] text-white` |
| Metric hint | `font-nebula-ui text-[11px] text-zinc-500` |
| Row primary | `font-nebula-ui text-[13.5px] font-medium tracking-[-0.01em] text-zinc-100` |
| Row secondary | `font-nebula-ui text-[12px] text-zinc-500` |
| Row value (money) | `font-nebula-heading text-[13px] font-semibold tabular-nums text-zinc-200` |
| Nav row | `font-nebula-ui text-[13px] font-medium tracking-[-0.01em]` |
| Tag / chip | `font-nebula-mono text-[10px] font-medium uppercase tracking-[0.14em]` |
| Inline link | `font-nebula-ui text-[12px] font-medium text-orange-400 hover:text-orange-300` |

Division of labour: **Manrope** = anything that is a title or a number (it has
the tightest tracking and real weight range). **Inter** = anything you read as a
sentence or a list item. **Geist Mono** = anything that is a label, tag, or
system state. Geist Sans is unused in-app (its slot on Home is buttons; in-app
buttons are Inter, because they sit in sentence-shaped UI).

### 3.3 Focus, hover, and touch — one string each

```
FOCUS (on the pane, #0a0a0b ground):
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70
  focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0b]

FOCUS (on the rail, #060607 ground):
  ... focus-visible:ring-offset-[#060607]

FOCUS (inside an overflow-hidden panel — no offset, ring must stay in bounds):
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset
  focus-visible:ring-orange-500/70

HOVER TRANSITION (everywhere):
  transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
```

Touch targets: nav rows `h-10` (40px) desktop / `h-12` (48px) in the drawer;
queue rows `min-h-[3.5rem]`; capture buttons `h-10 min-w-[40px]`; icon buttons
`h-10 w-10`. Inline text links inside dense rows get
`relative after:absolute after:inset-x-0 after:-inset-y-3 after:content-['']`
(the Home page's own extender pattern) rather than growing the row.

### 3.4 Hairlines vs gradient borders

DESIGN.md says "don't use solid borders." My reading, stated plainly so the
reviewer can overrule it: that rule governs the **outline of an elevated
surface** — a card must not have a flat 1px stroke, it gets `.nebula-border`.
It cannot sensibly govern **internal rules and row separators** in a data-dense
product; 5 list rows each wearing a mask-composite pseudo-element is absurd, and
the `::before` would collide with row hover states.

Policy:

- **Surface outlines** → `.nebula-border` + a per-element
  `--nebula-border-gradient`. Used on: the console frame, `ConsolePanel`.
- **Structural dividers** (rail group divider, header/metric-strip rules,
  metric cell dividers) → `.console-rule-x` / `.console-rule-y`, a 1px gradient
  hairline that **fades at both ends**. This honours the spirit and looks
  better than a full-bleed stroke:

```css
.console-rule-x { height:1px; width:100%;
  background: linear-gradient(to right, transparent, var(--console-hair-2) 12%,
              var(--console-hair-2) 88%, transparent); }
.console-rule-y { width:1px; align-self:stretch;
  background: linear-gradient(to bottom, transparent, var(--console-hair-2) 18%,
              var(--console-hair-2) 82%, transparent); }
```

- **Repeating row separators** → plain `border-t border-white/[0.055]`. Called
  out here as a deliberate, argued exception.

### 3.5 Scrollbars

The global layer is light-mode; default scrollbars on `#0a0a0b` look broken.

```css
.console-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.14) transparent; }
.console-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
.console-scroll::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.12); border-radius: 9999px;
  border: 3px solid transparent; background-clip: content-box; }
.console-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.22); background-clip: content-box; }
.console-scroll::-webkit-scrollbar-track { background: transparent; }
```

Applied to the rail nav and the content pane.

---

## 4. The rail (sidebar)

```html
<aside class="hidden md:flex w-[200px] lg:w-[236px] xl:w-[248px] shrink-0 flex-col
              border-r border-white/[0.06] bg-[#060607]">

  <!-- Mark: identical construction to the Home nav's mark, deliberately -->
  <div class="flex h-14 shrink-0 items-center gap-2.5 px-4">
    <a href="/" class="group flex items-center gap-2.5 rounded-[8px] focus-visible:…">
      <span aria-hidden class="grid h-6 w-6 place-items-center rounded-[8px]
              bg-gradient-to-br from-orange-500 to-orange-700
              font-nebula-tech text-[11px] font-bold text-white
              shadow-[0_0_16px_-4px_rgba(234,88,12,0.7)]">F</span>
      <span class="font-nebula-heading text-[15px] font-semibold tracking-[-0.02em] text-white">
        CreatorFlow</span>
    </a>
  </div>
  <div aria-hidden class="console-rule-x" />

  <nav aria-label="Primary" class="console-scroll relative min-h-0 flex-1 overflow-y-auto px-3 py-3">
    <RailSpine offset={…} />
    <ul class="flex flex-col gap-[2px]"> … 7 primary … </ul>
    <div aria-hidden class="console-rule-x my-3" />
    <ul class="flex flex-col gap-[2px]"> … Team, Settings … </ul>
  </nav>

  <div aria-hidden class="console-rule-x" />
  <RailAccount />
</aside>
```

**Nav row** (`<li><Link>`), 40px, identical for both groups:

```
group relative flex h-10 items-center gap-2.5 rounded-[10px] px-3
font-nebula-ui text-[13px] font-medium tracking-[-0.01em]
transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70
focus-visible:ring-offset-2 focus-visible:ring-offset-[#060607]

inactive:  text-zinc-400 hover:bg-white/[0.04] hover:text-white
active:    bg-white/[0.055] text-white          + aria-current="page"

icon (lucide, size 16, strokeWidth 1.75):
  inactive: text-zinc-500 group-hover:text-zinc-300
  active:   text-orange-400
```

Active state is deliberately **not** a filled/branded pill. Nine filled pills in
a 248px column reads as a toolbar. A 5.5%-white plate plus an orange icon is
enough contrast at this density, and it leaves the orange to do one job.

### 4.1 The spine — the shell's one piece of delight

A 24×2px orange bar living on the rail's left edge that **slides** to the active
row. It is the only motion in the chrome, it is transform-only, and it gives the
rail a sense of memory.

```html
<span aria-hidden
  class="rail-spine pointer-events-none absolute left-[-12px] top-0 h-6 w-[2px]
         rounded-[2px] bg-orange-500 shadow-[0_0_12px_rgba(234,88,12,0.85)]"
  style={{ transform: `translateY(${offset}px)`, opacity: offset === null ? 0 : 1 }} />
```

Offset is deterministic from the nav arrays — no measurement, no refs, no
layout effect:

```ts
const ROW = 40, GAP = 2, PAD = 12, SPINE = 24
const STEP = ROW + GAP                              // 42
const DIVIDER = 25                                  // my-3 (12+12) + 1px rule
const GROUP_2 = primaryNav.length * STEP - GAP + DIVIDER   // 292 + 25 = 317

function spineOffset(i: number, secondary: boolean) {
  return PAD + (secondary ? GROUP_2 : 0) + i * STEP + (ROW - SPINE) / 2
}
// primary[0]   → 20      secondary[0] → 337
```

`.rail-spine { transition: transform 420ms cubic-bezier(0.16,1,0.3,1), opacity 200ms linear; }`
Killed under reduced motion (§7) — it then simply appears at the right place.
`left-[-12px]` cancels the nav's `px-3` so the bar sits on the rail's own border.
Because it lives inside the scrolling `<nav>`, it scrolls with the list, which
is correct.

### 4.2 Account block (bottom)

```html
<div class="flex h-16 shrink-0 items-center gap-2.5 px-3">
  <Monogram name={name} size={28} />
  <div class="min-w-0 flex-1">
    <p class="truncate font-nebula-ui text-[12.5px] font-medium tracking-[-0.01em] text-zinc-200">{name}</p>
    <p class="truncate font-nebula-mono text-[10.5px] text-zinc-500">{email}</p>
  </div>
  <button aria-label="Sign out" title="Sign out"
    class="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] text-zinc-500
           transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
           hover:bg-white/[0.05] hover:text-zinc-200 focus-visible:… ">
    <LogOut size={15} />
  </button>
</div>
```

`Monogram`: `grid place-items-center rounded-[8px] bg-white/[0.07] ring-1
ring-inset ring-white/[0.08] font-nebula-mono text-[11px] font-medium uppercase
tracking-[0.06em] text-zinc-300` + initials from the name. Deterministic, no
image fetch, no colour-hash rainbow (single-accent system).

`signOut` handler is lifted from the existing `AppSidebar` unchanged.

### 4.3 Mobile (< 768px)

`MobileTopBar` — `h-14 shrink-0 flex items-center gap-3 px-4 border-b
border-white/[0.06] bg-[#060607]`: 40×40 hamburger (`aria-label="Open navigation
menu"`, `aria-expanded`, `aria-controls="app-drawer"`), then the mark + wordmark.

`MobileRailDrawer` — improvements over the current implementation, all additive:

- Scrim: `fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px]` (the one permitted
  blur; the panel above it is opaque, so no nesting).
- Panel: `fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] bg-[#0b0b0c]
  border-r border-white/[0.08] translate-x-0 / -translate-x-full`,
  `transition-transform duration-220 ease-[cubic-bezier(0.16,1,0.3,1)]`.
- `role="dialog" aria-modal="true" aria-label="Navigation"`; focus moves to the
  close button on open and returns to the hamburger on close; `Escape` closes;
  focus is trapped while open; `document.body` gets `overflow-hidden`.
- Nav rows inside the drawer are `h-12` (48px) with `text-[14px]`.
- The spine is hidden in the drawer (`offset={null}`) — at 48px rows the
  filled-plate active state is sufficient and the offset maths would need a
  second constant set for no gain.

---

## 5. `ConsoleHeader` and the instrument strip

The header is **owned by the page, not the layout.** This is what makes the
strip possible without touching data flow: the layout cannot receive page data,
but the dashboard page already has `deals`, `ideas`, `profile`, `channelStats`,
so it renders its own header and passes its own metrics in. Every later screen
gets the same contract and fills the slot with whatever it already fetched
(`/deals` → stage counts, `/ideas` → status counts, etc.), or passes nothing.

```html
<header class="shrink-0">
  <div class="mx-auto w-full max-w-[1240px] 2xl:max-w-[1320px] px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col gap-4 pb-5 pt-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
      <div class="min-w-0">
        <p class="mb-2 flex items-center gap-2 font-nebula-mono text-[10px] font-medium
                  uppercase tracking-[0.2em] text-orange-400/85">
          <span aria-hidden class="h-1 w-1 rotate-45 bg-orange-500" />   <!-- Home's marquee tick -->
          {eyebrow}
        </p>
        <h1 class="font-nebula-heading text-[22px] md:text-[26px] font-semibold
                   leading-[1.15] tracking-[-0.02em] text-white">{title}</h1>
        {description && <p class="mt-2 max-w-[52ch] font-nebula-ui text-[13.5px] leading-relaxed text-zinc-400">…</p>}
      </div>
      <div class="flex shrink-0 items-center gap-2">{actions}</div>
    </div>
  </div>
  {metrics && (
    <>
      <div aria-hidden class="console-rule-x" />
      <div class="mx-auto w-full max-w-[1240px] 2xl:max-w-[1320px] px-4 sm:px-6 lg:px-8">{metrics}</div>
      <div aria-hidden class="console-rule-x" />
    </>
  )}
</header>
```

Note the header sits **above** the scroll pane in the flex column, so it never
scrolls and never needs `position: sticky` — hence never needs frosting.

### 5.1 `MetricStrip`

```html
<dl class="grid grid-cols-3 py-3 sm:py-4">
  <!-- cell, repeated; the rule-y divider is rendered between cells -->
  <div class="relative min-w-0 px-3 first:pl-0 last:pr-0 sm:px-5">
    <div aria-hidden class="console-rule-y absolute inset-y-1 left-0 hidden [&:not(:first-child)]:block" />
    <dt class="truncate font-nebula-mono text-[9px] font-medium uppercase tracking-[0.12em]
               text-zinc-500 sm:text-[10px] sm:tracking-[0.18em]">Open deals</dt>
    <dd class="mt-1.5 truncate font-nebula-heading text-[16px] sm:text-[20px] lg:text-[24px]
               font-semibold tabular-nums tracking-[-0.03em] text-white">7</dd>
    <p class="mt-0.5 truncate font-nebula-ui text-[11px] text-zinc-500">of 12 total</p>
  </div>
</dl>
```

(In practice render the `console-rule-y` as a sibling `<div aria-hidden>` between
cells rather than the `[&:not(:first-child)]` selector — cleaner, and `<dl>`
tolerates the extra div in a `grid` if the divider is absolutely positioned.
Either is fine; the visual target is a faded vertical hairline between cells,
inset 4px top and bottom.)

Dashboard fills it with the three values the page **already computes**:

| Cell | Value | Hint |
|---|---|---|
| `Open deals` | `openDeals.length` | `of {deals.length} total` |
| `Revenue collected` ⚠️ | `formatMoney(revenueMtdCents)` | `across {paidCount} paid deals` |
| `Ideas captured` | `ideas.length` | `{ideasInProgress} in progress` |

⚠️ **Label change, flagged.** The existing label is "Revenue MTD" but the
computation is `deals.filter(d => d.status === 'paid').reduce(...)` — every paid
deal ever, with no date filter. Under `PRODUCT.md`'s no-fabricated-evidence rule
a metric whose label overstates what it measures is the same class of problem as
a fake testimonial. I am **not** changing the computation (out of scope); I am
relabelling it to `Revenue collected`, which is true of what is being summed.
If engineering would rather keep "MTD", the filter needs a
`created_at`/`updated_at` month bound — a logic change, and therefore a separate
decision.

### 5.2 `CapturePills` — the quick actions, preserved

The three deep links `/deals?new=1`, `/ideas?new=1`, `/drafts?new=1` move out of
the 3-card row and into the header action cluster as one segmented control. No
menu, no popover, no new client state — three plain `<Link>`s, so the deep
links behave identically to today.

```html
<div class="flex items-center rounded-[9999px] border border-white/[0.08] bg-white/[0.03] p-1">
  <!-- ×3 -->
  <a href="/deals?new=1" aria-label="Log a deal" title="Log a deal"
     class="group inline-flex h-10 min-w-[40px] items-center justify-center gap-2 rounded-[9999px] px-2.5 sm:px-3.5
            font-nebula-ui text-[12.5px] font-medium text-zinc-400
            transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
            hover:bg-white/[0.07] hover:text-white
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500/70">
    <Plus size={14} class="text-orange-400/80 group-hover:text-orange-400" />
    <span class="hidden sm:inline">Deal</span>
  </a>
  …
</div>
```

Below `sm`, labels drop and the three become 40×40 icon buttons with
`aria-label` + `title` — still direct links, still 40px targets, no behaviour
change. Total width at 320px: 3×40 + 8 padding = 128px, sits under the title on
its own line.

### 5.3 Dashboard header content

- eyebrow: `Dashboard`
- title: `Welcome back, {firstName}` `[new copy]`
- description: `{needsAttention.length} deals need a next step.` /
  `Nothing needs a next step right now.` `[new copy]` — derived from data
  already on the page, and it answers the brief's stated purpose ("one glance
  tells the creator what needs their attention today") in words, at the top.

The current `Good morning` eyebrow is dropped. It is hard-coded, server-rendered
in UTC, and `profiles.timezone` is not consulted — so it is wrong for a large
share of users a large share of the time. `Welcome back` is time-independent and
carries the same warmth.

---

## 6. Dashboard body

```html
<main id="console-main" class="console-scroll console-fade min-h-0 flex-1 overflow-y-auto">
  <div class="mx-auto w-full max-w-[1240px] 2xl:max-w-[1320px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_320px]">
      <section aria-labelledby="queue-h"> … the one panel … </section>
      <div class="flex flex-col gap-8"> … context rail groups … </div>
    </div>
  </div>
</main>
```

Below `lg` the context rail stacks under the queue — correct priority order on a
phone (what needs me → what I was thinking about → how the channel is doing).

### 6.1 "Needs your attention" — the one panel

```html
<div class="nebula-border relative overflow-hidden rounded-[1.5rem] bg-white/[0.025]"
     style="--nebula-border-gradient:
            linear-gradient(150deg, rgba(255,255,255,0.14), rgba(255,255,255,0.02) 55%, rgba(234,88,12,0.12))">

  <div class="flex h-[3.25rem] items-center justify-between gap-3 border-b border-white/[0.06] px-5">
    <div class="flex min-w-0 items-center gap-2.5">
      <h2 id="queue-h" class="font-nebula-heading text-[14px] font-semibold tracking-[-0.01em] text-zinc-100">
        Needs your attention</h2>
      <span class="rounded-[4px] bg-white/[0.07] px-1.5 py-0.5 font-nebula-mono text-[10px]
                   font-medium tabular-nums text-zinc-400">{needsAttention.length}</span>
    </div>
    <a href="/deals" class="relative shrink-0 after:absolute after:inset-x-0 after:-inset-y-3 after:content-['']
                            font-nebula-ui text-[12px] font-medium text-orange-400
                            transition-colors duration-150 hover:text-orange-300 focus-visible:…">View all</a>
  </div>

  <ul>
    <QueueRow ×5 />
  </ul>

  {openDeals.length > needsAttention.length && (
    <a href="/deals" class="flex h-11 items-center justify-center border-t border-white/[0.055]
                            font-nebula-ui text-[12px] font-medium text-zinc-500
                            transition-colors hover:bg-white/[0.03] hover:text-zinc-200 focus-visible:…">
      {openDeals.length - needsAttention.length} more open deals
    </a>)}
</div>
```

**`QueueRow`** — grid at `lg+`, stacked below:

```html
<li class="border-b border-white/[0.055] last:border-b-0">
  <a href={`/deals?deal=${deal.id}`}
     class="group relative grid min-h-[3.5rem] items-center gap-x-3 gap-y-1 px-5 py-3
            grid-cols-[2.25rem_minmax(0,1fr)_auto]
            lg:grid-cols-[2.25rem_minmax(0,1fr)_auto_6.5rem_1rem]
            transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
            hover:bg-white/[0.035]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500/70">

    <!-- urgency tick: only rendered when overdue/due-soon -->
    <span aria-hidden class="absolute inset-y-2 left-0 w-[2px] rounded-[2px] bg-orange-500" />

    <Monogram size={36} name={deal.brand_name ?? '?'} />

    <div class="min-w-0">
      <p class="truncate font-nebula-ui text-[13.5px] font-medium tracking-[-0.01em] text-zinc-100
                transition-colors group-hover:text-white">{deal.brand_name ?? 'Untitled deal'}</p>
      <p class="truncate font-nebula-ui text-[12px] text-zinc-500">
        {deal.deliverables ?? DEAL_STAGE_LABEL[deal.status]}
        {due && <> · <span class={overdue ? 'text-orange-400' : 'text-zinc-500'}>{dueLabel}</span></>}
      </p>
    </div>

    <span class="justify-self-end font-nebula-heading text-[13px] font-semibold tabular-nums text-zinc-200">
      {money}</span>

    <StageTag class="hidden lg:inline-flex">{DEAL_STAGE_LABEL[deal.status]}</StageTag>

    <ChevronRight size={14} aria-hidden
      class="console-nudge hidden lg:block text-zinc-600 transition-transform duration-200
             ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:text-zinc-400" />
  </a>
</li>
```

`StageTag`: `inline-flex items-center rounded-[4px] bg-white/[0.06] px-2 py-1
font-nebula-mono text-[10px] font-medium uppercase tracking-[0.14em]
text-zinc-400`.

**Colour discipline.** Stage tags are *deliberately monochrome*. In a
single-accent system, giving five stages five colours spends the whole palette
on a dimension the user is not being asked to act on. Orange is reserved for one
meaning throughout the app: **"this is where you are, or this wants you now."**
So orange appears on: the active nav row's icon and spine, the urgency tick and
due-date text, and the one CTA. Nothing else.

**`due_date` — flagged.** `getDeals()` already returns `due_date`; showing it is
presentation, not a data change. But it does introduce a computed notion
("overdue") the current page does not have, so I am calling it out. It is the
single strongest "what needs me today" signal available in the existing payload,
which is the entire brief for this screen. If the reviewer prefers zero new
derivations, drop the tick and the due fragment — the row still works, showing
`deliverables ?? stage`.

### 6.2 Context rail — no cards, hairlines only

```html
<!-- RailGroup -->
<section aria-labelledby="ideas-h">
  <div class="mb-1 flex items-center justify-between">
    <h2 id="ideas-h" class="font-nebula-mono text-[10px] font-medium uppercase
                            tracking-[0.18em] text-zinc-500">Recent ideas</h2>
    <a href="/ideas" class="relative after:absolute after:inset-x-0 after:-inset-y-3 after:content-['']
                            font-nebula-ui text-[11.5px] font-medium text-zinc-500
                            transition-colors hover:text-orange-400 focus-visible:…">View all</a>
  </div>
  <ul>
    <li class="border-t border-white/[0.055]">
      <a href={`/ideas?open=${idea.id}`}
         class="group relative flex min-h-[3.25rem] items-start justify-between gap-3 py-3 pl-3 pr-1
                transition-colors duration-150 hover:bg-white/[0.025] focus-visible:…">
        <span aria-hidden
              class="absolute inset-y-2.5 left-0 w-[2px] rounded-[2px] bg-orange-500
                     opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
        <p class="line-clamp-2 font-nebula-ui text-[13px] font-medium leading-snug tracking-[-0.01em]
                  text-zinc-300 transition-colors group-hover:text-white">{idea.title}</p>
        <span class="mt-0.5 shrink-0 font-nebula-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
          {IDEA_STATUS_LABEL[idea.status]}</span>
      </a>
    </li>
  </ul>
</section>
```

Because these rows have no card to sit in, hover feedback has to carry more
weight — hence the orange edge tick fading in, plus the title going white. That
tick is the same 2px orange bar as the rail spine and the queue urgency mark:
one shape, one meaning, three contexts.

**"This week's performance"** — same group treatment:

```html
<h2 …>This week's performance</h2>  +  <a href="/analytics">Full analytics</a>

<div class="border-t border-white/[0.055] pt-4">
  <p class="font-nebula-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Views</p>
  <p class="mt-1 font-nebula-heading text-[24px] font-semibold tabular-nums tracking-[-0.03em] text-white">
    {formatCompact(weekViews)}</p>
  <Sparkline values={channelStats.map(s => s.views)} label="Daily views, last 7 days" />
  <dl class="mt-4 grid grid-cols-2 gap-3">
    <div><dt class="…label">New subscribers</dt>
         <dd class="mt-1 font-nebula-heading text-[15px] font-semibold tabular-nums text-zinc-200">
           +{formatCompact(weekSubsGained)}</dd></div>
    <div><dt class="…label">Total subscribers</dt>
         <dd class="…">{latestSubs !== null ? formatCompact(latestSubs) : '—'}</dd></div>
  </dl>
</div>
```

**No delta chips.** The reference has green-up/red-down deltas; I am not
inventing them. A week-over-week delta needs 14 days and the page fetches
`getChannelStats(7)`. Changing that argument is a query change, so it is out of
scope for a re-skin. The sparkline uses *exactly* the seven points already
fetched and communicates direction honestly. If the team later accepts
`getChannelStats(14)`, the strip has room for a delta chip
(`--console-pos` / `--console-neg`) with no layout change.

### 6.3 `Sparkline`

```tsx
// 7 points → 120×32 viewBox, non-scaling stroke (required: preserveAspectRatio="none"
// would otherwise distort the line weight horizontally).
<svg viewBox="0 0 120 32" preserveAspectRatio="none" role="img" aria-label={label}
     class="mt-3 h-8 w-full overflow-visible">
  <defs>
    <linearGradient id="cfSpark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#ea580c" stop-opacity="0.28" />
      <stop offset="100%" stop-color="#ea580c" stop-opacity="0" />
    </linearGradient>
  </defs>
  <path d={areaD} fill="url(#cfSpark)" />
  <path d={lineD} fill="none" stroke="#fb923c" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
  <circle cx={lastX} cy={lastY} r="4" fill="#fb923c" opacity="0.22" />
  <circle cx={lastX} cy={lastY} r="1.8" fill="#fb923c" />
</svg>
```

Maths: `x = i * (120 / (n - 1))`, `y = 30 - ((v - min) / (max - min || 1)) * 26`.
If `values.length < 2`, render a single flat `<line>` at `y=16` in
`stroke-white/10` instead of a path. **No draw-on animation** — a line that
draws itself withholds a trend the user came to read.

Give the SVG `id="cfSpark"` uniqueness via `useId()` if more than one sparkline
ever renders on a page (only one does today).

---

## 7. Motion plan

| # | What | Spec | Reduced motion |
|---|---|---|---|
| 1 | Content pane arrival | `.console-fade { animation: consoleFade 260ms cubic-bezier(0.16,1,0.3,1) both }` — opacity 0→1 only | `animation: none` |
| 2 | Rail spine travel | `transition: transform 420ms cubic-bezier(0.16,1,0.3,1)` | `transition: none` (snaps into place) |
| 3 | Hover/focus colour + bg | `transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]` | kept (colour-only, no vestibular cost) |
| 4 | Row chevron nudge | `.console-nudge` + `group-hover:translate-x-0.5 duration-200` | `transition: none` |
| 5 | Mobile drawer | `transform` 220ms; scrim `opacity` 180ms | transform → none; scrim opacity kept |
| 6 | Skeleton shimmer | `animate-pulse` on `.console-skeleton` | `animation: none`, bars held at `bg-white/[0.06]` |
| 7 | First-run `ShinyCTA` | inherits `.nebula-cta` (spin + shimmer + breathe) | already handled by the existing rule in globals.css |

```css
@keyframes consoleFade { from { opacity: 0 } to { opacity: 1 } }
.console-fade { animation: consoleFade 260ms cubic-bezier(0.16,1,0.3,1) both; }

@media (prefers-reduced-motion: reduce) {
  .console-fade,
  .console-skeleton { animation: none !important; opacity: 1 !important; }
  .rail-spine,
  .console-nudge,
  .console-drawer { transition: none !important; }
}
```

**Not used in-app, deliberately:** `nebula-reveal` (§0.3), `columnReveal`,
`nebula-marquee`, `nebula-progressive-blur`, `nebula-typewriter`, `animate-ping`,
`animate-bounce`, `animate-spin` (except a genuine in-flight spinner, which the
dashboard has none of), the breathing glow outside the one CTA. Total in-app
motion budget: **one 260ms fade, one 420ms transform, and colour transitions.**

---

## 8. States

### 8.1 First run — `!hasAnyData` (no deals, no ideas)

Replaces the entire body grid. This is the **one Persuade moment inside
Operate**, so it gets the one `ShinyCTA` and centred composition:

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
                               font-nebula-ui text-[13px] font-medium text-zinc-400
                               transition-colors hover:text-white focus-visible:…">Connect Gmail</a>
  </div>
</div>
```

Copy is verbatim from `DESIGN_BRIEF.md` §5. The header, metric strip (all
zeroes) and capture pills remain — orientation should not disappear just because
the account is empty.

### 8.2 Per-region empty (has data elsewhere)

| Region | Empty render |
|---|---|
| Needs your attention | Inside the panel: `py-10 text-center` · `font-nebula-ui text-[13px] text-zinc-400` — "Nothing needs your attention right now." plus a `text-[12px] text-zinc-600` second line "All your open deals are delivered or paid." The panel keeps its header and `View all`. |
| Recent ideas | Under the group label, on the hairline: `py-6 text-[12.5px] text-zinc-500` "No ideas captured yet." + inline orange link "Capture one" → `/ideas?new=1`. |
| This week | `!youtubeConnected \|\| channelStats.length === 0` → group label, then `py-5`: `text-[12.5px] text-zinc-400` "Connect YouTube to see your performance here." + a bordered pill link → `/settings`: `inline-flex h-10 items-center rounded-[9999px] border border-white/[0.10] bg-white/[0.03] px-4 font-nebula-ui text-[12.5px] font-medium text-zinc-200 hover:bg-white/[0.07]`. No `ShinyCTA` — this is a secondary ask. |

### 8.3 Loading — `app/(app)/dashboard/loading.tsx` (new file, presentation only)

Renders the real `ConsoleHeader` chrome (title `Dashboard`, no name) so the
frame does not jump, then skeletons:

- Metric strip: 3 cells, `h-2.5 w-16 rounded-[6px] bg-white/[0.06]` label bar +
  `mt-2 h-6 w-20 rounded-[6px] bg-white/[0.08]` value bar.
- Queue panel: the real panel chrome + 5 rows, each
  `h-9 w-9 rounded-[8px]` monogram block, `h-3 w-[38%] rounded-[6px]` name bar,
  `mt-2 h-2.5 w-[22%] rounded-[6px]` meta bar.
- Context rail: 3 title bars + a `h-8 w-full rounded-[6px]` sparkline block.

All wrapped in `.console-skeleton` (which carries `animate-pulse`), killed under
reduced motion. Skeleton widths are fixed percentages — no randomised widths,
which shimmer differently on every load and read as instability.

### 8.4 Error — `app/(app)/error.tsx` (group-level, new file)

```html
<ConsoleHeader eyebrow="Dashboard" title="Something went wrong" />
<main …><div class="mx-auto max-w-[30rem] py-16 text-center">
  <p class="font-nebula-ui text-[14px] leading-relaxed text-zinc-400">
    We couldn't load this screen. Nothing was lost — try again.</p>
  <div class="mt-7 flex items-center justify-center gap-3">
    <button onClick={reset}
      class="inline-flex h-10 items-center rounded-[9999px] border border-orange-500/40 bg-orange-500/10 px-5
             font-nebula-ui text-[13px] font-medium text-orange-200
             transition-colors duration-150 hover:bg-orange-500/15 focus-visible:…">Try again</button>
    <a href="/dashboard" class="… h-10 … text-zinc-400 hover:text-white">Reload the dashboard</a>
  </div>
  {process.env.NODE_ENV !== 'production' && (
    <pre class="console-scroll mt-8 max-h-40 overflow-auto rounded-[10px] border border-white/[0.08]
                bg-black/50 p-4 text-left font-nebula-mono text-[11px] text-zinc-500">{error.message}</pre>)}
</div></main>
```

No red alarm surface. The error is orange-outlined, not filled — a failed load
is recoverable, and a red slab on a black screen at 6am is disproportionate.

### 8.5 Dense / populated

- Queue is already `slice(0, 5)`; the `+N more open deals` footer link (§6.1)
  makes the truncation visible instead of silent. It is computed from
  `openDeals.length - needsAttention.length`, both already on the page.
- Long brand names: `truncate` on a `min-w-0` grid cell.
- Long idea titles: `line-clamp-2` (2 lines max, ~3.25rem row).
- Long deliverables strings: `truncate` on the meta line.
- Large revenue: `formatMoney` → compact at ≥ 100,000 (`$1.3M`), full below.
- Missing values: `rate_amount_cents === null` → the value cell renders `—` in
  `text-zinc-600`, not an empty gap; `brand_name === null` → "Untitled deal"
  (existing behaviour, preserved).
- Very tall viewport: the panel and rail groups do not stretch; the content
  column is top-aligned and the console ground fills the remainder. No stretched
  empty cards.

---

## 9. Things this design pushes against, called out

1. **Solid hairlines vs. DESIGN.md's "no solid borders."** §3.4. I read the rule
   as governing elevated-surface outlines, and I introduce a faded gradient rule
   (`.console-rule-x/y`) for structural dividers as a compromise. Repeating list-row
   separators remain solid `border-white/[0.055]` — a deliberate exception.

2. **"Revenue MTD" is mislabelled in the existing code.** §5.1. I relabel to
   `Revenue collected` rather than change the computation. If the label is meant
   to be authoritative, this is a logic bug that needs a separate fix.

3. **`due_date` is newly surfaced.** §6.1. Already in the `getDeals()` payload,
   so no query change — but it introduces a derived "overdue" state the current
   page doesn't have. Trivially removable; the row degrades cleanly.

4. **No week-over-week deltas.** §6.2. The reference has them; honest ones need
   `getChannelStats(14)`, which is a query change. Sparkline instead.

5. **Sidebar collapse is rejected**, contradicting the reference structure in
   brief §4. Reasoning in §1.3.

6. **The KPI tile row is deleted**, also from brief §4. Reasoning in §0.4.

7. **Root layout is dark-hostile and is not mine to fix.** `app/layout.tsx` has
   `<html className="… bg-linen">` and `export const viewport = { colorScheme:
   'light', themeColor: '#FFFFFF' }`. Consequences on every in-app screen: the
   UA paints light form controls, light default scrollbars, and a white
   overscroll gutter. The console's `h-screen overflow-hidden` contains most of
   it, and `.console-scroll` handles scrollbars, but `colorScheme: 'light'` will
   still light up native `<select>`/date inputs on Groups 2–4. **Recommend Group
   6 (or whoever owns the root) moves to `colorScheme: 'dark'` and drops
   `bg-linen` once the light surfaces are gone.** Do not do it in Group 1 —
   it would break the still-light auth pages.

8. **Sidebar item counts were considered and rejected.** Live badges on
   Deals/Ideas would be the single highest-value shell addition, but they require
   new queries in `app/(app)/layout.tsx` and would add DB round-trips to every
   navigation. That is a data-flow change; out of scope for a re-skin.

9. **Nav breakpoint stays at `md`** (matching today's implementation) rather
   than moving to `lg`. At 768px the rail is narrowed to 200px and queue rows
   stay in their stacked two-line form until `lg`, so nothing is cramped.

10. **`app/(app)/dashboard/loading.tsx` and `app/(app)/error.tsx` are new
    files.** Both are pure presentation (React boundaries, no data), added
    because §6.5 of the brief requires loading and error states for every data
    region and the route currently has neither.

---

## 10. Implementation order

1. Add the `NEBULA CONSOLE` CSS block (§3.1, §3.4, §3.5, §7) to `globals.css`.
2. `app/(app)/layout.tsx` → console frame + atmosphere + skip link. Verify
   nothing under `app/(app)/` sets `backdrop-blur` except the drawer scrim.
3. `AppRail` + `MobileRail` (port pathname/signOut logic verbatim; add the
   drawer's dialog semantics and focus trap).
4. `ConsoleHeader` + `MetricStrip` + `CapturePills`. Verify the three deep links
   still land on the correct `?new=1` handlers.
5. `ConsolePanel` + `QueueRow` + `StageTag` + `Monogram`.
6. `RailGroup` + `Sparkline`.
7. Rewrite `dashboard/page.tsx` presentation — the `Promise.all`, all five
   queries, and every derived value stay byte-identical.
8. `loading.tsx`, `error.tsx`, `ConsoleEmpty`.
9. Check: 320px no horizontal scroll · every interactive element has a visible
   focus ring on both `#060607` and `#0a0a0b` · `prefers-reduced-motion` leaves
   the screen fully readable and static · every `rounded-*` on this surface is
   an arbitrary value · tab order is rail → header actions → queue → context rail.
