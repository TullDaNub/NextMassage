-- Database Schema for Massage Parlor Booking Web Application
-- Designed for Supabase PostgreSQL

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "btree_gist";

-- 1. CUSTOMERS Table
create table public.customers (
    id uuid primary key default uuid_generate_v4(),
    name varchar(100) not null,
    phone varchar(20) not null,
    created_at timestamp with time zone default now()
);

-- 2. MASSEUSES Table
create table public.masseuses (
    id uuid primary key default uuid_generate_v4(),
    name varchar(100) not null,
    nickname varchar(50),
    photo_url varchar(255),
    status varchar(20) default 'available' check (status in ('available', 'queued', 'in_session', 'break', 'off_duty')),
    session_started_at timestamp with time zone,
    current_service_duration_min int,
    working_schedule jsonb, -- e.g. {"monday": ["09:00", "21:00"], ...}
    is_active boolean default true,
    created_at timestamp with time zone default now()
);

-- 3. SERVICES Table
create table public.services (
    id uuid primary key default uuid_generate_v4(),
    name varchar(100) not null,
    description text,
    duration_minutes int not null,
    price decimal(10, 2) not null,
    category varchar(50),
    image_url varchar(255),
    is_active boolean default true,
    created_at timestamp with time zone default now()
);

-- 4. MASSEUSE_SERVICES (Many-to-Many Mapping)
create table public.masseuse_services (
    masseuse_id uuid references public.masseuses(id) on delete cascade,
    service_id uuid references public.services(id) on delete cascade,
    primary key (masseuse_id, service_id)
);

-- 5. ROOMS Table
create table public.rooms (
    id uuid primary key default uuid_generate_v4(),
    name varchar(50) not null,
    type varchar(20) default 'air_con' check (type in ('air_con', 'non_air_con')),
    capacity int default 1,
    status varchar(20) default 'active' check (status in ('active', 'maintenance')),
    created_at timestamp with time zone default now()
);

-- 6. APPOINTMENTS Table
create table public.appointments (
    id uuid primary key default uuid_generate_v4(),
    booking_code varchar(20) unique not null,
    customer_id uuid references public.customers(id) on delete set null,
    masseuse_id uuid references public.masseuses(id) on delete set null,
    service_id uuid references public.services(id) on delete set null,
    room_id uuid references public.rooms(id) on delete set null,
    appointment_date date not null,
    start_time time not null,
    end_time time not null,
    status varchar(20) default 'confirmed' check (status in ('confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    total_price decimal(10, 2) not null,
    notes text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 7. APPOINTMENT_STATUS_LOG Table
create table public.appointment_status_log (
    id uuid primary key default uuid_generate_v4(),
    appointment_id uuid references public.appointments(id) on delete cascade,
    old_status varchar(20),
    new_status varchar(20) not null,
    changed_by varchar(50) default 'system',
    changed_at timestamp with time zone default now()
);

-- Constraints
-- ป้องกัน Double-booking ห้อง (ช่วงเวลาเดียวกัน วันเดียวกัน)
alter table public.appointments 
add constraint unique_room_slot 
exclude using gist (
    room_id with =,
    appointment_date with =,
    tsrange(
        (appointment_date + start_time)::timestamp, 
        (appointment_date + end_time)::timestamp
    ) with &&
) where (status not in ('cancelled', 'no_show'));

-- ป้องกัน Double-booking พนักงาน (ช่วงเวลาเดียวกัน วันเดียวกัน)
alter table public.appointments 
add constraint unique_masseuse_slot 
exclude using gist (
    masseuse_id with =,
    appointment_date with =,
    tsrange(
        (appointment_date + start_time)::timestamp, 
        (appointment_date + end_time)::timestamp
    ) with &&
) where (status not in ('cancelled', 'no_show'));

-- Row Level Security (RLS)
-- Enable RLS for all tables
alter table public.customers enable row level security;
alter table public.masseuses enable row level security;
alter table public.services enable row level security;
alter table public.rooms enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_status_log enable row level security;
alter table public.masseuse_services enable row level security;

-- Basic Policies (Update these for production)
create policy "Allow public read access to services" on public.services for select using (true);
create policy "Allow public read access to masseuses" on public.masseuses for select using (true);
create policy "Allow public read access to rooms" on public.rooms for select using (true);
-- Customers can insert their own data, read own data (or we just use anon key for now)
create policy "Allow anon insert to customers" on public.customers for insert with check (true);
create policy "Allow anon select to customers" on public.customers for select using (true);
-- Appointments
create policy "Allow anon insert to appointments" on public.appointments for insert with check (true);
create policy "Allow anon select to appointments" on public.appointments for select using (true);
create policy "Allow anon update to appointments" on public.appointments for update using (true);

-- Trigger for updated_at on appointments
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on public.appointments
for each row
execute function public.handle_updated_at();

-- Disable RLS for easy testing natively since we are making an MVP.
-- (Can be revoked later or handled by server code with service role)
