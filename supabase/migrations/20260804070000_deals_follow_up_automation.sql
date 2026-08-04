-- Stage 2.1: adds a 4th baseline automation rule for "needs follow-up"
-- detection (a deal stuck 5+ days in Inbound/Negotiating, or an invoice
-- sent and unpaid past its due date). Unlike the other rules this is a
-- computed condition evaluated live wherever deals are read
-- (lib/dealUrgency.ts), not something that needs a trigger engine to be
-- real — the Dashboard/Deals surfacing works whether or not this row
-- exists. The automation row itself follows the same "preview only, saves
-- a preference" pattern as the two other non-Gmail rules (see
-- AutomationsBoard.tsx), disabled by default like the rest.
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
      jsonb_build_object('description', 'As soon as a new video goes live, queue it up in Repurpose so clips and posts are ready same-day.'), false),
    (new.id, 'Deal gone quiet or invoice overdue → Flag for follow-up', 'deals.needs_follow_up', 'deals.flag_follow_up',
      jsonb_build_object('description', 'Deals stuck 5+ days in Inbound/Negotiating, or with an unpaid invoice past its due date, already show on your Dashboard and in Deals regardless of this toggle.'), false)
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

-- Backfill the new rule for every existing account so it shows up on the
-- Automations page without requiring a fresh signup.
insert into public.automations (user_id, name, trigger_type, action_type, config, enabled)
select
  a.id,
  'Deal gone quiet or invoice overdue → Flag for follow-up',
  'deals.needs_follow_up',
  'deals.flag_follow_up',
  jsonb_build_object('description', 'Deals stuck 5+ days in Inbound/Negotiating, or with an unpaid invoice past its due date, already show on your Dashboard and in Deals regardless of this toggle.'),
  false
from public.accounts a
where not exists (
  select 1 from public.automations au
  where au.user_id = a.id and au.trigger_type = 'deals.needs_follow_up'
);
