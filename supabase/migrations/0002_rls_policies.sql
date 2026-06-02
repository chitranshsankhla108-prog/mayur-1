-- ============================================================
-- 0002_rls_policies.sql
-- Row Level Security. Idempotent (drop policy if exists ... ).
--
-- Roles:
--   public/anon      -> read active catalog only
--   customer         -> own profile, cart, wishlist, addresses, orders
--   admin / staff    -> full catalog + order management (via is_admin())
-- ============================================================

alter table public.profiles          enable row level security;
alter table public.categories         enable row level security;
alter table public.product_templates  enable row level security;
alter table public.template_fields    enable row level security;
alter table public.products           enable row level security;
alter table public.product_specs      enable row level security;
alter table public.product_images     enable row level security;
alter table public.cart_items         enable row level security;
alter table public.wishlist_items     enable row level security;
alter table public.addresses          enable row level security;
alter table public.orders             enable row level security;
alter table public.order_items        enable row level security;

-- ---- PROFILES ----
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (user_id = auth.uid());

-- ---- CATEGORIES ----
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (is_active or public.is_admin());
drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- PRODUCT TEMPLATES ----
drop policy if exists "templates_public_read" on public.product_templates;
create policy "templates_public_read" on public.product_templates
  for select using (true);
drop policy if exists "templates_admin_write" on public.product_templates;
create policy "templates_admin_write" on public.product_templates
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- TEMPLATE FIELDS ----
drop policy if exists "fields_public_read" on public.template_fields;
create policy "fields_public_read" on public.template_fields
  for select using (true);
drop policy if exists "fields_admin_write" on public.template_fields;
create policy "fields_admin_write" on public.template_fields
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- PRODUCTS ----
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (is_active or public.is_admin());
drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- PRODUCT SPECS ----
drop policy if exists "specs_public_read" on public.product_specs;
create policy "specs_public_read" on public.product_specs
  for select using (true);
drop policy if exists "specs_admin_write" on public.product_specs;
create policy "specs_admin_write" on public.product_specs
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- PRODUCT IMAGES ----
drop policy if exists "images_public_read" on public.product_images;
create policy "images_public_read" on public.product_images
  for select using (true);
drop policy if exists "images_admin_write" on public.product_images;
create policy "images_admin_write" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- CART (owner only) ----
drop policy if exists "cart_owner_all" on public.cart_items;
create policy "cart_owner_all" on public.cart_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---- WISHLIST (owner only) ----
drop policy if exists "wishlist_owner_all" on public.wishlist_items;
create policy "wishlist_owner_all" on public.wishlist_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---- ADDRESSES (owner only) ----
drop policy if exists "addresses_owner_all" on public.addresses;
create policy "addresses_owner_all" on public.addresses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---- ORDERS ----
drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders_insert_self_or_guest" on public.orders;
create policy "orders_insert_self_or_guest" on public.orders
  for insert with check (user_id = auth.uid() or user_id is null);
drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- ---- ORDER ITEMS ----
drop policy if exists "order_items_select_own_or_admin" on public.order_items;
create policy "order_items_select_own_or_admin" on public.order_items
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );
-- Insert allowed only when the parent order belongs to the caller (or is a guest order).
drop policy if exists "order_items_insert" on public.order_items;
create policy "order_items_insert" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or o.user_id is null)
    )
  );

-- ============================================================
-- Security hardening
-- ============================================================
-- handle_new_user() is a trigger function only; never callable via PostgREST RPC.
revoke all on function public.handle_new_user() from public, anon, authenticated;
-- is_admin() intentionally keeps EXECUTE (RLS policies call it; it only reveals
-- the caller's own admin status).
