# GROUP 5 — Auth surfaces · Design proposal **B**

**Scope:** `app/login`, `app/onboarding`, `app/forgot-password`, `app/reset-password`,
`app/accept-invite` (+ `app/accept-invite/AcceptInviteButton.tsx`).
**Deliverable:** written proposal. No application code is changed by this document.
**System:** Nebula (`/DESIGN.md`), as already built on Home (`components/home/*`).
**Constraint class:** re-skin. Every behaviour listed in §12 must survive byte-for-byte.

---

## 0. The idea in one paragraph — "The Airlock"

Home is a **marketing** surface: full-bleed, cinematic, seven-column curtain, motion
everywhere. The console (Group 1) is an **operating** surface: solid ground, brightness
ladder, deliberately zero blur, 240ms opacity fades only. Auth sits between them and is
neither. It is the airlock — a single lit object floating in the dark, nothing else on
screen competing for attention. So the auth tier gets exactly **one** elevated object per
screen (`AuthCard`), **one** `backdrop-filter` on the whole page (that card), **one**
`mask-composite` gradient border (that card's frame), and **one** signature action (the
`.nebula-cta` submit). Everything else — background glow, quiet three-column curtain,
grain, ghost wordmark — is depth, is `aria-hidden`, and never moves after the first 700ms.

That budget is the design. It is what stops five near-identical 400px forms from turning
into five slightly different glass casseroles, and it is what keeps the Chromium nested-
backdrop-filter bug structurally impossible rather than merely avoided by discipline.

---

## 1. Shared shell

### 1.1 Anatomy

All five routes render the same three-band vertical shell. Nothing about the shell is
per-route except the props.

```
<div class="nebula-auth">                     ← ground: bg-black, min-h-[100svh], flex-col
  <SkipLink />                                ← first tabbable node, href="#auth-main"
  <AuthBackdrop />                            ← aria-hidden, fixed inset-0, z-0
  <AuthTopBar left={mark+wordmark} right={…}/>← h-14 sm:h-16, sticky-less, static
  <main id="auth-main">                       ← flex-1, grid place-items-center
     <div class="auth-column">                ← w-full, max-w per `width` prop
        {children}                            ← heading block → AuthCard → footnote
     </div>
  </main>
  <AuthFootnote>{footnote}</AuthFootnote>     ← optional, pb-8 sm:pb-10
</div>
```

### 1.2 `AuthShell`

```tsx
// components/auth/AuthShell.tsx — SERVER component (no 'use client')
export function AuthShell({
  width = 'narrow',      // 'narrow' → max-w-[400px] | 'wide' → max-w-[480px]
  topRight,              // ReactNode | undefined  (link, step rail, or nothing)
  footnote,              // ReactNode | undefined
  ghostWord = 'CREATORFLOW',
  children,
}: AuthShellProps)
```

**It must stay a server component.** `accept-invite/page.tsx` is an `async` RSC that does
`await getAuthenticatedUser()` and `await getInviteById()`. If the shell carries
`'use client'`, that page cannot use it and Group 5 immediately splits into two shells.
Only the three leaf components that own state — `AuthPasswordField`, `AuthSubmit`,
`AuthAlert` — are client components. `AuthCard`, `AuthTopBar`, `AuthBackdrop`,
`AuthHeading`, `AuthField`, `AuthNotice`, `AuthConnectCard` are all server-safe.

Root classes:

```
relative isolate flex min-h-screen min-h-[100svh] w-full flex-col overflow-x-hidden
bg-black font-nebula-ui text-white antialiased
selection:bg-orange-500/30 selection:text-orange-200
```

`min-h-screen` first, `min-h-[100svh]` second: `svh` is the correct unit (mobile URL bar
does not create a scrollbar), and the `screen` line is the fallback for engines without
`svh`. `overflow-x-hidden` is the belt to the 320px braces in §11.

`main`: `relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-14 xl:py-20`.

### 1.3 `AuthTopBar`

```
relative z-20 flex h-14 shrink-0 items-center justify-between gap-3 px-4 sm:h-16 sm:px-6
```

No border. A hairline rule instead, because DESIGN.md forbids solid borders and a
1px `border-b` across a 1440px black page is the single most Swiss thing that could
survive this redesign:

```tsx
<div aria-hidden className="console-rule-x absolute inset-x-0 bottom-0 opacity-60" />
```

(`.console-rule-x` already exists in globals.css — a transparent→`rgba(255,255,255,0.10)`
→transparent horizontal gradient. Reused, not re-authored.)

**No `.nebula-progressive-blur`.** Home's fixed nav needs it; the auth bar is static, and
adding an 8-layer backdrop-filter stack above a card that itself has `backdrop-blur-xl`
puts two blur contexts on one page for no gain. Keeping it off is what makes "one
backdrop-filter per page" a fact rather than an aspiration.

Left cluster — the brand lockup, always a link to `/`:

```tsx
<Link href="/" className={`group inline-flex shrink-0 items-center gap-2.5 rounded-[9999px] ${FOCUS}`}>
  <ConsoleMark size={24} />
  <span className="font-nebula-ui text-[15px] font-medium tracking-tight text-white">CreatorFlow</span>
</Link>
```

`ConsoleMark` (`components/console/ConsoleMark.tsx`) not `components/ui/logo.tsx`.
`Logo` hard-codes `#000000` on every path and is invisible on black — Group 1 already
routed around it and Group 6 owns the central fix. Group 5 makes the same call.
`accept-invite`'s two branches currently render the lockup *without* a link wrapper
(lines 25–26); normalise to the link — it is a navigational improvement with no
behavioural surface.

Right cluster is the `topRight` prop, one of:
- `<AuthTopLink href=…>` (login, forgot-password)
- `<AuthSteps current=… />` (onboarding, youtube/gmail steps only)
- `undefined` (reset-password, accept-invite, onboarding welcome/check-email/done)

### 1.4 `AuthTopLink` — the inline-link recipe used everywhere

Every text link on these five screens uses exactly this string. It is the ≥40px
touch-target answer that does not bloat the 56px bar:

```tsx
className={`relative font-nebula-ui text-[13px] font-medium text-zinc-400
  transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
  hover:text-white after:absolute after:inset-x-0 after:-inset-y-3 after:content-['']
  ${FOCUS}`}
```

`FOCUS` is imported from `components/console/tokens.ts`
(`focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400`).
Do not retype it. `outline` rather than `ring` for the reason already recorded in that
file: it follows `border-radius` and needs no per-ground offset colour.

Long labels get a responsive split so they cannot wrap or overflow at 320px:

```tsx
<span className="hidden sm:inline">Don&apos;t have an account? </span>Start free
```

### 1.5 `AuthBackdrop` — the four depth layers

One component, `aria-hidden`, `fixed inset-0 z-0 pointer-events-none`. Fixed rather than
absolute so a tall onboarding step scrolling does not drag the glow with it.

| z | Layer | Implementation |
|---|---|---|
| 0 | ground | inherited `bg-black` |
| 1 | **aurora** | `absolute left-1/2 top-[-25%] h-[75%] w-[140%] -translate-x-1/2 rounded-[9999px] bg-[radial-gradient(ellipse_at_center,rgba(234,88,12,0.13),rgba(234,88,12,0.04)_38%,transparent_70%)] blur-[60px]` |
| 2 | **curtain** | `AuthCurtain` — 3 columns, `hidden md:grid md:grid-cols-3` |
| 3 | **ghost word** | `hidden xl:block`, `text-[13vw] font-nebula-heading font-extrabold tracking-tighter text-white/[0.018]`, absolutely centred, `select-none` |
| 4 | **grain** | `.nebula-grain` on the `AuthBackdrop` root (it is a `::after`, so it sits over every child) |

**`AuthCurtain`** is a deliberate 3-column reduction of `HeroCurtain`'s 7. At 400px of
content on a 1440px page, seven columns read as wallpaper; three read as architecture,
and the centre column frames the card:

```tsx
const COLUMNS = [
  { height: '58%', delay: 'nebula-delay-1', side: 'right' },
  { height: '34%', delay: 'nebula-delay-2', side: 'centre' },
  { height: '58%', delay: 'nebula-delay-3', side: 'left' },
]
```

