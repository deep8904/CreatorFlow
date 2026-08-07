create extension if not exists pgcrypto;
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Supabase Vault (pgsodium-backed) ships enabled on every Supabase project by
-- default and isn't user-creatable via `create extension` on hosted
-- Supabase — the `vault.create_secret`/`vault.decrypted_secrets` used below
-- for OAuth token storage need no setup here.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  username text unique,
  avatar_url text,
  onboarding_completed boolean not null default false,
  onboarding_checklist_dismissed boolean not null default false,
  timezone text,
  locale text,
  notify_deal_reminders boolean not null default true,
  view_preferences jsonb not null default '{}'::jsonb,
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
  updated_at timestamptz not null default now(),
  -- Stage 2.3: Content Calendar reads this alongside deals due_date/
  -- usage_rights_expires_at. See 20260804090000_calendar_dates.sql.
  due_date date,
  -- Stage 3.2: approval workflow. See 20260804220000_draft_approvals.sql.
  status text not null default 'draft'
    check (status = any (array['draft','pending_review','approved','changes_requested'])),
  submitted_by uuid references auth.users(id) on delete set null,
  review_notes text
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_name text,
  contact_name text,
  contact_email text,
  status text not null default 'inbound' check (status = any (array['inbound','negotiating','contracted','delivered','paid','lost'])),
  rate_amount_cents integer,
  deliverables text,
  notes text,
  email_thread_id text,
  due_date date,
  invoiced_at timestamptz,
  paid_at date,
  is_priority boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Schema-only today — see 20260729030000_deal_archive_flag.sql. No
  -- application code reads or writes this yet; the "Deal marked Paid ->
  -- Archive contract" automation is still preview-only in AutomationsBoard.tsx.
  archived boolean not null default false,
  -- Stage 2.3: Content Calendar. See 20260804090000_calendar_dates.sql.
  usage_rights_expires_at date
);

-- fetch-gmail-deals is idempotent over a given email thread — this is what
-- lets it re-run without creating duplicate deals for the same thread.
create unique index if not exists deals_user_id_email_thread_id_key
  on public.deals (user_id, email_thread_id)
  where email_thread_id is not null;

-- Stage-transition history for a deal, so the Deals page can show when a
-- deal moved through its pipeline (not just its current status).
create table if not exists public.deal_stage_history (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  from_status text,
  to_status text not null,
  changed_at timestamptz not null default now()
);

create index if not exists deal_stage_history_deal_id_idx on public.deal_stage_history(deal_id);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  -- Tokens live in Supabase Vault (pgsodium-backed); these are references,
  -- never the token value itself. is_demo marks the seeded demo-account
  -- connection so the UI can tell it apart from a real OAuth grant.
  access_token_secret_id uuid,
  refresh_token_secret_id uuid,
  is_demo boolean not null default false,
  expires_at timestamptz,
  scope text[],
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
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
  updated_at timestamptz not null default now(),
  -- Stage 3.3: a real cron expression (UTC), null for event-based rules.
  -- See 20260804230000_butler_automations.sql.
  schedule text,
  -- Butler-style human phrasing shown in the UI instead of cron syntax.
  schedule_label text
);

-- Stage 3.3: one row per scheduled run, written by the
-- run-scheduled-automations edge function (service-role only — no INSERT
-- policy for authenticated users below) so the Automations page can
-- honestly show "last checked" instead of just trusting the toggle is on.
create table if not exists public.automation_activity (
  id uuid primary key default gen_random_uuid(),
  automation_id uuid not null references public.automations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  ran_at timestamptz not null default now(),
  summary text not null,
  details jsonb
);

create index if not exists automation_activity_automation_id_ran_at_idx
  on public.automation_activity (automation_id, ran_at desc);

alter table public.profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.drafts enable row level security;
alter table public.deals enable row level security;
alter table public.deal_stage_history enable row level security;
alter table public.integrations enable row level security;
alter table public.automations enable row level security;
alter table public.automation_activity enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Without this, a member could never see ANY teammate's name (including the
-- owner's) — getTeam() joins team_members to profiles, and the policy above
-- only ever matched the caller's own row, so the Team page fell back to
-- "You" for every row but the caller's own.
create policy "Account members can view teammates' profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.team_members tm_target
      join public.team_members tm_caller on tm_caller.account_id = tm_target.account_id
      where tm_target.user_id = profiles.id and tm_caller.user_id = auth.uid()
    )
  );

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

-- search_path pinned per the security advisor's function_search_path_mutable
-- check — every function in this schema pins it, this one included.
create or replace function public.update_updated_at()
returns trigger
language plpgsql
set search_path = public
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

