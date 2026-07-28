-- Performance hardening surfaced by a full data-integrity audit (Supabase advisors):
-- 1. Every foreign-key/filter column queried by lib/supabase/queries.ts had no
--    covering index — notably team_members.user_id, which getCurrentAccount()
--    (called on nearly every page load) filters on directly. At current row
--    counts this is invisible; it becomes a real sequential-scan cost as
--    accounts and content grow.
-- 2. Several RLS policies called auth.uid()/auth.jwt() directly in their
--    qual/with_check, which re-evaluates per row instead of once per
--    statement. Wrapping in (select ...) lets Postgres cache the result.

create index if not exists automations_user_id_idx on public.automations (user_id);
create index if not exists channel_videos_user_id_idx on public.channel_videos (user_id);
create index if not exists deal_stage_history_user_id_idx on public.deal_stage_history (user_id);
create index if not exists deals_user_id_idx on public.deals (user_id);
create index if not exists drafts_user_id_idx on public.drafts (user_id);
create index if not exists drafts_idea_id_idx on public.drafts (idea_id);
create index if not exists ideas_user_id_idx on public.ideas (user_id);
create index if not exists integrations_user_id_idx on public.integrations (user_id);
create index if not exists repurposed_content_user_id_idx on public.repurposed_content (user_id);
create index if not exists repurposed_content_video_id_idx on public.repurposed_content (video_id);
create index if not exists team_invites_account_id_idx on public.team_invites (account_id);
create index if not exists team_invites_accepted_by_idx on public.team_invites (accepted_by);
create index if not exists team_members_user_id_idx on public.team_members (user_id);

alter policy "Users can view own profile" on public.profiles
  using ((select auth.uid()) = id);

alter policy "Users can insert own profile" on public.profiles
  with check ((select auth.uid()) = id);

alter policy "Users can update own profile" on public.profiles
  using ((select auth.uid()) = id);

alter policy "Account members can view teammates' profiles" on public.profiles
  using (
    exists (
      select 1
      from public.team_members tm_target
      join public.team_members tm_caller on tm_caller.account_id = tm_target.account_id
      where tm_target.user_id = profiles.id
        and tm_caller.user_id = (select auth.uid())
    )
  );

alter policy "Invited user can view their own pending invite" on public.team_invites
  using (
    status = 'pending'
    and lower(invited_email) = lower((select auth.jwt()) ->> 'email')
  );

-- handle_new_user/handle_new_team_owner are AFTER INSERT ON auth.users trigger
-- functions (RETURNS trigger) — Postgres refuses to invoke a trigger function
-- as a plain call, so this has no functional effect, but there's no reason for
-- them to be reachable via /rest/v1/rpc/... at all.
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.handle_new_team_owner() from anon, authenticated;
