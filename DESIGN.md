---
name: CreatorFlow
description: Dark, technical, data-dense creator-ops product — Nexus Architecture's system, CreatorFlow's product truth
colors:
  primary: "#22C55E"
  accent: "#22C55E"
  background: "#000000"
  surface: "#161616"
  surface-raised: "#232323"
  border: "#2A2A2A"
  text-primary: "#FFFFFF"
  text-secondary: "#A1A1AA"
  text-tertiary: "#6B6B70"
  positive: "#22C55E"
  negative: "#F87171"
typography:
  display-lg:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(44px, 5vw + 16px, 88px)"
    fontWeight: 500
    lineHeight: "1.04"
    letterSpacing: "-0.02em"
  display-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(36px, 4vw + 8px, 64px)"
    fontWeight: 500
    lineHeight: "1.08"
  display-sm:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(28px, 3vw + 4px, 44px)"
    fontWeight: 500
    lineHeight: "1.15"
  auth-heading:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: "1.25"
  app-heading:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: "1.2"
  body-md:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "1.6"
  body-sm:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "1.5"
  label-md:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "1.2"
    letterSpacing: "0.06em"
  control-label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    letterSpacing: "-0.01em"
  label-sm:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "11px"
    fontWeight: 500
    textTransform: "uppercase"
  body-lg:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: "1.6"
rounded:
  card: "8px"
  control: "8px"
  pill: "9999px"
spacing:
  base: "8px"
  gap: "16px"
  card-padding: "24px"
  section-padding: "80px"
components:
  card:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.card}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#000000"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
---

## Overview

CreatorFlow is redesigning from its earlier orange/black editorial system to a dark, technical, data-dense visual world, per explicit product direction on 2026-07-25. Primary visual authority: `nexus-architecture-DESIGN.md` (dark ground, single green accent, Inter + JetBrains Mono, 8px system, restrained pill controls, masked/staggered motion, ambient WebGL background layers). Secondary reference: Skymetrics dashboard screenshots, for in-app data-density patterns — stat tiles, sidebar structure, chart types, and a proven light/dark pairing.

This is a visual-world replacement, not a product-truth change: see `PRODUCT.md` for what stays fixed (name, users, positioning, voice, evidence constraints). Nexus's testimonial/tiers/enterprise-infra content and copy voice are explicitly **not** adopted — CreatorFlow has no real testimonials or pricing tiers, and its voice stays direct and plain per `docs/DESIGN_BRIEF.md`. Only the palette, type system, spacing/radius system, component shape language, and motion grammar carry over.

## Colors