-- Team & Permissions: an "account" is identified by its owner's original user id.
-- Five real roles (owner, manager, editor, designer, moderator) — no seat cap, no
-- cap on pending invites. (Earlier versions of this schema capped every account at
-- one owner + one collaborator + one pending invite via partial unique indexes;
-- that free-plan cap has been removed.)

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','manager','editor','designer','moderator')),
  joined_at timestamptz not null default now(),
  unique (account_id, user_id)
);

-- Still exactly one owner per account — ownership transfer (see
-- transfer_account_ownership below) is a swap, not a shared role.
create unique index if not exists team_members_one_owner_per_account
  on public.team_members (account_id)
  where role = 'owner';

create table if not exists public.team_invites (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users(id) on delete cascade,
  invited_email text not null,
  role text not null check (role in ('owner','manager','editor','designer','moderator')),
  status text not null default 'pending' check (status in ('pending','accepted','revoked')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id)
);

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

-- Role-aware data access for content tables. `user_id` on every content table is
-- really the *account* id (the account's original owner) — a team member is a
-- different auth user acting on that same account, so plain `auth.uid() = user_id`
-- would block every teammate from ever seeing the account's own data, regardless of
-- role. has_role_access replaces that check with "does the caller belong to this
-- account, in an allowed role."
create or replace function public.has_role_access(target_account_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.team_members tm
    where tm.account_id = target_account_id
      and tm.user_id = auth.uid()
      and tm.role = any(allowed_roles)
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

-- Let an invited (not-yet-a-member) user look up their own pending invite by
-- email, so the accept-invite page can show who/what they're joining before
-- they confirm. Reads the email out of the session JWT rather than querying
-- auth.users directly — the authenticated role has no SELECT grant on
-- auth.users, and Postgres ORs every applicable policy together, so a
-- policy that errors here breaks every query against team_invites, not just
-- the invited-user path.
create policy "Invited user can view their own pending invite" on public.team_invites
  for select using (
    status = 'pending'
    and lower(invited_email) = lower((auth.jwt() ->> 'email'))
  );

create policy "Owner creates invites" on public.team_invites
  for insert with check (public.is_account_owner(account_id));

create policy "Owner updates invites" on public.team_invites
  for update using (public.is_account_owner(account_id));

-- Workspace identity: one row per account, giving the workspace itself a name
-- distinct from any individual member's profile.
create table if not exists public.accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  workspace_name text not null default 'My Workspace',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.accounts enable row level security;

create policy "Account members can view their workspace" on public.accounts
  for select using (public.is_account_member(id));

create policy "Owner updates workspace" on public.accounts
  for update using (public.is_account_owner(id));

create trigger update_accounts_updated_at before update on public.accounts
for each row execute function public.update_updated_at();

-- Every new signup gets: a solo owner account + workspace, and if their email
-- matches an existing pending invite, they're reconnected to that account
-- too (whichever path — invite link or standalone signup — they came in
-- through).
create or replace function public.handle_new_team_owner()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.team_members (account_id, user_id, role)
  values (new.id, new.id, 'owner')
  on conflict (account_id, user_id) do nothing;

  insert into public.accounts (id, workspace_name)
  values (
    new.id,
    case
      when nullif(trim(new.raw_user_meta_data->>'full_name'), '') is not null
        then trim(new.raw_user_meta_data->>'full_name') || '''s Workspace'
      else 'My Workspace'
    end
  )
  on conflict (id) do nothing;

  -- Every account gets the same baseline automations disabled by default —
  -- gmail.sponsorship_email_detected has a real effect once Gmail is
  -- connected (fetch-gmail-deals creates real deals from it), so this is
  -- opt-in via the Automations page, not on by default. The two scheduled
  -- rules (deals.needs_follow_up, schedule.weekly_digest) are genuinely
  -- cron-driven as of Stage 3.3 — see run-scheduled-automations.
  insert into public.automations (user_id, name, trigger_type, action_type, config, enabled, schedule, schedule_label)
  values
    (new.id, 'New sponsorship email → Create a deal', 'gmail.sponsorship_email_detected', 'deals.create',
      jsonb_build_object('description', 'When Gmail detects a new brand deal email, automatically create a deal card for it.'), false, null, null),
    (new.id, 'Deal marked Paid → Archive contract', 'deals.status_changed_to_paid', 'deals.archive_contract',
      jsonb_build_object('description', 'Keep your Deals view focused on what''s active.'), false, null, null),
    (new.id, 'New video published → Suggest a repurpose', 'youtube.video_published', 'repurpose.suggest',
      jsonb_build_object('description', 'As soon as a new video goes live, queue it up in Repurpose so clips and posts are ready same-day.'), false, null, null),
    (new.id, 'Deal gone quiet or invoice overdue → Flag for follow-up', 'deals.needs_follow_up', 'deals.flag_follow_up',
      jsonb_build_object('description', 'Deals stuck 5+ days in Inbound/Negotiating, or with an unpaid invoice past its due date, already show on your Dashboard and in Deals right away, with no toggle needed. Turn this on for a daily scheduled check that logs what it found here too.'), false,
      '0 13 * * *', 'Checked daily, 1pm UTC'),
    (new.id, 'Monday digest: what''s due this week', 'schedule.weekly_digest', 'deals.summarize_week',
      jsonb_build_object('description', 'Every Monday, a summary of deals and drafts due in the next 7 days.'), false,
      '0 14 * * 1', 'Every Monday, 2pm UTC')
  on conflict do nothing;

  insert into public.team_members (account_id, user_id, role)
  select ti.account_id, new.id, ti.role
  from public.team_invites ti
  where ti.status = 'pending' and lower(ti.invited_email) = lower(new.email)
  on conflict (account_id, user_id) do nothing;

  update public.team_invites
  set status = 'accepted', accepted_at = now(), accepted_by = new.id
  where status = 'pending' and lower(invited_email) = lower(new.email);

  return new;
end;
$$;

create or replace trigger on_auth_user_created_team_owner
after insert on auth.users
for each row execute function public.handle_new_team_owner();

-- Accept-invite flow: an invited (non-member) user has no RLS access to
-- insert into team_members or update team_invites (both are owner-only by
-- policy). A SECURITY DEFINER function is the same escape hatch used above,
-- scoped narrowly to "the calling user accepting their own pending invite."
create or replace function public.accept_team_invite(p_invite_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite record;
  v_caller_email text;
begin
  select email into v_caller_email from auth.users where id = auth.uid();
  if v_caller_email is null then
    return jsonb_build_object('success', false, 'error', 'You must be signed in.');
  end if;

  select * into v_invite from public.team_invites where id = p_invite_id for update;
  if v_invite is null then
    return jsonb_build_object('success', false, 'error', 'This invite could not be found.');
  end if;
  if v_invite.status <> 'pending' then
    return jsonb_build_object('success', false, 'error', 'This invite is no longer pending.');
  end if;
  if lower(v_invite.invited_email) <> lower(v_caller_email) then
    return jsonb_build_object('success', false, 'error', 'This invite was sent to a different email address.');
  end if;

  insert into public.team_members (account_id, user_id, role)
  values (v_invite.account_id, auth.uid(), v_invite.role)
  on conflict (account_id, user_id) do nothing;

  update public.team_invites
  set status = 'accepted', accepted_at = now(), accepted_by = auth.uid()
  where id = p_invite_id;

  return jsonb_build_object('success', true);
end;
$$;

-- team_members has one partial unique index (one owner per account).
-- Promoting a member to Owner is really a swap: the current owner is
-- demoted to 'manager' in the same motion. Deleting both rows and
-- re-inserting them (same id/account_id/user_id/joined_at) avoids the
-- unique-index collision a plain UPDATE would hit mid-statement.
create or replace function public.transfer_account_ownership(p_new_owner_member_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_target record;
  v_caller_member record;
begin
  select * into v_target from public.team_members where id = p_new_owner_member_id for update;
  if v_target is null then
    return jsonb_build_object('success', false, 'error', 'That member could not be found.');
  end if;

  select * into v_caller_member from public.team_members
    where account_id = v_target.account_id and user_id = auth.uid() for update;
  if v_caller_member is null or v_caller_member.role <> 'owner' then
    return jsonb_build_object('success', false, 'error', 'Only the account owner can transfer ownership.');
  end if;
  if v_target.user_id = auth.uid() then
    return jsonb_build_object('success', false, 'error', 'You''re already the owner.');
  end if;

  delete from public.team_members where id in (v_caller_member.id, p_new_owner_member_id);

  insert into public.team_members (id, account_id, user_id, role, joined_at) values
    (v_caller_member.id, v_caller_member.account_id, v_caller_member.user_id, 'manager', v_caller_member.joined_at),
    (v_target.id, v_target.account_id, v_target.user_id, 'owner', v_target.joined_at);

  return jsonb_build_object('success', true);
end;
$$;

-- CREATE FUNCTION grants EXECUTE to PUBLIC by default, and anon inherits
-- through PUBLIC membership regardless of a role-specific revoke — the
-- actual fix is revoking from PUBLIC, then re-granting to authenticated.
revoke execute on function public.transfer_account_ownership(uuid) from public;
revoke execute on function public.accept_team_invite(uuid) from public;
grant execute on function public.transfer_account_ownership(uuid) to authenticated;
grant execute on function public.accept_team_invite(uuid) to authenticated;

-- Stage 3.2: the two approval-workflow transitions. Both check for
-- Manager/Owner explicitly rather than relying on RLS's row-level grant --
-- RLS can't restrict *which column values* an already-permitted role may
-- write, so this is the actual enforcement point for "only a
-- Manager/Owner may approve or reject," mirroring the RPC-boundary pattern
-- established above rather than widening a raw table grant.
create or replace function public.approve_draft(p_draft_id uuid, p_notes text default null)
returns public.drafts
language plpgsql
security definer set search_path = public
as $$
declare
  v_draft public.drafts;
begin
  select * into v_draft from public.drafts where id = p_draft_id for update;
  if v_draft is null then
    raise exception 'Draft not found.';
  end if;
  if not public.has_role_access(v_draft.user_id, array['owner','manager']) then
    raise exception 'Only a Manager or Owner can approve a draft.';
  end if;

  update public.drafts
    set status = 'approved', review_notes = p_notes, updated_at = now()
    where id = p_draft_id
    returning * into v_draft;

  return v_draft;
end;
$$;

create or replace function public.request_draft_changes(p_draft_id uuid, p_notes text)
returns public.drafts
language plpgsql
security definer set search_path = public
as $$
declare
  v_draft public.drafts;
begin
  if p_notes is null or btrim(p_notes) = '' then
    raise exception 'Review notes are required when requesting changes.';
  end if;

  select * into v_draft from public.drafts where id = p_draft_id for update;
  if v_draft is null then
    raise exception 'Draft not found.';
  end if;
  if not public.has_role_access(v_draft.user_id, array['owner','manager']) then
    raise exception 'Only a Manager or Owner can request changes on a draft.';
  end if;

  update public.drafts
    set status = 'changes_requested', review_notes = p_notes, updated_at = now()
    where id = p_draft_id
    returning * into v_draft;

  return v_draft;
end;
$$;

revoke all on function public.approve_draft(uuid, text) from public;
revoke all on function public.request_draft_changes(uuid, text) from public;
grant execute on function public.approve_draft(uuid, text) to authenticated;
grant execute on function public.request_draft_changes(uuid, text) to authenticated;

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
  created_at timestamptz not null default now(),
  -- Schema-only today — see 20260729030100_channel_video_repurpose_suggested.sql.
  -- No application code reads or writes this yet; the "New video published
  -- -> Suggest a repurpose" automation is still preview-only, and no
  -- publish-event source exists to set this flag.
  repurpose_suggested boolean not null default false
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

create trigger update_media_kits_updated_at before update on public.media_kits
for each row execute function public.update_updated_at();

alter table public.channel_stats_daily enable row level security;
alter table public.channel_videos enable row level security;
alter table public.repurposed_content enable row level security;
alter table public.media_kits enable row level security;

-- Role-scoped data access. See has_role_access() above — user_id on each of
-- these tables is the account id, and access is granted per the module's
-- role matrix rather than a flat "any team member sees everything":
--   deals / deal_stage_history / automations -> owner, manager
--   ideas / drafts                           -> owner, editor
--   repurposed_content                       -> owner, editor, designer
--   channel_stats_daily / channel_videos     -> owner, manager, editor, designer
-- (moderator has no module of its own yet — see docs/qa/TEAM_SIMULATION_REPORT.md.)

create policy "Role-scoped deal access" on public.deals
  for all using (public.has_role_access(user_id, array['owner','manager']))
  with check (public.has_role_access(user_id, array['owner','manager']));

create policy "Role-scoped deal history access" on public.deal_stage_history
  for all using (public.has_role_access(user_id, array['owner','manager']))
  with check (public.has_role_access(user_id, array['owner','manager']));

create policy "Role-scoped ideas access" on public.ideas
  for all using (public.has_role_access(user_id, array['owner','editor']))
  with check (public.has_role_access(user_id, array['owner','editor']));

-- Stage 3.2: Manager gets read access for review, additive to the
-- content-edit policy below (a separate SELECT policy, not a replacement,
-- so Manager still can't insert/update/delete a draft's content directly).
create policy "Manager can view drafts for review" on public.drafts
  for select using (public.has_role_access(user_id, array['owner','manager']));

-- Designer joins Editor with full content-edit access (Gate 0's other RBAC
-- gap). The with-check blocks Editor/Designer from ever setting status to
-- approved/changes_requested themselves -- those transitions only happen
-- through approve_draft()/request_draft_changes() (see
-- 20260804220000_draft_approvals.sql), which check for Manager/Owner
-- explicitly. Enforced at the RLS layer, so it holds even against a direct
-- API call, not just against the UI.
create policy "Role-scoped drafts access" on public.drafts
  for all using (public.has_role_access(user_id, array['owner','editor','designer']))
  with check (
    public.has_role_access(user_id, array['owner'])
    or (
      public.has_role_access(user_id, array['editor','designer'])
      and status = any (array['draft','pending_review'])
    )
  );

create policy "Role-scoped automations access" on public.automations
  for all using (public.has_role_access(user_id, array['owner','manager']))
  with check (public.has_role_access(user_id, array['owner','manager']));

create policy "Role-scoped automation activity access" on public.automation_activity
  for select using (public.has_role_access(user_id, array['owner','manager']));

create policy "Role-scoped repurpose access" on public.repurposed_content
  for all using (public.has_role_access(user_id, array['owner','editor','designer']))
  with check (public.has_role_access(user_id, array['owner','editor','designer']));

create policy "Role-scoped channel stats access" on public.channel_stats_daily
  for all using (public.has_role_access(user_id, array['owner','manager','editor','designer']))
  with check (public.has_role_access(user_id, array['owner','manager','editor','designer']));

create policy "Role-scoped channel videos access" on public.channel_videos
  for all using (public.has_role_access(user_id, array['owner','manager','editor','designer']))
  with check (public.has_role_access(user_id, array['owner','manager','editor','designer']));

-- Deliberately no anon policy here — see the comment on the table
-- definition above. The public share page reads through a service-role
-- client instead of this policy.
create policy "Role-scoped media kit access" on public.media_kits
  for all using (public.has_role_access(user_id, array['owner','manager']))
  with check (public.has_role_access(user_id, array['owner','manager']));

-- PostgREST only exposes the `public` schema by default, so the edge
-- functions that own OAuth token lifecycle (connect-integration,
-- fetch-youtube-data, fetch-gmail-deals, disconnect-integration) reach
-- Supabase Vault through these thin, service-role-only wrappers rather than
-- calling `vault.*` directly.
create or replace function public.vault_create_secret_for_integration(p_secret text, p_name text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  return vault.create_secret(p_secret, p_name);
end;
$$;

create or replace function public.vault_read_secret_for_integration(p_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secret text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where id = p_id;
  return v_secret;
end;
$$;

create or replace function public.vault_update_secret_for_integration(p_id uuid, p_secret text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform vault.update_secret(p_id, p_secret);
end;
$$;

create or replace function public.vault_delete_secret_for_integration(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from vault.secrets where id = p_id;
end;
$$;

revoke execute on function public.vault_create_secret_for_integration(text, text) from public, anon, authenticated;
revoke execute on function public.vault_read_secret_for_integration(uuid) from public, anon, authenticated;
revoke execute on function public.vault_update_secret_for_integration(uuid, text) from public, anon, authenticated;
revoke execute on function public.vault_delete_secret_for_integration(uuid) from public, anon, authenticated;

grant execute on function public.vault_create_secret_for_integration(text, text) to service_role;
grant execute on function public.vault_read_secret_for_integration(uuid) to service_role;
grant execute on function public.vault_update_secret_for_integration(uuid, text) to service_role;
grant execute on function public.vault_delete_secret_for_integration(uuid) to service_role;

-- Stage 3.3: the two standing pg_cron jobs that drive run-scheduled-
-- automations. cron.schedule() upserts by job name, so re-running this is
-- safe. The service-role key they authorize with lives in Vault under the
-- name 'service_role_key' — populated with its real value directly against
-- the live project, never committed here (see
-- 20260804230000_butler_automations.sql).
select cron.schedule(
  'automation-follow-up-check',
  '0 13 * * *',
  $cron$
  select net.http_post(
    url := 'https://fpzvtetxiazleoijoisq.supabase.co/functions/v1/run-scheduled-automations',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key' limit 1)
    ),
    body := jsonb_build_object('job', 'follow_up')
  );
  $cron$
);

select cron.schedule(
  'automation-monday-digest',
  '0 14 * * 1',
  $cron$
  select net.http_post(
    url := 'https://fpzvtetxiazleoijoisq.supabase.co/functions/v1/run-scheduled-automations',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key' limit 1)
    ),
    body := jsonb_build_object('job', 'digest')
  );
  $cron$
);
