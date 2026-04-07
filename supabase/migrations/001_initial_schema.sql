-- ClipBoard — Barber Booking Platform
-- Initial Database Schema

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- SHOPS
-- ============================================
create table public.shops (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  phone text,
  email text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip text,
  timezone text not null default 'America/New_York',
  logo_url text,
  booking_notice_hours int not null default 1,
  cancellation_hours int not null default 24,
  require_deposit boolean not null default false,
  deposit_amount decimal(10,2) default 0,
  walk_ins_enabled boolean not null default true,
  online_booking_enabled boolean not null default true,
  google_place_id text,
  facebook_url text,
  instagram_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- BARBERS (staff members)
-- ============================================
create table public.barbers (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  user_id uuid references auth.users(id),
  first_name text not null,
  last_name text not null,
  display_name text,
  phone text,
  email text,
  avatar_url text,
  bio text,
  is_owner boolean not null default false,
  is_active boolean not null default true,
  commission_rate decimal(5,2),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_barbers_shop on public.barbers(shop_id);

-- ============================================
-- SERVICES
-- ============================================
create table public.services (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes int not null default 30,
  price decimal(10,2) not null,
  category text not null default 'Haircuts',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_services_shop on public.services(shop_id);

-- ============================================
-- BARBER_SERVICES (which barbers offer which services)
-- ============================================
create table public.barber_services (
  id uuid primary key default uuid_generate_v4(),
  barber_id uuid not null references public.barbers(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  custom_price decimal(10,2),
  custom_duration_minutes int,
  unique(barber_id, service_id)
);

-- ============================================
-- CLIENTS (no auth required — just name + phone)
-- ============================================
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  first_name text not null,
  last_name text,
  phone text not null,
  email text,
  notes text,
  preferred_barber_id uuid references public.barbers(id),
  no_show_count int not null default 0,
  visit_count int not null default 0,
  last_visit_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_clients_shop on public.clients(shop_id);
create index idx_clients_phone on public.clients(shop_id, phone);

-- ============================================
-- APPOINTMENTS
-- ============================================
create type appointment_status as enum (
  'booked',
  'confirmed',
  'checked_in',
  'in_progress',
  'completed',
  'no_show',
  'cancelled'
);

create type appointment_source as enum (
  'online',
  'walk_in',
  'phone',
  'manual'
);

create table public.appointments (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  barber_id uuid not null references public.barbers(id),
  client_id uuid references public.clients(id),
  service_id uuid not null references public.services(id),

  -- Client info (denormalized for quick access + no-account bookings)
  client_name text not null,
  client_phone text not null,

  -- Scheduling
  date date not null,
  start_time time not null,
  end_time time not null,
  duration_minutes int not null,

  -- Pricing
  price decimal(10,2) not null,
  tip decimal(10,2) default 0,
  total decimal(10,2),

  -- Status
  status appointment_status not null default 'booked',
  source appointment_source not null default 'online',

  -- Timestamps
  checked_in_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,

  -- Notes
  notes text,
  cancellation_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_appointments_shop_date on public.appointments(shop_id, date);
create index idx_appointments_barber_date on public.appointments(barber_id, date);
create index idx_appointments_status on public.appointments(status);
create index idx_appointments_client on public.appointments(client_id);

-- ============================================
-- WALK-IN QUEUE
-- ============================================
create type queue_status as enum (
  'waiting',
  'assigned',
  'in_progress',
  'completed',
  'left'
);

create table public.walk_in_queue (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  client_id uuid references public.clients(id),
  barber_id uuid references public.barbers(id),
  service_id uuid references public.services(id),

  client_name text not null,
  client_phone text,
  party_size int not null default 1,

  status queue_status not null default 'waiting',
  position int not null,
  estimated_wait_minutes int,

  joined_at timestamptz not null default now(),
  assigned_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz
);

create index idx_queue_shop on public.walk_in_queue(shop_id, status);

-- ============================================
-- BARBER SCHEDULES (availability)
-- ============================================
create table public.barber_schedules (
  id uuid primary key default uuid_generate_v4(),
  barber_id uuid not null references public.barbers(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0=Sunday
  start_time time not null,
  end_time time not null,
  is_available boolean not null default true,
  unique(barber_id, day_of_week)
);

-- ============================================
-- BLOCKED TIME (breaks, time off)
-- ============================================
create table public.blocked_times (
  id uuid primary key default uuid_generate_v4(),
  barber_id uuid not null references public.barbers(id) on delete cascade,
  date date not null,
  start_time time,
  end_time time,
  all_day boolean not null default false,
  reason text,
  created_at timestamptz not null default now()
);

create index idx_blocked_barber_date on public.blocked_times(barber_id, date);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger shops_updated_at before update on public.shops
  for each row execute function public.update_updated_at();

create trigger barbers_updated_at before update on public.barbers
  for each row execute function public.update_updated_at();

create trigger clients_updated_at before update on public.clients
  for each row execute function public.update_updated_at();

create trigger appointments_updated_at before update on public.appointments
  for each row execute function public.update_updated_at();

-- ============================================
-- SEED DATA (The Spot Barbershop as demo)
-- ============================================
insert into public.shops (name, slug, phone, address_line1, city, state, zip, timezone, walk_ins_enabled)
values ('The Spot Barbershop', 'the-spot', '561-429-3732', '4618 S. Jog Rd.', 'Greenacres', 'FL', '33467', 'America/New_York', true);

-- Get shop ID for seeding
do $$
declare
  shop_uuid uuid;
  manny_uuid uuid;
  sammy_uuid uuid;
begin
  select id into shop_uuid from public.shops where slug = 'the-spot';

  -- Barbers
  insert into public.barbers (shop_id, first_name, last_name, display_name, is_owner, sort_order)
  values (shop_uuid, 'Manuel', 'De La Torre', 'Manny', true, 1)
  returning id into manny_uuid;

  insert into public.barbers (shop_id, first_name, last_name, display_name, is_owner, sort_order)
  values (shop_uuid, 'Samuel', 'De La Torre', 'Sammy', true, 2)
  returning id into sammy_uuid;

  -- Services
  insert into public.services (shop_id, name, description, duration_minutes, price, category, sort_order) values
    (shop_uuid, 'Regular Men''s Haircut', 'Precision cut tailored to your style', 30, 30.00, 'Haircuts', 1),
    (shop_uuid, 'Haircut with Beard Trim', 'Full cut plus beard shape and lineup', 40, 35.00, 'Haircuts', 2),
    (shop_uuid, 'Haircut with Beard & Eyebrows', 'The complete grooming package', 45, 38.00, 'Haircuts', 3),
    (shop_uuid, 'Shape Up', 'Clean edges, hairline, and lineup only', 15, 15.00, 'Haircuts', 4),
    (shop_uuid, 'Shape Up with Beard', 'Edge work plus a full beard cleanup', 20, 21.00, 'Haircuts', 5),
    (shop_uuid, 'Hot Towel Shave', 'Classic straight-razor experience', 30, 30.00, 'Shaves', 6),
    (shop_uuid, 'Hot Towel Shave with Haircut', 'The ultimate barbershop experience', 60, 50.00, 'Shaves', 7),
    (shop_uuid, 'Kid''s Haircut', 'Ages 12 and under', 25, 23.00, 'Haircuts', 8),
    (shop_uuid, 'Senior Haircut', 'Senior discount cut', 25, 21.00, 'Haircuts', 9);

  -- Barber services (both barbers do all services)
  insert into public.barber_services (barber_id, service_id)
  select manny_uuid, id from public.services where shop_id = shop_uuid;

  insert into public.barber_services (barber_id, service_id)
  select sammy_uuid, id from public.services where shop_id = shop_uuid;

  -- Barber schedules (Tue-Fri 11-7, Sat 10-6)
  insert into public.barber_schedules (barber_id, day_of_week, start_time, end_time, is_available) values
    (manny_uuid, 0, '11:00', '19:00', false),  -- Sunday off
    (manny_uuid, 1, '11:00', '19:00', false),  -- Monday off
    (manny_uuid, 2, '11:00', '19:00', true),   -- Tuesday
    (manny_uuid, 3, '11:00', '19:00', true),   -- Wednesday
    (manny_uuid, 4, '11:00', '19:00', true),   -- Thursday
    (manny_uuid, 5, '11:00', '19:00', true),   -- Friday
    (manny_uuid, 6, '10:00', '18:00', true),   -- Saturday
    (sammy_uuid, 0, '11:00', '19:00', false),
    (sammy_uuid, 1, '11:00', '19:00', false),
    (sammy_uuid, 2, '11:00', '19:00', true),
    (sammy_uuid, 3, '11:00', '19:00', true),
    (sammy_uuid, 4, '11:00', '19:00', true),
    (sammy_uuid, 5, '11:00', '19:00', true),
    (sammy_uuid, 6, '10:00', '18:00', true);
end $$;