Each column: `nebula-col relative h-full` + `border-r border-white/[0.04]` /
`border-l border-white/[0.04]`. Plinth child:
`absolute inset-x-0 bottom-0 bg-black shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.8)]` with
`borderTop: 1px solid rgba(255,255,255,0.08)` and `height` from the table.
Container mask, top-fade, same technique as `HeroCurtain`:

```
maskImage: 'linear-gradient(to top, black 30%, transparent 85%)'
WebkitMaskImage: same
```

`.nebula-col` already animates `nebulaColumnReveal` 1.4s and is already in the
reduced-motion kill list. Zero new CSS.

Contrast note: the aurora peaks at `rgba(234,88,12,0.13)` behind `blur(60px)` — measured
ground under the card is ≈`#0d0806`. Every text contrast figure in §4 is computed against
`#0d0806`, not pure black, so the numbers hold at the worst position on the page.

### 1.6 `AuthCard` — the one elevated object

```tsx
// server component
<div
  className="nebula-border auth-enter relative overflow-hidden rounded-[2rem]
             bg-white/[0.035] p-5 backdrop-blur-xl
             shadow-[0_28px_80px_-30px_rgba(0,0,0,0.9)] sm:p-7"
  style={{ '--nebula-border-gradient':
    'linear-gradient(150deg, rgba(255,255,255,0.22), rgba(255,255,255,0.03) 46%, rgba(234,88,12,0.18))',
    animationDelay: '80ms' } as CSSProperties}
>
```

Decisions worth defending:

- **`rounded-[2rem]`, not `2.5rem`.** The reference radius vocabulary
  (NEBULA_REFERENCE_NOTES §4) is `2.5rem` mega-cards / `2rem` secondary cards. A 400px-wide,
  ~340px-tall auth panel is not a mega-card; at `2.5rem` the corner arc eats the first
  field's focus ring. `2rem` at this size reads identically soft and keeps 16px of straight
  edge above the first input.
- **`backdrop-blur-xl` lives here and nowhere else.** No descendant of `AuthCard` may
  carry `backdrop-blur-*`, `backdrop-filter`, or `.nebula-progressive-blur`. This is the
  Chromium content-blanking trap; it has bitten this project twice. Fields, buttons,
  connect rows and alerts all use flat `bg-white/[0.0x]` + inset hairlines instead. The
  card's blur has real content to bite on — the aurora, curtain and grain sit behind it.
- **`.nebula-border` is spent here.** It owns `::before`. Nothing inside the card may use
  `.nebula-border` again (same rule Group 1 wrote for `ConsolePanel`). One exception, §5.2.
- **`overflow-hidden` + focus.** Because the card clips, any element flush to its inner
  edge must use `FOCUS_INSET` (`outline-offset-[-2px]`) instead of `FOCUS`. With `p-5`
  there is 20px of padding, so nothing is flush today — but the rule is written down so the
  next person adding an edge-to-edge row does not discover it as a bug.

`AuthCard` props: `{ as?: 'div' | 'form', className?, style?, children }`. On login,
onboarding-welcome, forgot-password and reset-password it renders **as the `<form>`
itself** — `as="form"` — rather than wrapping one. That preserves the existing DOM
relationship (`onSubmit` on the element that holds the fields) and avoids a pointless
extra node.

### 1.7 `AuthHeading`

```tsx
<div className="auth-enter mb-7 text-center sm:mb-8">
  {eyebrow && (
    <p className="mb-3 font-nebula-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">
      {eyebrow}
    </p>
  )}
  <h1 className="mx-auto max-w-[22ch] bg-gradient-to-b from-white to-white/70 bg-clip-text
                 pb-[0.12em] font-nebula-heading text-[26px] font-semibold leading-[1.12]
                 tracking-[-0.02em] text-transparent sm:text-[30px] lg:text-[34px]">
    {title}
  </h1>
  {subtitle && (
    <p className="mx-auto mt-3 max-w-[38ch] font-nebula-ui text-[14px] leading-relaxed
                  text-zinc-400 sm:text-[15px]">
      {subtitle}
    </p>
  )}
</div>
```

`pb-[0.12em]` is required: `bg-clip-text` clips descenders at the line box, and
"Let's get your creator business set up." has a `y` and a `g` in the first line at 320px.

`from-white to-white/70` — the Home hero uses `via-white to-white/50` at 96px where a
long fade reads as light falling off a huge letterform. At 26–34px a `/50` terminal makes
the heading look faded rather than lit. `/70` keeps the effect and the contrast
(worst-case pixel ≈`#b3b3b3` on `#0d0806` = 9.4:1).

### 1.8 Footnote

```tsx
<p className="auth-enter mx-auto mt-6 max-w-[42ch] px-2 text-center font-nebula-ui
              text-[12px] leading-relaxed text-zinc-500" style={{ animationDelay: '160ms' }}>
```

`text-zinc-500` (`#71717a`) on `#0d0806` = 4.9:1 — passes AA for normal text. Do not go
to `zinc-600`.

---

## 2. Breakpoint behaviour (all five screens)

The auth column **does not scale with the viewport**. A 400px form at 1440px is correct;
stretching it is the failure mode. What changes across breakpoints is the surrounding
depth and the shell padding.

| | 320 | 768 | 1024 | 1440 |
|---|---|---|---|---|
| shell padding | `px-4 py-10` | `px-6 py-14` | `px-6 py-14` | `px-6 py-20` |
| top bar | `h-14 px-4` | `h-16 px-6` | `h-16 px-6` | `h-16 px-6` |
| top-right link | short form ("Start free") | full sentence | full | full |
| column width | `w-full` (= 288px content) | 400 / 480px | same | same |
| card padding | `p-5` | `p-7` | `p-7` | `p-7` |
| h1 | 26px | 30px | 34px | 34px |
| curtain | **off** | 3 columns | 3 columns | 3 columns |
| ghost word | off | off | off | on (`xl:`, ≥1280) |
| aurora | on, `w-[140%]` | on | on | on |
| onboarding step rail | dots only, in bar | dots + `sr-only` label | same | same |

At 320 the curtain is off because three columns across 288px of usable width put a
vertical hairline through the card. The aurora and grain carry the depth alone, which is
enough — the card still has something to blur.

Vertical: at 320×568 (smallest realistic) the login card is ~392px tall and the shell is
`min-h-[100svh] flex-col` with `flex-1` on `main`, so the page scrolls naturally rather
than clipping. Never use `h-screen` or `overflow-hidden` on the root.

---

## 3. Component inventory

New components live in `components/auth/`. Nothing in `components/ui/*`
(`Input`, `Label`, `Button`, `Logo`) is used on these screens — that is the whole point of
the re-skin — but nothing in `components/ui/*` is deleted either, because the in-app
screens still import it until Group 6.

| Component | Client? | Builds on | Props |
|---|---|---|---|
| `AuthShell` | no | new (composes below) | `width?: 'narrow'\|'wide'`, `topRight?`, `footnote?`, `ghostWord?`, `children` |
| `AuthTopBar` | no | `.console-rule-x`, `ConsoleMark` | `right?: ReactNode` |
| `AuthTopLink` | no | `FOCUS` + `after:` extender | `href`, `children`, `shortLabel?` |
| `AuthBackdrop` | no | `.nebula-grain`, `.nebula-col`, `.nebula-delay-*` | `ghostWord?`, `showCurtain?` (default true) |
| `AuthCurtain` | no | `HeroCurtain` (3-col reduction) | — |
| `AuthCard` | no | `.nebula-border` | `as?: 'div'\|'form'`, `onSubmit?`, `className?`, `children` |
| `AuthHeading` | no | — | `eyebrow?`, `title`, `subtitle?`, `id?` |
| `AuthField` | no | new | `id`, `label`, `hint?`, `error?`, `type?`, and all `InputHTMLAttributes` |
| `AuthPasswordField` | **yes** | `AuthField` | same as `AuthField`, minus `type` |
| `AuthSubmit` | no* | `.nebula-cta` + `.nebula-cta--wide` | `loading?`, `disabled?`, `children` |
| `AuthGhostButton` | no | `ConsoleButton` variant=ghost, resized | `href?`, `onClick?`, `children` |
| `AuthAlert` | **yes** | new | `message: string \| null`, `action?: {label, href}` |
| `AuthNotice` | no | `ConsoleEmpty` icon-block pattern | `icon`, `tone?: 'neutral'\|'accent'`, `title`, `body`, `children?` |
| `AuthSteps` | no | new | `current: 1 \| 2`, `total: 2` |
| `AuthConnectCard` | no | new | `glyph`, `name`, `description`, `note` |

