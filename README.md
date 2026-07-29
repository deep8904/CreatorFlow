# CreatorFlow

**The business side of your channel — brand deals, ideas, drafts, video repurposing, analytics, and team collaboration, in one place. Free and open source, forever. No cut of your deals, ever.**

CreatorFlow is a self-hosted CreatorOS for people who make content for a living (or want to). It's built for creators who are serious about their channel but aren't yet earning six figures — the people juggling sponsorship emails in their inbox, half-written scripts in a Notes app, and a spreadsheet of video ideas, without the budget or need for an enterprise creator-management platform.

## Why this exists

Most tools in this space either take a cut of your sponsorship revenue or charge a subscription that doesn't make sense until you're already making real money from deals. CreatorFlow does neither. It's a straightforward, honest tool you run yourself: track brand deals from first email to paid invoice, capture ideas before they slip away, turn them into drafts, plan how to repurpose a video into shorts and posts, and see your YouTube performance next to your deal pipeline — not spread across three different tabs and two different tools.

## Who it's for

- **Solo creators** who want one place for deals, ideas, drafts, and channel performance instead of a pile of disconnected tools.
- **Small creator teams** — a creator plus an editor, a manager who handles brand deals, a designer, or a moderator — who need to share a workspace without everyone having access to everything. CreatorFlow's role system is built for exactly this: it enforces who can see and touch what, at both the UI and the database level.

## Key features

