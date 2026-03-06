-- Lookup a user's position by email (only callable with service role key)
create or replace function waitlist_position(lookup_email text) returns bigint as $$
  select id from waitlist where email = lookup_email limit 1;
$$ language sql security definer;