\* `AuthSubmit` is a plain `<button>` with no state of its own; it renders inside a page
that is already `'use client'`, so it needs no directive. Marked "no" so it stays usable
from a future server form.

**Reused as-is, unmodified:** `SkipLink`, `ConsoleMark`, `FOCUS` / `FOCUS_INSET` / `EASE`
/ `HOVER` from `components/console/tokens.ts`, `.console-rule-x`, `.nebula-border`,
`.nebula-grain`, `.nebula-col`, `.nebula-cta`, `GmailGlyph`, `YouTubeGlyph`.

**Not reused:** `NebulaReveal` (IntersectionObserver + `'use client'`; auth content is
above the fold and must render in RSC — see §6.1), `ShinyCTA` (it is a `<Link>`; auth
needs `<button type="submit">` with `disabled`).

---

## 4. Concrete styling

### 4.1 Surfaces and hairlines

| Role | Value |
|---|---|
| page ground | `bg-black` (`#000`) |
| card | `bg-white/[0.035]` + `backdrop-blur-xl` |
| field rest | `bg-white/[0.04]`, hairline `inset 0 0 0 1px rgba(255,255,255,0.10)` |
| field hover | `bg-white/[0.055]` |
| field focus | `bg-white/[0.06]`, hairline `inset 0 0 0 1px rgba(251,146,60,0.55)` |
| field disabled | `bg-white/[0.02]`, hairline `…rgba(255,255,255,0.06)`, `text-zinc-600` |
| inert block (connect row) | `bg-white/[0.03]`, hairline `…rgba(255,255,255,0.08)` |
| alert (error) | `bg-rose-500/[0.09]`, hairline `inset 0 0 0 1px rgba(244,63,94,0.30)` |
| divider inside card | `.console-rule-x` |

**On "never solid borders".** DESIGN.md's rule targets *decorative frames*, and the
mask-composite technique is spent on the card. Fields use an **inset `box-shadow`
hairline**, which is not a border: it does not participate in layout, does not shift the
box by 1px on focus, and is exactly the mechanic the reference's own signature CTA uses
for its layer-2 inner hairline (`box-shadow: inset 0 0 0 1px #1a1818`) and the mechanic
Group 1 shipped for `Monogram` (`ring-1 ring-inset`). Applying `mask-composite` to five
stacked 48px inputs would add five `::before` pseudo-elements per screen for a difference
no one can see. **Called out as a deliberate reading of the rule, not an oversight.**

### 4.2 Type scale (auth tier)

| Role | Class string |
|---|---|
| h1 | `font-nebula-heading text-[26px] sm:text-[30px] lg:text-[34px] font-semibold leading-[1.12] tracking-[-0.02em]` |
| h2 (in-card section) | `font-nebula-heading text-[15px] font-semibold tracking-[-0.01em] text-zinc-100` |
| body / subtitle | `font-nebula-ui text-[14px] sm:text-[15px] leading-relaxed text-zinc-400` |
| eyebrow / step | `font-nebula-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500` |
| field label | `font-nebula-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-zinc-400` |
| field hint | `font-nebula-ui text-[12px] leading-snug text-zinc-500` |
| field input | `font-nebula-ui text-[16px] sm:text-[14px]` |
| button label | `font-nebula-tech text-[12.5px] font-medium uppercase tracking-[0.14em]` |
| inline link | `font-nebula-ui text-[13px] font-medium` |
| error text | `font-nebula-ui text-[12.5px] leading-snug text-rose-200` |
| footnote | `font-nebula-ui text-[12px] leading-relaxed text-zinc-500` |

**`text-[16px]` on inputs below `sm`** is not a typo. iOS Safari zooms the viewport on
focus for any input under 16px, and that zoom is a horizontal-overflow event at 320px —
the exact regression §11 exists to prevent. Above `sm` it drops to 14px to match the rest
of the tier.

Label in mono uppercase mirrors the old `Label` component's role (`font-label`, uppercase,
tracked) translated into Geist Mono — the tone the creator already recognises, in the new
typeface. Field labels are always visible; §7.1.

### 4.3 `AuthField`

```tsx
<div className="flex flex-col gap-2">
  <div className="flex items-baseline justify-between gap-3">
    <label htmlFor={id} className="font-nebula-mono text-[10.5px] font-medium uppercase
                                   tracking-[0.14em] text-zinc-400
                                   peer-focus:text-orange-300">
      {label}
    </label>
    {trailing /* e.g. the Forgot-password link on /login */}
  </div>

  <input
    id={id}
    aria-invalid={error ? true : undefined}
    aria-describedby={[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined}
    className="peer h-12 w-full rounded-[12px] bg-white/[0.04] px-4
               font-nebula-ui text-[16px] text-zinc-50 placeholder:text-zinc-600
               shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]
               outline-none transition-[background-color,box-shadow] duration-200
               ease-[cubic-bezier(0.16,1,0.3,1)]
               hover:bg-white/[0.055]
               focus:bg-white/[0.06] focus:shadow-[inset_0_0_0_1px_rgba(251,146,60,0.55)]
               user-invalid:shadow-[inset_0_0_0_1px_rgba(244,63,94,0.55)]
               aria-[invalid=true]:shadow-[inset_0_0_0_1px_rgba(244,63,94,0.55)]
               disabled:bg-white/[0.02] disabled:text-zinc-600
               sm:text-[14px]
               focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
               focus-visible:outline-orange-400"
    {...rest}
  />

  {hint  && <p id={`${id}-hint`}  className="font-nebula-ui text-[12px] leading-snug text-zinc-500">{hint}</p>}
  {error && <p id={`${id}-error`} className="font-nebula-ui text-[12.5px] leading-snug text-rose-200">{error}</p>}
</div>
```

- `h-12` (48px) — comfortably over the 40px floor and the right density for a 400px column.
- `rounded-[12px]`, never `rounded-xl`. The global token layer is the *old* Swiss system;
  `--radius-full: 2px` is the known trap and the same class of bug applies to any shorthand
  radius. **Every radius on these five screens is an explicit bracket value**: `rounded-[12px]`
  for fields, `rounded-[9999px]` for pills, `rounded-[2rem]` for the card, `rounded-[1rem]`
  for icon blocks. `rounded-full` appears nowhere.
- Focus is **one crisp ring**, not two. The `:focus` rule recolours the *inset* hairline
  (mouse and keyboard alike, plus the label goes `orange-300` via `peer-focus`). The
  `focus-visible` `outline` adds the keyboard-only ring at `offset-2`. Because the inset
  hairline is inside the box and the outline is 2px outside it, they read as one lit field
  rather than a muddy double halo. No `box-shadow` glow ring — a soft 4px halo underneath a
  crisp 2px outline is where this gets ugly.
- No `backdrop-blur` on the field. It is inside `AuthCard`'s blur. Non-negotiable.

### 4.4 `AuthPasswordField`

`AuthField` + a trailing toggle. Input gets `pr-12`.

```tsx
<button
  type="button"
  onClick={() => setVisible(v => !v)}
  aria-pressed={visible}
  aria-label={visible ? 'Hide password' : 'Show password'}
  aria-controls={id}
  className={`absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center
              rounded-[9999px] text-zinc-500 transition-colors duration-150
              ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-zinc-200 ${FOCUS}`}
>
  {visible ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
</button>
```

Rules:
- 40×40 target inside a 48px field — meets the floor without a layout extender.
- Icon-only ⇒ `aria-label` required, and it **changes with state** so a screen reader
  hears the next action, while `aria-pressed` carries the current state.
- Toggling `type` between `password` and `text` preserves the value and the
  `autoComplete` attribute; password managers handle it. **Do not** remount the input
  (no `key` change) — that loses cursor position and can drop a manager's fill.
- Focus stays on the toggle after a click. Never move it back to the input.
- Applies to: `/login` password, `/onboarding` password, `/reset-password` both fields.
  `/reset-password`'s two toggles are **independent** — a shared one would hide the second
  field while the user checks the first.

### 4.5 `AuthSubmit` — the signature action, as a real button

