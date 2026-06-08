-- ============================================================
-- 0010_order_details_capture.sql
-- Richer order capture for the admin "order briefing" view, plus a
-- hard requirement that order creation is for AUTHENTICATED users only.
--
-- What this does:
--   * orders: adds updated_at, discount_amount, coupon_code, delivery_method,
--     notes, paid_at (razorpay_order_id / razorpay_payment_id already exist).
--   * order_items: adds product snapshot columns (sku, brand, category, image)
--     so historical orders never change when a product is later edited/deleted.
--   * orders.updated_at is kept fresh via a BEFORE UPDATE trigger.
--   * RLS tightened: guests can no longer insert orders — auth is required.
--   * place_order() rewritten to require auth, capture the product snapshot,
--     and persist discount / coupon / delivery method / customer notes.
--
-- Idempotent: safe to re-run.
-- ============================================================

-- ---------- ORDERS: business fields ----------
alter table public.orders add column if not exists updated_at      timestamptz not null default now();
alter table public.orders add column if not exists discount_amount numeric(12,2) not null default 0;
alter table public.orders add column if not exists coupon_code     text;
alter table public.orders add column if not exists delivery_method text not null default 'standard';
alter table public.orders add column if not exists notes           text;
alter table public.orders add column if not exists paid_at         timestamptz;

-- ---------- ORDER ITEMS: product snapshot ----------
-- Captured at checkout time so an old order's line never shifts if the product
-- price/name/brand/image changes later (or the product is deleted).
alter table public.order_items add column if not exists product_sku       text;
alter table public.order_items add column if not exists product_brand     text;
alter table public.order_items add column if not exists product_category  text;
alter table public.order_items add column if not exists product_image_url text;

-- ---------- updated_at trigger ----------
create or replace function public.touch_orders_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.touch_orders_updated_at();

-- ============================================================
-- RLS: order creation now REQUIRES an authenticated user.
-- (Guest orders are no longer permitted — checkout requires login.)
-- ============================================================
drop policy if exists "orders_insert_self_or_guest" on public.orders;
drop policy if exists "orders_insert_self"          on public.orders;
create policy "orders_insert_self" on public.orders
  for insert with check (user_id = auth.uid());

drop policy if exists "order_items_insert" on public.order_items;
create policy "order_items_insert" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

