create extension if not exists pgcrypto;

create table if not exists public.barbers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  shop_name text not null,
  email text unique,
  password_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers(id) on delete cascade,
  requested_barber_id uuid references public.barbers(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  service text not null,
  day date not null,
  time_slot text not null,
  end_time text not null default '00:00',
  duration_minutes integer not null default 30,
  reassigned boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.barbers add column if not exists email text;
alter table public.barbers add column if not exists password_hash text;
alter table public.bookings add column if not exists requested_barber_id uuid references public.barbers(id) on delete set null;
alter table public.bookings add column if not exists end_time text not null default '00:00';
alter table public.bookings add column if not exists duration_minutes integer not null default 30;
alter table public.bookings add column if not exists reassigned boolean not null default false;

create index if not exists idx_bookings_barber_day on public.bookings (barber_id, day);
create index if not exists idx_admins_email on public.admins (email);
create index if not exists idx_barbers_email on public.barbers (email);

alter table public.barbers enable row level security;
alter table public.admins enable row level security;
alter table public.bookings enable row level security;
