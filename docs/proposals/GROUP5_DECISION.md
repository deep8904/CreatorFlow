# Group 5 — Auth surfaces · **BINDING DECISION**

**Scope:** `app/login`, `app/onboarding`, `app/forgot-password`, `app/reset-password`,
`app/accept-invite` (+ `AcceptInviteButton.tsx`).
**Inputs:** `docs/proposals/GROUP5_DESIGN_A.md` ("Threshold"), `docs/proposals/GROUP5_DESIGN_B.md`
("The Airlock"), both re-read against `docs/REDESIGN_BRIEF.md`, `DESIGN.md`,
`docs/NEBULA_REFERENCE_NOTES.md`, `components/home/*`, `components/console/*`, and the five real
source files, plus `app/globals.css`, `app/layout.tsx`, `components/ui/logo.tsx`, and
`app/(app)/team/TeamBoard.tsx`, all read directly for this decision (claims below are verified
against the actual code, not taken on either designer's word).
**Format bar:** matches `docs/proposals/GROUP1_DECISION.md`. This document is binding. An
implementer builds directly from it with zero further judgement calls.

---

## 1. Verdict

**Merge, with Design A as the base skeleton and philosophy, and seven specific mechanics pulled
from Design B where B is demonstrably more correct, more honest, or more consistent with the
already-shipped system.** Neither proposal wins outright. A is more disciplined about scope
(simpler component boundaries, no unnecessary skip link, no cross-tier import) but ships one
internal contradiction in its submit-button state logic and one copy claim that doesn't survive
a codebase check. B is more rigorous about honesty and accessibility mechanics (the `.nebula-cta`
wide-button fix, the tiered CTA-vs-ghost-button discipline, the `ConnectCard` copy) but invents a
duplicate F-mark component, mis-specifies its own `SkipLink` reuse, and reaches for `fixed`
positioning and a hero-scale entrance keyframe that both cut against its own "restraint" thesis.

| Screen / shell | Winner | One-line reason |
|---|---|---|
| Shared shell (`AuthShell`, `AuthTopBar`, backdrop) | **Merge** | A's simpler root + B's `AuthBackdrop` consolidation and ghost-word layer, both with corrections (§4) |
| `/login` | **A**, with B's field-focus and CTA-tier corrections | A's composition is already correct; only the primitives underneath change |
| `/onboarding` | **A**'s per-step composition (no `AuthCard` wrapper on connect steps) + B's `AuthConnectCard` copy | A's simpler nesting avoids B's bare/elevated variant complexity entirely |
| `/forgot-password` | **A** | Identical proposals; A's static recovery-line pattern (reused here implicitly via its own `sent` copy) is simplest |
| `/reset-password` | **A**'s permanent recovery line (not B's error-gated action) | Solves the actual UX problem named in review — visible *before* the user wastes a second attempt |
| `/accept-invite` | **B**'s tiered CTA discipline (`AuthLinkButton` only for "Create account"; `AuthGhostButton` for every other exit) | A would put signature-CTA weight on "Go to Dashboard," which is a dead-end, not a commitment |

Component-by-component rulings are in §5. Every "reviewer must rule on" item from A's §7 and B's §13
is resolved in §3.

---

## 2. What I independently verified before ruling (do not re-litigate these)

1. **`components/ui/logo.tsx`** now uses `currentColor` (fixed in Group 6 cleanup, confirmed by
   reading the file). Both proposals route around it anyway with their own F-mark component,
   regardless of the bug — see §3.9 for why that's *still* wrong, but not because of the bug.
2. **Pricing/billing copy.** All three strings A flagged exist verbatim at the cited line numbers.
   `app/(app)/team/TeamBoard.tsx` contains four more billing claims (lines 26, 52, 184, 188) against
   zero billing code in the repo (`grep -ri stripe\|subscription\|billing` under `lib/` returns
   nothing behavioural). Confirmed, out of scope, flagged at §8.
3. **`app/layout.tsx`** — confirmed lines 60–63/73: `colorScheme: 'light'`, `themeColor: '#FFFFFF'`,
   `<html className="...bg-linen">`. Not fixed. Ruling in §3.6.
4. **`reset-password/page.tsx`** — confirmed zero token/session validation. `updatePassword()` is
   called directly; the only client-side checks are length and match, both pre-existing. Ruling
   in §3.7 confirms neither proposal adds a session probe.
5. **`accept-invite/page.tsx`** — confirmed `async function AcceptInvitePage` (real RSC, `await
   searchParams`, `await getAuthenticatedUser()`, `await getInviteById()`). Confirmed the logo in
   this file today (lines 24–26) is **not** wrapped in a `<Link>` — B's claim is accurate.
6. **`.nebula-cta` in `app/globals.css`** (lines 639–740) — confirmed `::after` shimmer is
   `width: 100%; aspect-ratio: 1` (line 703–704), confirmed there is **no** `:disabled` rule
   anywhere in the block, confirmed the only shipped consumer (`ShinyCTA.tsx`) uses
   `inline-flex ... px-12 py-5` (content-sized, roughly 4:1 aspect at typical widths) — never
   `w-full`. Ruling in §3.1.
7. **`components/ui/button.tsx`** line 16 — `rounded-full` is in the *base* class shared by every
   variant, not scoped to "nonPrimaryVariants" as A states. Immaterial to the ruling (still
   correct that nothing in `components/ui/*` may be imported by these five pages) but noted for
   accuracy.
8. **`components/console/SkipLink.tsx`** — confirmed it hardcodes `href="#console-main"` with no
   prop for the target. B's shell diagram shows `<SkipLink />` linking to `#auth-main`, and B's
   component table lists `SkipLink` under "Reused as-is, unmodified." Those two claims are
   mutually exclusive — the component cannot be reused unmodified and also point somewhere else.
   Ruling in §3.10: no skip link on this tier at all, so the conflict is moot.
9. **`app/(app)/settings/SettingsBoard.tsx`** — confirmed a real connect/disconnect UI exists
   (`gmailConnected`, `youtubeConnected`, `disconnectIntegration`), **but** its own "Connect"
   control (line ~239–243) is the identical disabled/`title`-tooltip stub as onboarding's
   `ConnectRow`. A's proposed onboarding copy — "You can connect it later in Settings" — implies
   Settings offers a working path that it does not. Ruling in §3.4 rejects that clause.
10. **`components/home/HeroCurtain.tsx`** line 26 — confirmed the approved Home curtain renders
    from `md:grid` (768px), not `lg:` (1024px). B's breakpoint matches the established
    convention; A's does not. Ruling in §3.8.
11. **`components/home/*`** background layers (`Hero.tsx`, `DetailCards.tsx`, `NebulaNav.tsx`,
    `HeroCurtain.tsx`) — confirmed every atmosphere/decoration layer on the approved Home page
    uses `absolute inset-0`, never `fixed inset-0`. B's `AuthBackdrop` uses `fixed`. Ruling in §3.8.
12. **`components/home/GhostSection.tsx`** — confirmed the giant-ghost-typography technique
    (`12vw`, `text-white/[0.03]`) is already a shipped Home primitive, not an invention. B's xl+
    ghost wordmark on auth is a reuse of an established technique, not scope creep. Approved, §3.8.
13. **`app/onboarding/page.tsx`** `StepIndicator` (lines 18–34) — worked through the actual
    ternary by hand for every `(current, i)` pair. `i < index-1` and `i === index-1` both resolving
    to `'bg-lavender'` is **not** a bug; it is the standard "past-and-current steps stay filled"
    progress-bar idiom, and it produces the correct dot state at every step I checked. B's §4.9
    claim that this is "a latent index bug" is **incorrect** — see §3.11. The 2-segment redesign
    is still adopted, on different (correct) grounds.
14. **`PRODUCT.md`** lines 13, 37, 52 — confirms "no payment/billing UI exists anywhere," and that
    "Settings/billing" is PRODUCT.md's own shorthand for the owner-exclusive permission scope, not
    a claim that a billing feature exists. This is why the accept-invite fix drops "billing"
    entirely rather than trying to preserve it — see §4 copy table.

---

## 3. Every "reviewer must rule on" item, resolved

Numbered items map to A §7 (A1–A9) and B §13 (B1–B9) as cited.

### 3.1 `.nebula-cta` on a full-width, disabled-capable submit (A §7.2, B §13.1)

**Ruling: merge, with a correction to A's own internal contradiction.**

Verified: the shimmer (`::after`) is genuinely tuned for a content-sized pill (§2.7), and an 8:1
aspect-ratio full-width 48px button will visibly under-serve it (most of the square sweep clips
under `overflow: hidden`, leaving a thin, off-center highlight). B's fix is real and cheap:

```css
/* Additive only. app/globals.css, appended after the existing .nebula-cta block. */
.nebula-cta--wide::after {
  aspect-ratio: auto;
  width: 140%;
  height: 100%;
  opacity: 0.28;
  -webkit-mask-image: radial-gradient(ellipse at bottom, transparent 45%, #000);
  mask-image: radial-gradient(ellipse at bottom, transparent 45%, #000);
}
```

**Adopt this rule. Reject B's `.nebula-cta:disabled` and `.nebula-cta[aria-busy='true']` rules —
they are unnecessary given the mechanism below, and shipping unused CSS is its own defect.**

