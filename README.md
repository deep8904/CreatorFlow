# CreatorFlow

**The business side of your channel — brand deals, ideas, drafts, video repurposing, and analytics, in one place. Free and open source, forever. No cut of your deals, ever.**

CreatorFlow is built for content creators who are serious about their channel but aren't yet earning six figures — the people juggling sponsorship emails, half-written scripts, and a Notion doc of ideas, without the budget (or need) for an enterprise creator-management platform.

## Why this exists

Most tools in this space either take a cut of your sponsorship revenue or charge a subscription that doesn't make sense until you're already making real money from deals. CreatorFlow doesn't do either. It's a straightforward, honest tool: track your brand deals from first email to paid invoice, capture ideas before they slip away, turn them into drafts, and see your YouTube performance next to your deal pipeline — not in three different tabs.

## Features

- **Dashboard** — a real-time view of open deals, pipeline value, collected revenue, and what needs a next step today.
- **Deals** — a full pipeline (inbound → negotiating → contracted → delivered → paid/lost) with stage history, invoice tracking, deal prioritization, and bulk actions.
- **Ideas** — quick capture (including voice), tagging, and status tracking, with a one-click path into a Draft.
- **Drafts** — a distraction-free writing surface, linked back to the idea it came from, with voice capture and an idea-aware AI-assist template.
- **Repurpose** — turn a published video, a draft, or an idea into short-form clip ideas, social post angles, and a blog outline.
- **Analytics** — YouTube channel performance (views, watch time, subscribers, top videos), linked to the same month's deal pipeline.
- **Team & permissions** — invite collaborators with real, enforced roles (Owner, Manager, Editor, Designer, Moderator), each scoped to the parts of the product that role actually needs — enforced at both the UI and the database level via Postgres Row Level Security, not just hidden nav items.
- **Automations** *(preview)* and **AI contract review / reply drafting** *(preview)* — clearly labeled previews of where this is headed, built from your real data rather than generic placeholders, honest about not being live yet.

Every "preview only" label in the app means exactly that — nothing sends, calls, or connects anywhere it doesn't say it does.

## Screenshots

<!-- Add the actual PNG/JPG files at these exact paths and these will render automatically — see CONTRIBUTING.md or the note below for capture instructions. -->

| | |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Deals pipeline](docs/screenshots/deals.png) |
| ![Ideas](docs/screenshots/ideas.png) | ![Team & roles](docs/screenshots/team.png) |

Until those are added, `docs/design.pdf` has the full visual design reference, or just run it locally (two minutes, see below).

<details>
<summary>How to capture these (for maintainers)</summary>

Run the app locally against the seeded demo account (see <a href="#optional-seed-demo-data">Optional: seed demo data</a> below), then screenshot these four states at a standard desktop width (1280px+):

| File | Page | State to capture |
|---|---|---|
| `docs/screenshots/dashboard.png` | `/dashboard` | Signed in as the demo Owner, with data — the metric tiles, funnel, and panels all populated. |
| `docs/screenshots/deals.png` | `/deals` | The kanban pipeline view (not the low-volume list — the seeded demo account has enough deals to show columns). |
| `docs/screenshots/ideas.png` | `/ideas` | The ideas list with a few different statuses/tags visible. |
| `docs/screenshots/team.png` | `/team` | The Members panel with more than one role visible — invite a second account (or temporarily add a row via SQL) so Owner + at least one other role (e.g. Manager) both show. |

