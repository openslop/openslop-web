create table if not exists waitlist (
  id bigint generated always as identity primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table waitlist enable row level security;

create policy "Allow anonymous inserts" on waitlist
  for insert
  to anon
  with check (true);
