"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useWishlist } from "@/lib/store/wishlist";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function WishlistButton({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const toggle = useWishlist((s) => s.toggle);
  const has = useWishlist((s) => s.has);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const active = mounted && has(product.id);

  return (
    <button
      type="button"
      aria-label="Toggle wishlist"
      onClick={() => {
        toggle(product);
        toast.success(active ? "Removed from wishlist" : "Saved to wishlist");
      }}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-ink-700/80 backdrop-blur transition-colors hover:border-crimson/50",
        className
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          active ? "fill-crimson text-crimson" : "text-muted-foreground"
        )}
      />
    </button>
  );
}