For the disabled/enabled/submitting states, adopt A's **markup-swap** mechanism (§2.8), not B's
CSS-`:disabled`-override mechanism — but A's own document contradicts itself between §2.8 ("the
class swap uses the disabled predicate, byte-for-byte") and §5.1 ("Submitting: `.nebula-cta`
retained"), because the same predicate (`isSubmitting || !email.trim() || !password`) cannot
simultaneously select the plain-pill markup *and* keep the `.nebula-cta` markup while
`isSubmitting` is true. This decision resolves it explicitly:

- **Variant selection** (`.nebula-cta` vs. the plain inert pill) is driven by **field completeness
  only** — e.g. `!email.trim() || !password` on login, with the equivalent per-screen expression
  elsewhere. This can only be false (i.e. the plain pill renders) before the user has finished
  typing; it is never re-evaluated once `isSubmitting` becomes true, because `isSubmitting` only
  becomes true from a click that was already gated on the fields being complete.
- **The real HTML `disabled` attribute** stays exactly the existing predicate
  (`isSubmitting || !email.trim() || !password` etc.) — **byte-identical**, so double-submit
  protection is unchanged.
- Net effect: idle-incomplete → plain pill, real `disabled`, no animation (nothing to kill, it was
  never `.nebula-cta`). Idle-complete → `.nebula-cta`, not disabled, beam spinning. Submitting →
  `.nebula-cta` (fields were necessarily complete to get here), real `disabled` attribute set,
  `aria-busy="true"`, beam **keeps spinning** with zero extra CSS (there is no `:disabled` kill
  rule to fight), which is the correct signal — work is in flight. This is a strict improvement on
  both proposals' internal logic and needs no `.nebula-cta:disabled` selector at all.

```tsx
// components/auth/AuthSubmit.tsx — client (holds no state; needs 'use client' only if it is
// the first client boundary a page hits, which none of these pages need it to be)
export function AuthSubmit({
  isComplete,      // fields non-empty — screen-specific boolean, computed by the caller
  disabled,        // the full existing predicate, byte-identical per screen
  loading,
  children,
  type = 'submit',
}: {
  isComplete: boolean
  disabled: boolean
  loading?: boolean
  children: ReactNode
  type?: 'submit' | 'button'
  onClick?: () => void
}) {
  if (!isComplete) {
    return (
      <button type={type} disabled
        className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center
                   rounded-[9999px] bg-white/[0.04] px-8 font-nebula-tech text-[13px] font-medium
                   uppercase tracking-[0.14em] text-zinc-500
                   shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
        {children}
      </button>
    )
  }
  return (
    <button type={type} disabled={disabled} aria-busy={loading || undefined}
      className="nebula-cta nebula-cta--wide group inline-flex h-12 w-full items-center
                 justify-center gap-2 px-8 font-nebula-tech text-[13px] font-medium uppercase
                 tracking-[0.14em] text-white transition-[transform,box-shadow] duration-500
                 hover:shadow-[0_0_40px_-12px_rgba(234,88,12,0.55)]
                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
                 focus-visible:outline-orange-400">
      <span className="nebula-cta__label gap-2">{children}</span>
    </button>
  )
}
```

No `hover:scale-[1.02]` (matches A's reasoning — a full-width button that grows on hover shifts
internal card layout; the glow shadow alone carries hover).

### 3.2 Field hairline as `box-shadow: inset`, not `mask-composite` (A §7.4, B §13.3)

**Ruling: both proposals are right, and it is not close.** DESIGN.md's "no solid borders" rule
(and NEBULA_REFERENCE_NOTES §4's "gradient borders, never solid") governs *elevated-surface
frames* — the technique the reference itself documents for exactly that purpose. A text input is
a cut into the surface, not an elevated object, and the reference's own signature CTA uses this
exact inset mechanic for its layer-2 hairline (`box-shadow: inset 0 0 0 1px #1a1818`,
NEBULA_REFERENCE_NOTES §2.2). Group 1 shipped the identical reasoning for `Monogram`
(`ring-1 ring-inset`, GROUP1_DECISION). **Adopt.** Five stacked `.nebula-border` `::before`s per
card for a difference nobody can see is the wrong trade.

**Focus-state color, merged (neither proposal wins outright):** A recolors the inset hairline to
brighter white on focus and relies solely on the outer `focus-visible` ring for orange; B recolors
the inset hairline to orange **and** keeps the outer ring orange **and** recolors the label to
`orange-300` — three simultaneous orange signals for one state, which is closer to the "muddy
double halo" B itself warns against in the same section. Adopt a clean split: **inset hairline
brightens to white on focus (A), outer `focus-visible` ring is orange (both), label recolors to
`orange-300` via `peer-focus` (B)** — one signal per visual channel, no doubled emphasis on the
same ring.

```tsx
// components/auth/AuthField.tsx
<div className="flex flex-col gap-2 text-left">
  <div className="flex items-baseline justify-between gap-3">
    <label htmlFor={id}
      className="peer-focus:text-orange-300 font-nebula-mono text-[10.5px] font-medium
                 uppercase tracking-[0.16em] text-zinc-400 transition-colors duration-150">
      {label}
    </label>
    {labelSuffix}
  </div>
  <div className="relative">
    <input
      id={id} {...rest}
      aria-invalid={error ? true : undefined}
      aria-describedby={[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined}
      className="peer h-12 w-full rounded-[12px] bg-white/[0.03] px-4 font-nebula-ui text-[16px]
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
  {hint  && <p id={`${id}-hint`}  className="font-nebula-ui text-[12px] text-zinc-500">{hint}</p>}
  {error && <p id={`${id}-error`} className="font-nebula-ui text-[12.5px] font-medium text-rose-300">{error}</p>}
</div>
```

`text-[16px]` unconditionally, at every breakpoint — **adopt A's rule over B's `sm:text-[14px]`
step-down.** Both solve the iOS zoom-on-focus bug at the floor; A's version is one string instead
of a responsive pair, which is one fewer thing to regress if a future edit forgets the breakpoint
variant. `placeholder:text-zinc-600` is the one sanctioned zinc-600 use (A §2.6.4) — every field
has a persistent visible label, so the placeholder never carries meaning alone.

### 3.3 `noValidate` on the four `<form>` elements (A §7.1)

**Reject.** This is the one item A itself flags as droppable, and it should be dropped: today's
forms have no `noValidate`, so native validation bubbles are the **existing, shipped** behaviour
for malformed input on `required` fields. Adding `noValidate` is a real attribute delta against a
"re-skin, preserve all behaviour" brief, for a benefit (styling the never-reachable native bubble)
that doesn't exist today either. Keep every `<form>` exactly as-is — no `noValidate` anywhere. The
`:user-invalid` / `aria-[invalid=true]` hairline recoloring in `AuthField` works identically with
or without it; nothing about the visual design depends on this attribute.

### 3.4 `AuthConnectCard` honesty copy (both, A §2.15 / B §4.10)

**Ruling: B's copy wins; A's contains a factual error.** Verified against
`app/(app)/settings/SettingsBoard.tsx`: A's proposed sentence — "Not available yet — this needs
production Google credentials. **You can connect it later in Settings.**" — implies Settings has a
working connect flow. It does not; Settings' own "Connect" control is the identical
disabled/tooltip stub. Shipping that sentence would recreate, inside the auth tier, exactly the
kind of overclaim the whole review is checking for. **Adopt B's copy verbatim:**

> Connecting a real account needs production Google OAuth credentials, which this build doesn't
> have yet.

Mechanics: adopt B's three-signal honesty pattern (persistent "Not connected" pill + visibly inert
`<span aria-disabled="true">` control, no `onClick`, no `href` + the visible sentence above,
replacing the current `title`-only tooltip that touch and most screen readers never reach) — both
proposals independently converged on this, it's correct, adopt as common ground.

Structural placement: **adopt A's simpler nesting.** On the `youtube`/`gmail` onboarding steps,
`AuthConnectCard` is a standalone elevated object (its own `.nebula-border` + `backdrop-blur-xl` +
`rounded-[1rem]`, no wrapping `AuthCard`) — **not** B's `AuthCard` `variant="bare"` +
`AuthConnectCard elevated` two-prop dance, which exists solely to avoid concentric frames that A's
simpler "just don't wrap it" approach avoids by construction. Reject B's `variant`/`elevated` props
as unnecessary complexity for a problem A's composition doesn't have.

### 3.5 `AuthShell` as a server component (B §0/§1.2)

**Ruling: not a real conflict.** Verified: A's own component table (§2, row 1) already lists
`AuthShell` as `server`, and A's §2.1 code has no `'use client'` directive. Both proposals in fact
specify a directive-free `AuthShell`. This works correctly in both contexts it's used in: as a true
Server Component when `accept-invite/page.tsx` (a real `async` RSC, verified §2.5 above) renders
it directly, and as an ordinary function component inside the client-boundary tree when the other
four (`'use client'`) pages render it — Next.js does not require every component in a client
module's import graph to carry its own `'use client'`; only the boundary file does. **No violation
in either proposal.** Adopt B's explicit written rule ("must stay a server component, no
`'use client'` at the top of this file, ever") as a comment in the shipped file purely for future
maintainers — cheap insurance against someone adding a directive out of habit — but this is
documentation, not a design difference.

