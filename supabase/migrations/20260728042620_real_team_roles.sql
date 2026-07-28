-- Real team roles (docs/qa/TEAM_SIMULATION_REPORT.md, Must-Fix #1): removes
-- the free-plan seat cap and widens the binary owner/member split into five
-- real roles, each with enforced data access — not just a label.
--
-- Also fixes a much bigger bug the simulation surfaced along the way: every
-- content table's RLS policy was a flat `auth.uid() = user_id`. Since
-- user_id on these tables is really "which account this row belongs to"
-- (the account owner's own id), a team member — a *different* auth user —
-- had zero data access to the account's deals/ideas/drafts/etc, not just
-- undifferentiated full access. has_role_access() replaces that check with
-- "does the caller belong to this account, in an allowed role."

drop index if exists public.team_members_one_member_per_account;
drop index if exists public.team_invites_one_pending_per_account;

-- Drop the old constraints before migrating data (a row with role='member'
-- would violate either the old or new constraint depending on which is
-- active when the UPDATE runs), then add the wider constraint back once
-- every row already complies with it.
alter table public.team_members drop constraint if exists team_members_role_check;
alter table public.team_invites drop constraint if exists team_invites_role_check;

update public.team_members set role = 'editor' where role = 'member';
update public.team_invites set role = 'editor' where role = 'member';

alter table public.team_members add constraint team_members_role_check
  check (role in ('owner','manager','editor','designer','moderator'));
alter table public.team_invites add constraint team_invites_role_check
  check (role in ('owner','manager','editor','designer','moderator'));

-- transfer_account_ownership hardcoded the demoted former owner's new role
-- to 'member', which no longer exists. 'manager' is the closest still-
-- operational fallback for someone who used to run the whole account.
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

-- Workspace identity: a real accounts table, one row per account (an
-- "account" is still identified by its owner's original user id).
create table if not exists public.accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  workspace_name text not null default 'My Workspace',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.accounts enable row level security;

drop policy if exists "Account members can view their workspace" on public.accounts;
create policy "Account members can view their workspace" on public.accounts
  for select using (public.is_account_member(id));

drop policy if exists "Owner updates workspace" on public.accounts;
create policy "Owner updates workspace" on public.accounts
  for update using (public.is_account_owner(id));

drop trigger if exists update_accounts_updated_at on public.accounts;
create trigger update_accounts_updated_at before update on public.accounts
for each row execute function public.update_updated_at();

insert into public.accounts (id, workspace_name)
select distinct tm.account_id,
  case
    when nullif(trim(p.full_name), '') is not null then trim(p.full_name) || '''s Workspace'
    else 'My Workspace'
  end
from public.team_members tm
left join public.profiles p on p.id = tm.account_id
on conflict (id) do nothing;

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

drop policy if exists "Users can manage own deals" on public.deals;
create policy "Role-scoped deal access" on public.deals
  for all using (public.has_role_access(user_id, array['owner','manager']))
  with check (public.has_role_access(user_id, array['owner','manager']));

drop policy if exists "Users can manage own deal stage history" on public.deal_stage_history;
create policy "Role-scoped deal history access" on public.deal_stage_history
  for all using (public.has_role_access(user_id, array['owner','manager']))
  with check (public.has_role_access(user_id, array['owner','manager']));

drop policy if exists "Users can manage own ideas" on public.ideas;
create policy "Role-scoped ideas access" on public.ideas
  for all using (public.has_role_access(user_id, array['owner','editor']))
  with check (public.has_role_access(user_id, array['owner','editor']));

drop policy if exists "Users can manage own drafts" on public.drafts;
create policy "Role-scoped drafts access" on public.drafts
  for all using (public.has_role_access(user_id, array['owner','editor']))
  with check (public.has_role_access(user_id, array['owner','editor']));

drop policy if exists "Users can manage own automations" on public.automations;
create policy "Role-scoped automations access" on public.automations
  for all using (public.has_role_access(user_id, array['owner','manager']))
  with check (public.has_role_access(user_id, array['owner','manager']));

drop policy if exists "Users can manage own repurposed content" on public.repurposed_content;
create policy "Role-scoped repurpose access" on public.repurposed_content
  for all using (public.has_role_access(user_id, array['owner','editor','designer']))
  with check (public.has_role_access(user_id, array['owner','editor','designer']));

drop policy if exists "Users can manage own channel stats" on public.channel_stats_daily;
create policy "Role-scoped channel stats access" on public.channel_stats_daily
  for all using (public.has_role_access(user_id, array['owner','manager','editor','designer']))
  with check (public.has_role_access(user_id, array['owner','manager','editor','designer']));

drop policy if exists "Users can manage own channel videos" on public.channel_videos;
create policy "Role-scoped channel videos access" on public.channel_videos
  for all using (public.has_role_access(user_id, array['owner','manager','editor','designer']))
  with check (public.has_role_access(user_id, array['owner','manager','editor','designer']));

-- Orphaned standalone signups: someone who signs up on their own (rather
-- than through the exact invite link) previously never connected to any
-- team that had already invited their email — the invite just sat pending
-- forever. Extend the new-user trigger to auto-join any matching pending
-- invite(s) at signup time, whichever path they signed up through.
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
