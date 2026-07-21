alter table public.deals drop constraint deals_status_check;
alter table public.deals add constraint deals_status_check
  check (status = any (array['inbound', 'negotiating', 'contracted', 'delivered', 'paid', 'lost']));
