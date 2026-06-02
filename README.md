# Mayur Electronics — Premium Electronics E-Commerce

A modern, production-ready electronics commerce platform (inverters, batteries,
CCTV, DVR/NVR, solar & electrical accessories) built with a premium black / crimson
design system.

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + shadcn-style UI primitives (Radix)
- **Supabase** — Postgres database + Auth (role-based)
- **Cloudinary** — product image uploads (unsigned preset)
- **Razorpay** — payments (UPI / card / netbanking) + COD fallback
- **Zustand** — cart & wishlist (localStorage persisted)
- Vercel-ready

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev
```

Open http://localhost:3000

> **Supabase is the source of truth.** The storefront and admin read live data from
> the database. If the DB is unreachable or empty, pages fall back to bundled sample
> data (`src/lib/sample-data.ts`) so the site never renders blank. Cloudinary uploads
> and Razorpay activate automatically once their environment variables are set.
>
> See **[`SUPABASE_SETUP.md`](SUPABASE_SETUP.md)** for full setup, migrations, admin
> promotion and verification, and **[`WORKFLOW_TEST_REPORT.md`](WORKFLOW_TEST_REPORT.md)**
> for the end-to-end audit results and test credentials.

## Environment Variables

See `.env.example`. Summary:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin operations |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` / `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Image uploads |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary server (optional) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Payments |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp inquiry button |

## Database Setup

Run the migrations in [`supabase/migrations`](supabase/migrations) **in order** via the
Supabase SQL Editor (or `supabase db push`):

| File | Purpose |
|---|---|
| `0001_core_schema.sql` | Tables, signup trigger, `is_admin()` helper |
| `0002_rls_policies.sql` | Row Level Security policies |
| `0003_seed.sql` | Categories + preset spec templates |
| `0004_promote_admin.sql` | Promote a real admin (edit the email inside) |
| `0005_seed_products.sql` | Sample storefront products + specs |
| `0006_dev_test_accounts.sql` | **Dev only** — test customer/admin accounts |

Promote any registered user to admin:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Then create an **unsigned** Cloudinary upload preset and set the env vars.
Full details and verification queries are in **[`SUPABASE_SETUP.md`](SUPABASE_SETUP.md)**.

## Project Structure

```
src/
  app/
    (public)/            Storefront (header/footer): home, products, cart, checkout, account
    admin/(panel)/       Admin dashboard (sidebar): products, categories, templates, orders…
    admin/login/         Admin sign-in (no sidebar)
    login, register, …   Auth pages (split-screen)
    api/                 checkout, razorpay/verify, admin/products, admin/orders
  components/
    ui/                  Button, Input, Select, Dialog… (shadcn-style)
    layout/ shared/ home/ shop/ checkout/ auth/ account/ admin/
  lib/
    supabase/            client / server / middleware
    store/               cart & wishlist (zustand)
    cloudinary.ts razorpay.ts sample-data.ts constants.ts utils.ts
  types/                 Domain types
supabase/
  schema.sql  seed.sql
```

## Key Features

- **Homepage** — hero with floating product composition, trust strip, categories,
  featured products, brand showcase, services, testimonials, FAQ.
- **Catalog** — product listing with filters/sort/search, category pages, rich
  product detail with gallery + specs + WhatsApp inquiry.
- **Cart & Checkout** — single-page two-column checkout, delivery options, GST,
  coupons (`MAYUR10`), Razorpay + COD, order success with invoice print.
- **Auth** — Supabase email/password, role-based redirects, route protection via
  middleware (`/account`, `/admin`).
- **Customer dashboard** — orders, wishlist, addresses, profile.
- **Admin dashboard** — stats, products table, **dynamic category/template product
  builder**, Cloudinary uploader, orders with status updates, customers, settings.

## Notes

- Without Supabase/Cloudinary/Razorpay configured the app gracefully degrades to a
  fully browsable demo (sample data, local image previews, simulated order success).
- Promote staff with `role = 'staff'` for limited admin access.

---

Built as a real, daily-use business platform — not a throwaway template.
