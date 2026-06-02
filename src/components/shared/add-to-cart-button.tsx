"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useCart } from "@/lib/store/cart";
import { useRole } from "@/components/providers/role-provider";
import type { Product } from "@/types";

interface AddToCartButtonProps extends Omit<ButtonProps, "onClick"> {
  product: Product;
  quantity?: number;
  label?: string;
}

export function AddToCartButton({
  product,
  quantity = 1,
  label = "Add to Cart",
  ...props
}: AddToCartButtonProps) {
  const addItem = useCart((s) => s.addItem);
  const role = useRole();
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock_quantity <= 0;

  function handleClick() {
    if (outOfStock) return;
    addItem(product, quantity, role);
    setAdded(true);
    toast.success(`${product.title} added to cart`);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Button onClick={handleClick} disabled={outOfStock} {...props}>
      {added ? (
        <>
          <Check className="h-4 w-4" /> Added
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          {outOfStock ? "Out of Stock" : label}
        </>
      )}
    </Button>
  );
}