Save each as a PNG at exactly that path (create the `docs/screenshots/` folder if it doesn't exist) — the table above already references these paths, so they'll appear in the README automatically once the files exist. No other edits needed.

</details>

## Tech stack

- **Frontend:** [Next.js](https://nextjs.org) (App Router) + React 19 + Tailwind CSS v4, TypeScript throughout
- **Backend:** [Supabase](https://supabase.com) — Postgres, Auth, Row Level Security, and Edge Functions (Deno)
- **Testing:** [Vitest](https://vitest.dev) (unit) + [Playwright](https://playwright.dev) (end-to-end)

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/deep8904/CreatorFlow.git
cd CreatorFlow
npm install
```

### 2. Create a Supabase project

Create a free project at [supabase.com](https://supabase.com), then from **Project Settings → API**, grab your project URL, anon key, and service role key.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from step 2. See `.env.example` for what each variable is for.

### 4. Set up the database

In the Supabase SQL Editor, run the full contents of [`supabase/schema.sql`](supabase/schema.sql) — it's a single consolidated script that creates every table, policy, and function this app needs. (If you'd rather apply history incrementally, the same schema is built up step-by-step in `supabase/migrations/`.)

### 5. Configure auth

In **Authentication → Providers**, make sure **Email** is enabled (this is the only sign-in method the app currently uses). In **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` as a redirect URL.

### 6. Deploy the edge functions

Three small edge functions handle privileged operations that must never run with a client-side key (reading/disconnecting OAuth integrations, deleting an account). Using the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref your-project-ref
supabase functions deploy get-integrations
supabase functions deploy disconnect-integration
supabase functions deploy delete-account
```

### 7. Run it

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and create an account — the onboarding flow takes about a minute.

### Optional: seed demo data

To populate an account with realistic sample deals, ideas, drafts, and analytics instead of starting from zero:

```bash
# Add DEMO_ACCOUNT_EMAIL and DEMO_ACCOUNT_PASSWORD to .env.local first —
# this creates (or reuses) that account and seeds it.
npm run seed:demo
```

## Testing

```bash
npm run lint        # ESLint
npx tsc --noEmit    # TypeScript
npm run test        # Vitest unit tests
npm run test:e2e    # Playwright end-to-end tests
npm run build        # production build
```

### End-to-end tests in CI

Lint, typecheck, unit tests, and the production build all run in CI (`.github/workflows/ci.yml`) with no setup required. The Playwright e2e suite needs a real, reachable Supabase project (the existing tests exercise real auth error responses, not mocks), so it's a separate `e2e` job that's **skipped automatically** until its secrets exist — nothing else needs to change in the workflow file once you add them.

To turn it on:

1. **Create a dedicated Supabase project for testing** — don't point CI at your real/production project. A free-tier project with an empty database is enough; the current e2e suite doesn't need seeded data (see `docs/qa/KNOWN_ISSUES.md` for the one documented gap — a full authenticated-flow suite would need a seeded test account too, at which point steps 2–4 below already cover it).
2. Run [`supabase/schema.sql`](supabase/schema.sql) against that test project's SQL Editor, same as local setup.
3. From that project's **Settings → API**, grab the project URL and anon key.
4. In this GitHub repo, go to **Settings → Secrets and variables → Actions** and add:

   | Secret name | Value |
   |---|---|
   | `SUPABASE_TEST_URL` | The test project's URL |
   | `SUPABASE_TEST_ANON_KEY` | The test project's anon key |
   | `SUPABASE_TEST_SERVICE_ROLE_KEY` | The test project's service role key *(not required by today's tests — only needed if/when an authenticated-flow test is added; safe to add now or later)* |
   | `DEMO_ACCOUNT_EMAIL` / `DEMO_ACCOUNT_PASSWORD` | Same caveat as above — for a future seeded-account test |

5. That's it — push or open a PR and the `e2e` job will pick up the secrets and start running. The workflow file already reads exactly these secret names; there's nothing to edit in `.github/workflows/ci.yml` unless the test suite itself grows new requirements later.

## Project structure

```
app/            Next.js App Router pages, grouped by feature ((app)/deals, (app)/ideas, ...)
components/     Shared UI components (dash/ for the app shell, home/ for the marketing site)
lib/            Server actions, data queries, the role/permission matrix, and other shared logic
supabase/       Database schema, migrations, and edge functions
docs/           Product requirements, design system, and QA reports
tests/          Playwright end-to-end tests
```

## Security

Row Level Security is enabled on every table. OAuth refresh tokens live in a service-role-only schema and are never readable from the client. See [`CLAUDE.md`](CLAUDE.md) for the full list of security decisions and why they're non-negotiable.

If you find a security issue, please don't open a public issue — see [`CONTRIBUTING.md`](CONTRIBUTING.md) for how to report it privately.

## Contributing

Contributions are welcome — see [`CONTRIBUTING.md`](CONTRIBUTING.md) for how to get set up, the coding conventions this repo follows, and how to submit a change.

## License

MIT — see [`LICENSE`](LICENSE). Free to use, modify, and self-host, forever.
