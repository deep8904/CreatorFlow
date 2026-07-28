-- Deal prioritization (docs/qa/TEAM_SIMULATION_REPORT.md Nice-to-Have #8):
-- a plain manual flag a creator sets themselves, not a computed score — the
-- app has no signal (urgency, rate, relationship) that a person doesn't
-- already have better judgment about, so this doesn't try to guess for them.
alter table public.deals add column if not exists is_priority boolean not null default false;