-- ============================================================
-- place_order() — authoritative, atomic, AUTH-REQUIRED order placement.
-- Re-defined (same signature) to:
--   * reject anonymous callers (AUTH_REQUIRED)
--   * snapshot product sku / brand / category / main image per line
--   * persist discount, coupon code, delivery method and customer notes
-- Everything else (server-side pricing, stock lock + decrement, single
-- transaction) is unchanged from 0009.
-- ============================================================
create or replace function public.place_order(
  p_items          jsonb,   -- [{ "product_id": uuid, "quantity": int }]
  p_shipping       jsonb,   -- shipping address object (may carry a "notes" field)
  p_payment_method text,
  p_delivery       text,    -- 'standard' | 'express' | 'pickup'
  p_coupon         text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid          uuid := auth.uid();
  v_role         user_role;
  v_item         jsonb;
  v_pid          uuid;
  v_qty          int;
  v_product      products%rowtype;
  v_unit         numeric(12,2);
  v_ptype        text;
  v_cat_name     text;
  v_img          text;
  v_line_total   numeric(12,2);
  v_subtotal     numeric(12,2) := 0;
  v_discount     numeric(12,2) := 0;
  v_gst          numeric(12,2);
  v_shipping     numeric(12,2);
  v_total        numeric(12,2);
  v_delivery     text := lower(coalesce(p_delivery, 'standard'));
  v_notes        text := nullif(btrim(coalesce(p_shipping->>'notes', '')), '');
  v_order_id     uuid;
  v_order_number text;
  v_attempt      int := 0;
begin
  -- Auth is mandatory: no guest orders.
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  -- Caller's role drives the pricing tier (dealer vs public).
  select role into v_role from profiles where user_id = v_uid;

  -- Shipping cost is server-controlled, never trusted from the client.
  v_shipping := case v_delivery when 'express' then 149 else 0 end;

  -- Generate a unique order number (retry on the rare collision).
  loop
    v_attempt := v_attempt + 1;
    v_order_number := 'ME' || to_char(now(), 'YYMM') || '-'
                   || lpad(((floor(random() * 9000) + 1000))::int::text, 4, '0');
    exit when not exists (select 1 from orders where order_number = v_order_number);
    if v_attempt > 8 then
      v_order_number := 'ME' || to_char(now(), 'YYMM') || '-'
                     || upper(substr(md5(gen_random_uuid()::text), 1, 6));
      exit;
    end if;
  end loop;

  -- Order shell (amounts filled in after the line items are priced).
  insert into orders (
    user_id, order_number, status, payment_status, payment_method,
    delivery_method, notes, shipping_address
  ) values (
    v_uid,
    v_order_number,
    'pending'::order_status,
    'pending'::payment_status,
    coalesce(p_payment_method, 'razorpay'),
    v_delivery,
    v_notes,
    coalesce(p_shipping, '{}'::jsonb)
  )
  returning id into v_order_id;

  -- Price + reserve each line, capturing a product snapshot.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_pid := (v_item->>'product_id')::uuid;
    v_qty := greatest(coalesce((v_item->>'quantity')::int, 1), 1);

    select * into v_product
      from products
     where id = v_pid and is_active = true
     for update;

    if not found then
      raise exception 'PRODUCT_UNAVAILABLE:%', v_pid;
    end if;
    if v_product.stock_quantity < v_qty then
      raise exception 'OUT_OF_STOCK:%', v_product.title;
    end if;

    if v_role = 'dealer' and v_product.dealer_price is not null then
      v_unit  := v_product.dealer_price;
      v_ptype := 'dealer';
    else
      v_unit  := v_product.price;
      v_ptype := 'public';
    end if;

    -- Snapshot: category name + main (or first) image.
    select name into v_cat_name from categories where id = v_product.category_id;
    select image_url into v_img
      from product_images
     where product_id = v_pid
     order by is_main desc, sort_order asc
     limit 1;

    v_line_total := v_unit * v_qty;
    v_subtotal   := v_subtotal + v_line_total;

    update products
       set stock_quantity = stock_quantity - v_qty
     where id = v_pid;

    insert into order_items (
      order_id, product_id, product_name, product_sku, product_brand,
      product_category, product_image_url, quantity, unit_price, total_price, price_type
    ) values (
      v_order_id, v_pid, v_product.title, v_product.sku, v_product.brand,
      v_cat_name, v_img, v_qty, v_unit, v_line_total, v_ptype
    );
  end loop;

  -- Coupon + tax + total (mirrors the storefront's rounding).
  if upper(coalesce(p_coupon, '')) = 'MAYUR10' then
    v_discount := round(v_subtotal * 0.10);
  end if;
  v_gst   := round((v_subtotal - v_discount) * 0.18);
  v_total := (v_subtotal - v_discount) + v_gst + v_shipping;

  update orders set
    subtotal        = v_subtotal,
    discount_amount = v_discount,
    coupon_code     = case when v_discount > 0 then upper(p_coupon) else null end,
    gst_amount      = v_gst,
    shipping_amount = v_shipping,
    total_amount    = v_total
  where id = v_order_id;

  return jsonb_build_object(
    'id',           v_order_id,
    'order_number', v_order_number,
    'subtotal',     v_subtotal,
    'discount',     v_discount,
    'gst',          v_gst,
    'shipping',     v_shipping,
    'total',        v_total
  );
end;
$$;

-- Login is REQUIRED to place an order. Functions grant EXECUTE to PUBLIC by
-- default, so revoke from PUBLIC (and anon) and grant only to authenticated.
-- Safe here because place_order is NOT referenced by any RLS policy (unlike
-- is_admin()), so removing the broad grant cannot break storefront reads.
revoke execute on function public.place_order(jsonb, jsonb, text, text, text)
  from public, anon;
grant execute on function public.place_order(jsonb, jsonb, text, text, text)
  to authenticated;