### 3.6 The light-mode root layout (B §13.8)

**Ruling: confirmed real and current; adopt the local, per-route mitigation; do not touch
`app/layout.tsx`.** Verified `app/layout.tsx` lines 60–63/73 exactly as B describes. Group 5 does
**not** flip `colorScheme`/`themeColor`/`bg-linen` globally — eight `(app)/*` screens are still on
the Swiss token layer and depend on the light scheme; that flip is explicitly Group 6's, once
nothing light-mode remains. Local mitigation, one line per route:

```tsx
// app/login/layout.tsx, app/forgot-password/layout.tsx, app/reset-password/layout.tsx,
// app/onboarding/layout.tsx — four new tiny server layout files (the routes are 'use client'
// pages, and Next.js forbids a `viewport` export from a client component, hence the wrapper)
export const viewport = { colorScheme: 'dark' as const, themeColor: '#000000' }
export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
```

`accept-invite/page.tsx` is already a server component and takes the export inline (alongside its
existing `metadata` export). **This is a file addition, not a restructure** — no route, URL, or
import changes; explicitly adopting A's framing of this over the "move five directories into an
`(auth)` route group" alternative, for the same reason A gives: a re-skin shouldn't show up in
`git log --stat` as a restructure.

### 3.7 `reset-password` cannot detect an expired token (A §7.5, B §13.5/§5.4)

**Ruling: both proposals correctly decline to add a `getSession()` probe — confirmed correct, and
confirmed non-negotiable.** A session probe is new data flow, explicitly out of scope for a
re-skin. **Adopt A's mechanism, reject B's.** A's static, permanently-visible recovery line renders
*before* the user has typed anything, directly addressing the exact failure path this review
named — "a dead link surfaces only after the user types a new password twice." B's version only
attaches the "Request a new link" action *inside* the error alert, i.e. only after that same wasted
round-trip has already happened — it wraps the current bad experience in nicer chrome without
fixing the timing. Ship:

```tsx
// below AuthCard on /reset-password, unconditional, every render
<p className="mt-6 text-center font-nebula-ui text-[12px] leading-relaxed text-zinc-500">
  Reset links expire. If this one doesn't work,{' '}
  <AuthLink href="/forgot-password">request a new one</AuthLink>.
</p>
```

Both client-side validation checks (`length < 8`, mismatch) stay exactly as written, same trigger
points, same message strings (including the existing curly apostrophe in "Passwords don't
match."), rendered in `AuthAlert` exactly where `{error && <p>}` renders today. No `action` prop is
added to `AuthAlert` for this — see §5.13, it stays message-only.

### 3.8 `AuthCurtain` breakpoint, `AuthBackdrop` positioning, ghost wordmark (B §0/§1.5, A §1.1)

Three sub-rulings, all decided by checking the already-approved Home page rather than either
proposal's assertion:

- **Curtain breakpoint: B wins.** Verified `components/home/HeroCurtain.tsx:26` renders from
  `md:grid` (768px), matching B. A's `lg:grid` (1024px) departs from the established convention
  for no stated reason. Adopt `hidden md:grid md:grid-cols-3` for `AuthCurtain`, off below `md`
  (three columns across 288–320px of content is a hairline through the card — both proposals
  agree on this floor).
- **Positioning: A/Home's convention wins, reject B's `fixed`.** Verified every atmosphere layer on
  the approved Home page (`Hero.tsx:26`, `DetailCards.tsx:43/149`, `HeroCurtain.tsx:26`,
  `NebulaNav.tsx:67`) uses `absolute inset-0`. B's `AuthBackdrop` uses `fixed inset-0`, reasoned as
  preventing the glow from scrolling with a tall onboarding step — a real but minor concern (these
  screens are short; only the smallest viewports with the longest step could scroll at all), and
  `fixed` reintroduces a known CSS trap (an ancestor with `transform`/`filter`/`backdrop-filter`
  silently turns `fixed` into `absolute`-relative-to-that-ancestor, which nothing here currently
  has, but it's exactly the kind of implicit dependency that breaks quietly on a future edit).
  Consistency with the shipped page beats a marginal, unobserved scroll-parallax concern. Adopt
  `absolute inset-0` for `AuthBackdrop`.
- **Ghost wordmark: approved.** Verified `components/home/GhostSection.tsx` already ships the
  giant-ghost-typography technique (`12vw`, `text-white/[0.03]`) as a full Home section. B's reuse
  of the same technique as a background layer at `xl:` (1280px+) behind the auth card — `13vw`,
  `text-white/[0.018]`, `aria-hidden`, `select-none` — is a legitimate reuse of an established
  primitive at an even lower opacity, not an invention. Adopt. Off below `xl` — at narrower
  desktop widths it would compete with the card rather than sit behind it.

`AuthBackdrop` ships as one component per B's consolidation (grain + aurora + curtain + ghost word
in one `aria-hidden` tree) rather than A's split (glow inlined in the shell, curtain a separate
component, no ghost layer) — consolidation is the better shape once there are four layers instead
of two, and it becomes the one place all four are documented together.

### 3.9 F-mark: reject both proposals' new component, reuse `ConsoleMark` directly

**Neither proposal is fully right, and this is the one place I'm overruling both.** A creates a
new `AuthMark` component that re-copies the gradient-F recipe from `NebulaNav.tsx:31`. B correctly
imports the existing `components/console/ConsoleMark.tsx` instead — but B still lists it as new
surface area worth a table row. The mark is a five-line, zero-behaviour, purely presentational
`<span>`. `components/ui/logo.tsx`'s own doc comment (verified, §2.1 above) exists specifically
because this exact mark was hand-copied five times and drifted (`strokeWidth` 2.5 vs 2, size 20
vs 24) before that consolidation. **Creating a sixth copy for the auth tier — even a byte-identical
one — is the anti-pattern the `Logo` refactor was written to eliminate**, and it is exactly the
kind of accidental cross-tier duplication the review brief asked me to check for.

**Ruling: `components/auth/*` imports `ConsoleMark` from `components/console/ConsoleMark.tsx`
directly. No `AuthMark` file is created.** This is a deliberate, minor cross-tier import — the one
exception alongside `FOCUS`/`FOCUS_INSET`/`HOVER`/`EASE` (§3.12) — justified because the
alternative is measurable drift risk for zero design benefit.

### 3.10 Skip link (B §1.1/§9.1, A §2.1)

**Ruling: A wins. No skip link on this tier.** A's reasoning holds up: these pages have one
landmark and 2–4 tabbable elements total; a skip link would be the *first* of them and would skip
past nothing meaningful — on the shortest pages (reset-password, accept-invite dead ends) it would
add a tab stop to save the user from tabbing past... one link. Group 1's shell has a 9-item rail;
that is the actual problem `SkipLink` solves. Additionally, verified (§2.8 above) that B's own
proposed reuse is broken as specified — `components/console/SkipLink.tsx` hardcodes
`href="#console-main"` with no target prop, so `<SkipLink />` cannot honestly point at
`#auth-main` without modifying a Group 1 shared file, which is out of this group's scope and not
proposed by B either. The conflict resolves itself once the component isn't used at all.

### 3.11 `AuthSteps`/`StepIndicator` "bug" (B §4.9/§13.6)

**Ruling: B's bug claim is factually wrong; the redesign is still adopted, on the correct
grounds.** Verified by hand-tracing `STEPS.indexOf(current)` against the actual ternary
(§2.13 above) for every reachable `(current, i)` pair: the two branches that both resolve to
`'bg-lavender'` are the intended "past step" and "current step" cases of a standard progress-bar
fill — completed steps staying lit is correct, not a defect, and no dot is ever wrongly filled at
any of the four reachable step values. **Do not describe the replacement as a bug fix.** The
replacement is still adopted, for the reason A actually gives: the current component renders
**three** dots for what is functionally a **two**-step user-facing flow (`youtube`, `gmail` —
`done` is a terminal state, not a step you progress through via the indicator). Reducing to two
explicit segments removes that mismatch. Final component, name from B (consistent `Auth-` prefix,
shorter):

```tsx
// components/auth/AuthSteps.tsx
export function AuthSteps({ current, total = 2 }: { current: 1 | 2; total?: number }) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={`Step ${current} of ${total}`}>
      <span className="sr-only">Step {current} of {total}</span>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} aria-hidden className={`h-[3px] w-8 rounded-[2px] transition-colors
          duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${i < current ? 'bg-orange-500' : 'bg-white/10'}`} />
      ))}
    </div>
  )
}
```

`rounded-[2px]` (A's segment radius) not `rounded-[9999px]` (B's) — these are thin progress bars,
not pills; `2px` matches the meter-segment vocabulary A already established and reads less like a
button. `aria-hidden` on the visual plus one `sr-only` sentence via `role="group" aria-label`
(collapses A's separate `aria-hidden` + trailing `<span class="sr-only">` into one accessible
name — equivalent semantics, less markup).

### 3.12 Console-token reuse / accidental duplication check (both, review-brief final bullet)

