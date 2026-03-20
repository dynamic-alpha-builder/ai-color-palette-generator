create extension if not exists "pgcrypto";

create table if not exists public.palettes (
  id          uuid          primary key default gen_random_uuid(),
  prompt      text          not null,
  colors      jsonb         not null,
  created_at  timestamptz   not null default now()
);

create index if not exists palettes_created_at_idx
  on public.palettes (created_at desc);

alter table public.palettes enable row level security;

create policy "Allow public insert"
  on public.palettes
  for insert
  to anon, authenticated
  with check (true);

create policy "Allow public select"
  on public.palettes
  for select
  to anon, authenticated
  using (true);