Reuses the `.nebula-cta` class (all six layers, already in globals.css) on a
`<button type="submit">` instead of a `<Link>`:

```tsx
<button
  type="submit"
  disabled={disabled || loading}
  aria-busy={loading || undefined}
  className={`nebula-cta nebula-cta--wide group mt-1 inline-flex h-12 w-full items-center
              justify-center gap-2 font-nebula-tech text-[12.5px] font-medium uppercase
              tracking-[0.14em] text-white
              transition-[transform,box-shadow] duration-500
              hover:shadow-[0_0_40px_-12px_rgba(234,88,12,0.55)]
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
              focus-visible:outline-orange-400`}
>
  <span className="nebula-cta__label gap-2">…</span>
</button>
```

Three small CSS additions are required in the Nebula layer of `app/globals.css`
(additive only — nothing existing is edited):

```css
/* Wide pill: the stock ::after shimmer is `width:100%; aspect-ratio:1`, i.e. a
   400px-tall square inside a 48px button. Under overflow:hidden almost none of
   it lands in frame, so the sweep silently disappears on a full-width action.  */
.nebula-cta--wide::after {
  aspect-ratio: auto;
  width: 140%;
  height: 100%;
  opacity: 0.28;
  -webkit-mask-image: radial-gradient(ellipse at bottom, transparent 45%, #000);
  mask-image: radial-gradient(ellipse at bottom, transparent 45%, #000);
}

/* Disabled: kill the beam. A spinning border on a dead control reads as
   "working", which is a lie the moment the form is incomplete.              */
.nebula-cta:disabled {
  animation: none;
  cursor: not-allowed;
  opacity: 0.45;
  background: linear-gradient(#000, #000) padding-box,
              linear-gradient(rgba(255,255,255,0.14), rgba(255,255,255,0.06)) border-box;
}
.nebula-cta:disabled::before,
.nebula-cta:disabled::after { display: none; }

/* Loading: beam keeps spinning (it is now honest — work is in flight).       */
.nebula-cta[aria-busy='true'] { opacity: 1; }
```

The last rule matters because the component sets **both** `disabled` and `aria-busy`
while submitting (see §12 — `disabled={isSubmitting || …}` is existing behaviour and must
not change). Without it the button would grey out mid-request and lose the one motion
signal that says the request is alive.

Loading content: `<Loader2 size={15} className="animate-spin" />` + the existing label
("Signing in…", "Creating account…", "Sending…", "Saving…", "Joining…"). Idle content:
label + the `ArrowRight`-equivalent inline SVG with `group-hover:translate-x-1`, matching
`ShinyCTA`.

### 4.6 `AuthGhostButton` — the secondary action

For "Continue" on the onboarding connect steps, "Go to Dashboard", "Back to CreatorFlow".
Same geometry as the submit, no beam:

```
inline-flex h-12 w-full items-center justify-center gap-2 rounded-[9999px]
bg-white/[0.05] font-nebula-tech text-[12.5px] font-medium uppercase tracking-[0.14em]
text-zinc-200 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]
transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
hover:bg-white/[0.08] hover:text-white  ${FOCUS}
```

**Effects budget:** exactly one `.nebula-cta` per screen. On onboarding's youtube/gmail
steps the "Continue" is a `AuthGhostButton`, not a second signature CTA — those steps
have no primary commitment to make (nothing is being connected), and spending the
signature button on a "skip past this" action devalues it. Same reasoning Group 1 used to
allow exactly one `ShinyCTA` in the entire console.

### 4.7 `AuthAlert` — the form-level error region

```tsx
'use client'
export function AuthAlert({ message, action, id = 'auth-error' }: AuthAlertProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { if (message) ref.current?.focus() }, [message])
  if (!message) return null
  return (
    <div
      ref={ref} id={id} role="alert" tabIndex={-1}
      className="auth-enter-sm flex flex-col gap-2 rounded-[12px] bg-rose-500/[0.09] px-4 py-3
                 shadow-[inset_0_0_0_1px_rgba(244,63,94,0.30)] outline-none"
    >
      <p className="font-nebula-ui text-[12.5px] leading-snug text-rose-200">{message}</p>
      {action && (
        <Link href={action.href} className={`relative w-fit font-nebula-ui text-[12.5px]
          font-medium text-rose-100 underline underline-offset-4
          after:absolute after:inset-x-0 after:-inset-y-3 after:content-[''] ${FOCUS}`}>
          {action.label}
        </Link>
      )}
    </div>
  )
}
```

- **Rose, not orange.** Orange is the single accent and the colour of "press this". An
  orange error next to an orange CTA is unreadable as a signal. Rose is already the
  system's negative — `--console-neg: #fb7185` in the console token block — so this is a
  reuse, not a new hue. `rose-200` (`#fecdd3`) on the tinted ground = 11:1.
- `role="alert"` alone. Do **not** add `aria-live="assertive"` as well; `role="alert"`
  implies it and doubling can cause double announcements in NVDA.
- Placement is **immediately above the submit button**, inside the form — the last thing
  before the action, matching where all five pages already render it. Not at the top of
  the card (the user's eye is at the button when they press it).
- `tabIndex={-1}` + programmatic `.focus()` is the submit-failure focus answer; §7.5.
- The card's `overflow-hidden` clips nothing here (it sits inside `p-5`), so `FOCUS`
  offset-2 is fine on the nested link.

### 4.8 `AuthNotice` — the icon + message block

Used by every terminal state (check-email, reset-sent, done, invite branches). Follows
`ConsoleEmpty`'s proportions so the two tiers feel related:

```tsx
<div className="auth-enter flex flex-col items-center gap-6 text-center" role="status" tabIndex={-1}>
  <div aria-hidden className={`grid h-14 w-14 place-items-center rounded-[1rem]
    bg-white/[0.04] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]
    ${tone === 'accent' ? 'text-orange-400' : 'text-zinc-300'}`}>
    {icon /* size={22} strokeWidth={1.75} */}
  </div>
  <AuthHeading title={title} subtitle={body} />
  {children /* actions */}
</div>
```

`tone="accent"` (orange glyph) for forward-motion states: `Check` on done, `UserPlus` on
a live invite. `tone="neutral"` (zinc glyph) for waiting/dead-end states: `Mail` on
check-email, `Ban`/`LinkIcon` on an invalid invite. Orange must not decorate a dead end.

### 4.9 `AuthSteps`

Replaces `StepIndicator`. Segments, not dots — a dot pair reads as a carousel; segments
read as progress:

```tsx
<div className="flex items-center gap-2" role="group" aria-label={`Step ${current} of ${total}`}>
  <span className="sr-only">Step {current} of {total}</span>
  {Array.from({ length: total }, (_, i) => (
    <span key={i} aria-hidden className={`h-[3px] w-7 rounded-[9999px] transition-colors
      duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:w-9
      ${i < current ? 'bg-orange-500 shadow-[0_0_10px_rgba(234,88,12,0.5)]' : 'bg-white/[0.12]'}`} />
  ))}
</div>
```

Note the existing `StepIndicator` has a latent index bug (`i < index - 1` and
`i === index - 1` produce the same class, so segment 1 is filled on both steps). The
`current`-prop rewrite fixes it as a side effect of the re-skin. Call sites pass
`current={1}` on the youtube step and `current={2}` on gmail — a straight mapping from
the existing `step` value, no state change.

### 4.10 `AuthConnectCard`

```tsx
<div className="flex flex-col gap-4 rounded-[1rem] bg-white/[0.03] p-4
                shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
  <div className="flex items-start gap-3.5">
    <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px]
      bg-white/[0.05] text-zinc-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
      {glyph}
    </span>
    <div className="min-w-0">
      <p className="font-nebula-heading text-[14px] font-semibold tracking-[-0.01em] text-zinc-100">{name}</p>
      <p className="mt-1 font-nebula-ui text-[13px] leading-snug text-zinc-400">{description}</p>
    </div>
    <span className="ml-auto shrink-0 rounded-[9999px] bg-white/[0.06] px-2.5 py-1
                     font-nebula-mono text-[10px] uppercase tracking-[0.12em] text-zinc-400">
      Not connected
    </span>
  </div>

  <span aria-disabled="true"
        className="flex h-11 w-full cursor-not-allowed items-center justify-center
                   rounded-[9999px] bg-white/[0.03] font-nebula-tech text-[12px] font-medium
                   uppercase tracking-[0.14em] text-zinc-600
                   shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
    Connect {name}
  </span>

  <p className="font-nebula-ui text-[12px] leading-snug text-zinc-500">{note}</p>
</div>
```

