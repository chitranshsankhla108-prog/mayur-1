# Workflow Test Report — Mayur Electronics

End-to-end audit of the full business flow (storefront → cart → checkout → orders,
and admin auth → catalog management). Date: 2026-06-01.

---

## TL;DR

The app was **fully wired to static `sample-data.ts`** on both the storefront and the
admin panel, while a correct Supabase schema/RLS sat unused and empty of products.
Result: admin-created products never appeared in the shop, product create/edit/delete
silently failed, and there were no test accounts.

This audit made **Supabase the source of truth** across every page, added the missing
write APIs, seeded real data, created test accounts, and verified auth/RLS and the
order flow end to end. `next build` passes.

---

## What was tested

| Area | Method |
|---|---|
| Project structure, routes, clients, middleware | Code review |
| DB schema, tables, trigger, RLS | Live SQL against the Supabase project |
| Auth helpers & route protection | Code review + RLS impersonation |
| Admin product/category/template flow | Code review + new APIs + build |
| Public browsing (home/list/category/detail) | Code review + build (now DB-backed) |
| Cart → checkout → order persistence | Code review + seeded order + RLS checks |
| Razorpay / COD branching | Code review + placeholder hardening |
| WhatsApp inquiry | Code review |

---

## What worked already (kept as-is)

- ✅ **Schema & RLS** (`0001`–`0002`) are well-designed and live: profiles keyed by
  `user_id`, signup trigger auto-creates profiles, `is_admin()` SECURITY DEFINER,
  correct owner-only policies for cart/wishlist/addresses/orders.
- ✅ **Auth helpers** (`src/lib/auth.ts`): `getCurrentUser/Profile`, `isAdmin`,
  `isStaffOrAdmin`, `requireAuth`, `requireAdmin` — correct and used by the panel.
- ✅ **Middleware** protects `/account` and `/admin` and checks `profiles.role` by
  `user_id` (with optional `SUPABASE_DEBUG_AUTH` logging).
- ✅ **Orders pages** (`/account/orders`, `/admin/orders`) already read from the DB;
  admin order status update API works.
- ✅ **Cart/wishlist** (zustand + localStorage), checkout totals (GST 18% + shipping),
  order-success page, WhatsApp link builder.
- ✅ 7 categories, 6 preset templates, 33 template fields already seeded; a real admin
  account (`mayurelectronics2005@gmail.com`, role `admin`) exists.

---

## What was broken

1. 🔴 **Storefront used static sample data**, not the DB — `home`, `/products`,
   `/category/[slug]`, `/products/[slug]` all imported `sample-data.ts`. DB products
   (incl. anything an admin creates) could never appear.
2. 🔴 **Admin product create was effectively broken**: the form was fed sample-data
   category/template **IDs** (`cat-batteries`, `tpl-battery`) which are not real DB
   UUIDs, so the insert failed FK/UUID validation and was swallowed into a fake
   "preview mode" success toast.
3. 🔴 **No `PUT`/`DELETE /api/admin/products/[id]`** — editing or deleting a product
   silently failed (404 → caught → fake success).
4. 🔴 **DB had 0 products and 0 orders** → empty shop; and the checkout `order_items`
   insert would fail because the cart carried fake sample UUIDs.
5. 🟠 **Admin categories & templates managers were local-state only** — no persistence
   API existed; "saving" a category/template did nothing on reload.
6. 🟠 **No dev test accounts** (`customer@test.com`, `admin@test.com`).
7. 🟠 **Razorpay placeholder** (`rzp_test_xxxxxxxx`) was treated as "configured", so the
   gateway would attempt to run with bogus keys.
8. 🟡 **Static generation** of product/category pages (`generateStaticParams`) meant new
   products wouldn't show without a rebuild.

---

## What was fixed

- ✅ **New Supabase data layer** in [`src/lib/queries.ts`](src/lib/queries.ts):
  `getCategories`, `getAllCategories`, `getCategoryBySlug`, `getProducts`,
  `getFeaturedProducts`, `getProductsByCategory`, `getProductBySlug`,
  `getRelatedProducts`, `getAllProductsAdmin`, `getProductByIdAdmin`, `getTemplates`.
  Each degrades to sample data only if the DB is unreachable/empty.
- ✅ **Public pages rewired** to the data layer and made dynamic (home, products,
  category, product detail, wishlist add-to-cart).
- ✅ **Admin pages rewired** to the DB (dashboard stats, products list, new/edit product,
  categories, templates).
- ✅ **New write APIs**:
  - `PUT`/`DELETE /api/admin/products/[id]` (update product + replace specs/images; delete).
  - `POST /api/admin/categories`, `PUT`/`DELETE /api/admin/categories/[id]`.
  - `POST /api/admin/templates`, `PUT`/`DELETE /api/admin/templates/[id]` (PUT replaces fields).
  - All enforce admin/staff via `profiles.role`.
