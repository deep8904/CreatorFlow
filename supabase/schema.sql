create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  username text unique,
  avatar_url text,
  onboarding_completed boolean not null default false,
  timezone text,
  locale text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  notes text,
  tags text[] not null default '{}',
  status text not null default 'new' check (status in ('new','in_progress','scheduled','done','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idea_id uuid references public.ideas(id) on delete set null,
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_name text,
  contact_name text,
  contact_email text,
  status text not null default 'inbound' check (status in ('inbound','negotiating','contracted','delivered','paid')),
  rate_amount_cents integer,
  deliverables text,
  notes text,
  email_thread_id text,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  access_token_encrypted text,
  refresh_token_encrypted text,
  expires_at timestamptz,
  scope text[],
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  trigger_type text not null,
  action_type text not null,
  config jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.drafts enable row level security;
alter table public.deals enable row level security;
alter table public.integrations enable row level security;
alter table public.automations enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can manage own ideas" on public.ideas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own drafts" on public.drafts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own deals" on public.deals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own automations" on public.automations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Deliberately zero permissive policies on integrations: RLS is enabled with no
-- policy granting select/insert/update/delete to authenticated clients at all, so
-- no direct client query can ever return this table's rows (including the token
-- columns), by construction. All access goes through the service role — reads via
-- the get-integrations edge function, writes via a server-side OAuth callback.
-- (A `for all using (auth.uid() = user_id)` policy plus a `for select using (false)`
-- policy do NOT combine to block reads: Postgres ORs multiple permissive policies
-- together, so the owner-access policy alone would still allow direct client selects.)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username, onboarding_completed)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'username', false)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_profiles_updated_at before update on public.profiles
for each row execute function public.update_updated_at();

create trigger update_ideas_updated_at before update on public.ideas
for each row execute function public.update_updated_at();

create trigger update_drafts_updated_at before update on public.drafts
for each row execute function public.update_updated_at();

create trigger update_deals_updated_at before update on public.deals
for each row execute function public.update_updated_at();

create trigger update_integrations_updated_at before update on public.integrations
for each row execute function public.update_updated_at();

create trigger update_automations_updated_at before update on public.automations
for each row execute function public.update_updated_at();

-- Team & Permissions: an "account" is identified by its owner's user id (no separate
-- accounts table exists yet). Free plan scope: exactly one owner, at most one additional
-- member, at most one pending invite at a time — enforced with partial unique indexes
-- below, not just at the application layer.

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','member')),
  joined_at timestamptz not null default now(),
  unique (account_id, user_id)
);

create unique index if not exists team_members_one_owner_per_account
  on public.team_members (account_id)
  where role = 'owner';

create unique index if not exists team_members_one_member_per_account
  on public.team_members (account_id)
  where role = 'member';

create table if not exists public.team_invites (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users(id) on delete cascade,
  invited_email text not null,
  role text not null check (role in ('owner','member')),
  status text not null default 'pending' check (status in ('pending','accepted','revoked')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id)
);

create unique index if not exists team_invites_one_pending_per_account
  on public.team_invites (account_id)
  where status = 'pending';

alter table public.team_members enable row level security;
alter table public.team_invites enable row level security;

-- Membership/ownership checks live in SECURITY DEFINER functions rather than
-- inline subqueries on team_members, because a policy ON team_members cannot
-- itself query team_members without Postgres re-triggering the same policy --
-- infinite recursion. A SECURITY DEFINER function evaluates as its owner and
-- so isn't subject to the calling policy's RLS.
create or replace function public.is_account_member(target_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.team_members tm
    where tm.account_id = target_account_id and tm.user_id = auth.uid()
  );
$$;

create or replace function public.is_account_owner(target_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.team_members tm
    where tm.account_id = target_account_id and tm.user_id = auth.uid() and tm.role = 'owner'
  );
$$;

create policy "Account members can view team members" on public.team_members
  for select using (public.is_account_member(account_id));

create policy "Owner adds team members" on public.team_members
  for insert with check (public.is_account_owner(account_id));

create policy "Owner updates team members" on public.team_members
  for update using (public.is_account_owner(account_id));

create policy "Owner removes non-owner team members" on public.team_members
  for delete using (role <> 'owner' and public.is_account_owner(account_id));

create policy "Account members can view invites" on public.team_invites
  for select using (public.is_account_member(account_id));

create policy "Owner creates invites" on public.team_invites
  for insert with check (public.is_account_owner(account_id));

create policy "Owner updates invites" on public.team_invites
  for update using (public.is_account_owner(account_id));

create or replace function public.handle_new_team_owner()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.team_members (account_id, user_id, role)
  values (new.id, new.id, 'owner')
  on conflict (account_id, user_id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created_team_owner
after insert on auth.users
for each row execute function public.handle_new_team_owner();

-- Cached/seeded YouTube channel performance, standing in for a live API pull when
-- no real YouTube account is connected (see integrations table). Daily granularity
-- so the Analytics screen can compute "this month vs last month" comparisons.
create table if not exists public.channel_stats_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stat_date date not null,
  views integer not null default 0,
  watch_time_minutes integer not null default 0,
  subscribers_total integer not null default 0,
  subscribers_gained integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, stat_date)
);

-- A lightweight catalog of the creator's published videos — backs both the
-- Analytics "Top videos" section and the Repurpose page's video picker.
create table if not exists public.channel_videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  youtube_video_id text,
  title text not null,
  published_at timestamptz not null default now(),
  views integer not null default 0,
  watch_time_minutes integer not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  duration_seconds integer,
  created_at timestamptz not null default now()
);

-- Saved AI repurposing runs against a published video.
create table if not exists public.repurposed_content (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid references public.channel_videos(id) on delete set null,
  source_url text,
  summary text,
  clip_worthy_moments jsonb not null default '[]',
  social_post_ideas jsonb not null default '[]',
  blog_outline text,
  created_at timestamptz not null default now()
);

alter table public.channel_stats_daily enable row level security;
alter table public.channel_videos enable row level security;
alter table public.repurposed_content enable row level security;

create policy "Users can manage own channel stats" on public.channel_stats_daily
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own channel videos" on public.channel_videos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own repurposed content" on public.repurposed_content
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