**Honesty, explicitly.** The existing `ConnectRow` communicates "not available" through a
`title` tooltip, which is invisible on touch and to keyboard users, and through 60%
opacity, which reads as "styled disabled" rather than "not built". This design says it
three ways that all work everywhere: a persistent **"Not connected"** status pill, a
visibly inert control, and a visible `note` line. Proposed `note` copy, replacing the
`title` attribute (the one place I am adding copy — flagged in §13):

> Connecting a real account needs production Google OAuth credentials, which this build
> doesn't have yet.

The control stays a `<span>`, not a `<button disabled>`: a disabled button is still in the
a11y tree as a control that might one day work, and the visual affordance would be a lie.
`aria-disabled="true"` on a non-focusable span is inert and harmless. **No `onClick`, no
href, no OAuth implication anywhere.**

---

## 5. Screen-by-screen

### 5.1 `/login`

`AuthShell width="narrow"` (400px).

- **topRight:** `AuthTopLink` → `/onboarding` (preserving `next` exactly as today:
  `searchParams.get('next') ? '/onboarding?next=' + encodeURIComponent(...) : '/onboarding'`).
  Label: `<span className="hidden sm:inline">Don't have an account? </span>Start free`.
- **Heading:** title "Welcome back", subtitle "Sign in to pick up where you left off."
  (unchanged copy).
- **Card** `as="form"`, `onSubmit={handleSubmit}`, `aria-busy={isSubmitting || undefined}`,
  `noValidate={false}`. Children, `gap-5`:
  1. `AuthField` — `id="email"`, label "Email", `type="email"`, `name="email"`,
     `autoComplete="email"`, `inputMode="email"`, `autoCapitalize="none"`,
     `autoCorrect="off"`, `spellCheck={false}`, `required`,
     `placeholder="you@gmail.com"`.
  2. `AuthPasswordField` — `id="password"`, label "Password",
     `autoComplete="current-password"`, `required`, `placeholder="••••••••"`,
     `trailing={<AuthTopLink href="/forgot-password" className="text-[12px]">Forgot password?</AuthTopLink>}`.
     The link sits in the label row, right-aligned and baseline-aligned — same position it
     occupies today, with the `after:-inset-y-3` extender added so it clears 40px.
  3. `AuthAlert message={error}`.
  4. `AuthSubmit disabled={isSubmitting || !email.trim() || !password} loading={isSubmitting}` —
     the disabled expression is copied verbatim from the current file.
- **Footnote:** "Free means free — no percentage of your deals, no credit card to start."
  (unchanged; note it contains no pricing *offer*, it is a statement that there is no
  price — consistent with PRODUCT.md).

Grid at each breakpoint: single column throughout. 320 → card `p-5`, fields full width,
the "Forgot password?" link drops to its own line under the label via
`flex-wrap` on the label row (it does not shrink the label).

### 5.2 `/onboarding`

`AuthShell width="wide"` (480px). Five step states, all in one page, `useState` step —
**do not move step to the URL**; the current back-button behaviour (browser back leaves
the flow) is existing behaviour.

- **topRight:** `<AuthSteps current={step === 'youtube' ? 1 : 2} total={2} />` rendered
  only when `step === 'youtube' || step === 'gmail'` — same condition as today.
- Step body is keyed for crossfade: `<div key={step} className="auth-enter">`.

| step | Heading | Card body |
|---|---|---|
| `welcome` | "Let's get your creator business set up." / "Takes about a minute. Free, no credit card." | `AuthCard as="form"`: name, email, password fields → `AuthAlert` → `AuthSubmit` |
| `check-email` | `AuthNotice` tone=neutral, `Mail` icon | no card — the notice *is* the moment |
| `youtube` | eyebrow "Step 1 of 2", "Connect YouTube", existing body copy | `AuthCard as="div"`: `AuthConnectCard` (YouTube) + `AuthGhostButton onClick={()=>setStep('gmail')}` "Continue" |
| `gmail` | eyebrow "Step 2 of 2", "Connect Gmail", existing body copy | `AuthCard as="div"`: `AuthConnectCard` (Gmail) + `AuthGhostButton onClick={()=>setStep('done')}` "Continue" |
| `done` | `AuthNotice` tone=accent, `Check` icon, "You're set up." | `AuthGhostButton href={nextHref}` with the existing conditional label |

Field details for `welcome` (all `autoComplete` values preserved, one added):
- `onboard-name` — label "Full name", `name="name"`, **`autoComplete="name"` (added — the
  field currently has none)**, `autoFocus`, `placeholder="Priya Nair"`.
- `onboard-email` — as `/login`'s email but `autoComplete="email"` only; note the current
  field has **no `required`** and neither will the redesign. The disabled-button guard
  (`!fullName.trim() || !email.trim() || !password`) is the existing validation semantics.
- `onboard-password` — `autoComplete="new-password"`, `hint="At least 8 characters"`?
  **No.** Supabase's minimum is a server setting and the current UI makes no such claim on
  this screen. Leave the placeholder `••••••••` and add no hint — inventing a rule the
  form does not enforce is a validation-semantics change.

`check-email` renders the user's email inline. That string is unbounded and currently
overflows at 320px:
```tsx
<span className="font-medium text-zinc-100 [overflow-wrap:anywhere]">{email}</span>
```
`[overflow-wrap:anywhere]` not `break-all` — it breaks only when it must.

**The `.nebula-border` exception.** On `youtube`/`gmail` the `AuthCard` wraps a single
`AuthConnectCard`, so the card frame and the connect block are concentric at 16px offset,
which looks like a mistake. Fix: on those two steps `AuthCard` takes
`className="p-0 bg-transparent backdrop-blur-none"` **and drops `.nebula-border`** — i.e.
the connect block *is* the elevated object, and it borrows the card's gradient border by
receiving `.nebula-border` itself. Net effect: still exactly one `.nebula-border` and one
`backdrop-filter` on the page (the blur moves onto `AuthConnectCard` for these two steps).
Implementation: `AuthCard` gets a `variant?: 'panel' | 'bare'` prop; `bare` renders a plain
`<div className="auth-enter">` passthrough and `AuthConnectCard` accepts an
`elevated?: boolean` that adds `nebula-border backdrop-blur-xl bg-white/[0.035] rounded-[2rem] p-5 sm:p-7`.

### 5.3 `/forgot-password`

`AuthShell width="narrow"`.

- **topRight:** `AuthTopLink href="/login"` → "Back to sign in".
- **`sent === false`:** heading "Reset your password" / "Enter your email and we'll send
  you a link to set a new one." Card `as="form"` with one `AuthField` (email, `autoFocus`,
  `required`, `autoComplete="email"`), `AuthAlert`, `AuthSubmit` ("Send reset link" /
  "Sending…", `disabled={isSubmitting || !email.trim()}`).
- **`sent === true`:** the card is replaced by `AuthNotice` tone=neutral, `MailCheck`
  icon, title "Check your email", body:
  "If an account exists for **{email}**, we've sent a link to reset your password."
  — copy unchanged, and the email span gets `[overflow-wrap:anywhere]`. Below it, an
  `AuthTopLink href="/login"` "Back to sign in" (the top-bar link stays too; a terminal
  state should not require a trip to the header). The notice carries `role="status"` and is
  focused on mount so screen readers and keyboard users both land on the outcome.

Deliberate: the enumeration-safe copy ("If an account exists for…") is preserved word for
word. Do not "improve" it into a confirmation.

### 5.4 `/reset-password`

`AuthShell width="narrow"`. No topRight (the user arrived from an email link; a "back to
sign in" here invites abandoning a half-finished reset — matching current behaviour, which
also has none).

- Heading "Set a new password" / "Choose something you haven't used before."
- Card `as="form"`, two `AuthPasswordField`s:
  - `new-password` — label "New password", `autoComplete="new-password"`, `autoFocus`,
    `required`, `hint="At least 8 characters"`. **Here the hint is correct** because this
    page *does* enforce it client-side (`if (password.length < 8)`), unlike onboarding.
    Promoting it from a placeholder to a hint line is the right move: a placeholder
    disappears the moment the user types, and `zinc-600` placeholder contrast is 2.8:1,
    which is fine for a decorative example and not fine for a rule.
  - `confirm-password` — label "Confirm password", `autoComplete="new-password"`,
    `required`, `placeholder="••••••••"`.
