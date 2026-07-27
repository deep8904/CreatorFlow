# Nebula reference — full teardown notes

Study of `generated-page.html` (1,653 lines) + its `DESIGN.md`, done before rebuilding.
Purpose: inventory **every** animation, button mechanic, and creative detail so the
CreatorFlow build reproduces the craft rather than an approximation of it.

Legend: ✅ built · ⚠️ simplified in first pass, now upgraded · ❌ not applicable to CreatorFlow

---

## 1. Animation inventory (14 distinct behaviours)

| # | Name | Mechanic | Where |
|---|---|---|---|
| 1 | `fadeSlideIn` | `translateY(30px)` + `blur(8px)` → `0`, 1s | ✅ every entrance |
| 2 | `columnReveal` | `clip-path: inset(0 0 100% 0)` → `0`, 1.4s, staggered `delay-1…7` | ✅ hero curtain |
| 3 | `border-spin` | `--gradient-angle: 0 → 360deg` on a **registered** `@property`, 2.5s linear infinite | ⚠️ now real |
| 4 | `shimmer` | full-size layer `rotate(360deg)`, 4s, masked by `radial-gradient(circle at bottom, transparent 40%, black)` | ⚠️ was missing |
| 5 | `breathe` | `scale(1) → scale(1.20)`, 4.5s — pulses an **inset** orange glow | ⚠️ was missing |
| 6 | `beam-spin` | conic-gradient `rotate(360deg)`, 3s — the nav button's hover beam | ✅ |
| 7 | `dots-move` | `background-position 0 → 24px 24px`, 8s — drifting dot field inside the CTA | ✅ |
| 8 | `infinite-scroll` | `translateX(0 → -50%)`, 40s, `animation-play-state: paused` on hover | ✅ marquee |
| 9 | `carousel-fade` | 15s 3-card crossfade, opacity + z-index keyed at 0/5/28/33/100% | ❌ was testimonials |
| 10 | `typing` | `width: 0 → 100%` with `steps(30, end)`, plus `blink-caret` on `border-right` | ⚠️ now real |
| 11 | `animate-ping` | expanding ring behind a status dot | ⚠️ now real |
| 12 | `animate-bounce` + `delay-100/200` | three dots = "syncing" indicator | ⚠️ now real |
| 13 | `animate-pulse` | live data point on the chart, status dots | ⚠️ now real |
| 14 | `animate-spin` | loader glyph inside an in-progress row | ⚠️ now real |

**Global easing rule:** `cubic-bezier(0.16, 1, 0.3, 1)` — never default easing.
**Scroll trigger:** one shared `IntersectionObserver` (threshold `0.1`, `rootMargin: 0px 0px -5% 0px`)
toggles `.animate`; the animation is authored *paused* in CSS, not hidden in markup.

---

## 2. The Shiny CTA — the signature button, dissected

Six stacked layers. My first pass rebuilt ~2 of them; this is the full recipe:

```
@property --gradient-angle        <angle>       0deg
@property --gradient-angle-offset <angle>       0deg
@property --gradient-percent      <percentage>  20%
@property --gradient-shine        <color>       #fb923c
```
Registered props are what make the conic angle **animatable at all** — a plain
custom property can't be tweened.

1. **Border beam** — `background: linear-gradient(#000,#000) padding-box, conic-gradient(...) border-box`
   with `border: 2px solid transparent`. The dual-background + `padding-box`/`border-box`
   trick paints a gradient *only* in the border region. Spins via `border-spin`.
2. **Inner hairline** — `box-shadow: inset 0 0 0 1px #1a1818`.
3. **`::before` dot field** — `radial-gradient(circle at 2px 2px, white 0.5px, transparent 0)`,
   `background-size: 4px 4px`, `background-repeat: space`, masked by a conic gradient
   so the dots only show on a rotating arc. `opacity: .4`.
4. **`::after` shimmer** — `linear-gradient(-50deg, transparent, #ea580c, transparent)`
   in a 1:1 aspect box, masked with `radial-gradient(circle at bottom, transparent 40%, black)`,
   rotating 4s.
5. **`span::before` breathing glow** — `box-shadow: inset 0 -1ex 2rem 4px #ea580c`,
   scale-pulsing 4.5s; `opacity` transitions on hover.
6. **Press** — `:active { transform: translateY(1px) }`.

Hover retargets `--gradient-angle-offset`, `--gradient-percent` and `--gradient-shine`
over **800ms** `cubic-bezier(0.25, 1, 0.5, 1)` — i.e. the *variables* are transitioned,
not the paint.

