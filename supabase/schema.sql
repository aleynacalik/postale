-- Postale kısa link & spam koruması tabloları
-- Supabase Dashboard > SQL Editor > New query içine yapıştırıp "Run" deyin.

create table if not exists public.cards (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.cards enable row level security;

-- Kalıcı spam / hız limiti tablosu (sadece hash'lenmiş IP ve alıcı saklar)
create table if not exists public.email_logs (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  recipient_hash text not null,
  card_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_email_logs_ip_created on public.email_logs (ip_hash, created_at desc);
create index if not exists idx_email_logs_recipient_created on public.email_logs (recipient_hash, created_at desc);
create index if not exists idx_email_logs_created on public.email_logs (created_at desc);

alter table public.email_logs enable row level security;

grant usage on schema public to service_role;
grant all privileges on table public.cards to service_role;
grant all privileges on table public.email_logs to service_role;
grant usage, select on all sequences in schema public to service_role;
