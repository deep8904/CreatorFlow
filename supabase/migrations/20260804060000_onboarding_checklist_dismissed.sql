-- Backs the Stage 1 "Today" Dashboard's adaptive onboarding checklist —
-- lets a user dismiss it once, persisted, rather than showing it forever
-- or re-showing it after every session.
alter table public.profiles
  add column if not exists onboarding_checklist_dismissed boolean not null default false;
