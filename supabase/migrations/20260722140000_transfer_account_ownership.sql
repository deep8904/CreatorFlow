-- team_members has TWO partial unique indexes: one owner per account and
-- one member per account (team_members_one_owner_per_account,
-- team_members_one_member_per_account — the free-plan "owner + at most one
-- collaborator" cap, enforced at the DB layer). Promoting a member to Owner
-- is really a swap: the current owner becomes a member in the same motion.
--
-- Tried two approaches that both failed against the live constraints:
--   1. Two separate UPDATE statements — whichever runs first violates one
--      of the two indexes (confirmed live, 23505 both ways).
--   2. A single UPDATE with a CASE expression touching both rows — still
--      23505. Postgres checks a unique btree index as each row is
--      processed, even within one statement; it doesn't batch the check to
--      end-of-statement the way a true DEFERRABLE constraint would, and
--      partial unique indexes (CREATE UNIQUE INDEX ... WHERE ...) can't be
--      attached as deferrable constraints in Postgres at all.
-- Fix: delete both rows, then insert two new rows with the roles swapped
-- (same id/account_id/user_id/joined_at, so nothing else observes a
-- change beyond the role). Between the delete and the insert there are
-- zero owner/member rows for this account within the transaction, so the
-- two inserts — one 'owner', one 'member' — never collide with each other
-- or with anything already gone.
-- SECURITY DEFINER for the same reason as accept_team_invite: this touches
-- a row the caller doesn't directly own (their own row changes as a side
-- effect of promoting someone else), which plain RLS can't express.
create or replace function public.transfer_account_ownership(p_new_owner_member_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
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
    return jsonb_build_object('success', false, 'error', 'You’re already the owner.');
  end if;

  delete from public.team_members where id in (v_caller_member.id, p_new_owner_member_id);

  insert into public.team_members (id, account_id, user_id, role, joined_at) values
    (v_caller_member.id, v_caller_member.account_id, v_caller_member.user_id, 'member', v_caller_member.joined_at),
    (v_target.id, v_target.account_id, v_target.user_id, 'owner', v_target.joined_at);

  return jsonb_build_object('success', true);
end;
$$;

-- `revoke ... from anon` alone does nothing here — CREATE FUNCTION grants
-- EXECUTE to PUBLIC by default, and anon inherits through that membership
-- regardless of a role-specific revoke. Confirmed live via
-- has_function_privilege: revoking from anon left it executable; revoking
-- from PUBLIC (see 20260722150000_revoke_public_grant_team_ownership_functions.sql)
-- was the actual fix. Left here so the create statement is self-contained;
-- the real revoke is the later migration.
revoke execute on function public.transfer_account_ownership(uuid) from anon;