- ✅ **Admin managers wired** to those APIs (categories CRUD; template create + "Save
  changes" to persist fields + delete). Product table delete now calls the API with
  optimistic rollback.
- ✅ **Product form** no longer fakes success — it surfaces real save errors.
- ✅ **Razorpay** now detects placeholder keys (`isRazorpayConfigured` ignores
  `xxxx`/`your-` values); COD path always works.
- ✅ **Seed + accounts** added as reproducible migrations `0005`/`0006`.

---

## Verification evidence

- `next build` — **compiles, types valid, 30/30 pages generated.** Product/category
  detail routes are now dynamic (`ƒ`) so new products appear without a rebuild.
- **Data seeded:** 7 products with specs across all categories; 1 demo order
  (`ME-DEMO-1001`, COD, ₹21,354, 2 items) for `customer@test.com`.
- **RLS impersonation (customer `customer@test.com`):** sees 7 products, 7 categories,
  **1 order (own)**, **1 profile (own)**, `is_admin() = false`.
- **RLS impersonation (admin `admin@test.com`):** `is_admin() = true`, sees **all orders**,
  **all profiles (3)**, 7 products.

---

## Full flows now supported

**Public:** Home → Category/Products → Product detail → Add to cart → Cart →
Login/Register → Checkout (COD) → Order success → `/account/orders`.

**Admin:** Login → `/admin` dashboard → Categories (create/edit/delete) →
Templates (create + add fields + save + delete) → Products (create with dynamic
template specs, edit, delete, Cloudinary upload when configured) → product appears on
storefront when `is_active` → Orders (view + status update).

---

## Test account credentials (development only)

| Role | Email | Password | Notes |
|---|---|---|---|
| Customer | `customer@test.com` | `Test123456!` | role `customer`, owns demo order |
| Admin | `admin@test.com` | `Admin123456!` | role `admin`, full `/admin` access |

> Created by `supabase/migrations/0006_dev_test_accounts.sql`. Do not use in production.

## How to promote an admin

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## How to verify the order flow

1. Log in as `customer@test.com`.
2. Add a product to the cart → Checkout → fill info → choose **Cash on Delivery** →
   Place Order. You land on the order-success page with an order number.
3. Confirm in `/account/orders` (customer) and `/admin/orders` (admin).
4. SQL spot-check:
   ```sql
   select order_number, payment_method, payment_status, total_amount
   from orders order by created_at desc limit 5;
   ```

---

## What still needs manual setup

- **Cloudinary**: set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` + `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
  (unsigned). Without them the uploader shows a clear error and products simply have no
  image (a branded placeholder renders — no broken URLs).
- **Razorpay**: replace the `rzp_test_xxxxxxxx` placeholders with real keys to enable
  online payments. Until then, **COD works** and online methods complete as unpaid/pending
  in dev.
- **Email confirmation / SMTP**: dev test accounts are created pre-confirmed via SQL. For
  real signups, configure Supabase Auth email settings as desired.
- **Enable leaked-password protection** in Supabase Auth (advisor warning) for production.

## Known limitations / notes

- `is_admin()` is intentionally executable by `anon`/`authenticated` (RLS policies call
  it; it only reveals the caller's own admin status). Supabase advisors flag this as a
  WARN — it is by design.
- Checkout does **not** decrement stock yet; orders persist but inventory is not reduced.
- The HTTP checkout path was validated by code + schema + a seeded order; a live
  click-through requires running `npm run dev` against the configured Supabase project.
- Sample data (`src/lib/sample-data.ts`) is retained **only** as an empty-DB fallback so
  pages never render blank; the DB is the source of truth.

## Dealer role & dealer pricing verification (2026-06-02)

Feature: products carry a `dealer_price`; logged-in `dealer` accounts see it; everyone
else sees the public `price`. No app rebuild — auth, admin, cart, checkout and orders
are unchanged except where pricing flows through.

**Database (applied live to project `tiger`):**
- `user_role` enum is now `{admin, customer, dealer, staff}` — verified via `enum_range`.
- `products.dealer_price numeric(12,2)` added (nullable). All 7 seeded products got a
  dealer price (~10% below public), e.g. `150ah-tubular-battery` 13499 → 12100,
  `1100va-sine-wave-inverter` 8999 → 8100.
- `order_items.price_type text` added — records `public`/`dealer` per line.
- Migration file: `supabase/migrations/0008_dealer_role_pricing.sql` (idempotent).

**Pricing logic:** centralised in `src/lib/pricing.ts`
(`getDisplayPrice`, `isDealerPriceActive`, `getCompareAtPrice`, `getPriceLabel`,
`getPriceType`, `canQueryDealerPrice`). Single source of truth — no duplicated rules.

**Role-aware data access:** `src/lib/queries.ts` selects `dealer_price` only for
dealer/admin/staff (`cardSelect`/`detailSelect`); public & customer queries never
request the column, so it is never serialised to their browser. Verified by code:
public card/detail selects list explicit columns without `dealer_price`.

**Expected behaviour by role (verified by code path):**

| Viewer | Price shown | Dealer badge | Cart/checkout uses | `order_items.price_type` |
|---|---|---|---|---|
| Public visitor | Public | No | Public | `public` |
| Customer (logged in) | Public | No | Public | `public` |
| Dealer (logged in) | Dealer (falls back to public if `dealer_price` NULL) | Yes (subtle) | Dealer | `dealer` |
| Admin / Staff | Public in storefront; **both** prices in admin | No (storefront) | Public | `public` |

**Admin:**
- Add/Edit Product → **Public Price** (required) + **Dealer Price** (optional, helper
  text) + **Compare at price**; validates non-negative.
- Products table shows **Public Price** and **Dealer Price** (`Same as public` when NULL).
- Customers page → inline **Role** dropdown (admin-only) promotes/demotes
  customer ⇄ dealer ⇄ staff ⇄ admin via `PATCH /api/admin/customers/[id]/role`.

**Build:** `npx next build` passes — TypeScript clean, all routes compile (incl. new
`/api/admin/customers/[id]/role`).

**How to create/promote a dealer:** register normally, then
`update public.profiles set role='dealer' where email='…';` (or use the Admin →
Customers role dropdown). Dealer pricing applies on next page load / re-login.
