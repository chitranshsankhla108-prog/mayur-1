-- ============================================================
-- 0001_core_schema.sql
-- Tables, signup trigger, and the is_admin() helper.
-- This is the canonical schema the Next.js app expects.
-- Idempotent: safe to re-run.
-- ============================================================

-- If you are migrating from an older/incompatible prototype schema,
-- uncomment these drops ONCE to remove the conflicting tables:
-- drop table if exists public.admin_users cascade;
-- drop table if exists public.contact_messages cascade;
-- drop table if exists public.orders cascade;
-- drop table if exists public.products cascade;

create extension if not exists "pgcrypto";

-- ---------- ENUMS ----------
do $$ begin
  create type user_role as enum ('customer', 'admin', 'staff');
exception when duplicate_object then null; end $$;

do $$ begin
  create type field_type as enum ('text', 'number', 'select', 'textarea', 'boolean');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pending','confirmed','processing','shipped','delivered','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending','paid','failed','refunded');
exception when duplicate_object then null; end $$;

-- ---------- PROFILES ----------
-- One row per auth user. profiles.user_id ALWAYS equals auth.users.id.
-- All queries and RLS use auth.uid() = user_id.
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null default '',
  mobile text,
  email text not null,
  role user_role not null default 'customer',
  business_name text,
  gst_number text,
  created_at timestamptz not null default now()
);

-- ---------- CATEGORIES ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  icon text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- PRODUCT TEMPLATES ----------
create table if not exists public.product_templates (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  is_preset boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.template_fields (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.product_templates(id) on delete cascade,
  label text not null,
  field_key text not null,
  field_type field_type not null default 'text',
  placeholder text,
  options jsonb,
  is_required boolean not null default false,
  sort_order int not null default 0
);

-- ---------- PRODUCTS ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  sku text,
  brand text,
  category_id uuid references public.categories(id) on delete set null,
  template_id uuid references public.product_templates(id) on delete set null,
  short_description text,
  description text,
  price numeric(12,2) not null default 0,
  compare_at_price numeric(12,2),
  stock_quantity int not null default 0,
  warranty text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_specs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  field_key text not null,
  label text not null,
  value text
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  cloudinary_public_id text,
  is_main boolean not null default false,
  sort_order int not null default 0
);

-- ---------- CART / WISHLIST ----------
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null default 1,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ---------- ADDRESSES ----------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  mobile text not null,
  address_line text not null,
  city text not null,
  state text not null,
  postal_code text not null,
  is_default boolean not null default false
);

-- ---------- ORDERS ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_number text not null unique,
  status order_status not null default 'pending',
  payment_status payment_status not null default 'pending',
  payment_method text not null default 'cod',
  razorpay_order_id text,
  razorpay_payment_id text,
  subtotal numeric(12,2) not null default 0,
  gst_amount numeric(12,2) not null default 0,
  shipping_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  shipping_address jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity int not null default 1,
  unit_price numeric(12,2) not null default 0,
  total_price numeric(12,2) not null default 0
);

-- ---------- INDEXES ----------
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_profiles_user on public.profiles(user_id);

-- ============================================================
-- Signup trigger: auto-create a profiles row for every new auth user.
-- search_path is pinned for SECURITY DEFINER safety.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, email, mobile, business_name, gst_number, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'mobile',
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'gst_number',
    'customer'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- is_admin(): does the current user have role admin or staff?
-- SECURITY DEFINER so it reads profiles without tripping RLS recursion.
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role in ('admin','staff')
  );
$$;
