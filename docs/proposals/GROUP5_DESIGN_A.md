# Group 5 — Auth surfaces · Design Proposal A

**Scope:** `app/login`, `app/onboarding`, `app/forgot-password`, `app/reset-password`,
`app/accept-invite` (+ `app/accept-invite/AcceptInviteButton.tsx`).
**Nature:** re-skin. Zero change to `lib/supabase/auth.ts` call sites, server actions,
queries, validation semantics, redirect targets, or error handling.
**Authority:** `docs/REDESIGN_BRIEF.md` → `DESIGN.md` → `docs/NEBULA_REFERENCE_NOTES.md` →
`components/home/*` (built expression) → `docs/proposals/GROUP1_DECISION.md` (binding for the
console tier; this document defines the tier next to it, and borrows its discipline).

---

## 0. The one-paragraph thesis

Nebula ships at two scales today: **marketing** (`app/page.tsx` — 8xl headlines, curtains,
`2.5rem` mega-cards, theatre) and **console** (Group 1 — 13px rows, brightness ladder, near-zero
motion, no blur). Auth is neither. It is a **threshold**: five short, high-stakes, low-frequency
moments where the user is doing exactly one thing and needs to trust the surface. So this proposal
defines a third, deliberately narrow tier — **Threshold** — that sits between the two and borrows
from both: the console's density, contrast floor and token rigour; the marketing tier's grain, glass,
gradient border and the one signature button. It is intentionally the smallest tier in the system:
**one shell, one card, one field, one button, one notice.** Five screens, five components' worth of
surface area.

The load-bearing constraint that shapes everything below: **auth pages are where fabricated evidence
gets smuggled into products.** No split-screen marketing panel, no testimonial rail, no "join 12,000
creators", no logo wall. CreatorFlow has none of that and will not grow it on a login screen. The
composition is centred at every breakpoint and earns its scale from atmosphere, not from a second
column of claims.

---

## 1. Layout structure per screen

### 1.0 The shared shell (all five screens)

Every screen is the same three-band vertical stack. Nothing else is shared, and nothing else needs to be.

```
┌──────────────────────────────────────────────────────┐
│ AuthTopBar        h-14 · logo lockup ⟷ trailing slot │  band 1 · shrink-0
├──────────────────────────────────────────────────────┤
│                                                      │
│           ┌──────────────────────────┐               │
│           │  AuthHeading             │               │  band 2 · flex-1, centred
│           │  AuthCard / AuthNotice   │               │           both axes
│           │  AuthAltLink             │               │
│           └──────────────────────────┘               │
│                                                      │
├──────────────────────────────────────────────────────┤
│ AuthFoot          footnote, 1 line, optional         │  band 3 · shrink-0
└──────────────────────────────────────────────────────┘
```

Root element:

```html
<div class="nebula-auth relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden
            bg-black font-nebula-ui text-zinc-200 antialiased
            selection:bg-orange-500/30 selection:text-orange-200">
```

`min-h-[100dvh]` not `min-h-screen` (Group 1 §4.1 — `100vh` leaves a dead strip under mobile browser
chrome). `overflow-x-hidden` on the root is what makes the oversized atmosphere layers safe at 320px.

Atmosphere (one layer, `aria-hidden`, `z-0`, immediately after the root open tag):

```html
<div aria-hidden class="nebula-grain pointer-events-none absolute inset-0 z-0">
  <div class="absolute left-1/2 top-[-18%] h-[70%] w-[160%] max-w-none -translate-x-1/2
              bg-[radial-gradient(ellipse_at_top,rgba(234,88,12,0.10),rgba(24,24,27,0.06)_45%,transparent_70%)]
              sm:w-[120%] lg:h-[80%]" />
</div>
```

Everything else sits in a `relative z-10` column.

### 1.1 Breakpoint behaviour (identical across all five screens unless noted)

| | **320** | **768** | **1024** | **1440** |
|---|---|---|---|---|
| Root padding | `px-4` | `sm:px-6` | — | — |
| Top bar | `h-14`, mark + wordmark, trailing slot truncates (§6.7) | `h-16`, trailing slot full copy | — | — |
| Content column | `w-full`, `max-w-[26rem]` (login/forgot/reset), `max-w-[30rem]` (onboarding), `max-w-[28rem]` (accept-invite) | unchanged | unchanged | unchanged |
| Vertical centring | `py-8`, top-aligned via `justify-start` (a 320×568 device must not need to scroll past whitespace to reach the field) | `md:justify-center md:py-12` | `lg:py-16` | — |
| Card padding | `px-5 py-6` | `sm:px-7 sm:py-8` | — | — |
| h1 | `text-[26px]` | `sm:text-[30px]` | `lg:text-[34px]` | — |
| Glow ellipse | `w-[160%]` (narrower viewport needs a wider ellipse to read as ambient) | `sm:w-[120%]` | `lg:h-[80%]` | — |
| `AuthCurtain` | not rendered | not rendered | `lg:grid` — 3 columns, plinths | unchanged |
| Footnote | `text-[12px]`, `max-w-[34ch]` | — | — | — |

**Why the column count never changes.** A 1440px auth page with a single 26rem card and a lot of
black is *correct* here — see §0. The 1024 breakpoint earns its keep with `AuthCurtain` (§2.13), a
3-column reduction of the approved `HeroCurtain`, which is real depth from an approved primitive
rather than an invented second column of copy. Called out explicitly in §7 as a thing a reviewer may
push back on.

### 1.2 Per-screen composition

**`/login`** — `max-w-[26rem]`
- Top bar trailing: link → `/onboarding` (preserving the `next` param exactly as today).
- Heading: h1 "Welcome back" + deck "Sign in to pick up where you left off." (centred).
- `AuthCard as="form"`: `AuthField` email → `PasswordField` password (with the "Forgot password?"
  link on the label row, right-aligned, as today) → `AuthFormError` → `AuthSubmit`.
- Footnote: revised copy, §6.9.

**`/onboarding`** — `max-w-[30rem]`, wider because the wizard's `ConnectCard` carries an icon +
two-line text + a full-width control and cramps at 26rem.
- Top bar trailing: `AuthStepMeter` (only on the `youtube` / `gmail` steps, exactly as today).
- Five step bodies, keyed on `step` so React remounts and the entrance replays (§4.3):
  - `welcome` — heading + `AuthCard as="form"` (name, email, password) + alt link "Already have an account? Sign in".
  - `check-email` — `AuthStatusIcon` (Mail) + heading + alt link "Back to sign in". **No card** — there is nothing to interact with.
  - `youtube` — eyebrow "Step 1 of 2" + heading (left-aligned, not centred — it is instructional, not ceremonial) + `ConnectCard` + `AuthSubmit`-shaped Continue button.
  - `gmail` — same, "Step 2 of 2".
  - `done` — `AuthStatusIcon` (Check) + heading + primary link button to `nextHref`.
- **Step state stays `useState`.** Do not lift it to a query param, do not add history entries. The
  current back-button behaviour (leaves the wizard) is the shipped behaviour and is in scope of §2a.

