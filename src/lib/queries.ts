import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  Order,
  Product,
  ProductTemplate,
  Profile,
  UserRole,
} from "@/types";
import * as sample from "@/lib/sample-data";
import { getCurrentProfile as _getCurrentProfile } from "@/lib/auth";
import { canQueryDealerPrice } from "@/lib/pricing";

/**
 * Server-side data helpers. Supabase is the source of truth.
 * Each helper degrades gracefully when Supabase is not configured or empty —
 * falling back to bundled sample data so pages always render something sane.
 */

function hasEnv() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Single source of truth lives in lib/auth.ts — re-exported for convenience.
export { getCurrentProfile } from "@/lib/auth";

/** Current viewer role (null for anon). Request-cached via getCurrentProfile. */
async function currentRole(): Promise<UserRole | null> {
  try {
    return (await _getCurrentProfile())?.role ?? null;
  } catch {
    return null;
  }
}

// Card columns (no relations). dealer_price is appended ONLY for dealer-visible
// roles so it is never selected — or serialised to the browser — for the public.
const CARD_COLS =
  "id, slug, title, brand, price, compare_at_price, stock_quantity, is_featured, is_active, category_id, created_at";
const CARD_RELATIONS =
  "category:categories(id,name,slug,icon), images:product_images(image_url,is_main,sort_order)";

// Full detail columns (explicit so we can gate dealer_price by role).
const DETAIL_COLS =
  "id, title, slug, sku, brand, category_id, template_id, short_description, description, price, compare_at_price, stock_quantity, warranty, is_featured, is_active, created_at, updated_at";
const DETAIL_RELATIONS =
  "category:categories(*), images:product_images(*), specs:product_specs(*)";

/** Card projection, role-aware: includes dealer_price only when permitted. */
function cardSelect(role: UserRole | null): string {
  const dealer = canQueryDealerPrice(role) ? ", dealer_price" : "";
  return `${CARD_COLS}${dealer}, ${CARD_RELATIONS}`;
}

/** Full detail projection, role-aware. */
function detailSelect(role: UserRole | null): string {
  const dealer = canQueryDealerPrice(role) ? ", dealer_price" : "";
  return `${DETAIL_COLS}${dealer}, ${DETAIL_RELATIONS}`;
}

const HOME_PAGE_SIZE = 12;

// ============================================================
// CATEGORIES
// ============================================================

/** Active categories for the storefront (ordered). Falls back to sample data. */
export async function getCategories(): Promise<Category[]> {
  if (!hasEnv()) return sample.categories;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (data && data.length) return data as Category[];
    return sample.categories;
  } catch {
    return sample.categories;
  }
}

/** All categories incl. inactive — for the admin panel. */
export async function getAllCategories(): Promise<Category[]> {
  if (!hasEnv()) return sample.categories;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    return (data as Category[]) ?? [];
  } catch {
    return [];
  }
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  if (!hasEnv()) return sample.getCategoryBySlug(slug) ?? null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return (data as Category) ?? sample.getCategoryBySlug(slug) ?? null;
  } catch {
    return sample.getCategoryBySlug(slug) ?? null;
  }
}

// ============================================================
// PRODUCTS
// ============================================================

/**
 * Active products for the storefront (card projection — no specs).
 * Falls back to sample data when empty. Used by the shop/products page where
 * client-side filtering needs the full active set.
 */
export async function getProducts(): Promise<Product[]> {
  if (!hasEnv()) return sample.products;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select(cardSelect(await currentRole()))
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (data && data.length) return data as unknown as Product[];
    return sample.products;
  } catch {
    return sample.products;
  }
}

/**
 * Best sellers for the homepage — featured products, hard-limited and using the
 * light card projection so the hero/best-sellers strip paints fast.
 */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  if (!hasEnv()) return sample.getFeaturedProducts().slice(0, limit);
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select(cardSelect(await currentRole()))
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (data && data.length) return data as unknown as Product[];
    return sample.getFeaturedProducts().slice(0, limit);
  } catch {
    return sample.getFeaturedProducts().slice(0, limit);
  }
}

