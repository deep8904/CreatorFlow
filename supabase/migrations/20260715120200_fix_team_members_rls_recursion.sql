-- Fix: the team_members/team_invites RLS policies queried public.team_members
-- from within a policy defined ON public.team_members, which Postgres cannot
-- evaluate without re-triggering the same policy -- infinite recursion
-- ("infinite recursion detected in policy for relation team_members"),
-- confirmed reproducible on every select/insert/update against these tables.
-- Fix: move the membership/ownership checks into SECURITY DEFINER functions,
-- which evaluate as the function owner and so are not subject to the calling
-- policy's own RLS -- the standard pattern for self-referencing RLS checks.

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

drop policy if exists "Account members can view team members" on public.team_members;
drop policy if exists "Owner adds team members" on public.team_members;
drop policy if exists "Owner updates team members" on public.team_members;
drop policy if exists "Owner removes non-owner team members" on public.team_members;
drop policy if exists "Account members can view invites" on public.team_invites;
drop policy if exists "Owner creates invites" on public.team_invites;
drop policy if exists "Owner updates invites" on public.team_invites;

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
