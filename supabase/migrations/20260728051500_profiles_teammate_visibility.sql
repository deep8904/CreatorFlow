-- getTeam() shows every member's name by joining team_members to profiles,
-- but profiles' only SELECT policy was "auth.uid() = id" — a member could
-- never see ANY teammate's name, including the owner's, so the Team page
-- silently fell back to "You" for every row but the caller's own. This adds
-- read access to a profile for anyone who shares an account with that
-- profile's owner, without opening profiles up more broadly than that.
create policy "Account members can view teammates' profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.team_members tm_target
      join public.team_members tm_caller on tm_caller.account_id = tm_target.account_id
      where tm_target.user_id = profiles.id and tm_caller.user_id = auth.uid()
    )
  );
