-- Real Google OAuth is being wired up (Gmail + YouTube). Tokens are stored via
-- Supabase Vault (pgsodium-backed, already enabled on this project) rather
-- than a hand-rolled pgcrypto scheme — the integrations row keeps only a
-- reference to the vault secret, never the token itself. The old
-- *_encrypted text columns were never populated (no real OAuth existed
-- until now) and are dropped rather than carried forward unused.
--
-- is_demo distinguishes a real OAuth-connected row from the seeded
-- demo-account row scripts/seed-demo-data.ts creates to make the demo
-- account look connected — the UI's "(demo)" labeling reads this instead of
-- assuming every connected row is fake.

alter table public.integrations
  drop column if exists access_token_encrypted,
  drop column if exists refresh_token_encrypted,
  add column if not exists access_token_secret_id uuid,
  add column if not exists refresh_token_secret_id uuid,
  add column if not exists is_demo boolean not null default false;

-- Needed for upserting one row per (account, provider) from the OAuth
-- callback and the seed script alike.
alter table public.integrations
  add constraint integrations_user_id_provider_key unique (user_id, provider);
