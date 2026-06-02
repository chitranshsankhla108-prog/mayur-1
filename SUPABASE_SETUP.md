# Supabase Setup — Mayur Electronics

This document explains how to configure Supabase for the storefront + admin,
run the migrations, create/promote an admin, and verify access.

## 1. Required environment variables

Put these in `.env.local` (copy from `.env`):

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL (client + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key (RLS-bound) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ (server) | Service-role key for trusted server operations. **Never expose to the client.** |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | for uploads | Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | for uploads | **Unsigned** upload preset |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | optional | Server-side Cloudinary (not required for unsigned upload) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` | for online pay | Razorpay. If left as the `rzp_test_xxxxxxxx` placeholder, online payments are treated as **not configured** and checkout falls back gracefully (COD always works). |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | for WhatsApp | International format, digits only (e.g. `919829266287`) |
| `NEXT_PUBLIC_SITE_URL` | optional | Used in metadata / links |
| `SUPABASE_DEBUG_AUTH` | optional | Set `true` to log middleware auth decisions to the server console |

## 2. Run the migrations

Run, **in order**, the files in [`supabase/migrations`](supabase/migrations) using the
Supabase **SQL Editor**, or with the CLI:

```bash
supabase db push
```

| File | What it does |
|---|---|
| `0001_core_schema.sql` | Enums, tables, signup trigger (`handle_new_user`), `is_admin()` |
| `0002_rls_policies.sql` | RLS for every table (public read catalog, owner-only carts/orders, admin writes) |
| `0003_seed.sql` | 7 categories + 6 preset spec templates (Battery, Inverter, CCTV, DVR/NVR, Solar, Electrical) |
| `0004_promote_admin.sql` | Promotes your real admin email (edit it first) |
| `0005_seed_products.sql` | 7 sample products with specs (idempotent, keyed by slug) |
| `0006_dev_test_accounts.sql` | **Dev only** — creates the test accounts below |
| `0007_performance_indexes.sql` | Listing/lookup indexes |
| `0008_dealer_role_pricing.sql` | Adds the `dealer` role, `products.dealer_price`, `order_items.price_type`, and seeds dealer prices |

All migrations are idempotent — safe to re-run.

## 3. How profiles & roles work

- Every `auth.users` row gets a matching `public.profiles` row automatically via the
  `on_auth_user_created` trigger. `profiles.user_id == auth.users.id`.
- The role lives in `profiles.role` — one of `customer` (default), `dealer`, `staff`, `admin`.
- RLS uses `public.is_admin()` (SECURITY DEFINER) which returns true for `admin`/`staff`.
- `dealer` is a normal customer who sees **dealer pricing** (see §7). Dealers use the
  same storefront and account dashboard as customers.
- Middleware (`src/lib/supabase/middleware.ts`) protects `/account` (any logged-in user)
  and `/admin` (admin/staff only), reading `profiles.role` by `user_id`.

## 4. Create / promote an admin

Register normally through `/register`, then promote:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
-- staff (limited admin) instead:
update public.profiles set role = 'staff' where email = 'colleague@example.com';
```

`0006_dev_test_accounts.sql` already creates and promotes a dev admin.

## 5. Verify access

```sql
-- See every user and their role
select u.email, p.role
from auth.users u join public.profiles p on p.user_id = u.id
order by u.email;
```

To verify RLS as a specific user (in the SQL editor):

```sql
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub','<USER_UUID>','role','authenticated')::text, true);

select public.is_admin();              -- true only for admin/staff
select count(*) from orders;           -- customer: own only; admin: all
select count(*) from products;         -- everyone: active products
```

In the app:
- Customer logs in → can reach `/account`, **redirected away from `/admin`**.
- Admin logs in → can reach `/admin` and all sub-pages.

## 6. Dealer role & dealer pricing

Each product has two prices:

- `price` — **public price**, shown to every visitor and to `customer` accounts.
- `dealer_price` — **dealer-only price**, shown only to logged-in `dealer` accounts
  (also visible to `admin`/`staff` in the admin UI). `NULL` ⇒ dealers fall back to
  the public price.
- `compare_at_price` — optional old public price (struck through).

How it is enforced:

- The storefront query helpers in `src/lib/queries.ts` only **SELECT** `dealer_price`
  for `dealer`/`admin`/`staff`. Public and customer queries never request the column,
  so it is never serialised to their browser. (Postgres RLS is row-level, not
  column-level, so this gate lives in the app layer — see the note in
  `0008_dealer_role_pricing.sql`.)
- Pricing decisions are centralised in `src/lib/pricing.ts`
  (`getDisplayPrice`, `isDealerPriceActive`, `getPriceLabel`, `getPriceType`).
- The cart stores the **effective unit price** at add-time; checkout writes it to
  `order_items.unit_price` plus `order_items.price_type` (`public` | `dealer`), so
  past orders never change if a product's price changes later.

### Promote a user to dealer (or back)

By email, in the SQL editor:

```sql
-- Make a user a dealer (they will see dealer pricing on next page load / re-login):
update public.profiles set role = 'dealer' where email = 'dealer@example.com';

-- Revert a dealer back to a normal customer:
update public.profiles set role = 'customer' where email = 'dealer@example.com';
```

Or from the app: **Admin → Customers** → change the user's role in the **Role**
dropdown (admin-only; backed by `PATCH /api/admin/customers/[id]/role`).

### Setting dealer prices

In **Admin → Add/Edit Product**, the pricing section has **Public Price** (required),
**Dealer Price** (optional), and **Compare at price** (optional). Leave Dealer Price
blank to charge dealers the public price.

## 7. Dev test accounts

Created by `0006_dev_test_accounts.sql` (development only — do not use in production):

| Role | Email | Password |
|---|---|---|
| Customer | `customer@test.com` | `Test123456!` |
| Admin | `admin@test.com` | `Admin123456!` |
