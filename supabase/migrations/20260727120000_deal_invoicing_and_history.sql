-- Invoice/payment tracking on deals, and a stage-transition history table.
-- Requested by real user-test feedback (Marcus persona): "Collected to
-- date" had no real payment-date column to be accurate against, and there
-- was no way to see when a deal moved through its stages.

alter table public.deals
  add column invoiced_at timestamptz null,
  add column paid_at date null;

create table public.deal_stage_history (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  from_status text null,
  to_status text not null,
  changed_at timestamptz not null default now()
);

create index deal_stage_history_deal_id_idx on public.deal_stage_history(deal_id);

alter table public.deal_stage_history enable row level security;

-- Same shape as "Users can manage own deals" — a single ALL policy scoped
-- to the owning user, matching this project's established RLS convention.
create policy "Users can manage own deal stage history"
  on public.deal_stage_history
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
