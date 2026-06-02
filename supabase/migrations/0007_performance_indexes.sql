-- ============================================================
-- 0007_performance_indexes.sql
-- Indexes to speed up storefront product listing & detail queries.
-- Idempotent (IF NOT EXISTS) and safe to re-run.
-- ============================================================

-- Storefront listing filters/sorts on these columns.
create index if not exists idx_products_is_active
  on public.products (is_active);

create index if not exists idx_products_category_id
  on public.products (category_id);

create index if not exists idx_products_is_featured
  on public.products (is_featured);

-- Newest-first ordering of the active catalog (home + shop + category pages).
create index if not exists idx_products_active_created_at
  on public.products (is_active, created_at desc);

-- Best sellers: active + featured, newest-first.
create index if not exists idx_products_featured_active
  on public.products (is_active, is_featured, created_at desc);

-- Product detail page looks up by slug.
create index if not exists idx_products_slug
  on public.products (slug);

-- Relation joins for images/specs (card image + detail specs).
create index if not exists idx_product_images_product_id
  on public.product_images (product_id);

create index if not exists idx_product_specs_product_id
  on public.product_specs (product_id);

-- Category lookups by slug (category landing pages, nav).
create index if not exists idx_categories_slug
  on public.categories (slug);
