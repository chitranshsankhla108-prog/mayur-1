"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/shared/quantity-selector";
import { WishlistButton } from "@/components/shared/wishlist-button";
import { useCart } from "@/lib/store/cart";
import { useRole } from "@/components/providers/role-provider";
import type { Product } from "@/types";

export function ProductBuyBox({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const role = useRole();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const inStock = product.stock_quantity > 0;

  function add() {
    addItem(product, qty, role);
    setAdded(true);
    toast.success(`${product.title} added to cart`);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        {inStock ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> In stock
            {product.stock_quantity <= 10 &&
              ` — only ${product.stock_quantity} left`}
          </span>
        ) : (
          <span className="text-sm font-medium text-red-600">Out of stock</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <QuantitySelector
          value={qty}
          onChange={setQty}
          max={Math.max(product.stock_quantity, 1)}
        />
        <Button onClick={add} disabled={!inStock} size="lg" className="flex-1">
          {added ? (
            <>
              <Check className="h-4 w-4" /> Added
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </>
          )}
        </Button>
        <WishlistButton product={product} className="h-12 w-12" />
      </div>
    </div>
  );
}
