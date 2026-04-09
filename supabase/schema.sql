create table if not exists public.rooms (
  id text primary key,
  name text not null default 'TAGS - The Annual Gamer Showdown',
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.rooms enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'rooms' and policyname = 'rooms_select_public'
  ) then
    create policy rooms_select_public on public.rooms for select using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'rooms' and policyname = 'rooms_insert_public'
  ) then
    create policy rooms_insert_public on public.rooms for insert with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'rooms' and policyname = 'rooms_update_public'
  ) then
    create policy rooms_update_public on public.rooms for update using (true) with check (true);
  end if;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.rooms;
exception
  when duplicate_object then null;
end $$;
