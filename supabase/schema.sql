-- Postale kısa link & kartpostal veritabanı tablosu
-- Supabase Dashboard > SQL Editor > New query içine yapıştırıp "Run" deyin.

create table if not exists public.cards (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.cards enable row level security;