Single accent strategy: `#22C55E` (green) is both primary and accent, used sparingly against a near-black ground (`#000000` background, `#161616`/`#232323` surfaces). Positive/negative deltas reuse the same green plus `#F87171` red — do not introduce a third accent hue. Text is white/`#A1A1AA`/`#6B6B70` depending on hierarchy. Light mode is a secondary, explicit companion state for in-app Operate surfaces only (see Skymetrics's light pairing) — invert to a warm-white ground (`#FAFAF9`) with the same green accent and near-black text; marketing/Persuade surfaces stay dark-only.

## Typography

Inter for display moments (hero headlines, section titles, in-app page/auth headings) at weight 500–700, tight line-height (1.04–1.25 depending on size). JetBrains Mono for everything else — body copy, labels, stat values, nav items, technical metadata — matching Nexus's register and echoing CreatorFlow's existing mono-label habit from its prior system. Do not introduce a third typeface (no Playfair Display in the new world).

Display sizes (`display-lg` 64px, `display-md` 40px, `display-sm` 28px) scale fluidly via `clamp()` on marketing pages rather than jumping between fixed steps — the frontmatter values are the clamp's upper bound. `auth-heading` (26px) and `app-heading` (20px) are fixed, non-fluid utility steps distinct from the display scale: a centered auth moment ("Welcome back") and a dense in-app toolbar-adjacent page title serve different roles from a marketing hero and from each other, so they don't collapse to the display ramp.

Dense in-app UI text (card titles, table cells, badges, meta text, form labels) ranges 10–16px in roughly 0.5–1px steps (10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 15, 16), and stat/metric numerals (Dashboard/Analytics card values) range 17–26px — this is pre-existing drift from the prior system, carried over as-is during the visual reset rather than consolidated; a genuine type-scale cleanup (collapsing to a smaller, named step count) is real follow-up work but out of scope for this reset, which only changes color/typeface/motion, not the underlying size ramp.

## Layout

8px base spacing unit throughout (`gap: 16px`, `card-padding: 24px`, `section-padding: 80px`). Marketing pages keep deliberate, stable section rhythm — same grid direction and max-width discipline as before, now rendered dark. In-app Operate surfaces (Dashboard, Analytics, Deals, etc.) adopt Skymetrics's density: a fixed-width collapsible sidebar (icon + label, collapsible to icon-only), a top bar with date-range/context selectors, and a card grid of stat tiles + charts below. No horizontal scroll below 768px — this redesign is also the point where the known multi-panel-doesn't-reflow issue (Deals kanban, Drafts split) gets fixed, not carried forward.

## Elevation & Depth

Flat/tonal by default (dark surfaces separated by subtle background-color steps: `#000000` → `#161616` → `#232323`), not drop-shadow-heavy — matches Nexus's flat dark aesthetic and avoids the shadow language the prior light system used. A card's elevation is communicated by surface color step and a 1px `#2A2A2A` border, not blur/shadow.

## Shapes

8px radius on cards and controls (`rounded.card`, `rounded.control`); full pill radius (`9999px`) on buttons and badges — consistent with CreatorFlow's existing pill-CTA habit, so this is one of the few forms that survives the reset unchanged in shape, just in the new palette.

## Components

- **Buttons**: primary = solid green fill, black text, pill shape. Secondary = transparent with white text/border, pill shape. No more orange sweep-fill hover trick — replace with a clean opacity/brightness shift matching Nexus's restrained register.
- **Cards**: `surface-raised` background, 8px radius, 1px `#2A2A2A` border, `24px` padding. Used for stat tiles, deal cards, idea cards, draft list rows.
- **Stat tile** (new, from Skymetrics): label (mono, uppercase, `text-secondary`) → big number (Inter, display-md) → delta chip (green/red, small pill) → optional sparkline.
- **Sidebar nav**: icon + label rows, collapsible to icon-only, active state = green left accent + `surface-raised` background — replaces the prior top-nav-only mobile drawer pattern for desktop too, matching Skymetrics's persistent left rail.
- **Badges/pills**: mono label, uppercase, small tracked letter-spacing, bordered — same recipe as the prior TrustBand badge, recolored.

## Do's and Don'ts

- **Do** keep the CreatorFlow "F" logo mark as-is in form; render it in green/white on dark instead of orange.
- **Do** apply staggered/masked entrance motion once per view, orchestrated — not scattered per-element hover effects.
- **Do** honestly label any AI-feature preview (Repurpose, contract review, reply drafting) as a demo/preview — the visual reset does not change what's actually live.
- **Don't** add a testimonial section, customer logo strip, or pricing-tier comparison — no real evidence exists for any of these; fabricating them violates `PRODUCT.md`'s Evidence on Hand constraint.
- **Don't** introduce a third accent color beyond green (+ red for negative deltas) — Nexus's guardrail against diluting a committed single-accent strategy applies here too.
- **Don't** carry forward the multi-panel-doesn't-reflow-under-768px issue — this rebuild is the fix, not a repeat.
- **Don't** ship new motion without `prefers-reduced-motion` support or new interactive elements without a visible focus indicator — both were real, verified gaps in the prior system's audit; the reset must not repeat them.
