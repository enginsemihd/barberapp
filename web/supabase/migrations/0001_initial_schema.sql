-- Faz 1: çekirdek şema + RLS
-- bkz. docs/barberapp.md → "Veri Modeli"

create extension if not exists btree_gist;

-- ---------------------------------------------------------------------------
-- Tablolar
-- ---------------------------------------------------------------------------

create table shop_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  phone text,
  logo_url text,
  timezone text not null default 'Europe/Istanbul',
  cancellation_window_hours int not null default 6,
  deposit_percent int not null default 50 check (deposit_percent between 0 and 100),
  created_at timestamptz not null default now()
);

create table staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  photo_url text,
  bio text,
  phone text,
  role text not null check (role in ('owner', 'barber')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes int not null check (duration_minutes > 0),
  price numeric(10, 2) not null check (price >= 0),
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table staff_services (
  staff_id uuid not null references staff (id) on delete cascade,
  service_id uuid not null references services (id) on delete cascade,
  duration_minutes_override int check (duration_minutes_override > 0),
  price_override numeric(10, 2) check (price_override >= 0),
  primary key (staff_id, service_id)
);

create table staff_schedules (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff (id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  check (end_time > start_time)
);

create table staff_time_off (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff (id) on delete cascade,
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  reason text,
  check (end_datetime > start_datetime)
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  notification_channel text not null default 'whatsapp' check (notification_channel in ('whatsapp', 'sms')),
  notes text,
  created_at timestamptz not null default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  staff_id uuid not null references staff (id) on delete cascade,
  service_id uuid not null references services (id) on delete restrict,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  price numeric(10, 2) not null,
  deposit_amount numeric(10, 2) not null,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'deposit_paid', 'paid_in_full')),
  notes text,
  created_at timestamptz not null default now(),
  check (end_time > start_time),
  -- Aynı berbere çakışan iki randevu asla kaydedilemez (race condition dahil,
  -- veritabanı seviyesinde). İptal edilen randevular çakışma kontrolüne girmez.
  exclude using gist (
    staff_id with =,
    tstzrange (start_time, end_time) with &&
  ) where (status not in ('cancelled'))
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments (id) on delete cascade,
  amount numeric(10, 2) not null check (amount >= 0),
  provider text not null default 'iyzico',
  provider_ref text,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

create table notifications_log (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments (id) on delete cascade,
  type text not null check (type in ('sms', 'whatsapp')),
  purpose text not null check (purpose in ('confirmation', 'reminder_24h', 'reminder_2h')),
  sent_at timestamptz not null default now(),
  status text not null default 'sent' check (status in ('sent', 'failed'))
);

-- ---------------------------------------------------------------------------
-- Yardımcı fonksiyonlar (RLS politikalarında kullanılır)
-- ---------------------------------------------------------------------------

create function current_staff_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from staff where user_id = auth.uid();
$$;

create function current_staff_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from staff where user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table shop_settings enable row level security;
alter table staff enable row level security;
alter table services enable row level security;
alter table staff_services enable row level security;
alter table staff_schedules enable row level security;
alter table staff_time_off enable row level security;
alter table customers enable row level security;
alter table appointments enable row level security;
alter table payments enable row level security;
alter table notifications_log enable row level security;

-- Herkes (giriş yapmamış ziyaretçi dahil) dükkan/hizmet/berber bilgisini
-- görebilir — randevu alma akışı bu bilgiyi göstermek zorunda.
create policy "shop_settings: public read" on shop_settings for select using (true);
create policy "staff: public read active" on staff for select using (is_active);
create policy "services: public read active" on services for select using (is_active);
create policy "staff_services: public read" on staff_services for select using (true);
create policy "staff_schedules: public read" on staff_schedules for select using (true);

-- Yazma: sadece owner.
create policy "shop_settings: owner write" on shop_settings for all
  using (current_staff_role() = 'owner') with check (current_staff_role() = 'owner');
create policy "staff: owner write" on staff for all
  using (current_staff_role() = 'owner') with check (current_staff_role() = 'owner');
create policy "services: owner write" on services for all
  using (current_staff_role() = 'owner') with check (current_staff_role() = 'owner');
create policy "staff_services: owner write" on staff_services for all
  using (current_staff_role() = 'owner') with check (current_staff_role() = 'owner');
create policy "staff_schedules: owner write" on staff_schedules for all
  using (current_staff_role() = 'owner') with check (current_staff_role() = 'owner');

-- staff_time_off: owner her berber için, berber sadece kendisi için girebilir.
create policy "staff_time_off: staff read" on staff_time_off for select
  using (current_staff_role() is not null);
create policy "staff_time_off: owner or self write" on staff_time_off for all
  using (current_staff_role() = 'owner' or staff_id = current_staff_id())
  with check (current_staff_role() = 'owner' or staff_id = current_staff_id());

-- customers: müşteri sadece kendi kaydını görür/düzenler; staff hepsini görür (CRM).
create policy "customers: self read" on customers for select
  using (user_id = auth.uid() or current_staff_role() is not null);
create policy "customers: self write" on customers for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "customers: self insert" on customers for insert
  with check (user_id = auth.uid());

-- appointments: müşteri sadece kendi randevularını görür; staff kendi
-- randevularını, owner hepsini görür.
create policy "appointments: customer read own" on appointments for select
  using (
    customer_id in (select id from customers where user_id = auth.uid())
    or staff_id = current_staff_id()
    or current_staff_role() = 'owner'
  );
create policy "appointments: customer insert own" on appointments for insert
  with check (customer_id in (select id from customers where user_id = auth.uid()));
create policy "appointments: customer update own" on appointments for update
  using (
    customer_id in (select id from customers where user_id = auth.uid())
    or staff_id = current_staff_id()
    or current_staff_role() = 'owner'
  );

-- payments: müşteri sadece kendi randevusuna ait ödemeyi görür; staff/owner hepsini görür.
-- Yazma yalnızca Edge Function'lar üzerinden (service_role) yapılır, burada insert/update
-- politikası yok — müşteri veya staff doğrudan ödeme kaydı oluşturamaz/değiştiremez.
create policy "payments: read own or staff" on payments for select
  using (
    appointment_id in (
      select id from appointments
      where customer_id in (select id from customers where user_id = auth.uid())
    )
    or current_staff_role() is not null
  );

-- notifications_log: sadece staff/owner görür (dahili log).
create policy "notifications_log: staff read" on notifications_log for select
  using (current_staff_role() is not null);
