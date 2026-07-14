-- Deals: add the due_date field required by the Deals UI/design brief.
alter table public.deals add column if not exists due_date date;