Checked every new component against `components/console/tokens.ts` (which exports exactly
`FOCUS`, `FOCUS_INSET`, `EASE`, `HOVER` — confirmed by reading the file, nothing else is exported).

- Both proposals correctly import `FOCUS`/`FOCUS_INSET` from `console/tokens.ts` and never retype
  the string. **Confirmed clean on both.**
- **A's `AuthMark` duplicates `ConsoleMark`** — flagged and struck in §3.9.
- **B's inline-retyped link recipe inside `AuthAlert`'s `action` link** (B §4.7) — B defines the
  `AuthTopLink` recipe once (§1.4) but then hand-copies the same class string a second time for
  the alert's action link rather than reusing the component. Minor, but it's the same "retype
  instead of reuse" pattern in miniature. Resolved by §5.3's single `AuthLink` component, used
  everywhere a text link appears (top bar, field label suffix, below-card, and — had it survived
  — inside an alert).
- No other duplication found. Neither proposal retypes `EASE`/`HOVER` (both correctly compose
  `HOVER` where a colour transition recipe is needed, or write out `transition-colors duration-150
  ease-[cubic-bezier(0.16,1,0.3,1)]` — equivalent to `HOVER`'s definition — which is fine, that's
  what the exported string *is*).

### 3.13 `disabled` vs `aria-disabled` on the submit button (B §13.5)

**Ruling: B is correct; confirmed against the real handlers.** Verified none of the five
`handleSubmit` functions guard against re-entrancy independently of the `disabled` HTML attribute
(no `if (isSubmitting) return` inside any handler). Swapping to `aria-disabled` + a click-guard
would need that guard added — which is exactly the "touches the submission contract" B declines to
do, and would be a genuine (if small) behaviour change, not a re-skin. **Keep `disabled`,
unchanged, exactly as B argues.** The focus-loss-on-disable problem this creates is real but
solved separately and non-invasively — see §5.14.

---

## 4. Copy fixes — exact strings to ship

Per REDESIGN_BRIEF §2b ("no pricing anywhere... no pricing copy, links, or CTAs on any surface")
and PRODUCT.md's confirmed "no payment/billing UI exists anywhere in the current build."

| File : line | Current (verbatim) | Ship | Source / reasoning |
|---|---|---|---|
| `login/page.tsx:120` | "Free means free — no percentage of your deals, no credit card to start." | **"Free and open source. No cut of your deals, ever."** | Anchored on the approved Home badge string, `Hero.tsx:43`, verified verbatim: "Free & open source — no cut of your deals." "no credit card **to start**" implies a later paid tier that will not exist. |
| `onboarding/page.tsx:120` | "Takes about a minute. Free, no credit card." | **"Takes about a minute. Free and open source."** | Same defect, same fix, same voice. |
| `accept-invite/page.tsx:98` | "full access, including **billing** and team management" | **"full access, including team management and account settings"** | There is no billing feature (PRODUCT.md line 52, confirmed). "Account settings" is real and owner-scoped (PRODUCT.md line 37, Settings page exists). Rejects A's identical fix's premise-check as not-yet-done — verified here instead. |
| `onboarding` `ConnectCard` note (new copy, no prior equivalent) | *(currently only a `title` tooltip, invisible to touch/most SR)* | **"Connecting a real account needs production Google OAuth credentials, which this build doesn't have yet."** | B's copy (§3.4) — A's alternative ("connect it later in Settings") is false; Settings' control is the same stub. |
| `reset-password` recovery line (new copy, no prior equivalent) | *(none — dead link surfaces only after two password entries)* | **"Reset links expire. If this one doesn't work, request a new one."** → `/forgot-password` | A's copy (§3.7) — permanent, not error-gated. |

Every other string on all five screens is preserved **verbatim**, specifically including:
- The enumeration-safe forgot-password success copy: "If an account exists for **{email}**, we've
  sent a link to reset your password." — do not "improve" this into a confirmation; it is a
  deliberate anti-enumeration measure.
- Reset-password's two validation strings, including the existing curly apostrophe in "Passwords
  don't match."
