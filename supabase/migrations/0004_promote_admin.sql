-- ============================================================
-- 0004_promote_admin.sql
-- Make a user an admin (or staff). Run AFTER the user has signed up,
-- so their auth.users row (and the auto-created profile) already exist.
--
-- The profiles row is created automatically by the on_auth_user_created
-- trigger. This script ONLY flips the role — never insert profiles by hand.
-- ============================================================

-- 1) Backfill: guarantee a profile exists for every auth user
--    (covers users created BEFORE the trigger was installed).
insert into public.profiles (user_id, full_name, email, mobile, role)
select u.id,
       coalesce(u.raw_user_meta_data->>'full_name',''),
       coalesce(u.email,''),
       u.raw_user_meta_data->>'mobile',
       'customer'
from auth.users u
on conflict (user_id) do nothing;

-- 2) Promote by email. Change the address to the account you want as admin.
update public.profiles
set role = 'admin'           -- or 'staff'
where email = 'mayurelectronics2005@gmail.com';

-- 3) Verify (user_id MUST match auth.users.id; role MUST be admin/staff).
select p.email, p.role, (p.user_id = u.id) as id_matches
from public.profiles p
join auth.users u on u.id = p.user_id
where p.role in ('admin','staff');
