-- ============================================================
-- 0006_dev_test_accounts.sql
-- DEVELOPMENT ONLY. Creates safe local test accounts and promotes
-- one of them to admin. Idempotent. DO NOT run in production.
--
--   customer@test.com / Test123456!   (role: customer)
--   admin@test.com    / Admin123456!   (role: admin)
--
-- Passwords are hashed with bcrypt via pgcrypto (crypt/gen_salt).
-- The handle_new_user() trigger (0001) auto-creates the profiles row.
-- ============================================================

do $$
declare
  v_cust uuid;
  v_admin uuid;
begin
  -- ---- Customer ----
  select id into v_cust from auth.users where email = 'customer@test.com';
  if v_cust is null then
    v_cust := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
      -- GoTrue scans these token columns into Go strings; NULL here causes the
      -- login error "Database error querying schema". They MUST be '' not NULL.
      confirmation_token, recovery_token, email_change,
      email_change_token_new, email_change_token_current,
      phone_change, phone_change_token, reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000', v_cust, 'authenticated', 'authenticated',
      'customer@test.com', crypt('Test123456!', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Test Customer"}'::jsonb, false, false,
      '', '', '', '', '', '', '', ''
    );
    insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
    values (v_cust, v_cust,
      jsonb_build_object('sub', v_cust::text, 'email', 'customer@test.com', 'email_verified', true),
      'email', now(), now());
  end if;

  -- ---- Admin ----
  select id into v_admin from auth.users where email = 'admin@test.com';
  if v_admin is null then
    v_admin := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
      confirmation_token, recovery_token, email_change,
      email_change_token_new, email_change_token_current,
      phone_change, phone_change_token, reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000', v_admin, 'authenticated', 'authenticated',
      'admin@test.com', crypt('Admin123456!', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Test Admin"}'::jsonb, false, false,
      '', '', '', '', '', '', '', ''
    );
    insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
    values (v_admin, v_admin,
      jsonb_build_object('sub', v_admin::text, 'email', 'admin@test.com', 'email_verified', true),
      'email', now(), now());
  end if;
end $$;

-- Self-heal: any auth.users row with NULL token columns breaks GoTrue login
-- ("Database error querying schema"). Backfill to '' so existing broken
-- dev DBs are repaired on re-run.
update auth.users set
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change = coalesce(phone_change, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  reauthentication_token = coalesce(reauthentication_token, '')
where email in ('admin@test.com', 'customer@test.com');

-- Promote admin@test.com (profile is created by the signup trigger).
update public.profiles p
set role = 'admin'
from auth.users u
where u.email = 'admin@test.com' and p.user_id = u.id;
