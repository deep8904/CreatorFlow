# Contributing to CreatorFlow

Thanks for considering a contribution. This is a small, opinionated project — the goal below is to keep it easy to review and easy to trust, not to add process for its own sake.

## Getting set up

Follow the **Getting started** section in [`README.md`](README.md) to get a local instance running against your own Supabase project. You'll need your own project for development — there's no shared dev database.

## Before you open a PR

Run the full check locally — this is exactly what CI runs:

```bash
npm run lint
npx tsc --noEmit
npm run test
npm run build
```

For anything touching a user-facing flow (a new page, a changed form, a permission change), click through it locally at both desktop and mobile widths before opening the PR. Screenshots or a short screen recording in the PR description help a lot for anything visual.

## Coding conventions

- **TypeScript everywhere**, strict mode. No `any` unless there's genuinely no better option.
- **Comments explain *why*, not *what*.** If a comment just restates the code, delete it. A comment earns its place when it documents a non-obvious constraint, a workaround for a specific bug, or a decision that would otherwise look wrong at a glance.
- **No dead code.** If something is unused, delete it rather than commenting it out or prefixing it with `_`.
- **Match the existing patterns** for the area you're touching — server actions in `lib/supabase/actions.ts`, data reads in `lib/supabase/queries.ts`, role/permission logic in `lib/roles.ts`. Consistency beats a locally "better" pattern.
- **Every new table needs Row Level Security**, from the migration that creates it — not added later. If a table holds anything sensitive (tokens, credentials), the policy should be stricter than the default per-user pattern; see the `integrations` table in `supabase/schema.sql` for the pattern (zero permissive client policies, service-role-only access via an edge function).
- **Keep `supabase/schema.sql` in sync.** It's a consolidated, always-current reference — every migration that changes the schema should also be reflected there in the same PR.
- **Copy matters.** This app is deliberately plain and honest about what's real versus preview — see `docs/DESIGN_BRIEF.md` for the tone. If a screen needs copy that isn't already in that doc, match its voice: direct, plain, no corporate hedging, no hype.

## Commit messages and PRs

- Keep the PR title short and specific; use the description for the *why*, not just the *what*.
- Prefer several small, reviewable PRs over one large one, unless a change is genuinely indivisible (like a schema migration and the code that depends on it).
- Link to the relevant issue if one exists.

## Reporting a security issue

Please don't open a public issue for a security vulnerability. Instead, email the maintainer directly (see the profile on the account this repository is hosted under) with a description and, if possible, steps to reproduce. Given the non-negotiable security requirements around OAuth token storage and Row Level Security documented in `CLAUDE.md`, these reports are taken seriously and prioritized.

## Questions

Open a GitHub issue for anything that isn't a security report — bugs, feature ideas, or "is this the right approach" questions before you invest time in a larger change.
