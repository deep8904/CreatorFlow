-- Fixes a real UX inconsistency found in the post-Stage-3 polish pass: the
-- "Deal gone quiet or invoice overdue" automation's static description said
-- the toggle had no effect "regardless of this toggle," directly
-- contradicting the dynamic status line right below it (added in Stage
-- 3.3) that tells the same person to "turn on to have this run
-- automatically." Both were true at the time each was written, but Stage
-- 3.3 gave this toggle a real, narrower effect (gating the daily
-- scheduled check and its activity log) without updating the older copy
-- that predates it.
update public.automations
set config = jsonb_set(
  config,
  '{description}',
  '"Deals stuck 5+ days in Inbound/Negotiating, or with an unpaid invoice past its due date, already show on your Dashboard and in Deals right away, with no toggle needed. Turn this on for a daily scheduled check that logs what it found here too."'
)
where trigger_type = 'deals.needs_follow_up';
