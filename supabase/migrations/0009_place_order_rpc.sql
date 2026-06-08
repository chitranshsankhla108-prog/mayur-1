-- ============================================================
-- 0009_place_order_rpc.sql
-- Authoritative, atomic order placement.
--
-- Fixes (all in one transaction):
--   * Server-side price recomputation — client-sent prices/totals are IGNORED.
--     Unit price is read from products; dealer price applies ONLY when the
--     signed-in caller is a dealer AND the product has a dealer_price.
--   * Stock check + decrement under row lock — prevents overselling.
--   * Order + order_items inserted atomically — no orphaned orders.
--   * Coupon (MAYUR10 = 10%), GST (18%) and shipping computed in the DB.
--
-- SECURITY DEFINER: needs to decrement products.stock_quantity, which RLS
-- otherwise restricts to admins. The function only ever acts for the caller
-- (auth.uid()) or a guest (null), mirroring the orders insert policy.
-- Idempotent.
-- ============================================================

create or replace function public.place_order(
  p_items          jsonb,   -- [{ "product_id": uuid, "quantity": int }]
  p_shipping       jsonb,   -- shipping address object
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
  v_line_total   numeric(12,2);
  v_subtotal     numeric(12,2) := 0;
  v_discount     numeric(12,2) := 0;
  v_gst          numeric(12,2);
  v_shipping     numeric(12,2);
  v_total        numeric(12,2);
  v_order_id     uuid;
  v_order_number text;
  v_attempt      int := 0;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  -- Caller's role drives pricing tier (anon/guest => null => public price).
  select role into v_role from profiles where user_id = v_uid;

  -- Shipping cost is server-controlled, never trusted from the client.
  v_shipping := case lower(coalesce(p_delivery, 'standard'))
                  when 'express' then 149
                  else 0
                end;

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
    user_id, order_number, status, payment_status, payment_method, shipping_address
  ) values (
    v_uid,
    v_order_number,
    case when p_payment_method = 'cod' then 'confirmed'::order_status
         else 'pending'::order_status end,
    'pending'::payment_status,
    coalesce(p_payment_method, 'cod'),
    coalesce(p_shipping, '{}'::jsonb)
  )
  returning id into v_order_id;

  -- Price + reserve each line.
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

    v_line_total := v_unit * v_qty;
    v_subtotal   := v_subtotal + v_line_total;

    update products
       set stock_quantity = stock_quantity - v_qty
     where id = v_pid;

    insert into order_items (
      order_id, product_id, product_name, quantity, unit_price, total_price, price_type
    ) values (
      v_order_id, v_pid, v_product.title, v_qty, v_unit, v_line_total, v_ptype
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

-- Storefront (incl. guest checkout) must be able to call it.
grant execute on function public.place_order(jsonb, jsonb, text, text, text)
  to anon, authenticated;

-- ============================================================
-- NOTE on the Supabase advisor warning for is_admin():
-- The linter flags is_admin() as a SECURITY DEFINER function executable by
-- anon/authenticated. We intentionally LEAVE it executable: it is called from
-- within the RLS policies on products/categories/orders/etc., and PostgreSQL
-- requires the querying role to hold EXECUTE on any function a policy
-- references. Revoking it would break every storefront read/write that hits
-- those policies. The function only ever returns the CALLER'S OWN admin
-- status (a boolean) and reveals no other data, so this is an acceptable warn.
-- ============================================================
