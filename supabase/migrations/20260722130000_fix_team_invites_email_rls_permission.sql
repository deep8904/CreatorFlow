-- Fix: "Invited user can view their own pending invite" (added in
-- 20260721120000_accept_team_invite.sql) selects directly from auth.users
-- inside its USING clause. RLS policies run with the privileges of the
-- querying role (authenticated), which has no SELECT grant on auth.users —
-- confirmed live via a real query: "permission denied for table users".
-- Because Postgres evaluates every applicable policy for a SELECT (they're
-- OR'd together), this one throwing broke every query against team_invites
-- for an authenticated user, including the account owner's own view of
-- their pending invite via getTeam() — not just the invited-user path this
-- policy was written for. The fix is the standard Supabase pattern: read
-- the email out of the session's own JWT claims (already present, no table
-- access needed) instead of querying auth.users.

drop policy if exists "Invited user can view their own pending invite" on public.team_invites;

create policy "Invited user can view their own pending invite" on public.team_invites
  for select using (
    status = 'pending'
    and lower(invited_email) = lower((auth.jwt() ->> 'email'))
  );
