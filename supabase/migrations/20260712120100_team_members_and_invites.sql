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

-- Exactly one owner per account.
create unique index if not exists team_members_one_owner_per_account
  on public.team_members (account_id)
  where role = 'owner';

-- Free plan: at most one additional collaborator per account.
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

-- Free plan: at most one outstanding invite per account at a time.
create unique index if not exists team_invites_one_pending_per_account
  on public.team_invites (account_id)
  where status = 'pending';

alter table public.team_members enable row level security;
alter table public.team_invites enable row level security;

-- Readable by any member of the same account (owner or collaborator).
create policy "Account members can view team members" on public.team_members
  for select using (
    exists (
      select 1 from public.team_members tm
      where tm.account_id = team_members.account_id and tm.user_id = auth.uid()
    )
  );

create policy "Owner adds team members" on public.team_members
  for insert with check (
    exists (
      select 1 from public.team_members tm
      where tm.account_id = team_members.account_id and tm.user_id = auth.uid() and tm.role = 'owner'
    )
  );

create policy "Owner updates team members" on public.team_members
  for update using (
    exists (
      select 1 from public.team_members tm
      where tm.account_id = team_members.account_id and tm.user_id = auth.uid() and tm.role = 'owner'
    )
  );

create policy "Owner removes non-owner team members" on public.team_members
  for delete using (
    role <> 'owner'
    and exists (
      select 1 from public.team_members tm
      where tm.account_id = team_members.account_id and tm.user_id = auth.uid() and tm.role = 'owner'
    )
  );

create policy "Account members can view invites" on public.team_invites
  for select using (
    exists (
      select 1 from public.team_members tm
      where tm.account_id = team_invites.account_id and tm.user_id = auth.uid()
    )
  );

create policy "Owner creates invites" on public.team_invites
  for insert with check (
    exists (
      select 1 from public.team_members tm
      where tm.account_id = team_invites.account_id and tm.user_id = auth.uid() and tm.role = 'owner'
    )
  );

create policy "Owner updates invites" on public.team_invites
  for update using (
    exists (
      select 1 from public.team_members tm
      where tm.account_id = team_invites.account_id and tm.user_id = auth.uid() and tm.role = 'owner'
    )
  );

-- Every new account gets exactly one owner row, automatically.
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