- The accept-invite three-cause explanation on the invalid/expired/consumed branch ("It may have
  already been accepted, revoked, or sent to a different email address...") — already the most
  honest copy on the tier, untouched.
- The Member-role accept-invite body ("access to deals, ideas, and automations") — no billing
  language there to begin with, untouched.

---

## 5. Component inventory — final, binding

All new files under `components/auth/`. Nothing in `components/ui/{input,label,button,logo}.tsx`
is imported by these five pages after this ships (Group 6 deletes them once nothing imports them —
`oauth-glyphs.tsx` is kept, it is already `currentColor`-based). `ConsoleMark` and
`FOCUS`/`FOCUS_INSET`/`HOVER`/`EASE` are imported directly from `components/console/`.

| # | Component | File | Client? | Builds on | Notes |
|---|---|---|---|---|---|
| 1 | `AuthShell` | `AuthShell.tsx` | no | new | §5.1 |
| 2 | `AuthTopBar` | `AuthTopBar.tsx` | no | `ConsoleMark`, `FOCUS` | §5.2 |
| 3 | `AuthLink` | `AuthLink.tsx` | no | `FOCUS` + `after:` extender | §5.3 — replaces A's `AuthAltLink` **and** B's `AuthTopLink` |
| 4 | `AuthBackdrop` | `AuthBackdrop.tsx` | no | `.nebula-grain`, `GhostSection` technique | §5.4 |
| 5 | `AuthCurtain` | `AuthCurtain.tsx` | no | `HeroCurtain` (3-col reduction) | §5.4 |
| 6 | `AuthCard` | `AuthCard.tsx` | no | `.nebula-border` | §5.5 |
| 7 | `AuthHeading` | `AuthHeading.tsx` | no | Group 1 §3.3 type roles | §5.6 |
| 8 | `AuthField` | `AuthField.tsx` | client (controlled) | new | §3.2 |
| 9 | `AuthPasswordField` | `AuthPasswordField.tsx` | client | `AuthField` | §5.7 |
| 10 | `AuthSubmit` | `AuthSubmit.tsx` | no directive needed | `.nebula-cta`/`.nebula-cta--wide` | §3.1 |
| 11 | `AuthLinkButton` | `AuthLinkButton.tsx` | no | same recipe as `AuthSubmit`, `<Link>` | §5.8 |
| 12 | `AuthGhostButton` | `AuthGhostButton.tsx` | no | new | §5.8 |
| 13 | `AuthAlert` | `AuthAlert.tsx` | client | new, `role="alert"` | §5.13 |
| 14 | `AuthNotice` | `AuthNotice.tsx` | no | new, tone-aware | §5.9 |
| 15 | `AuthSteps` | `AuthSteps.tsx` | no | replaces `StepIndicator` | §3.11 |
| 16 | `AuthConnectCard` | `AuthConnectCard.tsx` | no | replaces `ConnectRow` | §3.4 |

`index.ts` re-exports all sixteen.

### 5.1 `AuthShell`

```tsx
// components/auth/AuthShell.tsx
// SERVER component. Never add 'use client' to this file — accept-invite/page.tsx renders it
// directly as a Server Component; the other four pages render it from inside their own
// 'use client' boundary. Both work without a directive here. See GROUP5_DECISION §3.5.
export function AuthShell({
  width = 'narrow',       // 'narrow' → max-w-[25rem] (400px) | 'wide' → max-w-[30rem] (480px)
  topRight,                // ReactNode — top-bar trailing slot
  footnote,                // ReactNode, one line, band 3
  children,
}: {
  width?: 'narrow' | 'wide'
  topRight?: ReactNode
  footnote?: ReactNode
  children: ReactNode
}) {
  const maxWidth = width === 'wide' ? 'max-w-[30rem]' : 'max-w-[25rem]'
  return (
    <div className="nebula-auth relative flex min-h-screen min-h-[100svh] w-full flex-col
                     overflow-x-hidden bg-black font-nebula-ui text-zinc-200 antialiased
                     selection:bg-orange-500/30 selection:text-orange-200">
      <AuthBackdrop />
      <AuthTopBar right={topRight} />
      <main className="relative z-10 flex flex-1 flex-col justify-start px-4 py-8
                        sm:px-6 md:justify-center md:py-12 lg:py-16">
        <div className={`mx-auto w-full text-center ${maxWidth}`}>{children}</div>
      </main>
      {footnote && (
        <p className="relative z-10 mx-auto mb-8 max-w-[34ch] px-4 text-center font-nebula-ui
                      text-[12px] leading-relaxed text-zinc-500 sm:px-6">
          {footnote}
        </p>
      )}
    </div>
  )
}
```

`min-h-screen` first as the fallback, `min-h-[100svh]` second as the correct unit (stable smallest
viewport height — doesn't reflow as the mobile URL bar shows/hides, unlike `100dvh`). No `<SkipLink
/>` (§3.10). `overflow-x-hidden` is the 320px backstop both proposals independently specify —
adopt.

### 5.2 `AuthTopBar`

```tsx
// components/auth/AuthTopBar.tsx
export function AuthTopBar({ right }: { right?: ReactNode }) {
  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between gap-3
                        px-4 sm:h-16 sm:px-6">
      <Link href="/" className={`group inline-flex shrink-0 items-center gap-2.5 rounded-[10px]
                                  py-2 -my-2 ${FOCUS}`}>
        <ConsoleMark size={24} />
        <span className="font-nebula-ui text-[15px] font-medium tracking-tight text-white">
          CreatorFlow
        </span>
      </Link>
      {right && <div className="flex min-w-0 shrink items-center">{right}</div>}
      <div aria-hidden className="console-rule-x absolute inset-x-0 bottom-0 opacity-60" />
    </header>
  )
}
```

No `.nebula-progressive-blur` (B's reasoning: the bar is static, not fixed-on-scroll like Home's
nav; an 8-layer blur stack above a card that already carries the tier's one `backdrop-blur-xl`
would be a second blur context for no gain). The hairline rule reuses `.console-rule-x`
(confirmed present at `app/globals.css:799`) rather than a `border-b`, per DESIGN.md's no-solid-
borders rule applied literally here (a full-width 1px rule at the very top of a page is the most
visibly "Swiss" thing that could survive into this tier).

### 5.3 `AuthLink` (consolidates A's `AuthAltLink` and B's `AuthTopLink`)

One component for every inline text-link affordance on the tier: top-bar trailing link, the
"Forgot password?" label-row suffix, every below-card alt link, and the accept-invite
signed-out branch's "Already have an account? Sign in." **Do not** hand-retype this recipe
anywhere else on the tier (§3.12 flagged exactly that happening once, in B's `AuthAlert`).

```tsx
// components/auth/AuthLink.tsx
export function AuthLink({ href, className = '', children, ...rest }: LinkProps & { className?: string }) {
  return (
    <Link
      href={href}
      className={`relative rounded font-nebula-ui text-[13px] font-medium text-zinc-400
                  transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-white
                  after:absolute after:inset-x-0 after:-inset-y-3 after:content-['']
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
                  focus-visible:outline-orange-400 ${className}`}
      {...rest}
    >
      {children}
    </Link>
  )
}
```

The `after:` extender takes a 17px text link to a 41px hit target with zero layout height added —
the pattern `NebulaNav` already uses and both proposals correctly cite. Emphasised words inside a
link ("Sign in," "Start free") get an inline `text-white` span.

### 5.4 `AuthBackdrop` + `AuthCurtain`

```tsx
// components/auth/AuthBackdrop.tsx — aria-hidden, absolute (not fixed — §3.8), z-0
export function AuthBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* grain */}
      <div className="nebula-grain absolute inset-0" />
      {/* aurora */}
      <div className="absolute left-1/2 top-[-22%] h-[75%] w-[150%] -translate-x-1/2
                      rounded-[9999px] bg-[radial-gradient(ellipse_at_center,rgba(234,88,12,0.12),
                      rgba(234,88,12,0.04)_38%,transparent_70%)] blur-[60px]" />
      {/* curtain, md+ */}
      <AuthCurtain />
      {/* ghost wordmark, xl+ */}
      <p className="absolute inset-0 hidden select-none items-center justify-center
                    whitespace-nowrap text-center font-nebula-heading text-[13vw] font-extrabold
                    tracking-tighter text-white/[0.018] xl:flex">
        CREATORFLOW
      </p>
    </div>
  )
}
```

```tsx
// components/auth/AuthCurtain.tsx — 3-column reduction of HeroCurtain, hidden md:grid (§3.8)
const COLUMNS = [
  { height: '46%', delay: 'nebula-delay-1' },
  { height: '30%', delay: 'nebula-delay-2' },
  { height: '46%', delay: 'nebula-delay-3' },
]
export function AuthCurtain() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 hidden md:grid md:grid-cols-3"
      style={{ maskImage: 'linear-gradient(to top, black 25%, transparent 78%)',
               WebkitMaskImage: 'linear-gradient(to top, black 25%, transparent 78%)' }}
    >
      {COLUMNS.map((col, i) => (
        <div key={i} className={`nebula-col relative h-full ${col.delay}
                                  ${i > 0 ? 'border-l border-white/[0.04]' : ''}`}>
          <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.08] bg-black
                          shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.8)]"
               style={{ height: col.height }} />
        </div>
      ))}
    </div>
  )
}
```

Lower plinths than Home's hero (46/30/46 vs. 75/45/75, A's values) — the auth card sits lower in
the viewport than a hero headline, and the skyline must stay under it. `.nebula-col` and
`.nebula-delay-1/-2/-3` are already-shipped classes (confirmed `app/globals.css:528–530` and the
existing reduced-motion kill list) — zero new CSS for the curtain itself.

### 5.5 `AuthCard`

```tsx
// components/auth/AuthCard.tsx
export function AuthCard({
  as = 'div',
  className = '',
  ...rest
}: { as?: 'div' | 'form'; className?: string } & (React.HTMLAttributes<HTMLDivElement> | React.FormHTMLAttributes<HTMLFormElement>)) {
  const Comp = as as any
  return (
    <Comp
      className={`nebula-border auth-enter relative overflow-hidden rounded-[2rem]
                  bg-white/[0.035] p-5 shadow-[0_28px_80px_-30px_rgba(0,0,0,0.9)]
                  backdrop-blur-xl sm:p-7 ${className}`}
      style={{ '--nebula-border-gradient':
        'linear-gradient(150deg, rgba(255,255,255,0.22), rgba(255,255,255,0.03) 46%, rgba(234,88,12,0.18))',
        animationDelay: '80ms' } as CSSProperties}
      {...rest}
    />
  )
}
```

`rounded-[2rem]`, not A's invented `1.75rem` — NEBULA_REFERENCE_NOTES §4's radii vocabulary
already defines `2rem` as the "secondary card" bracket (`2.5rem` mega-cards / `2rem` secondary
cards). A 400–480px auth panel is a textbook secondary card; reusing the established bracket beats
inventing a third one. `backdrop-blur-xl` lives here and **nowhere else** on the page — the
Chromium nested-backdrop-filter trap both proposals correctly flag. No descendant of `AuthCard`
may carry `backdrop-filter`; `AuthConnectCard` and `AuthNotice` are **siblings**, never children,
when they need their own blur (only `AuthConnectCard` does, on the two onboarding connect steps —
§3.4).

### 5.6 `AuthHeading`

```tsx
// components/auth/AuthHeading.tsx
export function AuthHeading({
  eyebrow, title, subtitle, align = 'center',
}: { eyebrow?: string; title: string; subtitle?: ReactNode; align?: 'center' | 'start' }) {
  return (
    <div className={`auth-enter mb-7 sm:mb-8 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      {eyebrow && (
        <p className={`mb-2.5 flex items-center gap-2 font-nebula-mono text-[10.5px] font-medium
                        uppercase tracking-[0.18em] text-zinc-500 ${align === 'center' ? 'justify-center' : ''}`}>
          <span aria-hidden className="h-1 w-1 rotate-45 bg-orange-500" />{eyebrow}
        </p>
      )}
      <h1 className={`bg-gradient-to-b from-white to-white/70 bg-clip-text pb-[0.12em]
                      font-nebula-heading text-[26px] font-semibold leading-[1.12]
                      tracking-[-0.02em] text-transparent sm:text-[30px] lg:text-[34px]
                      ${align === 'center' ? 'mx-auto max-w-[22ch] text-balance' : ''}`}>
        {title}
      </h1>
      {subtitle && (
        <p className={`mt-3 font-nebula-ui text-[14px] leading-relaxed text-zinc-400 sm:text-[15px]
                       ${align === 'center' ? 'mx-auto max-w-[38ch]' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
```

`to-white/70` (not Home hero's `/50`) — both proposals independently converged on this for the
same reason (a 26–34px heading needs more of the ramp in the opaque half to clear 4.5:1 across its
whole height); adopt. `pb-[0.12em]` (B's value) over A's `0.06em` — checked against the actual
longest string, onboarding's "Let's get your creator business set up." at 320px/26px, which wraps
three lines and has descenders (`y`, `g`) on the first wrapped line; `0.12em` is the safer margin
against Safari's `bg-clip-text` descender clip.

### 5.7 `AuthPasswordField`

```tsx
// components/auth/AuthPasswordField.tsx — 'use client'
export function AuthPasswordField(props: AuthFieldProps) {
  const [shown, setShown] = useState(false)
  return (
    <AuthField
      {...props}
      type={shown ? 'text' : 'password'}
      trailing={
        <button type="button" onClick={() => setShown(v => !v)}
          aria-label={shown ? 'Hide password' : 'Show password'} aria-pressed={shown}
          className={`absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center
                      rounded-[10px] text-zinc-500 hover:text-zinc-200 ${HOVER} ${FOCUS}`}>
          {shown ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
        </button>
      }
    />
  )
}
```

`type="button"` is mandatory (a bare `<button>` in a `<form>` submits it). Toggling `type` between
`password`/`text` on the same DOM node (no `key` change) preserves the value, cursor position, and
`autoComplete` fill — do not remount. On `/reset-password` the two toggles are **independent
instances** (each field gets its own `AuthPasswordField`) — a shared toggle would hide the second
field while the user is checking the first.

### 5.8 `AuthLinkButton` and `AuthGhostButton` — the tiered CTA discipline

**Adopt B's tiering, reject A's flat treatment.** A's `AuthLinkButton` gives the same
`.nebula-cta` visual weight to all three navigational primaries — including "Go to Dashboard" from
a dead-end invite. That misapplies the signature action: `.nebula-cta` is the system's one
"press this to commit" affordance (Group 1 permits exactly one `ShinyCTA` in the entire console on
the same principle). Two tiers, used precisely:

- **`AuthLinkButton`** — the `.nebula-cta`/`.nebula-cta--wide` recipe (§3.1), rendered as a
  `<Link>`. Used in **exactly one place on the entire tier**: accept-invite's signed-out branch,
  "Create account" — the one purely-navigational action that is still a genuine commitment
  (starting the whole signup flow for an invited teammate).
- **`AuthGhostButton`** — plain pill, no beam, no infinite animation. Used everywhere else a
  full-width button or button-shaped link appears: onboarding's two "Continue" buttons
  (youtube→gmail, gmail→done — nothing is being submitted, there's no commitment to make),
  onboarding-done's "Go to Dashboard," accept-invite's "Back to CreatorFlow" and "Go to Dashboard"
  dead-end exits.

```tsx
// components/auth/AuthLinkButton.tsx
export function AuthLinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href}
      className="nebula-cta nebula-cta--wide group inline-flex h-12 w-full items-center
                 justify-center gap-2 px-8 font-nebula-tech text-[13px] font-medium uppercase
                 tracking-[0.14em] text-white transition-[transform,box-shadow] duration-500
                 hover:shadow-[0_0_40px_-12px_rgba(234,88,12,0.55)]
                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
                 focus-visible:outline-orange-400">
      <span className="nebula-cta__label gap-2">{children}</span>
    </Link>
  )
}

// components/auth/AuthGhostButton.tsx
export function AuthGhostButton({ href, onClick, children }: { href?: string; onClick?: () => void; children: ReactNode }) {
  const cls = `inline-flex h-12 w-full items-center justify-center gap-2 rounded-[9999px]
    bg-white/[0.05] font-nebula-tech text-[13px] font-medium uppercase tracking-[0.14em]
    text-zinc-200 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] transition-colors duration-150
    ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/[0.08] hover:text-white ${FOCUS}`
  return href
    ? <Link href={href} className={cls}>{children}</Link>
    : <button type="button" onClick={onClick} className={cls}>{children}</button>
}
```

Neither imports `components/home/ShinyCTA.tsx` directly (rejecting B's one-off reuse of the actual
marketing-tier component for the same visual result) — `AuthLinkButton` owns the recipe locally,
consistent with `AuthSubmit` owning it for the button case, avoiding a cross-tier import for what
is otherwise a same-tier concern.

### 5.9 `AuthNotice` (consolidates A's `AuthStatusIcon` + iconless `AuthNotice` into one component)

**Adopt B's unified, tone-aware version; reject A's split.** Verified A's own spec: `AuthStatusIcon`
is always orange-tinted (no neutral variant shown), while A's separate `AuthNotice` (for the two
accept-invite dead ends) carries **no icon at all**. That means A's dead-end states render with
zero iconography while every other terminal state gets one — an inconsistency, not a deliberate
choice. B's single component, icon on every terminal state, tone-driven color, is both simpler
(one component instead of two) and gets the semantics right: orange is the system's action/success
accent (DESIGN.md), so it must never decorate a dead end.

```tsx
// components/auth/AuthNotice.tsx
export function AuthNotice({
  icon: Icon, tone = 'neutral', title, body, children,
}: { icon: LucideIcon; tone?: 'accent' | 'neutral'; title: string; body?: ReactNode; children?: ReactNode }) {
  return (
    <div role="status" tabIndex={-1} className="auth-enter flex flex-col items-center gap-6 text-center outline-none">
      <div aria-hidden className={`grid h-14 w-14 place-items-center rounded-[1rem] bg-white/[0.04]
        shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]
        ${tone === 'accent' ? 'text-orange-400' : 'text-zinc-300'}`}>
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <AuthHeading title={title} subtitle={body} />
      {children}
    </div>
  )
}
```

`tone="accent"` (orange glyph): `Check` on onboarding `done`, `UserPlus` on a live/valid invite,
`UserPlus` on the signed-out invite branch (all forward-motion states). `tone="neutral"` (zinc
glyph): `Mail` on `check-email`, `MailCheck` on forgot-password `sent`, `Ban` on the invalid/expired
invite, `Unlink` on the malformed-link branch (all waiting/dead-end states). `role="status"` +
`tabIndex={-1}`, focused on mount via a one-line `useEffect` in the page — every terminal state is
announced and keyboard focus lands on the new content instead of an orphaned, now-removed button.
Icon box radius `rounded-[1rem]` — established "inner element" bracket (NEBULA_REFERENCE_NOTES
§4), not A's invented `1.25rem`.

### 5.10 `AuthConnectCard`

Copy and honesty mechanics decided in §3.4. Structure (B's shape, A's simpler non-nested
placement — §3.4):

```tsx
// components/auth/AuthConnectCard.tsx
export function AuthConnectCard({ icon, name, description, note }: {
  icon: ReactNode; name: string; description: string; note: string
}) {
  return (
    <div className="nebula-border relative overflow-hidden rounded-[1rem] bg-white/[0.035] p-5
                    backdrop-blur-xl sm:p-6"
      style={{ '--nebula-border-gradient':
        'linear-gradient(155deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02) 55%, rgba(234,88,12,0.10))' } as CSSProperties}>
      <div className="flex items-start gap-4">
        <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px]
                                     bg-white/[0.06] text-zinc-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          {icon}
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="font-nebula-ui text-[14px] font-medium tracking-[-0.01em] text-zinc-100">{name}</p>
          <p className="mt-1 font-nebula-ui text-[12.5px] leading-relaxed text-zinc-500">{description}</p>
        </div>
        <span className="ml-auto shrink-0 rounded-[9999px] bg-white/[0.05] px-2.5 py-1
                         font-nebula-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-zinc-400">
          Not connected
        </span>
      </div>
      <span aria-disabled="true"
        className="mt-5 flex h-11 w-full cursor-not-allowed items-center justify-center
                   rounded-[9999px] bg-white/[0.035] font-nebula-tech text-[12.5px] font-medium
                   uppercase tracking-[0.12em] text-zinc-600 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
        Connect {name}
      </span>
      <p className="mt-3 text-left font-nebula-ui text-[12px] leading-relaxed text-zinc-500">{note}</p>
    </div>
  )
}
```

`text-zinc-600` on the inert label is deliberate and not a contrast regression — the control is
disabled, and disabled controls are exempt from WCAG 1.4.3; the state is independently carried by
the pill, the sentence, and `aria-disabled`. Header row wraps via `flex-wrap` at `<sm` so "Not
connected" drops to its own line rather than compressing the name.

### 5.11–5.12 Motion, states, a11y — see §6–§7 below.

### 5.13 `AuthAlert` (renamed from A's `AuthFormError`; B's shorter name, same job, message-only)

```tsx
// components/auth/AuthAlert.tsx — 'use client'
export const AuthAlert = forwardRef<HTMLDivElement, { message: string | null }>(
  function AuthAlert({ message }, ref) {
    const localRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => localRef.current!)
    useEffect(() => { if (message) localRef.current?.focus() }, [message])
    return (
      <div ref={localRef} tabIndex={-1} role="alert" className="outline-none"
        aria-hidden={!message}>
        {message && (
          <div className="flex items-start gap-2.5 rounded-[12px] bg-rose-500/[0.09] px-3.5 py-3
                          text-left shadow-[inset_0_0_0_1px_rgba(244,63,94,0.30)]">
            <AlertCircle aria-hidden size={15} className="mt-px shrink-0 text-rose-400" strokeWidth={2} />
            <p className="font-nebula-ui text-[12.5px] leading-relaxed text-rose-200">{message}</p>
          </div>
        )}
      </div>
    )
  }
)
```

Always mounted (collapses to an empty, `aria-hidden` node when `message` is null) so `role="alert"`
is already being observed by assistive tech when the text arrives — a container that mounts *with*
its text is announced inconsistently across SR/browser pairs (A's reasoning, adopted). `role="alert"`
alone, **no** additional `aria-live="assertive"` — `role="alert"` already implies it, and doubling
can cause double announcements in NVDA (B's correction, adopted; A's spec did add the redundant
`aria-live`, struck here). No `action` prop (§3.7 — reset-password's recovery link is a separate,
permanent element, not something the alert carries). `text-rose-200` on the tinted plate measures
~11:1; `rose-400` icon stroke is the same hue Group 1 reserved as `--console-neg` — reuse, not a
new colour.

### 5.14 Focus management on submit failure

Both proposals implement the same fix; adopt either's code shape (Design B's `useEffect`-in-the-
component form, folded into `AuthAlert` above, is slightly more self-contained than A's
`requestAnimationFrame` callback wired from each page — one fewer thing for five call sites to get
right identically). The interaction contract, stated once: every current handler disables its
submit button while `isSubmitting` (confirmed, unchanged — §3.13), which means a failed submission
leaves focus on `<body>` for a keyboard user. `AuthAlert` focusing itself on `message` transition
(`tabIndex={-1}`, `outline-none` — programmatic focus on a non-interactive container paints no
visible ring in any supported engine, and the element isn't Tab-reachable afterwards) is purely
additive presentation: nothing about *when* an error is set changes, only that focus now lands
somewhere sensible when it is. The next Tab from there reaches the now-re-enabled submit button.

---

## 6. Motion plan (merged, binding)

| # | What | Mechanic | Trigger | Reduced motion |
|---|---|---|---|---|
| 1 | Page entrance | `.auth-enter` — **new, subtler keyframe** (A's values, not B's reuse of the hero's `nebulaFadeSlideIn`): `translateY(10px)` + `blur(3px)` → `0`, **420ms**, staggered `60/130/200ms` on heading → card → footnote | mount, CSS `backwards`, no JS | `animation: none`, lands on end state |
| 2 | `AuthCurtain` | `.nebula-col` clip-path, `.nebula-delay-1/-2/-3` (already-shipped classes) | mount, `md:` only | already killed, `globals.css:599` |
| 3 | Submit theatre | `.nebula-cta` — 2.5s border spin + 4s shimmer, only when the variant is `.nebula-cta` (§3.1's markup-swap keeps it off the incomplete-state pill entirely) | field-complete state onward, including submitting | already killed, `globals.css:755` |
| 4 | Submit hover | `box-shadow` glow, 500ms | hover | duration-clamped by the existing global reduced-motion rule |
| 5 | Field focus | `background-color` + `box-shadow` + label colour, 150ms | focus/hover | colour-only, fine as-is |
| 6 | `AuthNotice` icon | new `.auth-pop` — `scale(0.88)→1`, 460ms, 80ms delay | mount of any `AuthNotice` | `animation: none` |
| 7 | `AuthSteps` fill | `background-color` 300ms | step advance | fine as-is (colour-only) |
| 8 | Wizard step change | `.auth-enter` replays via `key={step}` on the step container — **crossfade only, no slide** | `setStep` | none needed beyond #1's kill |
| 9 | Submitting spinner | `Loader2` `animate-spin`, 15px | `isSubmitting` | global `*` rule (`globals.css:153`) clamps to one turn; the button's own label text ("Signing in…") carries the state regardless |
| 10 | Password toggle | none — instant icon swap | click | n/a |

**Rejected: A's `.nebula-cta` "swap away from the class entirely while disabled" as a *separate*
motion concept** — folded into §3.1's state logic, it is not a distinct animation, it's markup
selection.
**Rejected: B's reuse of `nebulaFadeSlideIn`** (30px translate, 8px blur, 700ms) for the entrance —
that keyframe is tuned for a 96px hero headline; on a repeated, low-latency task screen the user
needs to clear quickly, it is heavier than the "airlock"/"threshold" thesis both proposals state
for themselves. A's original, purpose-built `authEnter` (10px/3px blur/420ms) is adopted instead.

```css
/* Additive, appended to app/globals.css after the existing NEBULA CONSOLE block. */

