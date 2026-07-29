-- fetch-gmail-deals is idempotent by design — it can run repeatedly over
-- the same 30-day mailbox window without creating duplicate deals for a
-- thread already turned into one. email_thread_id already existed
-- (provisioned for exactly this) but had no uniqueness guard.
create unique index if not exists deals_user_id_email_thread_id_key
  on public.deals (user_id, email_thread_id)
  where email_thread_id is not null;