/**
 * One page of active products for the homepage "Explore All Products" grid.
 * Returns the slice plus the total active count so the client knows whether to
 * keep showing "Load More". Uses a ranged, card-only query — never loads the
 * whole catalog at once.
 */
export async function getProductsPage(
  page = 0,
  pageSize = HOME_PAGE_SIZE
): Promise<{ products: Product[]; total: number }> {
  if (!hasEnv()) {
    const all = sample.products;
    const start = page * pageSize;
    return { products: all.slice(start, start + pageSize), total: all.length };
  }
  try {
    const supabase = createClient();
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, count } = await supabase
      .from("products")
      .select(cardSelect(await currentRole()), { count: "exact" })
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (data) {
      return { products: data as unknown as Product[], total: count ?? data.length };
    }
    return { products: [], total: 0 };
  } catch {
    const all = sample.products;
    const start = page * pageSize;
    return { products: all.slice(start, start + pageSize), total: all.length };
  }
}

export async function getProductsByCategory(
  categoryId: string
): Promise<Product[]> {
  if (!hasEnv()) return sample.getProductsByCategory(categoryId);
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select(cardSelect(await currentRole()))
      .eq("is_active", true)
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false });
    return (data as unknown as Product[]) ?? [];
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasEnv()) return sample.getProductBySlug(slug) ?? null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select(detailSelect(await currentRole()))
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (data) {
      const p = data as unknown as Product;
      // order specs/images for stable rendering
      p.specs = (p.specs ?? []).slice();
      p.images = (p.images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
      return p;
    }
    return sample.getProductBySlug(slug) ?? null;
  } catch {
    return sample.getProductBySlug(slug) ?? null;
  }
}

export async function getRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  if (!product.category_id) return [];
  const all = await getProductsByCategory(product.category_id);
  return all.filter((p) => p.id !== product.id).slice(0, limit);
}

// ---- Admin product helpers (include inactive) ----

export async function getAllProductsAdmin(): Promise<Product[]> {
  if (!hasEnv()) return sample.products;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select("*, category:categories(*), images:product_images(*)")
      .order("created_at", { ascending: false });
    return (data as unknown as Product[]) ?? [];
  } catch {
    return [];
  }
}

export async function getProductByIdAdmin(
  id: string
): Promise<Product | null> {
  if (!hasEnv()) return sample.products.find((p) => p.id === id) ?? null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      // Admin/staff manage both prices — always include dealer_price.
      .select(
        "*, category:categories(*), images:product_images(*), specs:product_specs(*)"
      )
      .eq("id", id)
      .maybeSingle();
    return (data as unknown as Product) ?? null;
  } catch {
    return null;
  }
}

// ============================================================
// TEMPLATES
// ============================================================

export async function getTemplates(): Promise<ProductTemplate[]> {
  if (!hasEnv()) return sample.templates;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("product_templates")
      .select("*, fields:template_fields(*)")
      .order("created_at", { ascending: true });
    if (data && data.length) {
      // sort fields within each template
      return (data as unknown as ProductTemplate[]).map((t) => ({
        ...t,
        fields: (t.fields ?? []).slice().sort((a, b) => a.sort_order - b.sort_order),
      }));
    }
    return sample.templates;
  } catch {
    return sample.templates;
  }
}

// ============================================================
// ORDERS / CUSTOMERS (already DB-backed)
// ============================================================

export async function getMyOrders(): Promise<Order[]> {
  if (!hasEnv()) return [];
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    return (data as Order[]) ?? [];
  } catch {
    return [];
  }
}

export async function getAllOrders(): Promise<Order[]> {
  if (!hasEnv()) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .order("created_at", { ascending: false });
    return (data as Order[]) ?? [];
  } catch {
    return [];
  }
}

export async function getAllCustomers(): Promise<Profile[]> {
  if (!hasEnv()) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    return (data as Profile[]) ?? [];
  } catch {
    return [];
  }
}
