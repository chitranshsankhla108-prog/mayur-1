-- ============================================================
-- 0008_dealer_role_pricing.sql
-- Adds the `dealer` role and dealer-only product pricing.
-- Idempotent: safe to re-run.
--
-- IMPORTANT: this file only ADDS the 'dealer' enum value and the
-- dealer_price column — it never inserts/uses a row with role='dealer'
-- in the same transaction (Postgres forbids using a newly-added enum
-- value in the same tx that added it).
-- ============================================================

-- ---------- ROLE: add 'dealer' ----------
-- Final user_role set: customer | dealer | admin | staff
alter type user_role add value if not exists 'dealer';

-- ---------- PRODUCTS: dealer price ----------
-- dealer_price is OPTIONAL. When NULL, dealers fall back to the public price.
-- price            = public / customer price
-- dealer_price     = dealer-only price (NULL => same as public)
-- compare_at_price = optional old public price (strikethrough)
alter table public.products
  add column if not exists dealer_price numeric(12,2);

-- ---------- ORDER ITEMS: record which price was charged ----------
-- 'public' | 'dealer' — preserves, per line, whether the dealer price was used
-- at checkout time. Past orders never change when product prices change later.
alter table public.order_items
  add column if not exists price_type text;

-- ---------- SEED: give the sample catalog dealer prices ----------
-- Dealer price ~= 90% of public price for the seeded demo products.
-- Only fills rows that don't already have a dealer price set.
update public.products p
set dealer_price = round((p.price * 0.9) / 100) * 100
where p.dealer_price is null
  and p.slug in (
    '150ah-tubular-battery',
    '1100va-sine-wave-inverter',
    '5mp-cctv-camera',
    '8-channel-dvr',
    'solar-charge-controller-20a',
    'copper-electrical-cable',
    'cat6-networking-cable'
  );

-- ============================================================
-- SECURITY NOTE (dealer_price exposure)
-- ------------------------------------------------------------
-- products is a publicly-readable table (RLS: is_active OR is_admin()).
-- Postgres RLS is row-level, not column-level, so dealer_price cannot be
-- hidden from anon via a policy alone. The application layer enforces this:
-- the storefront query helpers (src/lib/queries.ts) only SELECT dealer_price
-- for logged-in dealer/admin/staff users — public/customer queries never
-- request the column, so it is never serialised to the browser for them.
-- Mutations remain protected by the existing products_admin_write policy.
-- ============================================================
