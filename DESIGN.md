---
version: alpha
name: CreatorFlow — Nebula Dark Infrastructure
description: A high-density, dark-mode landing surface featuring cinematic grid reveals, glassmorphism, grain, and interactive typography — the Nebula system applied to CreatorFlow's creator-ops product truth.
colors:
  primary: "#ea580c"
  secondary: "#fb923c"
  background: "#000000"
  surface: "#1a1818"
  text-primary: "#ffffff"
  text-secondary: "#9ca3af"
  border: "rgba(255, 255, 255, 0.1)"
typography:
  fontFamily: "'Inter', sans-serif"
  heading: "'Manrope', sans-serif"
  button: "'Geist', sans-serif"
  size-hero: "6rem"
  size-body: "1.125rem"
  weight-bold: "700"
spacing:
  section-padding: "80px"
  container-max-width: "1280px"
rounded:
  button: "9999px"
  card: "2.5rem"
components:
  - NebulaNav
  - ShinyCTA
  - StackMarquee
  - HeroGrid
  - FeatureCard
---

## Overview

**Third visual reset, 2026-07-25 — supersedes the Swiss Modernism system entirely.** Authority is the user-supplied `Nebula Web3 Infrastructure` DESIGN.md plus its `generated-page.html` reference build. Deep-space aesthetic: black canvas, high-contrast orange accents, depth via progressive blur / glassmorphism / grain, and a grid-curtain reveal on load.

**Scope note:** this system currently governs the **Home page only** (`app/page.tsx` + `components/home/*`). The in-app product surfaces (`app/(app)/*`) and auth pages still run on the prior token layer and are deliberately untouched until the Home page is approved. The Home page is therefore self-contained — it does not read the global light-mode tokens, so the two systems coexist without either corrupting the other.

**Product truth changes with this reset** (from the user, recorded in `PRODUCT.md`): CreatorFlow is going **open source for the community**. There is no pricing, no paid tier, and no pricing-related content, link, or CTA anywhere on the Home page.

## Colors

- **Primary Black** `#000000` — main background and deep canvas.
- **Nebula Orange** `#ea580c` / `#fb923c` — primary actions, badges, hover states, the single accent family.
- **Zinc Grays** `#18181b` / `#27272a` — secondary surfaces and borders.
- **White/Transparent** — high-opacity white for headings; 10–20% white for glassmorphic cards and border glows.

## Typography

- **Manrope** — high-impact headings, tight letter-spacing, varied weights.
- **Inter** — navigation and UI, prioritizing readability.
- **Geist / Geist Mono** — technical labels, buttons, monospace accents; reinforces the developer-first, open-source theme.
- **Heading 1** — 96px desktop / 60px mobile, `tracking-tighter`, vertical gradient clipping.

## Layout

- **Progressive Blur Header** — fixed top area using a multi-layered CSS blur stack for a glass transition on scroll.
- **Central Hero** — content centered in a 7-column grid; collapses to single-column on mobile.
- **Max-Width Containers** — `5xl` for hero content, `7xl` for feature grids.

## Elevation & Depth

- **Grid Curtains** — vertical grid where individual columns reveal via `clip-path` animation ("shutter" effect), staggered `delay-1` → `delay-7`.
- **Grainy Overlay** — SVG noise texture at 20% opacity, `mix-blend-mode: overlay`, over all large background gradients. Generated inline via `feTurbulence` as a data URI rather than fetched from an external CDN, so the page stays self-contained and offline-safe.
- **Border Beams** — conic-gradients with `mask-composite` for spinning-light border effects.

## Shapes

- **Pill Buttons** — buttons and badges at `9999px`.
- **Mega-Cards** — large feature blocks at `2.5rem`, softened by inner glass borders and backdrop blurs.

## Components

- **Shiny CTA** — CSS-animated spinning border beam, internal radial dot pattern, orange glow that breathes on hover.
- **Interactive Header** — hero characters wrapped in `overflow-hidden` spans for a vertical roll-over effect on hover.
- **Stack Marquee** — infinite horizontal scroll, pauses on hover, grayscale→color transition.
- **Navigation Bar** — floating glassmorphic pill, `backdrop-blur-xl`, subtle white gradient border.

## Page Sections (Home)

### Navigation
Fixed-top floating pill. Links: Product, How it works, Docs, GitHub. **No Pricing link** — the product is open source. Right side: "Sign in" text link + a 3D "Start free" button with spinning border on hover.

### Hero
High-contrast Manrope heading using CreatorFlow's locked copy from `docs/DESIGN_BRIEF.md` ("Fewer dropped ideas. More consistent you."), with interactive letter-hover on the emphasized phrase. Background mixes the column-reveal curtain with a radial top-glow gradient and grain.

### Stack Marquee
Full-width marquee below the hero. **Shows the real, verifiable open-source stack CreatorFlow is built on** (Next.js, React, TypeScript, Tailwind, Supabase, Postgres, Vercel) under a "Built with" label — deliberately *not* fabricated partner or customer logos, which CreatorFlow does not have (see `PRODUCT.md` → Evidence on Hand).

### Feature Showcase + Bento Grid
A `2.5rem` mega-card pairing text on the left with a live-looking product visual on the right, followed by a bento grid of the real P0 modules (Deals, Ideas, Drafts, Analytics, Team).

## Motion & Interaction

- **fadeSlideIn** — entrance keyframe: `translateY(30px)` + `blur(8px)` → `0`.
- **columnReveal** — shutter entrance for the background grid, staggered delays.
- **Scroll Triggers** — `IntersectionObserver` toggles `.animate` to fire entrance animations as sections enter the viewport.
- **Easing** — `cubic-bezier(0.16, 1, 0.3, 1)` everywhere; never default easing.

## Do's and Don'ts

- **Do** use heavy backdrop blurs (`backdrop-blur-lg`/`xl`) for elevated surfaces.
- **Do** apply grain over large background gradients.
- **Don't** use solid borders — prefer the `linear-gradient` + `mask-composite` border technique.
- **Don't** use standard transition easing.
- **Don't** put pricing content, links, or CTAs anywhere on this page — the product is open source.
- **Don't** invent customer logos, testimonials, or usage metrics; the marquee shows the real tech stack, not fake social proof.
- **Don't** ship motion without a `prefers-reduced-motion` path — the reduced-motion rule from prior audits survives every visual reset.

## Accessibility

- Dark mode enforced on this surface by default.
- Custom selection colors (`selection:bg-orange-500/30`) for contrast with the accent.
- All interactive elements keep visible focus states; the letter-roll hero hover is decorative only and never gates content.
- Grain, beams, marquee, and curtain animations all collapse under `prefers-reduced-motion: reduce`.
