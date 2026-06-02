import type { Product, UserRole } from "@/types";

/**
 * Central role-aware pricing logic. Keep ALL "which price does this user see?"
 * decisions here so the rule lives in exactly one place.
 *
 * Rules:
 *  - Only a logged-in `dealer` sees dealer pricing.
 *  - Dealer pricing applies only when product.dealer_price is set (not null).
 *  - Everyone else (public visitor, customer, admin, staff) sees the public
 *    price in the storefront. Admin/staff manage dealer prices in the admin UI.
 */

export type PricingRole = UserRole | null;

/** True when the role is a dealer AND the product actually has a dealer price. */
export function isDealerPriceActive(
  product: Pick<Product, "price" | "dealer_price">,
  role: PricingRole
): boolean {
  return role === "dealer" && product.dealer_price != null;
}

/** The price to display/charge for this user. Dealers fall back to public price. */
export function getDisplayPrice(
  product: Pick<Product, "price" | "dealer_price">,
  role: PricingRole
): number {
  if (isDealerPriceActive(product, role)) return product.dealer_price as number;
  return product.price;
}

/**
 * The "compare at / struck-through" price to show next to the display price.
 *  - Dealer with an active (lower) dealer price → show the public price crossed.
 *  - Everyone else → the product's compare_at_price (old public price), if any.
 */
export function getCompareAtPrice(
  product: Pick<Product, "price" | "dealer_price" | "compare_at_price">,
  role: PricingRole
): number | null {
  if (isDealerPriceActive(product, role)) {
    return (product.dealer_price as number) < product.price ? product.price : null;
  }
  return product.compare_at_price;
}

/** Short label for the active price tier. */
export function getPriceLabel(role: PricingRole): string {
  return role === "dealer" ? "Dealer Price" : "Price";
}

/** "public" | "dealer" — the tier actually charged, for persisting on orders. */
export function getPriceType(
  product: Pick<Product, "price" | "dealer_price">,
  role: PricingRole
): "public" | "dealer" {
  return isDealerPriceActive(product, role) ? "dealer" : "public";
}

/**
 * Whether a given role is allowed to even RECEIVE the dealer_price column from
 * the database. Dealers need it to shop; admin/staff need it to manage. Public
 * and plain customers must never have it selected into their query results.
 */
export function canQueryDealerPrice(role: PricingRole): boolean {
  return role === "dealer" || role === "admin" || role === "staff";
}
