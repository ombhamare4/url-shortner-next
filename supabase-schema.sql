-- Run this once in the Supabase SQL editor to set up the schema.

-- The app obfuscates ids via a bijective multiplier before base-62 encoding
-- (see lib/shortcode.ts), so sequential ids no longer produce sequential
-- short codes. The sequence can start at 1.
create sequence if not exists public.url_id_seq start with 1;

create table if not exists public.urls (
  id bigint primary key,
  short_url text unique not null,
  long_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists urls_long_url_idx on public.urls (long_url);

-- Atomic next-ID generator exposed to PostgREST so the app can call it via rpc().
create or replace function public.next_url_id()
returns bigint
language sql
as $$
  select nextval('public.url_id_seq');
$$;

-- The anon role uses the publishable key. Tighten this with RLS for production.
alter table public.urls enable row level security;

drop policy if exists "urls read" on public.urls;
create policy "urls read" on public.urls for select using (true);

drop policy if exists "urls insert" on public.urls;
create policy "urls insert" on public.urls for insert with check (true);

grant usage on sequence public.url_id_seq to anon, authenticated;
grant execute on function public.next_url_id() to anon, authenticated;

-- ---- Migration for existing installs ----
-- If you already have rows with sequential-looking short codes from an
-- earlier setup, run these two statements to wipe the table and reset the
-- sequence so future inserts use the new obfuscated codes:
--
--   truncate public.urls;
--   alter sequence public.url_id_seq restart with 1;
