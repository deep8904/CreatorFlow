-- Stage 3.3: Butler-Style Recurring & Escalation Automations.
--
-- Genuine scheduled infrastructure, not a simulated timer: pg_cron fires a
-- Postgres job on a real cron schedule, which uses pg_net to call the
-- run-scheduled-automations edge function over HTTP — the same shape a
-- production cron-to-webhook pipeline would use. The service-role key used
-- to authorize that call lives in Supabase Vault (created here as a
-- placeholder, populated with the real value directly against the live
-- project, never committed — same pattern as .env.local's
-- DEMO_ACCOUNT_PASSWORD never being hardcoded in the seed script).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- schedule: a real cron expression (UTC). Null = event-based, same as every
-- automation before this migration. schedule_label: the human-readable
-- Butler-style phrasing shown in the UI instead of asking anyone to read
-- cron syntax.
alter table public.automations
  add column if not exists schedule text,
  add column if not exists schedule_label text;

-- One row per scheduled run, written by the edge function so the
-- Automations page can honestly show "last checked" instead of just trusting
-- the toggle is on. Service-role-only writes (the edge function uses the
-- service-role client) — no INSERT policy for authenticated users below.
create table if not exists public.automation_activity (
  id uuid primary key default gen_random_uuid(),
  automation_id uuid not null references public.automations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  ran_at timestamptz not null default now(),
  summary text not null,
  details jsonb
);

create index if not exists automation_activity_automation_id_ran_at_idx
  on public.automation_activity (automation_id, ran_at desc);

alter table public.automation_activity enable row level security;

create policy "Role-scoped automation activity access" on public.automation_activity
  for select using (public.has_role_access(user_id, array['owner','manager']));

-- Upgrade the existing "Deal gone quiet or invoice overdue" rule to
-- genuinely cron-driven (was a preview-only toggle with no execution path),
-- and give every existing account the new Monday-digest rule.
update public.automations
  set schedule = '0 13 * * *', schedule_label = 'Checked daily, 1pm UTC'
  where trigger_type = 'deals.needs_follow_up' and schedule is null;

insert into public.automations (user_id, name, trigger_type, action_type, config, enabled, schedule, schedule_label)
select
  tm.account_id,
  'Monday digest — what''s due this week',
  'schedule.weekly_digest',
  'deals.summarize_week',
  jsonb_build_object('description', 'Every Monday, a summary of deals and drafts due in the next 7 days.'),
  false,
  '0 14 * * 1',
  'Every Monday, 2pm UTC'
from public.team_members tm
where tm.role = 'owner'
  and not exists (
    select 1 from public.automations a
    where a.user_id = tm.account_id and a.trigger_type = 'schedule.weekly_digest'
  );

-- New accounts get both from the moment they sign up.
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

  -- Every account gets the same baseline automations disabled by default —
  -- gmail.sponsorship_email_detected has a real effect once Gmail is
  -- connected (fetch-gmail-deals creates real deals from it), so this is
  -- opt-in via the Automations page, not on by default. The two scheduled
  -- rules (deals.needs_follow_up, schedule.weekly_digest) are genuinely
  -- cron-driven as of Stage 3.3 — see run-scheduled-automations.
  insert into public.automations (user_id, name, trigger_type, action_type, config, enabled, schedule, schedule_label)
  values
    (new.id, 'New sponsorship email → Create a deal', 'gmail.sponsorship_email_detected', 'deals.create',
      jsonb_build_object('description', 'When Gmail detects a new brand deal email, automatically create a deal card for it.'), false, null, null),
    (new.id, 'Deal marked Paid → Archive contract', 'deals.status_changed_to_paid', 'deals.archive_contract',
      jsonb_build_object('description', 'Keep your Deals view focused on what''s active.'), false, null, null),
    (new.id, 'New video published → Suggest a repurpose', 'youtube.video_published', 'repurpose.suggest',
      jsonb_build_object('description', 'As soon as a new video goes live, queue it up in Repurpose so clips and posts are ready same-day.'), false, null, null),
    (new.id, 'Deal gone quiet or invoice overdue → Flag for follow-up', 'deals.needs_follow_up', 'deals.flag_follow_up',
      jsonb_build_object('description', 'Deals stuck 5+ days in Inbound/Negotiating, or with an unpaid invoice past its due date, already show on your Dashboard and in Deals regardless of this toggle.'), false,
      '0 13 * * *', 'Checked daily, 1pm UTC'),
    (new.id, 'Monday digest — what''s due this week', 'schedule.weekly_digest', 'deals.summarize_week',
      jsonb_build_object('description', 'Every Monday, a summary of deals and drafts due in the next 7 days.'), false,
      '0 14 * * 1', 'Every Monday, 2pm UTC')
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
$$;

-- Vault secret placeholder for the service-role key pg_net's HTTP calls
-- authorize with. The real value is set directly against the live project
-- (never committed) — same secrecy pattern as .env.local's
-- SUPABASE_SERVICE_ROLE_KEY / DEMO_ACCOUNT_PASSWORD.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'service_role_key') then
    perform vault.create_secret('REPLACE_VIA_OPS_NOT_COMMITTED', 'service_role_key', 'Service-role key for run-scheduled-automations pg_net calls.');
  end if;
end $$;

-- Real cadence: daily follow-up check, weekly Monday digest. Both call the
-- same edge function with a different job name in the body.
select cron.schedule(
  'automation-follow-up-check',
  '0 13 * * *',
  $cron$
  select net.http_post(
    url := 'https://fpzvtetxiazleoijoisq.supabase.co/functions/v1/run-scheduled-automations',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key' limit 1)
    ),
    body := jsonb_build_object('job', 'follow_up')
  );
  $cron$
);

select cron.schedule(
  'automation-monday-digest',
  '0 14 * * 1',
  $cron$
  select net.http_post(
    url := 'https://fpzvtetxiazleoijoisq.supabase.co/functions/v1/run-scheduled-automations',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key' limit 1)
    ),
    body := jsonb_build_object('job', 'digest')
  );
  $cron$
);
