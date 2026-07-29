# Setup & Action Items

Everything in this repo's history that needs *your* action — a manual step, an external account, a dashboard toggle, or a decision — rather than a code change. Nothing here blocks the app from running or the repo from being technically publishable; severity is marked per item.

Checkboxes are for your own tracking — nothing here is auto-updated.

## Before publishing (recommended, not code-blocking)

- [ ] **Push the committed work to GitHub.**
  what: `origin/deep` on GitHub is still at the old pre-rebuild commit (`73008ca`). Everything since — the 5-role RBAC system, the full data-integrity audit, README/CONTRIBUTING/LICENSE/CI, and the dependency/CVE fix — is committed locally but not pushed.
  why it needs you: pushing is something I can do, but only with your go-ahead each time (it's a shared/irreversible action) — I won't do it silently.
  how: `git push origin deep`, or just tell me to push.
  **This is the one item that actually determines whether "publish" means anything today** — right now the public URL still serves the old app.

- [ ] **Enable Leaked Password Protection in Supabase.**
  what: Authentication → Policies (or Auth settings) in the Supabase dashboard → turn on the HaveIBeenPwned check for new passwords.
  why it needs you: it's a project-level Auth setting only reachable via the dashboard UI, logged in as the project owner — no SQL/migration/MCP tool can flip it remotely.
  how: one toggle, ~30 seconds. Relevant now that real password-change/reset flows exist.
  required?: recommended before real public signups, not launch-blocking.

- [ ] **Capture the 4 README screenshots.**
  what: `docs/screenshots/{dashboard,deals,ideas,team}.png` — the README already references these paths and has exact capture instructions (which page, which state, what to populate first).
  why it needs you: you asked to do this step yourself in an earlier pass rather than have me generate them — happy to take them via the browser tool instead if you'd rather hand it back to me.
  required?: cosmetic only — the README already has a fallback note pointing to `docs/design.pdf` until these exist.

## Optional / when you're ready

- [ ] **Decide if/when you want real Gmail + YouTube connections.**
  what: today, Connect Gmail / Connect YouTube are honestly disabled ("this build doesn't have production Google OAuth credentials yet") — this is a deliberate, disclosed gap, not a bug.
  why it needs you: only you can create the Google Cloud project and OAuth client (Client ID/Secret), configure the consent screen, and set authorized redirect URIs — that's tied to your own Google account, not something I can provision.
  how, once you're ready: Google Cloud Console → new OAuth 2.0 client → add credentials to Supabase Auth (Authentication → Providers → Google) with `access_type=offline` and `prompt=consent` (per `CLAUDE.md` — required or no refresh token is ever returned).
  what follows from it: this also unlocks a real body of engineering work I'd still need to do afterward — encrypted refresh-token storage, explicit refresh-before-expiry logic (Supabase does not auto-refresh Google provider tokens), the Gmail sponsorship-email classifier, and live Gemini calls for contract review / reply drafting / video analysis. None of that can start until the credentials above exist.
  required?: fully optional — the product is honest and functional without it (manual deal entry, no auto-classification).

- [ ] **Create a dedicated Supabase test project + add E2E secrets to GitHub Actions**, if you want the Playwright suite running in CI.
  what: a *separate* free-tier Supabase project (not your real/demo one), with `supabase/schema.sql` run against it.
  secrets to add (Settings → Secrets and variables → Actions in GitHub): `SUPABASE_TEST_URL`, `SUPABASE_TEST_ANON_KEY`, `SUPABASE_TEST_SERVICE_ROLE_KEY`, `DEMO_ACCOUNT_EMAIL`, `DEMO_ACCOUNT_PASSWORD`.
  why it needs you: only you can create a new Supabase project and add secrets to your own GitHub repo.
  required?: no — the CI `e2e` job already auto-skips until these secrets exist; lint/typecheck/unit tests/build all run today with zero setup.

- [ ] **Re-fill `SUPABASE_SERVICE_ROLE_KEY` in your local `.env.local`**, if you want to run `npm run seed:demo` again on this machine.
  what: the value is currently empty locally (likely cleared during the earlier secrets-audit pass) — the app itself never reads this key directly (only the seed script and the three edge functions do, and the edge functions get it from Supabase's own function secrets, not this file), so nothing else was affected.
  why it needs you: it's your live service-role key from the Supabase dashboard (Project Settings → API) — I don't paste secrets into local files on your behalf.
  required?: no — purely a local dev convenience for re-resetting demo data.

---

*Compiled from the full session history: the RBAC rebuild, the data-integrity audit, and the pre-publish fresh-clone/verification pass. Everything else flagged along the way (typography-scale drift, no notification system, no bulk actions on Ideas/Drafts, unused `avatar_url`/`timezone`/`locale` columns, the dead `gmailClassifier.ts` stub, minor RLS-policy consolidation, etc.) is engineering backlog I can pick up myself in a future session — it's tracked in `docs/qa/KNOWN_ISSUES.md`, not repeated here, since none of it requires anything from you specifically.*
