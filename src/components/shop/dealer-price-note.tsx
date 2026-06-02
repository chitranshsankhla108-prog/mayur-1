"use client";

import { BadgeCheck } from "lucide-react";
import { useRole } from "@/components/providers/role-provider";
import { isDealerPriceActive } from "@/lib/pricing";
import type { Product } from "@/types";

/** Subtle "Dealer pricing applied" line — shown only to dealers, only when an
 *  actual dealer price is in effect for this product. */
export function DealerPriceNote({
  product,
}: {
  product: Pick<Product, "price" | "dealer_price">;
}) {
  const role = useRole();
  if (!isDealerPriceActive(product, role)) return null;

  return (
    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-crimson-700">
      <BadgeCheck className="h-3.5 w-3.5" />
      Dealer pricing applied
    </p>
  );
}
