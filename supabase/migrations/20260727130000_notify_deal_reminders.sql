alter table public.profiles
  add column notify_deal_reminders boolean not null default true;