- **Dashboard** — a real-time view of open deals, pipeline value, collected revenue, ideas captured, and what needs a next step today.
- **Deals** — a full kanban pipeline (inbound → negotiating → contracted → delivered → paid/lost) with per-deal invoice tracking (invoice sent/paid dates), deal prioritization, stage-change history, search, and bulk select/move/delete.
- **Ideas** — quick capture (typed or voice), tagging, status tracking (new/in progress/scheduled/done), and a one-click path into a Draft.
- **Drafts** — a distraction-free writing surface linked back to the idea it came from, with voice capture and an idea-aware AI-assist template.
- **Repurpose** — turn a published video, a draft, or an idea into short-form clip angles, social post ideas, and a summary — built from what you've actually written, not a generic template.
- **Analytics** — real YouTube channel data (channel info and your uploaded videos) once you connect your own YouTube account; honest about the one real gap (a daily views/watch-time trend needs a separate, more sensitive OAuth scope this app doesn't request).
- **Automations** — a real automations list, not just a mockup: every account gets three starter rules (sponsorship email → create a deal, deal marked paid → archive contract, video published → suggest a repurpose). The first one does real work once Gmail is connected — it creates real deals from matching emails when you check for new deals — the other two are honestly labeled preview until this build has an event-trigger engine.
- **Team & permissions** — invite collaborators by email with one of five real, enforced roles (Owner, Manager, Editor, Designer, Moderator). Access is scoped both in the UI (a role only sees the nav items it can use) and in the database via Postgres Row Level Security — not just hidden buttons.
- **Settings** — profile, password, notification preferences, connected accounts, data export, and account deletion.
- **Real Gmail + YouTube integration** — genuine Google OAuth (not a mock): connect once, and CreatorFlow stores your tokens encrypted in Supabase Vault, refreshes them itself before they expire, and uses them to fetch your real YouTube videos and scan Gmail for sponsorship-shaped emails. Requires your own Google Cloud OAuth credentials — see [Google OAuth setup (optional)](#google-oauth-setup-optional) below.

**Intentionally not live yet:** AI contract review, AI reply drafting, and AI video-transcript analysis are all clearly labeled "preview" in the UI. They're built from your real data (not filler text) so you can see the shape of the feature, but they don't call a live AI model — nothing sends your data anywhere it doesn't say it does. Two of the three Automations rules are the same story: real rule definitions with no trigger engine behind them yet.

## Screenshots

<!-- Add the actual PNG/JPG files at these exact paths and these will render automatically. -->

| | |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Deals pipeline](docs/screenshots/deals.png) |
| ![Ideas](docs/screenshots/ideas.png) | ![Team & roles](docs/screenshots/team.png) |

> **Note:** these files don't exist in this checkout yet — `docs/screenshots/` hasn't been created. The table above is left in place, wired to those paths, so dropping the four PNGs in later makes them appear with no further edits. Until then, run the app locally (see below) to see it for real.

<details>
<summary>How to capture these (for maintainers)</summary>

Run the app locally against the seeded demo account (see [Optional: seed demo data](#8-optional-seed-demo-data) below), then screenshot these four states at a standard desktop width (1280px+):

| File | Page | State to capture |
|---|---|---|
| `docs/screenshots/dashboard.png` | `/dashboard` | Signed in as the demo Owner, with data — the metric tiles, funnel, and panels all populated. |
| `docs/screenshots/deals.png` | `/deals` | The kanban pipeline view (not the low-volume list — the seeded demo account has enough deals to show columns). |
| `docs/screenshots/ideas.png` | `/ideas` | The ideas list with a few different statuses/tags visible. |
| `docs/screenshots/team.png` | `/team` | The Members panel with more than one role visible — invite a second account (or temporarily add a row via SQL) so Owner + at least one other role (e.g. Manager) both show. |

Create the `docs/screenshots/` folder, save each PNG at exactly that path — no other edits needed.

</details>

## Tech stack

- **Frontend:** [Next.js](https://nextjs.org) 16 (App Router) + React 19 + Tailwind CSS v4, TypeScript throughout
- **Backend:** [Supabase](https://supabase.com) — Postgres, Auth (email/password + Google OAuth linking), Row Level Security, Vault (encrypted secret storage), and Edge Functions (Deno)
- **Integrations:** Gmail API and YouTube Data API v3, via the user's own Google Cloud OAuth credentials
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

Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from step 2. See `.env.example` for what each variable is for — `DEMO_ACCOUNT_EMAIL`/`DEMO_ACCOUNT_PASSWORD` are only needed if you plan to seed demo data (step 8).

### 4. Set up the database

In the Supabase SQL Editor, run the full contents of [`supabase/schema.sql`](supabase/schema.sql) — it's a single consolidated script that creates every table, policy, function, and the Vault-backed integration-token storage this app needs. (If you'd rather apply history incrementally, the same schema is built up step-by-step in `supabase/migrations/`.)

### 5. Configure auth

In **Authentication → Providers**, make sure **Email** is enabled — this is the only way to *sign in* to CreatorFlow. (Google OAuth is used separately, only to *connect* Gmail/YouTube data access after you're already signed in — see [Google OAuth setup (optional)](#google-oauth-setup-optional) below if you want that working.)

In **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` as a redirect URL.

### 6. Deploy the edge functions

Several small edge functions handle privileged operations that must never run with a client-side key — reading/writing OAuth tokens, calling Google's APIs, and deleting an account. Using the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref your-project-ref
supabase functions deploy get-integrations
supabase functions deploy connect-integration
supabase functions deploy disconnect-integration
supabase functions deploy fetch-youtube-data
supabase functions deploy fetch-gmail-deals
supabase functions deploy delete-account
```

`connect-integration`, `disconnect-integration`, `fetch-youtube-data`, and `fetch-gmail-deals` also need `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` set as edge function secrets (**Project Settings → Edge Functions → Secrets**, or `supabase secrets set`) — but only if you're setting up real Gmail/YouTube connections. Without them, the app runs fine; Connect Gmail/YouTube just won't work until you do the [Google OAuth setup (optional)](#google-oauth-setup-optional) below.

### 7. Run it

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and create an account — the onboarding flow takes about a minute.

### 8. Optional: seed demo data

To populate an account with realistic sample deals, ideas, drafts, and analytics instead of starting from zero:

```bash
# Add DEMO_ACCOUNT_EMAIL and DEMO_ACCOUNT_PASSWORD to .env.local first —
# this creates (or reuses) that account and seeds it.
npm run seed:demo
```

## Role system

CreatorFlow has five roles, invited by email from the **Team** page. Access is scoped to exactly the modules each role needs — enforced by both the UI (a role's nav only shows what it can reach) and Postgres Row Level Security (the database itself refuses reads/writes outside a role's scope, so this isn't just hidden buttons).

| Role | Can access | Notes |
|---|---|---|
| **Owner** | Everything | The account creator, or whoever ownership was explicitly transferred to. Only role that can manage Team, connect/disconnect integrations, and delete the account. Exactly one per workspace. |
| **Manager** | Dashboard, Deals, Analytics, Automations, Team, Settings | The brand-partnership side of the business. |
| **Editor** | Dashboard, Ideas, Drafts, Analytics, Repurpose, Team, Settings | The content-creation side. |
| **Designer** | Dashboard, Repurpose, Analytics, Team, Settings | Visual and creative work. |
| **Moderator** | Dashboard, Team, Settings | No module is assigned to this role yet — CreatorFlow doesn't have community-facing features today, so it exists for future use. |

Dashboard, Team, and Settings are open to every role — Dashboard and Settings just render less for a role with nothing to show, and Team is a read-only roster for everyone except the Owner, who can invite, change roles, and remove members.

## Google OAuth setup (optional)

Gmail sponsorship-email detection and real YouTube analytics both require your own Google Cloud OAuth credentials — this is a per-deployment decision, not something that ships pre-configured, since it's tied to your own Google account and API quota.

1. In [Google Cloud Console](https://console.cloud.google.com), create a project and enable the **Gmail API** and **YouTube Data API v3**.
2. Configure the **OAuth consent screen** with the `gmail.readonly` and `youtube.readonly` scopes. While the app is in Google's "Testing" publishing status, only accounts you explicitly add as test users can connect — moving to "Published" requires Google's own verification review for these scopes, which is optional and entirely up to you.
3. Create an **OAuth 2.0 Client ID** (Web application), and add your Supabase project's OAuth redirect URI (`https://<your-project-ref>.supabase.co/auth/v1/callback`) as an authorized redirect URI.
4. In Supabase, go to **Authentication → Providers → Google** and add the Client ID/Secret.
5. In **Authentication → Settings**, turn on **Allow manual linking** — this is off by default (an account-takeover safeguard) and required for connecting Gmail/YouTube to an already-signed-in account to work at all.
6. Add the same Client ID/Secret as `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` edge function secrets (step 6 above) — the edge functions call Google's token refresh/revoke endpoints directly, separately from Supabase's own Auth server.

Once that's done, "Connect Gmail" / "Connect YouTube" in Settings (or the onboarding flow) will do a real OAuth round trip.

## Testing

```bash
npm run lint        # ESLint
npx tsc --noEmit    # TypeScript
npm run test        # Vitest unit tests
npm run test:e2e    # Playwright end-to-end tests
npm run build        # production build
```

### End-to-end tests in CI

Lint, typecheck, unit tests, and the production build all run in CI (`.github/workflows/ci.yml`) with no setup required. The Playwright e2e suite needs a real, reachable Supabase project (the existing tests exercise real auth error responses, not mocks), so it's a separate `e2e` job that's **skipped automatically** until its secrets exist.

To turn it on:

1. **Create a dedicated Supabase project for testing** — don't point CI at your real/production project. A free-tier project with an empty database is enough.
2. Run [`supabase/schema.sql`](supabase/schema.sql) against that test project's SQL Editor, same as local setup.
3. From that project's **Settings → API**, grab the project URL and anon key.
4. In this GitHub repo, go to **Settings → Secrets and variables → Actions** and add:

   | Secret name | Value |
   |---|---|
   | `SUPABASE_TEST_URL` | The test project's URL |
   | `SUPABASE_TEST_ANON_KEY` | The test project's anon key |
   | `SUPABASE_TEST_SERVICE_ROLE_KEY` | The test project's service role key *(not required by today's tests — only needed if/when an authenticated-flow test is added)* |
   | `DEMO_ACCOUNT_EMAIL` / `DEMO_ACCOUNT_PASSWORD` | Same caveat as above — for a future seeded-account test |

5. That's it — push or open a PR and the `e2e` job will pick up the secrets and start running.

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

Row Level Security is enabled on every table. OAuth access and refresh tokens are stored encrypted via Supabase Vault, in a table with zero client-readable policies — every read, write, refresh, and revoke goes through a service-role-only edge function, never a direct client query. See [`CLAUDE.md`](CLAUDE.md) for the full list of security decisions and why they're non-negotiable.

If you find a security issue, please don't open a public issue — see [`CONTRIBUTING.md`](CONTRIBUTING.md) for how to report it privately.

## Project status: what's real vs. preview

CreatorFlow is honest, by design, about what actually works out of the box versus what needs your own setup or is intentionally unfinished. Every "preview" label in the app means exactly that — nothing sends, calls, or connects anywhere it doesn't say it does.

**Fully real, no extra setup needed:**
- Auth, onboarding, 5-role team invites and permission enforcement
- Deals (kanban, invoicing, priority, bulk actions, stage history)
- Ideas and Drafts (capture, tagging, voice input)
- Repurpose (built from your real content, not filler)
- Dashboard, Settings, data export, account deletion

**Fully real, but needs your own Google OAuth credentials (see above):**
- Connecting Gmail and YouTube
- Real YouTube video data in Analytics
- Gmail sponsorship-email detection creating real deals (triggered manually via "Check for new deals" on the Deals page — not yet a background/automatic process)

**Intentionally demo/preview, not yet built:**
- AI contract review and AI reply drafting (shown as clearly-labeled preview text, built from your real deal data, but not a live AI call)
- AI video-transcript analysis
- Automated trigger execution for "deal marked paid" and "video published" rules (no event-trigger engine yet)
- A daily YouTube views/watch-time trend (needs a separate, more sensitive OAuth scope this app doesn't request)

## Contributing

Contributions are welcome — see [`CONTRIBUTING.md`](CONTRIBUTING.md) for how to get set up, the coding conventions this repo follows, and how to submit a change.

## License

MIT — see [`LICENSE`](LICENSE). Free to use, modify, and self-host, forever.
