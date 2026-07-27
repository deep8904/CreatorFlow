# Site-wide redesign brief (shared agent context)

Read this **first**. It is the single source of truth for every agent working on the
CreatorFlow site-wide redesign. Read the files it points at before proposing anything.

---

## 1. The design system you must build in

**Authority, in order:**

1. `/DESIGN.md` — the Nebula system (frontmatter tokens + rules). Non-negotiable.
2. `/docs/NEBULA_REFERENCE_NOTES.md` — a full teardown of the reference build:
   14 animations, the six-layer CTA recipe, depth techniques, creative details.
   **Read this — it will save you re-deriving everything.**
3. `~/Downloads/generated-page (1).html` — the original reference markup (1,653 lines).
4. `/components/home/*` + `/app/page.tsx` — the **already-approved** Home page.
   This is the built, shipped expression of the system. Match its quality bar and
   reuse its *primitives and conventions* (see §3), not its section layouts.

**System in one line:** black canvas, single orange accent (`#ea580c` / `#fb923c`),
Manrope display + Inter UI + Geist technical/mono, glassmorphism, grain, gradient
borders via `mask-composite` (never solid borders), pill buttons, `2.5rem` mega-cards,
`cubic-bezier(0.16, 1, 0.3, 1)` easing everywhere.

---

## 2. Hard constraints — violating these fails review

### 2a. Preserve all behaviour. This is a re-skin, not a rewrite.

The in-app screens (`app/(app)/*`) are **live, functional, Supabase-backed** with
row-level security. They do real CRUD through `lib/supabase/actions.ts` and
`lib/supabase/queries.ts`.

- **Do not change data flow, server actions, queries, auth, or RLS assumptions.**
- Every existing capability must still work identically: create/edit/delete, search,
  deep links (`?new=1`, `?deal=<id>`, `?open=<id>`), unsaved-changes warnings,
  confirm-before-destructive dialogs, toasts, ownership transfer, invites.
- "Don't reuse old components" means **presentation**: markup, layout, styling,
  visual patterns. It does **not** mean tearing out working logic.

### 2b. Product truth (`/PRODUCT.md`)

- **No pricing anywhere.** CreatorFlow is going open source. `/pricing` should be
  **deleted**, not redesigned. No pricing copy, links, or CTAs on any surface.
- **No fabricated evidence.** No testimonials, customer names, partner logos, user
  counts, or benchmark claims. None exist.
- **AI features are previews, not live.** Repurpose, contract review and reply
  drafting must stay honestly labelled as demo/preview.
- Demonstration data must be labelled as such where a visitor could mistake it for real.

### 2c. Accessibility floor (regressions here are P0)

These were hard-won; do not undo them:
- Visible `focus-visible` ring on every interactive element.
- All motion — including infinite loops — collapses under `prefers-reduced-motion`.
- Touch targets ≥ 40px effective (use `after:absolute after:-inset-y-3` extenders on
  inline links rather than bloating layout).
- Decorative layers `aria-hidden`; icon-only buttons need `aria-label`.
- No horizontal overflow at 320px.

### 2d. Token independence

The global token layer in `app/globals.css` still serves the *old* Swiss system
(`--radius-full: 2px`, white ground). Nebula surfaces must **not** depend on it —
use explicit values (`rounded-[9999px]`, not `rounded-full`). This already caused one
real bug where the nav button rendered at 2px instead of a pill.

---

## 3. Conventions already established (reuse these)

From `components/home/`:

| Primitive | What it does |
|---|---|
| `NebulaReveal` | scroll-triggered `fadeSlideIn`; paused in CSS so content survives without JS |
| `ShinyCTA` | the six-layer signature button (`.nebula-cta` in globals.css) |
| `.nebula-border` | gradient border via `mask-composite`; set `--nebula-border-gradient` per element |
| `.nebula-grain` | inline `feTurbulence` grain overlay (no external CDN) |
| `.nebula-progressive-blur` | 8-layer blur ramp behind fixed headers |
| `.font-nebula-heading/-ui/-tech/-mono` | Manrope / Inter / Geist / Geist Mono |
| `.nebula-marquee` + `-track` | infinite scroll, pauses on hover |

**Known trap:** never nest `backdrop-filter` inside another `backdrop-filter` — Chromium
blanks the inner element's content. Blur belongs on the parent only.

---

## 4. Dashboard reference (for `app/(app)/*` screens)

The user supplied "Skymetrics" analytics-dashboard screenshots. **Structure to borrow,
visuals to discard** (they're light-mode mint-green; we are dark + orange):

- Persistent left sidebar: icon + label rows, collapsible to icon-only, clear active state.
- Top bar with page title + contextual controls (date range, account switcher).
- A row of KPI stat tiles: mono uppercase label → large tabular numeral → delta chip
  (green up / red down) → optional sparkline.
- Below: a 2-up of a large trend chart and a funnel/conversion panel.
- Then a 3-up: a gauge/donut single metric, a breakdown with proportional bars +
  legend, and a compact sortable data table.
- Dense but breathable: ~8–12px internal padding, 12-column grid, sticky table headers.

Also draw on general well-designed data-dense SaaS admin patterns for hierarchy:
one primary metric per view, progressive disclosure, empty/loading/error states for
every data region, and keyboard-navigable tables. **Restyle everything into the Nebula
system** — do not copy reference visuals.

---

## 5. Page inventory and order

| Group | Pages | Notes |
|---|---|---|
| **1. App shell + Dashboard** | `app/(app)/layout.tsx`, `dashboard` | Sidebar, top bar, KPI tiles — sets the in-app language |
| 2. Data screens | `deals`, `ideas`, `drafts` | Kanban, list+modal, split editor. Mobile fixes already exist — preserve them |
| 3. Analytics + Repurpose | `analytics`, `repurpose` | Charts; Repurpose stays labelled preview |
| 4. Team + Settings + Automations | `team`, `settings`, `automations` | Forms, roles, destructive confirms |
| 5. Auth | `login`, `onboarding`, `forgot-password`, `reset-password`, `accept-invite` | Centred moments |
| 6. Cleanup | delete `/pricing`, delete `components/landing/*` | Once nothing imports them |

---

## 6. What to hand back

Design agents produce a **written proposal**, not code edits (two agents editing the
same files would collide). Include:

1. Layout structure per screen (grid, regions, breakpoint behaviour at 320/768/1024/1440).
2. Component inventory — new components with names, props, and which Nebula primitive
   each builds on.
3. Concrete styling decisions: exact classes/tokens for surfaces, borders, type scale.
4. Motion plan — what animates, when, and how it degrades under reduced-motion.
5. States: empty, loading, error, and the dense/populated case for every data region.
6. Anything in §2 you think the design pushes against, called out explicitly.

Be specific enough to implement from. Vague direction ("use glassmorphism") is not useful.