.nebula-auth input:-webkit-autofill,
.nebula-auth input:-webkit-autofill:hover,
.nebula-auth input:-webkit-autofill:focus,
.nebula-auth input:-webkit-autofill:active {
  -webkit-text-fill-color: #fafafa;
  -webkit-box-shadow: 0 0 0 1000px #0e0e10 inset, inset 0 0 0 1px rgba(255,255,255,0.09);
  caret-color: #fafafa;
  transition: background-color 9999s ease-in-out 0s;
}

@keyframes authEnter {
  0%   { opacity: 0; transform: translateY(10px); filter: blur(3px); }
  100% { opacity: 1; transform: translateY(0);    filter: blur(0);   }
}
.auth-enter { animation: authEnter 420ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }

@keyframes authPop { 0% { opacity: 0; transform: scale(0.88); } 100% { opacity: 1; transform: scale(1); } }
.auth-pop { animation: authPop 460ms cubic-bezier(0.16, 1, 0.3, 1) 80ms backwards; }

.nebula-cta--wide::after {
  aspect-ratio: auto;
  width: 140%;
  height: 100%;
  opacity: 0.28;
  -webkit-mask-image: radial-gradient(ellipse at bottom, transparent 45%, #000);
  mask-image: radial-gradient(ellipse at bottom, transparent 45%, #000);
}

@media (prefers-reduced-motion: reduce) {
  .auth-enter, .auth-pop { animation: none !important; opacity: 1; transform: none; filter: none; }
}
```

`.nebula-cta` and `.nebula-col` are already in the existing reduced-motion blocks (`globals.css:599`,
`:755`) — no edits to either, and no `.nebula-cta:disabled` rule is added (§3.1).

---

## 7. States — every screen, no gaps

Legend: **idle** → **focus** → **submitting** → **field error** → **form error** → **success** →
**token-invalid** (where applicable).

| Screen | Idle | Submitting | Form error | Success | Token-invalid |
|---|---|---|---|---|---|
| `/login` | 2 fields, plain-pill submit (§3.1) | `.nebula-cta` retained, `disabled`, `aria-busy`, "Signing in…" | `AuthAlert`, focus moves to it | `router.push(next \|\| '/dashboard')`, no in-page success UI | n/a |
| `/onboarding · welcome` | 3 fields, plain-pill submit | "Creating account…" | `AuthAlert` | → `youtube` (has session) or `check-email` (no session) — unchanged fork | n/a |
| `/onboarding · check-email` | `AuthNotice` tone=neutral, `Mail`, focused on mount | — | — | is the success state | n/a |
| `/onboarding · youtube` / `gmail` | `AuthConnectCard` (not-connected) + `AuthGhostButton` "Continue" | — | — | advances step | n/a |
| `/onboarding · done` | `AuthNotice` tone=accent, `Check` + `AuthGhostButton` to `nextHref` | — | — | is the success state | n/a |
| `/forgot-password` | 1 field, plain-pill submit | "Sending…" | `AuthAlert` | `AuthNotice` tone=neutral, `MailCheck`, enumeration-safe copy preserved verbatim, focused | n/a |
| `/reset-password` | 2 fields + persistent hint on field 1, plain-pill submit, **permanent recovery line below card** | "Saving…" | `AuthAlert` (same two client messages, unchanged text/order) + `aria-invalid` on the relevant field | `router.push('/dashboard')` | surfaces *as* the form error; the always-visible recovery line (§3.7) is the mitigation, not a special branch |
| `/accept-invite · no param` | `AuthNotice` neutral, `Unlink` + `AuthGhostButton` "Back to CreatorFlow" | — | — | — | is the malformed-link state |
| `/accept-invite · signed out` | `AuthNotice` accent, `UserPlus` + `AuthLinkButton` "Create account" (the tier's second `.nebula-cta`) + `AuthLink` "Already have an account? Sign in" | — | — | — | — |
| `/accept-invite · not pending` | `AuthNotice` neutral, `Ban` + `AuthGhostButton` "Go to Dashboard" | — | — | — | is the expired/revoked/wrong-account state; three-cause copy preserved verbatim |
| `/accept-invite · pending` | `AuthNotice` accent, `UserPlus` + `AcceptInviteButton` (re-skinned to `AuthSubmit`-shaped, `type="button"`) | "Joining…" | `AuthAlert` above the button | `router.push('/team')` + `router.refresh()` | — |

No loading skeletons anywhere on the tier — these are forms, not data regions. Both `Suspense`
boundaries (`login`, `onboarding`, wrapping `useSearchParams`) keep `fallback={null}` — the
boundary resolves client-side in the same tick, and a flash of skeleton would read worse than
nothing. `accept-invite`'s server data fetch blocks the route render, which is correct for a page
whose entire content depends on the answer.

---

## 8. Accessibility checklist — acceptance criteria

1. No skip link (§3.10) — ruled unnecessary for a 2–4-tabbable-element page; do not add one.
2. Exactly one `<h1>` per rendered state (onboarding's changes with the step — fine, one at a time).
3. Every interactive element carries `FOCUS` from `console/tokens.ts`, imported not retyped
   (§3.12, confirmed clean on both source proposals).
4. The password-toggle is the only icon-only control on the tier: `aria-label` (state-aware) +
   `aria-pressed`.
5. Decorative layers `aria-hidden`: `AuthBackdrop` root (grain/aurora/curtain/ghost word),
   `ConsoleMark`, `AuthSteps` segments, `AuthNotice`/`AuthConnectCard` icon wrappers.
6. Touch targets: fields 48px · submit/ghost/link-button 48px · password toggle 40×40 · every
   `AuthLink` 40px effective via `after:-inset-y-3` · top-bar lockup padded to 40px via `py-2 -my-2`
   inside the 56/64px bar.
7. All motion collapses under `prefers-reduced-motion` (§6, table + CSS block).
8. No horizontal overflow at 320px — `overflow-x-hidden` on the shell root is the backstop;
   long strings (top-bar link, echoed email, Supabase error text, the longest h1) all wrap via
   `hidden sm:inline` splits, `[overflow-wrap:anywhere]`, and `max-w-[Nch]` respectively, matching
   both proposals' independently-converged 320px audits.
9. Contrast (`#000` ground, `≈#0d0806`–`#0b0b0c` under the card/aurora — computed at the worst
   position on the page, matching B's methodology): `zinc-100` body ~17–18:1 · `zinc-400`
   deck/labels/links ~8.4–9.2:1 · `zinc-500` hints/footnote ~4.9:1 (floor) · `orange-400`
   eyebrow/focus ring ~9–9.5:1 · `rose-200` on the tinted alert plate ~11:1 · `zinc-600` used only
   for placeholders and the inert connect-button label, both exempt (never the sole carrier of
   information; disabled controls are exempt from 1.4.3 respectively).
10. Colour is never the only signal: "Not connected" is a pill *and* an inert control *and* a
    sentence; errors are rose *and* prose inside a `role="alert"`; focus is a ring *and* (on
    fields) a hairline/background shift *and* (on fields) a label recolour.

---

## 9. Files touched

**New (16 components + index):** `components/auth/AuthShell.tsx`, `AuthTopBar.tsx`,
`AuthLink.tsx`, `AuthBackdrop.tsx`, `AuthCurtain.tsx`, `AuthCard.tsx`, `AuthHeading.tsx`,
`AuthField.tsx`, `AuthPasswordField.tsx`, `AuthSubmit.tsx`, `AuthLinkButton.tsx`,
`AuthGhostButton.tsx`, `AuthAlert.tsx`, `AuthNotice.tsx`, `AuthSteps.tsx`, `AuthConnectCard.tsx`,
`index.ts`.

**New (route-level viewport shims, §3.6):** `app/login/layout.tsx`, `app/forgot-password/layout.tsx`,
`app/reset-password/layout.tsx`, `app/onboarding/layout.tsx`.

**Edited (markup/classes/copy only — behaviour byte-identical per §10 below):** the five pages +
`app/accept-invite/AcceptInviteButton.tsx`.

**Edited (additive CSS only, §6):** `app/globals.css` — the autofill fix, `authEnter`/`authPop`
keyframes and classes, `.nebula-cta--wide::after`, and two selectors appended to the existing
reduced-motion block. No existing rule is modified; Home and the console are untouched.

**Not touched:** `lib/supabase/auth.ts`, `lib/supabase/actions.ts`, `lib/supabase/queries.ts`,
`app/auth/callback/*`, `components/ui/*` (deleted later by Group 6, not now), `components/home/*`,
`components/console/*` (except reading `ConsoleMark` and `tokens.ts` — no edits to either file).

---

## 10. Behaviour that must survive verbatim

Identical contract in both source proposals; restated here as the single binding list.

1. `login`: `signInWithEmail(email.trim(), password)`; success →
   `router.push(searchParams.get('next') || '/dashboard')` then `router.refresh()`; guard
   `if (!email.trim() || !password) return`; `finally { setIsSubmitting(false) }`.
2. `login`/`onboarding`: `Suspense` boundary around the `useSearchParams` consumer stays,
   `fallback={null}`, not hoisted.
3. `login`/`onboarding`: `next` round-trips through `encodeURIComponent` into the cross-link, only
   when present.
4. `onboarding`: `signUpWithEmail(email.trim(), password, { full_name: fullName.trim() })`;
   `setStep(data.session ? 'youtube' : 'check-email')` — preserve this fork exactly.
5. `onboarding`: step lives in `useState`, never the URL; `STEPS` ordering; the
   `step === 'youtube' || step === 'gmail'` condition gating `AuthSteps`; `nextHref` derivation and
   its conditional button label.
6. `onboarding`: no `beforeunload` handler — do not add one.
7. `forgot-password`: `requestPasswordReset(email.trim())`; `sent` is one-way; enumeration-safe
   copy preserved word for word.
8. `reset-password`: `password.length < 8` → "Password must be at least 8 characters.";
   `password !== confirm` → "Passwords don't match." (curly apostrophe as written); both checks run
   before `setIsSubmitting(true)` and `return` early; success → `router.push('/dashboard')` +
   `router.refresh()`.
9. `accept-invite`: `await searchParams`; `getAuthenticatedUser()`; `getInviteById(inviteId)`;
   branch order **no-param → no-user → invalid → valid**; `invite.status !== 'pending'`; the
   `invite.role === 'owner'` copy fork (member-role body unchanged, owner-role body gets the §4
   copy fix only); `nextParam` construction; `export const metadata`.
10. `AcceptInviteButton`: `acceptTeamInvite(inviteId)`, `result.error` into local state,
    `router.push('/team')` + `router.refresh()`, `isPending` gating.
11. Every `disabled={…}` expression on every submit button — unchanged (§3.1, §3.13).
12. Every `autoComplete` value — unchanged, with exactly one addition: `autoComplete="name"` on
    onboarding's full-name field (currently absent).
13. `onboarding` email/password fields keep **no `required`** attribute (unchanged validation
    semantics — the disabled-submit predicate is the only guard, as today).
14. No `noValidate` added to any `<form>` (§3.3 — reversing A's proposed addition).

---

## 11. Explicitly rejected, with reasons (summary — full reasoning inline above)

**From Design A:**
- `AuthMark` as a new component — duplicates `ConsoleMark`; import it instead (§3.9).
- `AuthStatusIcon` as a component separate from `AuthNotice` — inconsistent (icon on some
  terminal states, none on others); merged into one tone-aware `AuthNotice` (§5.9).
- `noValidate` on the four forms — A's own flagged, droppable item; dropped (§3.3).
- The `AuthCurtain` `lg:` breakpoint — departs from the shipped `HeroCurtain` convention (§3.8).
- `1.75rem` card radius and `1.25rem` notice/connect-card radius — invented brackets; the
  reference's own "secondary card" (`2rem`) and "inner element" (`1rem`) vocabulary is reused
  instead (§5.5, §5.9).
- `AuthLinkButton` used uniformly for all three navigational primaries — over-weights low-stakes
  exits with the signature CTA; replaced by the two-tier `AuthLinkButton`/`AuthGhostButton` split
  (§5.8).
- ConnectCard copy's "You can connect it later in Settings" clause — false; Settings' control is
  the identical disabled stub (§3.4).
- `sm:text-[14px]` step-down on field text was never actually A's issue (A kept 16px fixed,
  correctly) — noted only to confirm A's fixed-16px rule is the one adopted (§3.2).

**From Design B:**
- `SkipLink` reuse — the actual component hardcodes `href="#console-main"`; B's own diagram
  contradicts its "reused unmodified" claim, and no skip link is needed on this tier regardless
  (§3.10).
- `fixed inset-0` for the backdrop — departs from every atmosphere layer on the shipped Home page,
  which uses `absolute inset-0` (§3.8).
- Reuse of `nebulaFadeSlideIn` (30px/8px blur/700ms) for entrance — too heavy for a repeated task
  screen; A's purpose-built lighter keyframe adopted instead (§6).
- `.nebula-cta:disabled` / `.nebula-cta[aria-busy='true']` CSS rules — unnecessary once the
  markup-swap mechanism (§3.1) is adopted; shipping unused CSS is a defect in itself.
- The `AuthCard` `variant="bare"` / `AuthConnectCard elevated` two-prop dance for onboarding's
  connect steps — solves a problem that doesn't exist once `AuthConnectCard` is simply never
  wrapped in an `AuthCard` on those steps (A's simpler structure, §3.4).
- Direct import of `components/home/ShinyCTA.tsx` for accept-invite's "Create account" — an
  unnecessary cross-tier import; `AuthLinkButton` owns the same recipe locally (§5.8).
- The inline-retyped link-recipe inside `AuthAlert`'s `action` prop, and the `action` prop itself —
  struck; `AuthAlert` is message-only, the reset-password recovery mechanism is a separate,
  permanent element (§3.7, §5.13).
- Framing `AuthSteps` as "fixing a latent bug" in `StepIndicator` — the original component is not
  buggy; the redesign is adopted on the correct grounds (three dots for a two-step flow) instead
  (§3.11).
- `2px` vs `9999px` `AuthSteps` segment radius — B's pill radius read as button-like for a thin
  progress bar; A's `2px` meter-segment value adopted (§3.11).

**Struck from both:** nothing else — every remaining mechanic in both proposals either matched or
was folded into the merge above without contradiction.

---

## 12. Out of scope — flag only, do not fix here

**`app/(app)/team/TeamBoard.tsx`** contains four billing claims that are Group 4's scope, not
Group 5's, and are **not** touched by this document or its implementation:

- Line 26: `` `Grant ${inviteEmail.trim()} full Owner access, including billing and team
  management? ...` `` (confirm-dialog copy)
- Line 52: `` `Make ${name} the account owner? You'll become a Member and lose access to billing
  and team management...` `` (confirm-dialog copy)
- Line 184: `"Full access, including billing and team management."` (Owner role description)
- Line 188: `"Can manage deals, ideas, and automations, but not settings or billing."` (Member role
  description)

Same underlying defect as the accept-invite fix in §4 — CreatorFlow has no billing feature or UI
anywhere in the codebase (confirmed, PRODUCT.md line 52 and a repo-wide grep for
Stripe/subscription code, both empty). Group 4 should apply the same fix pattern used here: drop
"billing" and describe the real owner-exclusive scope (team management + account settings). Do not
let this get lost by the time Group 4 starts — it is the larger instance of the same problem this
document fixes at the accept-invite door.