---

## 3. Other button mechanics

- **Nav 3D button** — `p-[1px]` wrapper; a conic beam layer at `opacity-0 → 100` on hover,
  a static `bg-zinc-800` layer that fades *out* on hover, and an inner face with
  `bg-gradient-to-b from-zinc-800 to-zinc-950` + `shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]`
  (the inset top highlight is what sells the 3D). Arrow nudges `translate-x-0.5`.
- **Form submit** — inverted: solid white on black, uppercase, tracked, no radius.
- **Phone action buttons** — `group-active:scale-95`, orange gradient + `shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)]`.
- **Timeframe pills** — active state = `text-orange-500 bg-orange-500/10 border-orange-500/20`.

---

## 4. Depth & surface techniques

- **Gradient borders, never solid** — `::before` with `padding: 1px`, dual `-webkit-mask`
  + `mask-composite: exclude`. Driven by a `--border-gradient` custom property per element.
- **Progressive blur header** — 8 stacked layers, `blur(0.5px)` → `blur(64px)`, each with a
  `linear-gradient` mask covering a 12.5% band. Produces a true focal ramp, not a flat frost.
- **Grain** — `noise.svg` at `opacity: .2`, `mix-blend-mode: overlay`.
  *(Rebuilt inline as an `feTurbulence` data URI — no external CDN dependency.)*
- **Section masks** — `mask-image: linear-gradient(180deg, transparent, black 0%, black 95%, transparent)`
  to fade section edges into the page.
- **Radii vocabulary** — `9999px` pills · `2.5rem` mega-cards · `2rem` secondary cards ·
  `3.5rem` phone frame · `1.5rem`/`1rem` inner elements.

---

## 5. Creative details worth stealing

- **Giant ghost typography** — `text-[12vw]` at `text-white/[0.03]` behind a section.
- **Section counters** — `02/04` in mono with an orange dot, `opacity-60`.
- **Grid-curtain plinths** — stepped black blocks (75/65/55/45/55/65/75%) forming a skyline
  that rises toward the centre, each with `border-t border-white/10` and a heavy upward shadow.
- **Orbital diagram** — dashed concentric rings, a centre hub, satellites at absolute offsets,
  a status pill riding the outer ring. (Ideal fit for an open-source/repo visual.)
- **Floating UI widgets** — small rotated cards (`-rotate-6`, `rotate-12`, `rotate-3`) with
  skeleton bars, `hover:scale-105`. Suggests product surface without faking a screenshot.
- **Signal bars** — 3 bars at descending opacity (`bg-emerald-500`, `/50`, `/20`).
- **Phone mockup** — 6-stop layered `box-shadow` for realistic depth; Dynamic Island that
  **expands on hover** (`w-[110px] → w-[140px]`); SVG area chart with dashed grid pattern.
- **Envelope composition** — built from 4 stacked divs, no image.
- **Footer logo** — 3×3 grid of `rotate-45` squares, one white with a glow, two orange.
- **Floating form labels** — `peer-placeholder-shown` / `peer-focus` to slide the label up
  and recolour it orange.

---

## 6. Deliberately NOT reproduced (product-truth constraints)

Per `PRODUCT.md` → Evidence on Hand, CreatorFlow has no customers, testimonials, partners,
or paid tiers. These reference features are therefore out:

- ❌ **Testimonial carousel** + named quotes/avatars (`David Chen, CTO, Chainlink`) — fabricated social proof.
- ❌ **Partner logo marquee** (git/npm/Lucidchart) — replaced with the **real** open-source stack under a "Built with" label.
- ❌ **Pricing / "12 months support" / license-holder copy** — the product is open source and free.
- ❌ **Contact form** — a form that posts nowhere is dishonest; the closing CTA links to real signup instead.
- ⚠️ **Phone mockup** — kept, but framed as the *responsive web app* (PRD lists native mobile as an explicit non-goal).

---

## 7. Application order

1. Rebuild `ShinyCTA` at full six-layer fidelity (registered `@property`, shimmer, breathe).
2. Add the missing keyframes to the Nebula CSS layer.
3. Upgrade the product visual: typewriter status line, ping dots, signal bars, syncing bounce.
4. Add the 2-up feature cards with floating-widget and orbital visual headers.
5. Add a giant ghost-typography section with a section counter.
6. Footer geometric logo.
7. Keep every decorative loop inside the `prefers-reduced-motion` kill switch.
