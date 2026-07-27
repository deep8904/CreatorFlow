# UX review — Home page (Nebula system)

**Date:** 2026-07-25 · **Surface:** `app/page.tsx` + `components/home/*` · **Mode:** Persuade
**Method:** ⚠️ single-context review (no sub-agent used) — declared per the critique protocol.
Evidence gathered live in-browser: computed styles, hit-area measurement, overflow probing at
320 / 375 / 768 / 1024 / 1440 px, plus the bundled design detector.

---

## 1. Design Health Score — Nielsen heuristics

Two heuristics are `n/a`: this is a Persuade surface with no task state to recover from and no
in-product help to document.

| # | Heuristic | Score | Key finding |
|---|---|---|---|
| 1 | Visibility of system status | 3 / 4 | Hover/focus states are clear everywhere; the marquee gives no affordance that it pauses on hover |
| 2 | Match system ↔ real world | 4 / 4 | Copy is the creator's own language ("dropped ideas", "brand deal", "your inbox") — no infra jargon survived from the reference |
| 3 | User control & freedom | 3 / 4 | Nothing traps the visitor; the auto-scrolling marquee can't be stopped by keyboard, only hover |
| 4 | Consistency & standards | 4 / 4 | One pill radius, one accent, one easing curve, one entrance grammar across all seven sections |
| 5 | Error prevention | n/a | No forms on this surface (the reference's contact form was deliberately not reproduced) |
| 6 | Recognition over recall | 4 / 4 | Every nav item is a text label; no icon-only navigation anywhere |
| 7 | Flexibility & efficiency | 3 / 4 | Two routes to signup (nav + hero + closing CTA); no skip-link to main content |
| 8 | Aesthetic & minimalist design | 3 / 4 | Strong, committed; the hero stacks to 6 lines on the smallest phones (now 4 after the fix) |
| 9 | Error recovery | n/a | No error states on a static marketing page |
| 10 | Help & documentation | 2 / 4 | "Docs" and "GitHub" nav links are `#` placeholders — they go nowhere |
| **Total** | | **29 / 32** | **91% — Excellent** |

---

## 2. Design specificity verdict

**Pass — authored, not category-interchangeable.**

The page could not be lifted onto another product without rewriting it. The mega-card dramatises a
*brand-deal pipeline moving through real stages*; the orbital diagram describes an actual public
repo; the marquee lists commitments only this product can make ("no cut of your deals", "free
forever, no paid tier"). Swap the copy out and the illustrations stop making sense — which is the
test.

**Deterministic scan:** the bundled detector reports only `gradient-text` on the hero and the
"anywhere" emphasis word. Classified **not a defect**: the supplied `DESIGN.md` explicitly
specifies *"Heading 1 … with vertical gradient clipping"*, and a pinned brief outranks a generic
saturated-pattern warning. No other rule fires — no side-tab borders, no nested cards, no
overused-font hits.

---

## 3. Issues found and fixed this round

| # | Severity | Issue | Root cause | Status |
|---|---|---|---|---|
| 1 | **P1** | Hard-edged orange rectangle across the CTA on hover | `.nebula-cta__label::before` used `border-radius: inherit`; the label span has no radius, so it resolved to `0` and the inset glow painted as a rectangle | ✅ explicit `9999px`; glow now follows the pill |
| 2 | **P2** | Marquee showed the tech stack — said nothing to a creator | Slot inherited from the reference's partner-logo band | ✅ replaced with seven product commitments |
| 3 | **P2** | Large dead vertical gap in both detail cards | `mt-auto` pushed content to the bottom of a stretched grid cell | ✅ removed; padding tightened responsively |
| 4 | **P0** | **Nav pill overflowed at 320 px — "START FREE" was clipped** | Fixed paddings; total width ≈331 px vs 320 px viewport. Masked by `overflow-x-hidden`, so it silently *cut the primary CTA* instead of scrolling | ✅ compact nav below `sm` — now 308 px, fits |
| 5 | **P1** | Phone frame's fixed `330px` box overflowed its container | `transform: scale()` shrinks paint but not the layout box | ✅ responsive width/height (`276→330 px`), real layout change |
| 6 | **P1** | **20 interactive targets under 40 px** (nav links 16 px, footer links 17 px) | No padding on inline links | ✅ pseudo-element hit-area extenders; down to 2 (logo, CTA at 38 px) |
| 7 | **P2** | Hero headline ran 6 lines at 320 px | `text-5xl` floor too large | ✅ `text-4xl` floor, tighter leading, shorter badge copy |

---

## 4. Responsive verification (measured, not assumed)

| Width | Horizontal scroll | Unclipped overflow | Notes |
|---|---|---|---|
| 320 px | none | 0 elements | nav 308 px, phone 276 px — both fit |
| 375 px | none | 0 | headline 4 lines |
| 768 px | none | 0 | detail cards stack to 1-up |
| 1024 px | none | 0 | ghost section goes 3-column |
| 1440 px | none | 0 | full composition |

Method: walked every element in the DOM, compared `getBoundingClientRect().right` against
`clientWidth`, and **excluded anything inside an `overflow-hidden` ancestor** — otherwise the
marquee's intentionally-3300 px track would mask real overflow. This is the check that surfaced
issue #4, which a plain "does the page scroll sideways" test would have missed entirely.

---

## 5. Persona red flags

**Jordan (first-timer)** — ⚠️ *"Docs" and "GitHub" lead nowhere.* Both are `#` placeholders. A
first-timer clicking "Docs" to understand the product gets nothing. **This is the top remaining
issue.** Also: no skip-link, so the hero must be tabbed through every visit.

**Casey (distracted mobile)** — ✅ Now clean. Was the worst-served persona before this round: the
primary CTA was literally cut off at 320 px, and every nav link was a 16 px tap target. Both fixed.
State is preserved on tab-switch (no client-side wizard to lose).

**Sam (accessibility-dependent)** — ✅ Mostly good. Every decorative layer is `aria-hidden`; the
letter-roll hero carries an explicit `aria-label` so it reads as one sentence rather than
`"Fewerdroppedideas."`; focus rings are visible and orange-on-black passes contrast; all motion
including the infinite loops collapses under `prefers-reduced-motion`. ⚠️ Remaining: no skip-link,
and the marquee cannot be paused without a pointer.

---

## 6. What's working (keep)

1. **Motion is orchestrated, not scattered.** One entrance grammar (`fadeSlideIn`), one curtain
   reveal, one easing curve. Nothing animates just because it can.
2. **Honesty holds under pressure.** The reference's most persuasive sections were testimonials,
   customer logos and pricing. All three were dropped rather than faked, and the replacements
   (real commitments, real repo diagram) are *stronger* because they're specific.
3. **The illustrations are authored, not chrome.** No stock imagery, no gradient placeholders —
   every visual is built from divs and SVG and describes something the product actually does.

---

## 7. Remaining open items

| Priority | Item | Note |
|---|---|---|
| **P1** | `#docs` / `#github` / `#privacy` / `#terms` are dead links | Needs real URLs before launch — a visitor clicking "Docs" currently gets nothing |
| P2 | No skip-to-content link | Keyboard users tab the whole hero on every visit |
| P2 | Marquee has no keyboard/reduced-motion pause control | Pauses on hover only |
| P2 | `/pricing` route still exists | Nothing links to it, but "no pricing anywhere" is now a product rule (`PRODUCT.md`) |
| P3 | Footer geometric 3×3 logo from the reference not built | Cosmetic |

---

## 8. Verification

`tsc --noEmit` · `eslint` · `next build` · `vitest` 3/3 · Playwright 10/10 — all pass, run against
a cleared `.next` cache.

---

# Round 2 — visual audit (browser-only, no code reading)

**Method:** deliberately *not* a code review. Rendered the page, took screenshots at
320 / 375 / 800 / 1280 px, judged what was actually on screen, then traced each visible
defect back to a cause. Findings below are ordered by how badly they hurt the first
impression.

## V1 — CTA flooded with orange (P1, was the most damaging)

**Seen:** the pill's interior filled with a solid orange gradient, swamping the label.

**Traced to:** two of my own deviations from the supplied HTML, not the reference itself.
Re-reading `generated-page.html` line 128–144: `.shiny-cta span::before` is `opacity: 0`
and **there is no `:hover` rule for it anywhere in the file** — the layer never becomes
visible. I had added `:hover { opacity: 1 }` and enlarged the box to `100% + 3rem`.
Additionally the shimmer `::after` was left at the reference's `opacity: 0.6` / `40%` mask,
values tuned for its taller `1.25rem`-padded button; on this wider, shorter pill the square
sweep covers nearly the whole face.

**Fixed:** glow layer restored to `opacity: 0` verbatim; shimmer to `0.22` with a `55%`
transparent core. The button is now a black pill whose colour comes from the spinning
border beam — matching the reference's actual appearance.

## V2 — Hard-edged blocks cutting through the headline (P1)

**Seen:** stepped grey/black rectangles with sharp vertical borders slicing across
"Fewer dropped ideas".

**Traced to:** the grid-curtain plinths render full-height. In the reference the same
structure reads as a *bottom skyline*; here the strong `from-white/10` top-glow raised the
contrast between plinth and gap until the edges became foreground.

**Fixed:** masked the curtain with `linear-gradient(to top, black 35%, transparent 90%)`
so it fades before reaching the text, and softened the glow to `white/[0.06]`. Also hidden
entirely below `md`, where a single full-width column had turned the plinth into a
meaningless horizontal band.

## V3 — Ghost section stranded left with a dead right half (P2)

**Seen:** at ~800 px the workspace and status cards sat in a narrow left column with the
entire right half empty.

**Traced to:** both cards carried `max-w-sm` at every breakpoint, and the column only
becomes a right-hand rail at `lg`. Between `sm` and `lg` they had no reason to be narrow.

**Fixed:** `sm:flex-row lg:flex-col`, `max-w-sm` scoped to `lg` only, `h-full` on the inner
card so the pair matches height. They now fill the row below `lg` and return to a stacked
rail above it.

## V4 — Detail cards: dead space under the illustrations (P3)

**Seen:** a visible gap between each card's artwork and its heading.

**Fixed:** header heights `h-52/h-60` → `h-44/h-52`.

## Re-verification

`tsc` · `eslint` · `next build` · `vitest` 3/3 · Playwright 10/10 — all pass on a cleared cache.

## Standing note on method

V1 is the case for doing this visually. The CTA passed every code-level check —
typecheck, lint, detector, and a computed-style probe that confirmed all six layers were
present and the `@property` angle was animating. It was *structurally correct and visually
wrong*, and only a screenshot could tell the difference.