- `AuthAlert message={error} action={{ label: 'Request a new link', href: '/forgot-password' }}`.
- `AuthSubmit disabled={isSubmitting || !password || !confirm} loading` — verbatim.

**Expired / invalid token.** This page performs no token check of its own; the link is
consumed by `/auth/callback`, and if the recovery session is missing or expired,
`updatePassword()` returns a Supabase error which the existing code puts in `error`. So the
expired-token case *is* the form-level error case, and I am not adding detection logic
(that would be a behaviour change). What the design adds is presentation: whenever this
screen shows a form-level error, `AuthAlert` also renders the **"Request a new link"**
action. That is unconditional — it is helpful for a mismatch too ("I've lost track, start
over") and it means the dead-token user is never stranded with a message they cannot act
on. Both client-validation messages ("Password must be at least 8 characters.",
"Passwords don't match.") stay exactly as written, in the same single `error` slot, with
the same trigger points. The two fields additionally get `aria-invalid` when `error` is
non-null, which is annotation, not validation.

### 5.5 `/accept-invite`

Server component. `AuthShell width="wide"` (480px — the invite copy is the longest on the
tier). Four branches, each a terminal `AuthNotice` plus actions. Order and conditions
unchanged.

| Branch | Notice | Actions |
|---|---|---|
| **no `invite` param** | tone=neutral, `Unlink` icon, "Invite link incomplete." / existing body | `AuthGhostButton href="/"` "Back to CreatorFlow" |
| **not signed in** | tone=accent, `UserPlus`, "You've been invited to CreatorFlow." / existing body | `ShinyCTA href={/onboarding?next=…}` "Create account" — this is the one branch whose primary action is pure navigation, so the `Link`-based `ShinyCTA` is the right object rather than `AuthSubmit`; add `className="w-full px-6 py-4 text-[12.5px]"` and the `.nebula-cta--wide` modifier — plus `AuthTopLink href={/login?next=…}` "Already have an account? Sign in" |
| **invite missing / not pending** | tone=neutral, `Ban`, "This invite isn't valid." / existing body | `AuthGhostButton href="/dashboard"` "Go to Dashboard" |
| **valid pending invite** | tone=accent, `UserPlus`, "Join as an owner/a collaborator?" / existing role-conditional body | `<AcceptInviteButton inviteId={invite.id} />` |

`AcceptInviteButton` (client) is re-skinned in place: `AuthAlert message={error}` above,
then `AuthSubmit`-shaped `<button onClick={accept} disabled={isPending} aria-busy={isPending}>`
with "Accept invite" / "Joining…". It keeps `router.push('/team')` + `router.refresh()`.
This is the second `.nebula-cta` on the tier and it is correct — accepting an invite is a
commitment, exactly what the signature action is for. Note it is a `<button>` with an
`onClick`, so it uses `AuthSubmit` with `type="button"`; the component takes a `type` prop
defaulting to `'submit'`.

`metadata` export stays. This page's `shell()` closure collapses into `AuthShell`, which
removes the local duplication.

---

## 6. Motion plan

### 6.1 Entrance

The auth card is above the fold on every screen at every breakpoint, so an
IntersectionObserver is the wrong instrument — it fires on mount anyway and costs a
`'use client'` boundary that `accept-invite` cannot pay. Instead, one new CSS class,
reusing the existing keyframe:

```css
/* additive, in the NEBULA layer of globals.css */
.auth-enter    { animation: nebulaFadeSlideIn 700ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.auth-enter-sm { animation: authEnterSm 180ms cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes authEnterSm { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
```

Stagger, via inline `animationDelay` (no new classes):

| Element | Delay |
|---|---|
| `AuthHeading` | `0ms` |
| `AuthCard` / `AuthNotice` | `80ms` |
| footnote | `160ms` |
| curtain columns | `100/200/300ms` (existing `.nebula-delay-1..3`) |

Total settle: ~1.1s worst case, dominated by the 1.4s curtain, which is background.

### 6.2 Continuous / interactive

| What | Motion | Trigger |
|---|---|---|
| submit beam (`.nebula-cta`) | conic `nebulaBorderSpin` 2.5s linear infinite | always, when enabled |
| submit shimmer (`::after`) | `nebulaShimmer2` 4s linear infinite | always, when enabled |
| submit hover | `--nebula-angle-offset`→180deg, `--nebula-shine`→`#ffd6b0` over 800ms; outer glow shadow 500ms | hover |
| submit press | `translateY(1px)` | `:active` |
| field focus | `background-color` + `box-shadow` 200ms | focus |
| label recolour | `color` 200ms → `orange-300` | `peer-focus` |
| link hover | `color` 150ms | hover |
| step segment fill | `background-color` 300ms | step change |
| step crossfade | `.auth-enter` on a keyed wrapper | step change |
| alert appear | `.auth-enter-sm` 180ms | error set |
| loading spinner | `animate-spin` | submitting |

No hover-lift on the card. No parallax. No mouse-tracking glow. The card is a fixed object;
the only thing that moves after settle is the button beam and whatever the user touches.

### 6.3 Reduced motion

Add to the **existing** `@media (prefers-reduced-motion: reduce)` block in the Nebula layer
(the one that already lists `.nebula-col`, `.nebula-reveal`, `.console-fade`, …):

```css
.auth-enter, .auth-enter-sm { animation: none !important; opacity: 1; transform: none; filter: none; }
```

`.nebula-cta` and its `::after` are **already** killed by the existing rule at globals.css
:755. `.nebula-col` is already killed and lands at `clip-path: none; opacity: 1`. The
global `*` rule at :153 clamps every remaining transition to 0.01ms and forces
`animation-iteration-count: 1`, which stops `animate-spin` after one turn — acceptable,
because the button's **text** ("Signing in…") is the primary loading signal and is
unaffected. Do not add a bespoke spinner rule to work around that; the text carries it.

Net: under reduced motion the five screens are fully static. Every entrance lands on its
end state, no infinite loop survives, and no content is hidden waiting for an animation
that will not run.

---

## 7. Form specifics

### 7.1 Labels

Visible, always, above the field. Never placeholder-only, never a floating label that
vacates on focus. The reference build's floating-label trick
(`peer-placeholder-shown`/`peer-focus`) is explicitly **not** adopted: it puts the label
inside the input's box, which means at the moment of an error the field is simultaneously
holding a label, a value, a toggle button and a red hairline. Placeholders here are
format examples only (`you@gmail.com`, `Priya Nair`, `••••••••`) and never carry
information not present elsewhere.

### 7.2 Inline validation timing

**No new JavaScript validation.** Two mechanisms, both already true of the code:

1. **Native, on blur-after-interaction** — `input:user-invalid` recolours the hairline
   rose. This fires only after the user has interacted with and left a field, which is the
   correct timing (never while typing the first character of an email). It is driven
   entirely by attributes that already exist (`required`, `type="email"`), so it changes
   no semantics. Where a field has no `required` (onboarding's three), `:user-invalid`
   simply never fires — accurate, since the form does not require them individually; the
   submit button's `disabled` expression is the guard.
2. **On submit** — the existing handlers set `error` and `AuthAlert` renders. Nothing is
   validated earlier than the code validates it today.

`aria-[invalid=true]:` pairs the same hairline with the `aria-invalid` prop for the
reset-password case, so the annotation and the visual agree.

### 7.3 Autocomplete matrix

| Screen | Field | `type` | `name` | `autoComplete` | Other |
|---|---|---|---|---|---|
| login | email | `email` | `email` | `email` | `inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} required` |
| login | password | `password`\|`text` | `password` | `current-password` | `required` |
| onboarding | full name | `text` | `name` | `name` **(added)** | `autoFocus autoCapitalize="words"` |
| onboarding | email | `email` | `email` | `email` | as above, **no `required`** (unchanged) |
| onboarding | password | `password`\|`text` | `new-password` | `new-password` | — |
| forgot | email | `email` | `email` | `email` | `autoFocus required` |
| reset | new password | `password`\|`text` | `new-password` | `new-password` | `autoFocus required` |
| reset | confirm | `password`\|`text` | `confirm-password` | `new-password` | `required` |

Every `<form>` keeps a real submit button so Enter-to-submit works. `AuthShell` never
wraps children in a form — nesting forms would break that.

### 7.4 Error placement and ARIA

- **Form-level:** one `AuthAlert` per form, immediately above the submit,
  `role="alert"`, `tabIndex={-1}`. This is where all five screens' errors go today.
- **Field-level:** `AuthField` supports `error` → `<p id="{id}-error">` directly under the
  field, wired via `aria-describedby`, plus `aria-invalid`. **On these five screens the
  prop ships unused** — none of the current handlers produce per-field errors, and adding
  some would change validation semantics. The slot exists so the eventual Supabase
  per-field mapping has somewhere to land without a redesign.
- **Hint:** `<p id="{id}-hint">`, also in `aria-describedby`, listed *before* the error id
  so a screen reader reads the rule then the failure.
- **Loading:** `aria-busy` on the `<form>` and on the submit button. No extra
  `role="status"` live region for loading — the button label already changes and is inside
  the form the user just submitted; a duplicate announcement is noise.
- **Success:** terminal `AuthNotice`s carry `role="status"` and are focused on mount, so
  the outcome is announced and keyboard focus is at the new content rather than orphaned on
  a button that no longer exists.

### 7.5 Focus management on submit failure

This is the one genuinely load-bearing interaction detail on the tier.

Every current page disables the submit button while `isSubmitting`. A disabled button
loses focus, so after a failed sign-in the user's focus is on `<body>` and a screen-reader
user hears the `role="alert"` but a keyboard user has to Tab from the top of the document
to get back. Fix, entirely in presentation:

```
error set (non-null)  →  AuthAlert's useEffect fires  →  ref.current.focus()
```

`AuthAlert` is `tabIndex={-1} outline-none` — programmatic focus on a non-interactive
container does not paint a `:focus-visible` ring in any supported engine, and the element
is not tab-reachable afterwards. The next Tab from there lands on the (re-enabled) submit
button, which is exactly where the user wants to be.

**I am deliberately not** switching the button from `disabled` to `aria-disabled` +
handler guard, even though that would preserve focus more elegantly. The `disabled`
expressions (`isSubmitting || !email.trim() || !password`) are existing behaviour, they
gate real submission, and swapping the mechanism is precisely the kind of "small" rewrite
the brief forbids. The focus-the-alert approach gets the same outcome without touching the
form's contract. Called out in §13.

---

## 8. State matrix

Legend for the shared states:

- **idle** — card settled, submit disabled until the existing `disabled` expression clears.
- **focused** — field ground lifts to `white/[0.06]`, inset hairline → `orange-400/55`,
  label → `orange-300`; keyboard adds the `offset-2` outline.
- **submitting** — submit shows spinner + verb-ing label, `aria-busy`, beam still spinning
  (`.nebula-cta[aria-busy='true']` keeps opacity 1); all fields stay enabled and editable
  (unchanged — none of the current pages disable fields).
- **form error** — `AuthAlert` in rose above the button, focus moves to it, submit
  re-enables.
- **field error** — hairline rose via `:user-invalid` (native) or `aria-invalid`.

| Screen | Idle | Submitting | Form error | Success | Token invalid |
|---|---|---|---|---|---|
| **login** | 2 fields, submit disabled until both non-empty | "Signing in…" | Supabase message in alert | route push to `next \|\| /dashboard`; no in-page success state (unchanged) | n/a |
| **onboarding · welcome** | 3 fields, submit disabled until all three | "Creating account…" | Supabase message in alert | → `youtube` if `data.session`, else → `check-email` | n/a |
| **onboarding · check-email** | terminal notice, `role="status"`, focused | — | — | is the success state | n/a |
| **onboarding · youtube / gmail** | connect card, "Not connected" pill, inert control, ghost "Continue" | — | — | advances step | n/a |
| **onboarding · done** | accent notice + ghost button to `nextHref` | — | — | is the success state | n/a |
| **forgot** | 1 field, submit disabled until non-empty | "Sending…" | Supabase message in alert | `sent` → notice, focused, enumeration-safe copy | n/a |
| **reset** | 2 fields + hint, submit disabled until both non-empty | "Saving…" | alert + **"Request a new link"** action | route push to `/dashboard` | surfaces *as* the form error, with the recovery link — §5.4 |
| **accept-invite · no param** | notice + "Back to CreatorFlow" | — | — | — | is the invalid state |
| **accept-invite · signed out** | accent notice + `ShinyCTA` + sign-in link | — | — | — | — |
| **accept-invite · not pending** | notice + "Go to Dashboard" | — | — | — | **is** the expired/revoked/wrong-account state; copy already names all three causes and is preserved |
| **accept-invite · pending** | accent notice + accept button | "Joining…" | alert above button | route push to `/team` | — |

**Loading skeletons:** none. These are forms, not data regions; there is nothing to
skeleton. The two `Suspense` boundaries (`login`, `onboarding`, both wrapping
`useSearchParams`) currently pass `fallback={null}`. Keep `null` — the boundary resolves
in the same tick on the client and a flash of skeleton would be worse than nothing.
`accept-invite`'s server data (`getInviteById`) blocks the route render, which is correct
for a page whose entire content depends on the answer.

---

## 9. Accessibility checklist (per screen, all must pass)

1. `SkipLink` is the first tabbable node → `#auth-main`. `main` carries `id="auth-main"`
   and, if not naturally focusable, `tabIndex={-1}`.
2. Exactly one `<h1>` per rendered state. On onboarding the `<h1>` changes with the step —
   fine, one at a time.
3. Every interactive element carries `FOCUS` (or `FOCUS_INSET` if flush to a clip edge).
   Never `outline-none` without a replacement.
4. Icon-only controls: the password toggle is the only one; `aria-label` + `aria-pressed`,
   both state-aware.
5. Decorative layers `aria-hidden`: `AuthBackdrop` root, curtain, aurora, ghost word, grain
   (`::after`, inherently), `ConsoleMark`, `AuthSteps` segments, `AuthNotice` icon wrapper,
   `AuthConnectCard` glyph wrapper.
6. Touch targets: fields 48px; submit 48px; ghost button 48px; password toggle 40px;
   every inline link 40px via `after:-inset-y-3`; top-bar lockup 24px glyph inside a
   ≥40px-tall bar row (the `<Link>` is `inline-flex` in an `h-14` bar — add
   `after:absolute after:inset-y-0 after:-inset-x-2 after:content-['']` and `relative` to
   guarantee it).
7. All motion collapses under `prefers-reduced-motion` (§6.3).
8. No horizontal overflow at 320px (§11).
9. Contrast, measured against `#0d0806` (worst-case ground under the aurora):
   `zinc-50` 19.4:1 · `zinc-100` 17.6:1 · `zinc-200` 14.8:1 · `zinc-300` 11.9:1 ·
   `zinc-400` 8.4:1 · `zinc-500` 4.9:1 · `rose-200` on the tinted alert 11:1 ·
   `orange-400` (`#fb923c`) 9.1:1. `zinc-600` (2.8:1) is used for **placeholders only**,
   which are never the sole carrier of information. The 2px `orange-400` focus outline
   against both the card (`≈#151011`) and the page ground exceeds the 3:1 non-text
   requirement.
10. Colour is never the only signal: the "Not connected" state is a pill *and* an inert
    control *and* a sentence; errors are rose *and* prose in an `role="alert"`.

---

## 10. Files touched (for the implementing engineer)

**New:** `components/auth/AuthShell.tsx`, `AuthTopBar.tsx`, `AuthTopLink.tsx`,
`AuthBackdrop.tsx`, `AuthCurtain.tsx`, `AuthCard.tsx`, `AuthHeading.tsx`, `AuthField.tsx`,
`AuthPasswordField.tsx`, `AuthSubmit.tsx`, `AuthGhostButton.tsx`, `AuthAlert.tsx`,
`AuthNotice.tsx`, `AuthSteps.tsx`, `AuthConnectCard.tsx`, `index.ts`.

**Edited (markup/classes only):** the five pages + `AcceptInviteButton.tsx`.

**Edited (additive CSS only):** `app/globals.css` — three additions inside the existing
NEBULA layer: `.auth-enter` / `.auth-enter-sm` + `@keyframes authEnterSm`;
`.nebula-cta--wide::after` / `.nebula-cta:disabled` / `.nebula-cta[aria-busy='true']`; and
two selectors appended to the existing reduced-motion list. **No existing rule is
modified**, so Home and the console are untouched.

**Not touched:** `lib/supabase/auth.ts`, `lib/supabase/actions.ts`, `lib/supabase/queries.ts`,
`app/auth/callback/*`, `components/ui/*`, `components/home/*`, `components/console/*`.

---

## 11. 320px audit

Every known overflow vector on this tier, and its answer:

| Vector | Answer |
|---|---|
| long top-bar link ("Don't have an account? Start free") | `hidden sm:inline` on the prefix |
| user email echoed in check-email / reset-sent | `[overflow-wrap:anywhere]` on the span |
| Supabase error strings (unbounded) | `AuthAlert` is `flex-col` with wrapping `<p>`; no `whitespace-nowrap` anywhere |
| long h1 ("Let's get your creator business set up.") | `max-w-[22ch]`, `text-[26px]`, natural wrap; `pb-[0.12em]` for the clipped descender |
| uppercase tracked button label at `tracking-[0.14em]` | `text-[12.5px]` + `px` from the flex centring, not fixed padding; "Save new password" measures 214px at 320 |
| iOS focus zoom on <16px inputs | `text-[16px]` below `sm` |
| aurora at `w-[140%]` | inside `AuthBackdrop` which is `fixed inset-0 overflow-hidden` |
| ghost word at `13vw` | `hidden xl:block` |
| curtain hairlines | `hidden md:grid` |
| `AuthConnectCard` name + "Not connected" pill in one row | `min-w-0` on the text block, `shrink-0` on the pill; the pill wraps below via `flex-wrap` on the row at `<sm` |

Root also carries `overflow-x-hidden` as the backstop.

---

## 12. Behaviour that must survive verbatim (implementation contract)

Check each of these after the re-skin. None may change.

1. `login`: `signInWithEmail(email.trim(), password)`; on success
   `router.push(searchParams.get('next') || '/dashboard')` then `router.refresh()`;
   the guard `if (!email.trim() || !password) return`; `finally { setIsSubmitting(false) }`.
2. `login` / `onboarding`: the `Suspense` boundary around the `useSearchParams` consumer,
   `fallback={null}`. Do not hoist `useSearchParams` above it.
3. `login` / `onboarding`: the `next` param is round-tripped through
   `encodeURIComponent` into the cross-link, and only when present.
4. `onboarding`: `signUpWithEmail(email.trim(), password, { full_name: fullName.trim() })`;
   **`setStep(data.session ? 'youtube' : 'check-email')`** — the email-confirmation fork is
   the subtlest thing on the tier and is easy to lose in a rewrite.
5. `onboarding`: step lives in `useState`, not the URL. `STEPS` ordering, the
   `step === 'youtube' || step === 'gmail'` condition on the indicator, and `nextHref`
   (`searchParams.get('next') || '/dashboard'`) with its conditional button label.
6. `onboarding`: no `beforeunload` handler exists on this page (the only one in the repo is
   `app/(app)/drafts/DraftsBoard.tsx:54`). Do not add one — an unsaved-changes prompt on a
   signup form is new behaviour.
7. `forgot-password`: `requestPasswordReset(email.trim())`, whose `redirectTo` is
   `${origin}/auth/callback?next=/reset-password`; `sent` is one-way; the
   enumeration-safe copy.
8. `reset-password`: `password.length < 8` → "Password must be at least 8 characters.";
   `password !== confirm` → "Passwords don't match." (curly apostrophe, as written);
   both checks run **before** `setIsSubmitting(true)` and `return` early; on success
   `router.push('/dashboard')` + `router.refresh()`.
9. `accept-invite`: `await searchParams` (Next 15 async params); `getAuthenticatedUser()`;
   `getInviteById(inviteId)`; the branch order **no-param → no-user → invalid → valid**;
   `invite.status !== 'pending'`; the `invite.role === 'owner'` copy fork; `nextParam`
   construction; `export const metadata`.
10. `AcceptInviteButton`: `acceptTeamInvite(inviteId)`, `result.error` into local state,
    `router.push('/team')` + `router.refresh()`, `isPending` gating.
11. Every `disabled={…}` expression on every submit button, unchanged.
12. Every `autoComplete` value, unchanged (one addition: `name` on the full-name field).

---

## 13. Where this design pushes against the constraints

Stated plainly so a reviewer can rule on each.

1. **`.nebula-cta` needs three new CSS rules** (§4.5). The shipped class is tuned for
   Home's `px-12 py-5` inline pill; on a full-width 48px button the `aspect-ratio: 1`
   shimmer falls outside the frame and the spinning beam keeps spinning on a `disabled`
   control. All three additions are new selectors — `.nebula-cta--wide::after`,
   `.nebula-cta:disabled`, `.nebula-cta[aria-busy='true']` — so Home's rendering is
   byte-identical. If the reviewer prefers zero CSS change, the fallback is
   `AuthGhostButton` for every submit, which costs the tier its signature moment.

2. **Blur moves off `AuthCard` on two onboarding steps** (§5.2). To avoid concentric
   frames, the connect block becomes the elevated object on `youtube`/`gmail`. The
   invariant — one `backdrop-filter`, one `.nebula-border` per page — holds, but it is
   carried by a different element on those two steps. Worth a reviewer's eye because
   "the card always has the blur" is the simpler rule to police.

3. **The "no solid borders" rule is read as applying to frames, not field hairlines**
   (§4.1). Fields use inset `box-shadow`, following the reference CTA's own layer 2 and
   Group 1's `Monogram`. If the reviewer reads the rule absolutely, every field needs a
   `::before` mask-composite ring, which conflicts with `AuthField` also wanting `::before`
   space and adds ~15 pseudo-elements across the tier for no visible difference.

4. **One copy addition and one copy promotion.** Added: the `AuthConnectCard` `note`
   ("Connecting a real account needs production Google OAuth credentials, which this build
   doesn't have yet."), replacing a `title` tooltip that touch and keyboard users cannot
   reach. This is *more* honest, not less, and the constraint explicitly requires the
   connect steps stay honestly labelled. Promoted: reset-password's "At least 8 characters"
   moves from placeholder to a persistent hint, because the page actually enforces it.
   Everything else is unchanged copy.

5. **Focus-on-failure is new interaction, not new behaviour** (§7.5). Nothing today moves
   focus after a failed submit, so keyboard users are stranded on `<body>`. Moving focus to
   the `role="alert"` is additive. I explicitly did **not** take the cleaner route of
   swapping `disabled` for `aria-disabled`, because that touches the submission contract.

6. **`AuthSteps` fixes a latent bug** (§4.9). The existing `StepIndicator` renders segment
   1 filled on both steps because `i < index - 1` and `i === index - 1` map to the same
   class. The rewrite takes an explicit `current` and is therefore correct. This is a
   visual change to existing output — intended, but flagged so it is not mistaken for
   drift.

7. **`components/ui/logo.tsx` still hard-codes `#000000`** and is unusable on black; this
   tier routes around it via `ConsoleMark`, exactly as Group 1 did. Group 6 should own the
   real fix. Until then, three components render the CreatorFlow mark three ways.

8. **The root layout is still light-mode.** `app/layout.tsx` sets
   `viewport.colorScheme: 'light'`, `themeColor: '#FFFFFF'`, and `<html className="bg-linen">`.
   On a black auth page that produces a white overscroll gutter on iOS and a white flash on
   navigation. Home has the same defect today. Group 5 does **not** fix it globally (that is
   a shared-surface change and would affect the still-light in-app screens); the local
   mitigation is `bg-black` on the shell root plus `<meta name="theme-color" content="#000000">`
   via a route-level `viewport` export on each of the five pages. Flagged for Group 6 as the
   proper fix once the whole app is dark.

9. **No pricing, no fabricated evidence, no live-AI implication** — verified across all five
   screens. The only money-adjacent strings are login's footnote and onboarding's "Free, no
   credit card", both pre-existing statements that there is *no* price, which PRODUCT.md
   permits. No testimonial, logo, count or benchmark appears anywhere on the tier, and
   nothing in the connect steps implies working OAuth.
