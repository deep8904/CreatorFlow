-- accept_team_invite is only meant to be called by a signed-in user (it
-- checks auth.uid() internally and rejects anon callers already, but the
-- linter is right that anon shouldn't have EXECUTE at all as defense in depth).
revoke execute on function public.accept_team_invite(uuid) from anon;
