-- Only the seeded demo account ever had automations rows — a real signup's
-- account starts with zero, so there was nothing to toggle even though the
-- Automations UI itself has always been live. Every new account now gets
-- the same 3 baseline rules the demo account has, disabled by default
-- (unlike the demo seed's enabled:true) since gmail.sponsorship_email_detected
-- now has a real, working effect (fetch-gmail-deals creates real deals) —
-- opt-in, not on by default.
create or replace function public.handle_new_team_owner()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
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

  insert into public.automations (user_id, name, trigger_type, action_type, config, enabled)
  values
    (new.id, 'New sponsorship email → Create a deal', 'gmail.sponsorship_email_detected', 'deals.create',
      jsonb_build_object('description', 'When Gmail detects a new brand deal email, automatically create a deal card for it.'), false),
    (new.id, 'Deal marked Paid → Archive contract', 'deals.status_changed_to_paid', 'deals.archive_contract',
      jsonb_build_object('description', 'Keep your Deals view focused on what''s active.'), false),
    (new.id, 'New video published → Suggest a repurpose', 'youtube.video_published', 'repurpose.suggest',
      jsonb_build_object('description', 'As soon as a new video goes live, queue it up in Repurpose so clips and posts are ready same-day.'), false)
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
$function$;
