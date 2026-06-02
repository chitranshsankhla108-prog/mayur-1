"use client";

import { cn, formatINR } from "@/lib/utils";
import { useRole } from "@/components/providers/role-provider";
import {
  getDisplayPrice,
  getCompareAtPrice,
  isDealerPriceActive,
} from "@/lib/pricing";
import type { Product } from "@/types";

interface RoleAwarePriceProps {
  product: Pick<Product, "price" | "dealer_price" | "compare_at_price">;
  size?: "sm" | "md" | "lg";
  /** Show the small "Dealer Price" badge for dealers. Default true. */
  showBadge?: boolean;
  className?: string;
}

/**
 * Price block that reflects the viewer's role. Customers/visitors see the public
 * price; logged-in dealers see the dealer price with a subtle "Dealer Price"
 * badge and the public price struck through when it's higher.
 */
export function RoleAwarePrice({
  product,
  size = "md",
  showBadge = true,
  className,
}: RoleAwarePriceProps) {
  const role = useRole();
  const dealer = isDealerPriceActive(product, role);
  const price = getDisplayPrice(product, role);
  const compareAt = getCompareAtPrice(product, role);

  const priceClass =
    size === "lg"
      ? "text-3xl font-bold"
      : size === "sm"
        ? "text-base font-semibold"
        : "text-xl font-bold";

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn("text-foreground", priceClass)}>
        {formatINR(price)}
      </span>
      {compareAt && compareAt > price ? (
        <span className="text-sm text-muted-foreground line-through">
          {formatINR(compareAt)}
        </span>
      ) : null}
      {dealer && showBadge ? (
        <span className="rounded-md border border-crimson/30 bg-crimson/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-crimson-700">
          Dealer Price
        </span>
      ) : null}
    </div>
  );
}
