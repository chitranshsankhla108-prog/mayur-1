# Supabase setup — Mayur Electronics

Reliable, documented auth + roles + RLS. Follow this top to bottom.

## How profiles & roles work

- Supabase Auth stores users in **`auth.users`**.
- Every user gets exactly one row in **`public.profiles`**, where
  **`profiles.user_id === auth.users.id`**. We never use `profiles.id` for auth
  joins — all queries and RLS use **`auth.uid() = user_id`**.
- A row is created **automatically on signup** by the `on_auth_user_created`
  trigger → `handle_new_user()`. Default `role = 'customer'`.
- Roles: `customer` | `staff` | `admin`. Admin access is decided **only** by
  `profiles.role`, surfaced through the `is_admin()` SQL helper. There is no
  email allow‑list — set the role in `profiles` and you are in.

> **Never insert a `profiles` row by hand.** The unique `user_id` and the trigger
> already manage it. To grant admin, just **update the role** (step 4). Hand
> inserts with a mismatched `user_id` are the classic reason "I'm admin in the
> table but `/admin` still blocks me."

## First-time setup

Run the migrations in `supabase/migrations/` **in order**:

| File | What it does |
|------|--------------|
| `0001_core_schema.sql` | tables, signup trigger, `is_admin()` |
| `0002_rls_policies.sql` | Row Level Security + hardening |
| `0003_seed.sql` | categories, preset templates, template fields |
| `0004_promote_admin.sql` | backfill profiles + promote your admin |

Either paste each into the **Supabase SQL editor**, or with the CLI:

```bash
supabase link --project-ref <your-ref>
supabase db push
```

### Migrating from an older/incompatible schema
If the project already has conflicting tables (e.g. an old `products`/`admin_users`
prototype), uncomment the `drop table ...` block at the top of `0001_core_schema.sql`
once, then run the migrations.

## Environment

Copy `.env.example` → `.env.local` and set:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server only — bypasses RLS, never expose
```

## 4) Make yourself admin

After you have **signed up** in the app (so `auth.users` + the profile exist):

```sql
update public.profiles set role = 'admin'
where email = 'you@example.com';
```

Then **sign out and back in** (or refresh) so the session/middleware re-reads the
role. That's it — `/admin` now opens.

## Route protection (in the app)

- `src/lib/auth.ts` exposes `getCurrentUser()`, `getCurrentProfile()`, `isAdmin()`,
  `isStaffOrAdmin()`, `requireAuth()`, `requireAdmin()`.
- `src/middleware.ts` → `src/lib/supabase/middleware.ts` refreshes the session and:
  - `/account/*` → requires a logged-in user.
  - `/admin/*` (except `/admin/login`) → requires `role in (admin, staff)`;
    customers are redirected to `/`.

## End-to-end verification

1. Register a customer → a `profiles` row appears with `role = 'customer'`.
2. Customer can open `/account`, is redirected away from `/admin`.
3. `update profiles set role='admin' where email=...` → sign out/in.
4. `/admin` opens. Admin can create category → template → product, upload an
   image via Cloudinary.
5. Public/anon can read active products & categories; inactive ones are hidden.

## Debugging admin issues

Set `SUPABASE_DEBUG_AUTH=true` in `.env.local`. The middleware then logs, per
protected request: whether a user is present, the resolved profile role, and the
exact reason an `/admin` request was allowed or blocked. Remove the flag when done.

Quick SQL sanity check (run in SQL editor):

```sql
select p.email, p.role, (p.user_id = u.id) as id_matches
from public.profiles p join auth.users u on u.id = p.user_id;
```

`id_matches` must be `true` and `role` must be `admin`/`staff`.

## Manual auth setting to enable (dashboard)

Authentication → Providers → Email → enable **"Leaked password protection"**
(HaveIBeenPwned). Recommended; can't be set via SQL.