**`/forgot-password`** — `max-w-[26rem]`
- Top bar trailing: "Back to sign in".
- Two mutually exclusive bodies (`sent` boolean, unchanged): the form, or the `AuthStatusIcon` (Mail) confirmation.
- The `sent` state gains an alt link back to `/login` (today it is a dead end with no way forward
  except the top bar — that top bar link already exists, so this is a redundancy, not a new capability).

**`/reset-password`** — `max-w-[26rem]`
- Top bar has no trailing slot (as today — the user arrived from an emailed link and has nowhere sensible to go).
- Heading + `AuthCard as="form"`: `PasswordField` new-password → `PasswordField` confirm → `AuthFormError` → `AuthSubmit`.
- **Always-present** static helper below the card (§5.4): "Reset links expire. If this one doesn't
  work, request a new one." + link to `/forgot-password`.

**`/accept-invite`** — `max-w-[28rem]`, server component, four branches unchanged:
- `!inviteId` → `AuthNotice tone="neutral"`.
- `!user` → `AuthStatusIcon` (UserPlus) + heading + two stacked actions (Create account / Sign in), `next` params byte-identical to today.
- invite missing or `status !== 'pending'` → `AuthNotice tone="neutral"` + "Go to Dashboard".
- valid → `AuthStatusIcon` + heading + `AcceptInviteButton`.
- Its `shell()` helper becomes `<AuthShell>{children}</AuthShell>`; the branching logic is untouched.

---

## 2. Component inventory

All new files land in `components/auth/`. Nothing in `components/ui/*` is imported by these five
screens after the re-skin (`Input`, `Label`, `Button`, `Logo` are all Swiss-token surfaces).

| # | Component | Builds on | Client? |
|---|---|---|---|
| 1 | `AuthShell` | new root + `.nebula-grain` | server |
| 2 | `AuthTopBar` | (internal to shell) | server |
| 3 | `AuthMark` | `ConsoleMark` / `NebulaNav.tsx:31` gradient F | server |
| 4 | `AuthCard` | `.nebula-border` + `backdrop-blur-xl` | server |
| 5 | `AuthHeading` | Group 1 §3.3 type roles | server |
| 6 | `AuthField` | new | client (controlled) |
| 7 | `PasswordField` | `AuthField` | client |
| 8 | `AuthSubmit` | `.nebula-cta` (`ShinyCTA` recipe, `<button>` form) | client |
| 9 | `AuthLinkButton` | `AuthSubmit` styling, `<Link>` form | server |
| 10 | `AuthFormError` | new, `role="alert"` | client |
| 11 | `AuthAltLink` | `NebulaNav` link + `after:` extender | server |
| 12 | `AuthStatusIcon` | new | server |
| 13 | `AuthNotice` | `AuthCard` | server |
| 14 | `AuthCurtain` | `HeroCurtain` (reduced to 3 cols) | server |
| 15 | `AuthStepMeter` | replaces `StepIndicator` | server |
| 16 | `ConnectCard` | replaces `ConnectRow` | server |

### 2.1 `AuthShell`

```tsx
export function AuthShell({
  children,
  width = 'sm',            // 'sm' 26rem · 'md' 28rem · 'lg' 30rem
  trailing,                // ReactNode rendered right of the wordmark
  footnote,                // ReactNode, one line, band 3
  align = 'center',        // 'center' | 'start' — text alignment of band 2
}: {...})
```

```html
<div class="nebula-auth relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-black
            font-nebula-ui text-zinc-200 antialiased
            selection:bg-orange-500/30 selection:text-orange-200">
  {atmosphere}                                   <!-- §1.0 -->
  <AuthCurtain />                                <!-- lg only -->
  <AuthTopBar trailing={trailing} />
  <main class="relative z-10 flex flex-1 flex-col justify-start px-4 py-8
               sm:px-6 md:justify-center md:py-12 lg:py-16">
    <div class="mx-auto w-full {WIDTH[width]} {align === 'center' ? 'text-center' : ''}">
      {children}
    </div>
  </main>
  {footnote && (
    <div class="relative z-10 px-4 pb-8 sm:px-6">
      <p class="mx-auto max-w-[34ch] text-center font-nebula-ui text-[12px] leading-relaxed text-zinc-500">
        {footnote}
      </p>
    </div>)}
</div>
```

`WIDTH = { sm: 'max-w-[26rem]', md: 'max-w-[28rem]', lg: 'max-w-[30rem]' }`.

