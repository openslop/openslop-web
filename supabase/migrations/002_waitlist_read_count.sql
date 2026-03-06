-- Secure RPC function: returns only the max id (count proxy), no row access needed
create or replace function waitlist_count() returns bigint as $$
  select coalesce(max(id), 0) from waitlist;
$$ language sql security definer;
