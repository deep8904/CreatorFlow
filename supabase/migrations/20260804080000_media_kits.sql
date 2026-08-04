-- Stage 2.2: Auto-Generated Media Kit. One row per account — a share link
-- gets regenerated in place (new share_token), not replaced by a second
-- row, so there's exactly one link to reason about at a time.
create table if not exists public.media_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  share_token uuid not null default gen_random_uuid(),
  show_dollar_amounts boolean not null default false,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id),
  unique (share_token)
);

alter table public.media_kits enable row level security;

create trigger update_media_kits_updated_at before update on public.media_kits
for each row execute function public.update_updated_at();

-- Owner/manager manage their account's media kit — same role scope as
-- Deals, since the kit surfaces closed-deal history and (optionally) rate
-- figures. Deliberately no anon policy: the public share page never
-- queries this table with the caller's own session. It reads (and bumps
-- view_count) through a service-role client in
-- app/mediakit/[shareToken]/page.tsx instead — the same "read through
-- server code, not a client query" pattern already used for `integrations`.
create policy "Role-scoped media kit access" on public.media_kits
  for all using (public.has_role_access(user_id, array['owner','manager']))
  with check (public.has_role_access(user_id, array['owner','manager']));
