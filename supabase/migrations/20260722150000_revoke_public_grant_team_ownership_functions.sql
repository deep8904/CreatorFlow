-- Supabase's own security advisor flagged transfer_account_ownership and
-- accept_team_invite as callable by anon. Both functions already reject an
-- unauthenticated/unauthorized caller internally (auth.uid() resolves to
-- null or doesn't match a valid owner/invitee), so this isn't exploitable,
-- but revoking anon access outright is the correct defense-in-depth move —
-- the same call made for accept_team_invite in
-- 20260721120100_accept_team_invite_revoke_anon.sql.
--
-- That earlier migration didn't actually work, confirmed live via
-- has_function_privilege(): `revoke execute ... from anon` targets the
-- anon role directly, but CREATE FUNCTION grants EXECUTE to PUBLIC by
-- default, and every role (including anon) inherits through PUBLIC
-- membership. A role-specific revoke doesn't touch a privilege granted at
-- the PUBLIC level — the fix is revoking from PUBLIC, then re-granting to
-- authenticated explicitly (which needs to keep calling both).
revoke execute on function public.transfer_account_ownership(uuid) from public;
revoke execute on function public.accept_team_invite(uuid) from public;
grant execute on function public.transfer_account_ownership(uuid) to authenticated;
grant execute on function public.accept_team_invite(uuid) to authenticated;