**No `<SkipLink>`.** These pages have one landmark and 2–4 tabbables; a skip link would be the first
of them and would skip past nothing. (Group 1's shell has a 9-item rail — different problem.)

### 2.2 `AuthTopBar`

```html
<header class="relative z-10 flex h-14 shrink-0 items-center justify-between gap-x-4 px-4
               sm:h-16 sm:px-6">
  <Link href="/" class="group flex shrink-0 items-center gap-2.5 rounded-[10px] {FOCUS}">
    <AuthMark />
    <span class="font-nebula-heading text-[15px] font-semibold tracking-[-0.02em] text-white">
      CreatorFlow</span>
  </Link>
  {trailing && <div class="flex min-w-0 shrink items-center">{trailing}</div>}
</header>
```

`FOCUS` is imported from `components/console/tokens.ts` — **do not retype it**. The three strings
(`FOCUS`, `FOCUS_INSET`, `HOVER`) are already exported and already correct for a black ground;
Group 1 §3.6's reasoning (`outline` follows `border-radius`, no per-ground offset colour) applies
verbatim here. This is the one place Group 5 reaches into `components/console/`.

There is **no bottom hairline** under the top bar. A rule there would box the composition; the bar
floats on the same black ground as the card, which is what makes the card read as elevated.

### 2.3 `AuthMark`

The gradient F from `NebulaNav.tsx:31`, lifted verbatim, `aria-hidden`:

```html
<span aria-hidden class="grid h-7 w-7 place-items-center rounded-[9px]
      bg-gradient-to-br from-orange-500 to-orange-700
      font-nebula-tech text-[12px] font-bold text-white
      shadow-[0_0_16px_-4px_rgba(234,88,12,0.7)]">F</span>
```

**Do not import `components/ui/logo.tsx`.** Every path in it is hard-coded `stroke="#000000"` /
`fill="#000000"` — it renders invisible on black. Group 1 hit and documented this (§12 risk 2); all
five auth pages currently import it, so this is a real removal, not a hypothetical.

### 2.4 `AuthCard`

The single glassmorphic surface, and the **only `backdrop-filter` owner on the page**.

```html
<div class="nebula-border relative overflow-hidden rounded-[1.75rem]
            bg-white/[0.035] px-5 py-6 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]
            backdrop-blur-xl sm:px-7 sm:py-8"
     style="--nebula-border-gradient:
            linear-gradient(155deg, rgba(255,255,255,0.20), rgba(255,255,255,0.03) 48%, rgba(234,88,12,0.16))">
```

Rendered as `<form>` when `as="form"` (props spread: `onSubmit`, `noValidate` — see §6.3).

- **`1.75rem`** — deliberately between the console's `1.5rem` and marketing's `2.5rem`. The auth card
  is a moment, not a mega-card. `2.5rem` on a 26rem-wide card at 320px reads as a lozenge.
- **Nothing inside this card may declare `backdrop-filter`.** Chromium blanks the inner element's
  content when they nest — this project has hit it twice. Inputs use flat `rgba` fills (§3.2), never
  blur. The rule is enforceable by grep: `backdrop-` may appear exactly once per auth page, on `AuthCard`
  (or on `ConnectCard`/`AuthNotice`, which are **siblings** of the card, never descendants).
- `overflow-hidden` + `rounded-[1.75rem]` means outward focus rings on the last child would clip. All
  interactive children keep `focus-visible:outline-offset-2` and sit at least `12px` from the edge
  (card padding is `20/28px`), so there is no clipping. `FOCUS_INSET` is not needed here.

### 2.5 `AuthHeading`

```tsx
<AuthHeading eyebrow?: string  title: string  description?: ReactNode  align?: 'center'|'start' />
```

```html
<div class="mb-7">
  {eyebrow && (
    <p class="mb-2.5 flex items-center gap-2 font-nebula-mono text-[10px] font-medium uppercase
              tracking-[0.2em] text-orange-400/85 {align==='center' && 'justify-center'}">
      <span aria-hidden class="h-1 w-1 rotate-45 bg-orange-500" />{eyebrow}
    </p>)}
  <h1 class="bg-gradient-to-b from-white to-white/70 bg-clip-text pb-[0.06em]
             font-nebula-heading text-[26px] font-semibold leading-[1.12] tracking-[-0.03em]
             text-transparent sm:text-[30px] lg:text-[34px]">{title}</h1>
  {description && (
    <p class="mt-3 font-nebula-ui text-[14px] leading-relaxed text-zinc-400 sm:text-[15px]
              {align==='center' && 'mx-auto max-w-[38ch]'}">{description}</p>)}
</div>
```

`pb-[0.06em]` prevents Safari clipping descenders under `bg-clip-text`. The gradient stops at
`white/70` rather than the Home hero's `white/50` — a 34px heading needs more of the ramp in the
opaque half to stay above 4.5:1 across its whole height.

### 2.6 `AuthField`

```tsx
export function AuthField({
  id, label, value, onChange,
  type = 'text',
  autoComplete, name, inputMode, placeholder, hint, error,
  required, autoFocus, disabled,
  labelSuffix,            // e.g. the "Forgot password?" link on /login
  trailing,               // e.g. the show/hide button injected by PasswordField
}: {...})
```

```html
<div class="text-left">                                   <!-- resets the shell's text-center -->
  <div class="mb-2 flex items-baseline justify-between gap-3">
    <label for={id}
      class="font-nebula-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-zinc-400">
      {label}</label>
    {labelSuffix}
  </div>

  <div class="relative">
    <input
      id={id} name={name} type={type} value={value} onChange={onChange}
      autoComplete={autoComplete} inputMode={inputMode} placeholder={placeholder}
      required={required} autoFocus={autoFocus} disabled={disabled}
      aria-invalid={error ? true : undefined}
      aria-describedby={[error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined}
      class="h-12 w-full rounded-[12px] bg-white/[0.03] px-4 font-nebula-ui text-[16px]
             leading-[1.4] text-zinc-100 placeholder:text-zinc-600
             shadow-[inset_0_0_0_1px_rgba(255,255,255,0.09)]
             outline-none transition-[background-color,box-shadow] duration-150
             ease-[cubic-bezier(0.16,1,0.3,1)]
             hover:bg-white/[0.045]
             focus:bg-white/[0.05] focus:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]
             focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
             focus-visible:outline-orange-400
             disabled:cursor-not-allowed disabled:opacity-50
             aria-[invalid=true]:shadow-[inset_0_0_0_1px_rgba(251,113,133,0.55)]"
    />
    {trailing}
  </div>

  {hint  && <p id={`${id}-hint`}  class="mt-2 font-nebula-ui text-[12px] text-zinc-500">{hint}</p>}
  {error && <p id={`${id}-error`} class="mt-2 font-nebula-ui text-[12.5px] font-medium text-rose-300">{error}</p>}
</div>
```

Six decisions worth stating:

1. **`text-[16px]` is not negotiable.** iOS Safari auto-zooms the viewport on focus for any input
   below 16px, which on a 320px screen throws the card half off-screen. This is why the auth field is
   larger than the console's 13.5px rows.
2. **`h-12` (48px)** clears the 40px touch floor with room, and gives the label→field→hint stack an
   even 8px rhythm.
3. **The hairline is `box-shadow: inset`, not a `border` and not a `ring`.** DESIGN.md's "no solid
   borders" governs the *outline of an elevated surface* — the card, which correctly wears
   `.nebula-border`. A text input is an inset control, and `inset 0 0 0 1px` is the exact mechanic the
   reference's own CTA uses for its layer-2 inner hairline (`NEBULA_REFERENCE_NOTES.md` §2.2). Using
   `.nebula-border` on three stacked fields would also spend three `::before`s on a budgeted effect.
   Flagged in §7 as a judgement call.
4. **`placeholder:text-zinc-600` is the one sanctioned use of zinc-600.** Group 1 §3.4 bans it "for
   any text node that carries meaning". A placeholder here carries none — every field has a visible
   persistent label, and the placeholders are format examples (`you@gmail.com`). If the placeholder is
   ever the only carrier of information, that is a bug in the field, not in the colour.
5. **`aria-[invalid=true]:` variant** drives the error hairline from the same attribute assistive tech
   reads. No second source of truth.
6. `focus` and `focus-visible` are both styled: browsers match `:focus-visible` on text inputs even for
   pointer focus, so the orange outline appears on click too — which is correct for a form. The `focus:`
   background/hairline shift is the low-key version that also survives if the outline is suppressed by
   a forced-colors mode.

### 2.7 `PasswordField`

`AuthField` with `type` swapped locally and a `trailing` toggle injected:

```tsx
const [shown, setShown] = useState(false)
<AuthField
  {...props}
  type={shown ? 'text' : 'password'}
  trailing={
    <button type="button" onClick={() => setShown(v => !v)}
      aria-label={shown ? 'Hide password' : 'Show password'} aria-pressed={shown}
      class={`absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center
              rounded-[10px] text-zinc-500 hover:text-zinc-200 ${HOVER} ${FOCUS}`}>
      {shown ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
    </button>}
/>
```

Input gets `pr-12` when `trailing` is present. `type="button"` is mandatory — a bare `<button>` inside
a `<form>` submits it, which would be a behaviour change.

Applied to: `/login` password, `/onboarding` password, `/reset-password` both fields.
`autoComplete` is preserved untouched (`current-password` / `new-password`); toggling `type` does not
disturb password-manager fill, and `aria-pressed` keeps the toggle's state announced.

### 2.8 `AuthSubmit` — the signature action

The full six-layer `.nebula-cta` from `ShinyCTA`, in `<button>` form. `.nebula-cta` in
`globals.css` is element-agnostic — it needs no change.

```html
<!-- enabled -->
<button type="submit" aria-busy={loading}
  class="nebula-cta group inline-flex h-12 w-full items-center justify-center px-8
         font-nebula-tech text-[13px] font-medium uppercase tracking-[0.14em] text-white
         transition-[transform,box-shadow] duration-500
         hover:shadow-[0_0_40px_-12px_rgba(234,88,12,0.55)]
         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
         focus-visible:outline-orange-400">
  <span class="nebula-cta__label gap-2">…label + ArrowRight 16…</span>
</button>
```

```html
<!-- disabled: NOT .nebula-cta -->
<button type="submit" disabled
  class="inline-flex h-12 w-full cursor-not-allowed items-center justify-center rounded-[9999px]
         bg-white/[0.04] px-8 font-nebula-tech text-[13px] font-medium uppercase
         tracking-[0.14em] text-zinc-500
         shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">…</button>
```

**The class swap is the point.** `.nebula-cta` carries two infinite animations (2.5s border spin,
4s shimmer). Running them on a form the user is staring at for 30 seconds is noise. Swapping them out
while the button is disabled means the theatre ignites at the exact moment the action becomes
available — the button *tells you* the form is complete. Zero new logic: the `disabled` predicate is
the existing one (`isSubmitting || !email.trim() || !password`), byte-for-byte.

No `hover:scale-[1.02]` (Home's CTA has it). A full-width button that grows on hover shifts the card's
internal layout; the glow shadow carries the hover alone.

`AuthLinkButton` is the same two visual states as a `<Link>`, for the three navigational primaries
(`/onboarding` done → dashboard, accept-invite → create account, invalid-invite → dashboard).

### 2.9 `AuthFormError`

```tsx
export const AuthFormError = forwardRef<HTMLDivElement, { message: string | null }>(
  function AuthFormError({ message }, ref) {
  return (
    <div ref={ref} tabIndex={-1} role="alert" aria-live="assertive"
      class={message
        ? `flex items-start gap-2.5 rounded-[12px] bg-rose-500/[0.07] px-3.5 py-3 text-left
           shadow-[inset_0_0_0_1px_rgba(251,113,133,0.25)]
           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
           focus-visible:outline-orange-400`
        : 'sr-only'}>
      {message && <>
        <AlertCircle aria-hidden size={15} class="mt-px shrink-0 text-rose-400" strokeWidth={2} />
        <p class="font-nebula-ui text-[13px] leading-relaxed text-rose-200">{message}</p>
      </>}
    </div>)
})
```

The container is **always mounted** (collapsing to `sr-only` when empty) so `aria-live` is already
being observed when the text arrives; a container that mounts *with* its text is announced
inconsistently across SR/browser pairs.

`text-rose-200` on the tinted plate measures ≈11:1. `rose-400` (`#fb7185`) is the icon stroke only —
Group 1 reserved `--console-neg` at that value, so this is the same hue at the same place in the ramp,
not a new colour.

Position: **directly above the submit button**, which is exactly where the current
`{error && <p …>}` renders. Preserved deliberately — it is the last thing before the action.

### 2.10 `AuthAltLink`

```html
<Link href={…} class="relative rounded font-nebula-ui text-[13px] font-medium text-zinc-400
      transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-white
      after:absolute after:inset-x-0 after:-inset-y-3 after:content-['']
      focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
      focus-visible:outline-orange-400">
```

The `after:` extender takes a 17px-tall text link to a 41px hit target without adding layout height —
the pattern the brief names and `NebulaNav` already uses. Emphasised words inside the link
("Sign in", "Start free") get `text-white`.

### 2.11 `AuthStatusIcon`

```tsx
<AuthStatusIcon icon={Mail|Check|UserPlus} tone="accent" />
```

```html
<div aria-hidden class="auth-pop mx-auto mb-7 grid h-14 w-14 place-items-center rounded-[9999px]
     bg-orange-500/[0.10] text-orange-400
     shadow-[inset_0_0_0_1px_rgba(251,146,60,0.22),0_0_36px_-12px_rgba(234,88,12,0.7)]">
  <Icon size={22} strokeWidth={1.9} />
</div>
```

`aria-hidden` — every one of these sits directly above an `<h1>` that says the same thing. `rounded-[9999px]`,
never `rounded-full` (the global `--radius-full` is 2px; this exact class already shipped as a defect).

### 2.12 `AuthNotice`

`AuthCard`'s surface at a smaller radius (`1.25rem`), left-aligned, for the two accept-invite dead
ends. Props `{ tone: 'neutral' | 'warn', title, children, action }`. `tone="warn"` swaps the border
gradient's orange stop for `rgba(251,113,133,0.16)` and nothing else — the copy carries the severity.
Both current dead-end branches are `neutral`: a used invite is not an error, it is a fact.

### 2.13 `AuthCurtain`

`HeroCurtain` reduced to three columns with lower plinths, rendered `hidden lg:grid`:

```html
<div aria-hidden class="pointer-events-none absolute inset-0 z-0 hidden lg:grid lg:grid-cols-3"
     style="mask-image: linear-gradient(to top, black 22%, transparent 72%)">
  <!-- heights 46% / 30% / 46%, nebula-delay-1/-3/-5, border-r|border-l border-white/5 -->
</div>
```

Reuses `.nebula-col` verbatim, which means it inherits the existing reduced-motion kill
(`globals.css:600`) for free. Lower plinths than the hero's (46/30/46 vs 75/45/75) because the auth
card sits lower in the viewport than a hero headline and the skyline must stay under it.

### 2.14 `AuthStepMeter` (onboarding)

Replaces `StepIndicator`'s three `bg-lavender`/`bg-fog` dots.

```html
<div aria-hidden class="flex items-center gap-1.5">
  <!-- ×2 -->
  <span class="h-[3px] w-8 rounded-[2px] bg-white/10">
    <span class="block h-full rounded-[2px] bg-orange-500 transition-[width] duration-300
                 ease-[cubic-bezier(0.16,1,0.3,1)]" style="width: {done ? '100%' : '0%'}" />
  </span>
</div>
<span class="sr-only">Step {n} of 2</span>
```

`aria-hidden` on the visual + an `sr-only` sentence, rather than `role="progressbar"` — the visible
eyebrow on the step body already says "Step 1 of 2", so a progressbar role would triple-announce.
Two segments, not three: the current component renders three dots for a two-step flow, which is a
small existing lie.

### 2.15 `ConnectCard` (onboarding)

Replaces `ConnectRow`. **The honesty of this component is load-bearing** (brief §2b): Gmail/YouTube
OAuth is not wired, and the control must not imply it is.

```html
<div class="nebula-border relative overflow-hidden rounded-[1.25rem] bg-white/[0.03] p-5
            backdrop-blur-md"
     style="--nebula-border-gradient: linear-gradient(155deg,rgba(255,255,255,0.16),rgba(255,255,255,0.02) 55%,rgba(234,88,12,0.10))">
  <div class="flex items-start gap-4">
    <span aria-hidden class="grid h-11 w-11 shrink-0 place-items-center rounded-[13px]
          bg-white/[0.06] text-zinc-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">{icon}</span>
    <div class="min-w-0 text-left">
      <p class="font-nebula-ui text-[14px] font-medium tracking-[-0.01em] text-zinc-100">{name}</p>
      <p class="mt-1 font-nebula-ui text-[12.5px] leading-relaxed text-zinc-500">{description}</p>
    </div>
    <span class="ml-auto shrink-0 rounded-[9999px] bg-white/[0.05] px-2.5 py-1
                 font-nebula-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-zinc-400">
      Not connected</span>
  </div>

  <div class="mt-5 flex items-center gap-3">
    <span class="inline-flex h-11 flex-1 cursor-not-allowed items-center justify-center
                 rounded-[9999px] bg-white/[0.035] font-nebula-tech text-[12.5px] font-medium
                 uppercase tracking-[0.12em] text-zinc-600
                 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]"
          aria-disabled="true"
          title="Connecting a real account requires production Google OAuth credentials">
      Connect {name}</span>
  </div>
  <p class="mt-3 text-left font-nebula-ui text-[12px] leading-relaxed text-zinc-500">
    Not available yet — this needs production Google credentials. You can connect it later in Settings.
  </p>
</div>
```

Three honesty mechanics, up from one: the "Not connected" chip, the visibly inert control, and — new —
a **visible** sentence explaining why. The current implementation puts that explanation only in a
`title` attribute, which is invisible on touch and to most screen readers. `aria-disabled` on a
non-focusable `<span>` is belt-and-braces; the element takes no click handler either way, which is
the shipped behaviour.

`ConnectCard` is a **sibling** of `AuthCard` on the youtube/gmail steps (those steps render no
`AuthCard`), so its `backdrop-blur-md` is not a nesting case. If a future step ever puts a
`ConnectCard` inside an `AuthCard`, drop the blur from the child.

`text-zinc-600` on the inert button label is deliberate and is *not* a contrast regression — the
control is disabled, and disabled controls are exempt from WCAG 1.4.3. The state is carried by the
chip, the sentence, and `aria-disabled`, all of which are above the floor.

---

## 3. Concrete styling decisions

### 3.1 New CSS block

Append to `app/globals.css` after the `NEBULA CONSOLE` block. ~40 lines total.

```css
/* ============================================================================
   NEBULA AUTH — threshold tier. Between the marketing scale and the console.
   Self-contained: reads no global Swiss token.
   ========================================================================= */

.nebula-auth {
  --auth-card:   rgba(255,255,255,0.035);
  --auth-field:  rgba(255,255,255,0.03);
  --auth-hair:   rgba(255,255,255,0.09);
  --auth-hair-2: rgba(255,255,255,0.18);
  --auth-ink:    #fafafa;   /* zinc-50  */
  --auth-dim:    #a1a1aa;   /* zinc-400 — ~9.2:1 on black */
  --auth-faint:  #71717a;   /* zinc-500 — ~4.9:1, DARKEST MEANINGFUL TEXT */
  --auth-accent: #ea580c;
  --auth-danger: #fb7185;   /* rose-400 — icon + hairline only */
}

/* Chromium paints autofilled inputs with an opaque near-white plate that no
   background utility can override. This is the only fix, and without it every
   returning user sees a white bar in a black card. */
.nebula-auth input:-webkit-autofill,
.nebula-auth input:-webkit-autofill:hover,
.nebula-auth input:-webkit-autofill:focus,
.nebula-auth input:-webkit-autofill:active {
  -webkit-text-fill-color: #fafafa;
  -webkit-box-shadow: 0 0 0 1000px #0e0e10 inset, inset 0 0 0 1px rgba(255,255,255,0.09);
  caret-color: #fafafa;
  transition: background-color 9999s ease-in-out 0s;  /* defeat the UA fade */
}

/* The one entrance. 420ms/10px — a task surface, not a hero. */
@keyframes authEnter {
  0%   { opacity: 0; transform: translateY(10px); filter: blur(3px); }
  100% { opacity: 1; transform: translateY(0);    filter: blur(0);   }
}
.auth-enter { animation: authEnter 420ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
.auth-enter-1 { animation-delay: 60ms;  }
.auth-enter-2 { animation-delay: 130ms; }
.auth-enter-3 { animation-delay: 200ms; }

@keyframes authPop { 0% { opacity: 0; transform: scale(0.88); } 100% { opacity: 1; transform: scale(1); } }
.auth-pop { animation: authPop 460ms cubic-bezier(0.16, 1, 0.3, 1) 80ms backwards; }

@media (prefers-reduced-motion: reduce) {
  .auth-enter, .auth-pop { animation: none !important; opacity: 1; transform: none; filter: none; }
}
```

`.nebula-cta` and `.nebula-col` are already in the existing reduced-motion blocks
(`globals.css:599`, `:755`) — no additions needed for those.

### 3.2 Surface ladder

Black ground → card `+3.5%` → field `+3%` → field hover `+4.5%` → field focus `+5%`. The field is
*not* brighter than its card; it is a well, distinguished by its hairline, not by lightness. This
inverts the console's ladder on purpose — an input the user types into should read as a cut into the
surface, and a "raised" input inside a raised card produces the muddy double-elevation that the
current Swiss `glass-panel` + `bg-linen` inputs already suffer from.

### 3.3 Radii vocabulary (auth tier)

`1.75rem` card · `1.25rem` notice / connect card · `13px` glyph tile · `12px` inputs, error plate ·
`10px` icon buttons, top-bar link · `9999px` submit, chips, status circle · `2px` meter segments.

**`rounded-full`, `rounded-xl`, `rounded-lg`, `rounded-2xl` are forbidden on these five pages.** The
global `--radius-full: 2px`. `components/ui/button.tsx` uses `rounded-full` in
`nonPrimaryVariants` — one of several reasons none of the five pages keeps importing it.

### 3.4 Type scale

| Role | Class string |
|---|---|
| h1 | `font-nebula-heading text-[26px] sm:text-[30px] lg:text-[34px] font-semibold leading-[1.12] tracking-[-0.03em]` + gradient clip |
| Eyebrow | `font-nebula-mono text-[10px] font-medium uppercase tracking-[0.2em] text-orange-400/85` |
| Deck | `font-nebula-ui text-[14px] sm:text-[15px] leading-relaxed text-zinc-400` |
| Field label | `font-nebula-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-zinc-400` |
| Input value | `font-nebula-ui text-[16px] leading-[1.4] text-zinc-100` |
| Placeholder | `placeholder:text-zinc-600` |
| Field hint | `font-nebula-ui text-[12px] text-zinc-500` |
| Field error | `font-nebula-ui text-[12.5px] font-medium text-rose-300` |
| Form error | `font-nebula-ui text-[13px] leading-relaxed text-rose-200` |
| Button label | `font-nebula-tech text-[13px] font-medium uppercase tracking-[0.14em]` |
| Inline / alt link | `font-nebula-ui text-[13px] font-medium text-zinc-400 hover:text-white` |
| Status chip | `font-nebula-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-zinc-400` |
| Footnote | `font-nebula-ui text-[12px] leading-relaxed text-zinc-500` |

Font roles follow Group 1 §3.3 exactly: **Manrope** titles, **Inter** sentences, **Geist Mono**
labels/chips/counters, **Geist Sans** button labels only.

### 3.5 Contrast ledger (all on `#000`, or on the card's effective `#0b0b0c`)

| Token | Ratio | Verdict |
|---|---|---|
| `zinc-100` body | ~18:1 | ✅ |
| `zinc-400` deck, labels, links | ~9.2:1 | ✅ |
| `zinc-500` hints, footnote | ~4.9:1 | ✅ floor |
| `orange-400` eyebrow, focus ring | ~9.5:1 | ✅ |
| `rose-200` on `rose-500/7` plate | ~11:1 | ✅ |
| `rose-300` field error | ~8.6:1 | ✅ |
| `zinc-600` placeholders, disabled label | ~2.9:1 | ⚠️ permitted only where nothing meaningful rides on it (§2.6.4, §2.15) |

### 3.6 Effects budget (countable, per page)

| Effect | Budget |
|---|---|
| `backdrop-filter` | **1 owner**, never nested. `AuthCard`, or `ConnectCard`/`AuthNotice` when no card is present. |
| `.nebula-grain` | 1 — shell atmosphere |
| radial glow | 1 — shell atmosphere |
| `.nebula-border` | ≤ 2 visible at once (card + connect card) |
| infinite animations | **1** — `.nebula-cta` on the *enabled* submit. Zero otherwise. |
| `box-shadow` blur > 24px | permitted only on the card drop shadow and the CTA glow (this is a marketing-adjacent tier; the console's 24px cap does not apply) |

---

## 4. Motion plan

| # | What | Mechanic | Trigger | Reduced motion |
|---|---|---|---|---|
| 1 | Page entrance | `.auth-enter` 420ms, `translateY(10px)` + `blur(3px)`, staggered `-1/-2/-3` on heading → card → footnote | mount (CSS `backwards`, no JS, no observer) | `animation: none`, lands on end state |
| 2 | `AuthCurtain` | `.nebula-col` clip-path, `nebula-delay-1/-3/-5` | mount, `lg` only | already killed at `globals.css:600` |
| 3 | Submit theatre | `.nebula-cta` — 2.5s border spin + 4s shimmer + 4.5s breathe | **only while enabled** (class swap, §2.8) | already killed at `globals.css:755` |
| 4 | Submit hover | `box-shadow` glow, 500ms | hover | `transition` is duration-clamped by the existing global rule; acceptable |
| 5 | Field focus | `background-color` + `box-shadow`, 150ms | focus/hover | fine as-is (colour-only) |
| 6 | Status icon | `.auth-pop` 460ms scale 0.88→1 | mount of check-email / done / invite | `animation: none` |
| 7 | Step meter fill | `width` 0→100%, 300ms | step advance | add `.auth-meter { transition: none }` to the reduced-motion block |
| 8 | Wizard step change | `.auth-enter` replays via `key={step}` on the step container. **Crossfade only, no slide** | `setStep` | none |
| 9 | Submitting spinner | `Loader2 animate-spin` 15px | `isSubmitting` | spinner hidden; the label ("Signing in…") already carries the state, so nothing is lost |
| 10 | Password toggle | none — instant icon swap | click | n/a |

Total: **one** infinite animation, gated behind an enabled submit button. Everything else is a
one-shot under 500ms. `cubic-bezier(0.16, 1, 0.3, 1)` on every one of them; no default easing anywhere.

Entrance stagger is CSS-only with `animation-fill-mode: backwards`, **not** `NebulaReveal`. The
IntersectionObserver wrapper exists to defer animation until scroll; an auth card is in the viewport
at t=0, so the observer is pure overhead, and its 1s `nebulaFadeSlideIn`/30px is a marketing duration
on a screen the user wants to get past.

---

## 5. States

Legend for the shared columns: **idle** → **focused** → **submitting** → **field error** → **form error** → **success**.

### 5.1 `/login`

| State | Rendering |
|---|---|
| Idle | Both fields empty. Submit is the **disabled** variant (no spin) — matches `disabled={isSubmitting \|\| !email.trim() \|\| !password}`, unchanged. |
| Focused | Field bg `+5%`, hairline `white/18`, orange 2px outline at offset 2. |
| Complete | Submit swaps to `.nebula-cta`; border beam ignites. |
| Submitting | `aria-busy="true"`, `pointer-events-none` on the button, `.nebula-cta` retained, label → `Loader2` + "Signing in…". **Inputs stay fully interactive and un-`disabled`, exactly as today** — setting `disabled` mid-flight moves focus to `<body>` and would be a behaviour change. |
| Field error | Not produced by this screen. Supabase returns one message; it is form-level. |
| Form error | `AuthFormError` above the submit. Focus moves to it (§6.6). Submit returns to its enabled/disabled state per the unchanged predicate. |
| Success | `router.push(next \|\| '/dashboard')` — no success UI. The button stays in its submitting state through the navigation, which is correct: a flash of "Sign in" before the route changes reads as a failure. |

### 5.2 `/onboarding`

| Step | Idle | Submitting | Error | Success |
|---|---|---|---|---|
| `welcome` | 3 fields, disabled submit, `autoFocus` on name (existing) | "Creating account…" | `AuthFormError` above submit | → `youtube` (session) or `check-email` (no session) — branch unchanged |
| `check-email` | `AuthStatusIcon` Mail, h1 "Check your inbox.", email echoed in `text-zinc-100 font-medium` (**not** an accent — it is data, not an action), alt link "Back to sign in" | n/a | n/a | terminal |
| `youtube` | eyebrow, left-aligned heading, `ConnectCard` (not-connected), full-width "Continue" `AuthLinkButton`-styled `<button>` | n/a | n/a | → `gmail` |
| `gmail` | same, Step 2 of 2 | n/a | n/a | → `done` |
| `done` | `AuthStatusIcon` Check, h1 "You're set up.", primary link to `nextHref` (label branch unchanged) | n/a | n/a | terminal |

The `youtube`/`gmail` Continue buttons use the **enabled** submit visual (`.nebula-cta`) — they are
always actionable, so there is no disabled state to represent.

### 5.3 `/forgot-password`

| State | Rendering |
|---|---|
| Idle | One field, `autoFocus` (existing), disabled submit until non-empty (existing predicate). |
| Submitting | "Sending…" |
| Form error | `AuthFormError` above submit. |
| Success (`sent`) | Form is replaced by `AuthStatusIcon` Mail + h1 "Check your email" + the existing deliberately-vague deck ("If an account exists for …") — **that vagueness is an anti-enumeration measure, keep the wording exactly**. Add `AuthAltLink` → `/login`. |

### 5.4 `/reset-password` — including the expired/invalid link case

| State | Rendering |
|---|---|
| Idle | Two password fields, `autoFocus` on the first (existing). Hint under field 1: "At least 8 characters." — promoted from the current placeholder to a persistent `hint`, so it survives typing. |
| Submitting | "Saving…" |
| Validation error | The two existing client checks (`< 8`, mismatch) render in `AuthFormError` **and** set `aria-invalid` on the field they concern (length → field 1; mismatch → field 2). Message strings unchanged, timing unchanged (submit only), the check itself unchanged. |
| Server error | Same banner, message from `updatePassword`. |
| **Expired / invalid token** | The page performs **no token check today** — the recovery session is established by `/auth/callback` before the redirect, and a dead link surfaces as a Supabase error (e.g. "Auth session missing!") *after* submit. **This proposal does not add a session probe** — that would be new data flow (§2a). Instead: a **permanently rendered** helper below the card — `AuthAltLink`-styled — "Reset links expire. If this one doesn't work, request a new one." → `/forgot-password`. Static copy, zero behaviour change, and it puts the recovery path on screen *before* the user hits the wall. |
| Success | `router.push('/dashboard')`, no success UI. |

### 5.5 `/accept-invite` — four server-rendered branches

| Branch | Condition (unchanged) | Rendering |
|---|---|---|
| Malformed link | `!inviteId` | `AuthNotice tone="neutral"` — h1 "Invite link incomplete.", body, `AuthLinkButton` → `/` |
| Signed out | `!user` | `AuthStatusIcon` UserPlus + h1 + deck + stacked `AuthLinkButton` "Create account" and `AuthAltLink` "Already have an account? Sign in". `next` params byte-identical. |
| **Invalid / expired / consumed** | `!invite \|\| invite.status !== 'pending'` | `AuthNotice tone="neutral"` — h1 "This invite isn't valid.", existing three-cause body copy (already the best part of this page — it names all three causes), `AuthLinkButton` → `/dashboard` |
| Valid | otherwise | `AuthStatusIcon` UserPlus + role-branched h1 + role-branched deck (**copy fix, §6.9**) + `AcceptInviteButton` |
| `AcceptInviteButton` submitting | `isPending` | "Joining…" + spinner, `aria-busy` |
| `AcceptInviteButton` error | `result.error` | `AuthFormError` above the button — same position as today, now with `role="alert"` and focus move |

There is no loading skeleton on this page: it is a server component and the invite fetch happens
before first paint. If Group 4 later adds an `app/accept-invite/loading.tsx`, it should be the shell
+ a `console-skeleton` block at the card's dimensions.

### 5.6 States matrix — every screen, no gaps

| | idle | focus | submitting | field err | form err | success | token-invalid |
|---|---|---|---|---|---|---|---|
| login | ✅ | ✅ | ✅ | — (none produced) | ✅ | nav | n/a |
| onboarding | ✅ ×5 steps | ✅ | ✅ | — | ✅ | `check-email` / `done` | n/a |
| forgot | ✅ | ✅ | ✅ | — | ✅ | ✅ `sent` | n/a |
| reset | ✅ | ✅ | ✅ | ✅ `aria-invalid` | ✅ | nav | ✅ static recovery path |
| accept-invite | ✅ | n/a | ✅ | — | ✅ | nav to `/team` | ✅ dedicated branch |

---

## 6. Form specifics

**6.1 Labels.** Every field gets a **visible, persistent** `<label for>` above it, mono-uppercase.
No floating labels (the reference's `peer-placeholder-shown` trick is listed in
`NEBULA_REFERENCE_NOTES.md` §5 — deliberately **not** adopted): a floating label vanishes into the
value at exactly the moment a user re-checks what they typed, and it fights browser autofill, which
fills the value without firing the `:placeholder-shown` transition in some engines. Placeholders are
format examples only and are never the sole carrier of a field's meaning.

**6.2 Autocomplete + input attributes** — existing values preserved, missing ones added:

| Screen | Field | `type` | `name` | `autoComplete` | extra |
|---|---|---|---|---|---|
| login | email | `email` | `email` | `email` ✓existing | `inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false}` |
| login | password | `password` | `password` | `current-password` ✓ | — |
| onboarding | name | `text` | `name` | **`name`** (new — currently absent) | `autoCapitalize="words"` |
| onboarding | email | `email` | `email` | `email` ✓ | as above |
| onboarding | password | `password` | `new-password` | `new-password` ✓ | — |
| forgot | email | `email` | `email` | `email` ✓ | as above |
| reset | new | `password` | `new-password` | `new-password` ✓ | — |
| reset | confirm | `password` | `confirm-password` | `new-password` ✓ | — |

Adding `name` and the email input hints is additive on controlled inputs — no state, validation, or
submit behaviour changes, and it is what lets password managers offer to save the credential.

`required` stays exactly where it is today (login both, forgot email, reset both; **onboarding has
none** — do not add it, that would change validation semantics). Because `required` exists on some
fields, the `<form>` gets **`noValidate`**: without it the browser's native bubble fires before
`handleSubmit`, on a control we do not style, in the OS locale — and it would preempt the
`AuthFormError` path. The `disabled`-until-filled predicate already enforces the same rule, so no
capability is lost. **This is the one attribute change to a `<form>` element; flagged in §7.**

**6.3 Inline validation timing.** None is introduced. No `onBlur` validation, no as-you-type
validation, no password-strength meter. Validation fires exactly where it fires today:

- login / forgot / onboarding: the disabled predicate, then the server.
- reset-password: the two `handleSubmit` guards, unchanged in order, threshold, and message text.

Errors clear on the next submit (`setError(null)` at the top of each handler — unchanged). They do
**not** clear on keystroke; adding that would be a behaviour change and would also yank the message
out from under a screen reader mid-announcement.

**6.4 Error placement.** Field-level errors sit under their field (`mt-2`), inside the label group.
Form-level errors sit immediately above the submit button — the current position, preserved.

**6.5 ARIA wiring.**
- Form error container: always mounted, `role="alert" aria-live="assertive"`, `sr-only` when empty.
- Field error: `<p id="{id}-error">`, referenced from the input's `aria-describedby`, plus
  `aria-invalid="true"` on the input.
- Hint: `<p id="{id}-hint">`, also in `aria-describedby` (hint first, error second — SRs read in
  attribute order and the error should land last).
- Submitting button: `aria-busy="true"`; the accessible name changes with the label ("Sign in" →
  "Signing in…"), so the state is announced without a live region.
- Password toggle: `aria-label` + `aria-pressed`.
- Step meter: visual `aria-hidden`, `<span class="sr-only">Step n of 2</span>`.
- Decorative layers (grain, glow, curtain, status icons, mark, meter): `aria-hidden`.

**6.6 Focus management on submit failure.** In each handler's error branch, after `setError(...)`:

```ts
requestAnimationFrame(() => {
  errorRef.current?.focus()
  errorRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
})
```

`AuthFormError` carries `tabIndex={-1}` so it is programmatically focusable but not in the tab order.
This is purely additive — no branch, condition, or message is altered. On success no focus is moved;
the route change handles it.

**6.7 Touch targets.** Inputs 48px · submit 48px · password toggle 40×40 · connect control 44px ·
alt links 17px text + `after:-inset-y-3` = 41px effective · top-bar logo lockup 28px glyph inside a
56px bar row (pad the `<Link>` with `py-2 -my-2` to reach 40px without changing bar height).

**6.8 320px overflow audit.**

| Risk | Resolution |
|---|---|
| Glow ellipse `w-[160%]` | root `overflow-x-hidden` |
| Login top-bar trailing "Don't have an account? Start free" | `<span class="hidden sm:inline">Don't have an account? </span><span>Start free</span>` — full copy at ≥640, honest abbreviation below |
| `ConnectCard` header row (44px glyph + text + chip) | chip drops to a second line via `flex-wrap` below `sm`; text block is `min-w-0` and wraps (never `truncate` — the description is meaningful) |
| Submit label "Save new password" @13px/`tracking-[0.14em]` | ≈168px in a 248px content box ✅ |
| Onboarding h1 "Let's get your creator business set up." @26px | wraps to 3 lines; `text-balance` on `<h1>` |
| Email echo in `check-email` | `break-words` on the wrapping `<p>` |
| Step meter (2×32px + gap) | 70px, fits beside a 56px logo lockup at 320 with `gap-x-4` ✅ |

**6.9 Copy.** Existing strings are preserved verbatim except three that are **actively wrong** post
open-source (brief §2b: "No pricing anywhere… no pricing copy, links, or CTAs on any surface"):

| File | Current | Proposed | Why |
|---|---|---|---|
| `login/page.tsx:120` | "Free means free — no percentage of your deals, no credit card to start." | "Free and open source. No cut of your deals, ever." | "no credit card **to start**" asserts a paid tier that will not exist. The replacement is Home's approved badge copy (`Hero.tsx:43`). |
| `onboarding/page.tsx:120` | "Takes about a minute. Free, no credit card." | "Takes about a minute. Free and open source." | same |
| `accept-invite/page.tsx:98` | "full access, including **billing** and team management" | "full access, including team management and account settings" | there is no billing. This is pricing content on an auth surface. |

Two additions, both new surface with no existing equivalent: the `ConnectCard` explanation sentence
(§2.15) and the reset-link recovery line (§5.4). Both are plain, short, and say only what is true.

---

## 7. Where this design pushes against the constraints

Called out so a reviewer can rule rather than discover.

1. **`noValidate` on the four `<form>` elements.** §6.2. The only element-attribute change in the
   proposal. Justification: `required` is currently decorative — the disabled predicate already
   blocks empty submits, so the native bubble can never actually fire on a reachable path, and
   `noValidate` guarantees that stays true if a predicate is ever loosened. If a reviewer wants
   literally zero attribute deltas, drop it; the design is unaffected and the risk is a native
   bubble in a Swiss-era style if someone later changes the disabled predicate.

2. **One infinite animation on a form.** `.nebula-cta` spins forever while the submit is enabled.
   Group 1 ruled zero infinite animations in-app; the marketing tier runs several. Auth is between
   them, and the enabled-only gate (§2.8) is the compromise: motion appears at the moment of
   completion, is one element, and is fully killed under `prefers-reduced-motion`. If a reviewer
   wants zero, the fallback is a static orange-gradient pill; the whole design still stands, and the
   screen loses its only moment of craft.

3. **`backdrop-filter` is used at all.** Group 1 banned it under `app/(app)/` and made the ban
   greppable. This tier keeps exactly one owner per page because glassmorphism is a named DESIGN.md
   pillar and an auth card is the one surface in the product that can afford it. The nesting hazard
   is closed structurally: `AuthCard` has no descendant with a blur, and `ConnectCard`/`AuthNotice`
   are siblings, never children. Worth stating as a rule in the eventual `GROUP5_DECISION`: *the auth
   tier permits one blur owner; the console tier permits none.*

4. **The field hairline is `box-shadow: inset … 1px`.** Functionally a solid 1px border, which
   DESIGN.md's Don'ts push against. Argued in §2.6.3: the rule governs elevated surface outlines, the
   reference CTA itself uses this exact inset mechanic for its layer 2, and three `.nebula-border`
   `::before`s stacked in one card would blow the effects budget. If overruled, the alternative is a
   `.nebula-border` wrapper `<div>` around each input with the input at `bg-transparent` — more DOM,
   more `::before`, and a focus ring that has to be moved to the wrapper.

5. **Reset-password cannot honestly detect an expired token.** Doing so requires a `getSession()`
   probe on mount — new data flow, out of scope. §5.4's static recovery line is the design answer.
   If a decision-maker *wants* the probe, it belongs in a separate behaviour ticket, not in a re-skin.

6. **Five new `layout.tsx` files.** The root exports `viewport = { colorScheme: 'light', themeColor:
   '#FFFFFF' }` and `<html class="bg-linen">`. On a black auth page that gives light native
   scrollbars, light form-control chrome, a white overscroll rubber-band on iOS, and a white
   browser-UI theme colour. Four of the five pages are `'use client'`, and Next.js forbids a
   `viewport` export from a client component — so the fix is a tiny server `layout.tsx` per route:

   ```tsx
   // app/login/layout.tsx  (and forgot-password, reset-password, onboarding)
   export const viewport = { colorScheme: 'dark', themeColor: '#000000' }
   export default function Layout({ children }: { children: React.ReactNode }) { return children }
   ```

   `accept-invite` is a server component and can take the export inline. **This is a file addition,
   not a file move** — no URL, route, or import changes. The tidier alternative (an `app/(auth)/`
   route group with one shared layout) is URL-identical too but moves five directories; I recommend
   the five stub files precisely because "re-skin" should not show up in `git log --stat` as a
   restructure. Optionally also add `html:has(.nebula-auth) { background:#000 }` to kill the
   overscroll flash — `:has()` is safe in every target engine and degrades to today's behaviour where
   it is not.

7. **The composition stays single-column at 1440.** No split-screen. Argued in §0/§1.1 — the second
   column of an auth page is where fake evidence lives, and CreatorFlow has none. A reviewer who
   wants 1440 to feel less empty should push on `AuthCurtain` and glow intensity, not on a panel.

8. **Three copy strings change (§6.9).** All three assert pricing or billing that will not exist.
   The brief says keep existing copy "unless it is actively wrong" and separately bans pricing
   content outright; these are the intersection. Flagged rather than done silently.

9. **`components/ui/{input,label,button,logo}.tsx` are no longer imported by these five pages.** They
   remain in the tree for the not-yet-redesigned screens; Group 6 deletes them when nothing imports
   them. `oauth-glyphs.tsx` **is** kept — it is already `currentColor`-based and works on black
   unchanged.
