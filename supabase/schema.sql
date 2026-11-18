-- =========================================================
-- iMobile — Supabase schema
-- Run this once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run: it drops and recreates the policies and trigger.
-- =========================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------
-- Admins: users listed here can use the dashboard
-- ---------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------
-- Products (everything except visibility/stock/order lives in "data")
-- ---------------------------------------------------------
create table if not exists public.products (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  visible boolean not null default true,
  stock integer not null default 10 check (stock >= 0),
  position integer not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Site content + settings (one JSON row each)
--   content  – texts edited in Dashboard → Site content (public)
--   settings – delivery fee, colours… (public)
--   private  – notification email (admins only)
-- ---------------------------------------------------------
create table if not exists public.site_config (
  id text primary key check (id in ('content', 'settings', 'private')),
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Orders from checkout
-- ---------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  created_at timestamptz not null default now(),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  customer jsonb not null,
  items jsonb not null,
  subtotal integer not null default 0,
  delivery integer not null default 0,
  total integer not null default 0,
  payment text not null default 'M-Pesa' check (payment in ('M-Pesa', 'Card', 'Cash on delivery')),
  note text not null default '' check (length(note) <= 1000),
  notes text not null default ''
);

-- ---------------------------------------------------------
-- Contact-form inbox
-- ---------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (length(name) between 1 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text not null default '' check (length(phone) <= 40),
  topic text not null default 'General' check (length(topic) <= 80),
  message text not null check (length(message) between 1 and 5000),
  status text not null default 'unread' check (status in ('unread', 'read', 'replied', 'archived')),
  replies jsonb not null default '[]'::jsonb
);

-- ---------------------------------------------------------
-- Newsletter
-- ---------------------------------------------------------
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Orders are priced on the server: whatever the browser sends,
-- prices, totals and delivery are recalculated from the products
-- table, and stock is reduced.
-- ---------------------------------------------------------
create or replace function public.price_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  it jsonb;
  p public.products;
  step integer := 0;
  fee integer := 0;
  free_from integer := 0;
  sub integer := 0;
  qty integer;
  unit integer;
  idx integer;
  priced jsonb := '[]'::jsonb;
begin
  select coalesce((value->>'storage_step')::int, 0),
         coalesce((value->>'delivery_fee')::int, 0),
         coalesce((value->>'free_delivery_from')::int, 0)
    into step, fee, free_from
    from public.site_config where id = 'settings';
  step := coalesce(step, 0); fee := coalesce(fee, 0); free_from := coalesce(free_from, 0);

  if jsonb_typeof(new.items) <> 'array' or jsonb_array_length(new.items) = 0 or jsonb_array_length(new.items) > 30 then
    raise exception 'Order has no items';
  end if;

  for it in select * from jsonb_array_elements(new.items) loop
    select * into p from public.products where id = it->>'id' and visible;
    if not found then raise exception 'Unknown product %', it->>'id'; end if;

    qty := greatest(1, least(10, coalesce((it->>'qty')::int, 1)));
    if p.stock < qty then raise exception '% is out of stock', p.data->>'name'; end if;

    idx := 0;
    if it->>'storage' is not null and jsonb_typeof(p.data->'storage') = 'array' then
      select coalesce(max(ord) - 1, 0) into idx
        from jsonb_array_elements_text(p.data->'storage') with ordinality as s(v, ord)
       where v = it->>'storage';
    end if;

    unit := (p.data->>'price')::int + idx * step;
    priced := priced || jsonb_build_object(
      'id', p.id, 'name', p.data->>'name', 'color', left(coalesce(it->>'color', ''), 60),
      'storage', it->>'storage', 'qty', qty, 'unit', unit);
    sub := sub + unit * qty;

    update public.products set stock = stock - qty where id = p.id;
  end loop;

  new.items    := priced;
  new.subtotal := sub;
  new.delivery := case when sub >= free_from or sub = 0 then 0 else fee end;
  new.total    := sub + new.delivery;
  new.status   := 'pending';
  new.notes    := '';
  return new;
end;
$$;

drop trigger if exists orders_price on public.orders;
create trigger orders_price before insert on public.orders
  for each row execute function public.price_order();

-- ---------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------
alter table public.admins      enable row level security;
alter table public.products    enable row level security;
alter table public.site_config enable row level security;
alter table public.orders      enable row level security;
alter table public.messages    enable row level security;
alter table public.subscribers enable row level security;

-- admins: you can see your own row (used by is_admin through security definer anyway)
drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select to authenticated using (user_id = auth.uid());

-- products: everyone reads visible products, admins do everything
drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select using (visible or public.is_admin());
drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- site_config: content + settings are public, private is admin-only
drop policy if exists "config public read" on public.site_config;
create policy "config public read" on public.site_config for select
  using (id in ('content', 'settings') or public.is_admin());
drop policy if exists "config admin write" on public.site_config;
create policy "config admin write" on public.site_config for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- orders: anyone can place one, only admins can read/change
drop policy if exists "orders public insert" on public.orders;
create policy "orders public insert" on public.orders for insert to anon, authenticated with check (true);
drop policy if exists "orders admin" on public.orders;
create policy "orders admin" on public.orders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- messages: anyone can send one, only admins can read/change
drop policy if exists "messages public insert" on public.messages;
create policy "messages public insert" on public.messages for insert to anon, authenticated
  with check (status = 'unread' and replies = '[]'::jsonb);
drop policy if exists "messages admin" on public.messages;
create policy "messages admin" on public.messages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- subscribers: anyone can sign up, only admins can see the list
drop policy if exists "subscribers public insert" on public.subscribers;
create policy "subscribers public insert" on public.subscribers for insert to anon, authenticated with check (true);
drop policy if exists "subscribers admin" on public.subscribers;
create policy "subscribers admin" on public.subscribers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------
-- Product photos: public bucket, admins upload
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects for select
  using (bucket_id = 'product-images');
drop policy if exists "product images admin write" on storage.objects;
create policy "product images admin write" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ---------------------------------------------------------
-- Live dashboard updates (new messages / orders pop up instantly)
-- ---------------------------------------------------------
do $$
begin
  begin alter publication supabase_realtime add table public.messages; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.orders; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.subscribers; exception when duplicate_object then null; end;
end $$;

-- ---------------------------------------------------------
-- LAST STEP — make yourself an admin.
-- 1. Authentication → Users → Add user (email + password, "Auto confirm").
-- 2. Replace the email below and run just this line:
--
-- insert into public.admins (user_id) select id from auth.users where email = 'you@yourstore.co.ke';
-- ---------------------------------------------------------
