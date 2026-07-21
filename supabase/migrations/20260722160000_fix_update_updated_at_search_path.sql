-- Security advisor: function_search_path_mutable — update_updated_at had no
-- search_path pinned, unlike every other function in this schema. Doesn't
-- touch anything outside a plain `new.updated_at = now()`, so low risk in
-- practice, but pinning it matches the pattern used everywhere else here.
create or replace function public.update_updated_at()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;
