"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/lib/store/wishlist";
import { useCart } from "@/lib/store/cart";
import { formatINR } from "@/lib/utils";
import { toast } from "sonner";
import type { Product } from "@/types";

export default function WishlistPage() {
  const { items, remove } = useWishlist();
  const addItem = useCart((s) => s.addItem);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="py-10" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Heart className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-muted-foreground">
            Your wishlist is empty.
          </p>
          <Button asChild className="mt-4">
            <Link href="/products">Discover products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-xl border border-border bg-card p-4"
            >
              <Link
                href={`/products/${item.slug}`}
                className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-700"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <Link
                  href={`/products/${item.slug}`}
                  className="text-sm font-semibold text-foreground hover:text-crimson-700"
                >
                  {item.title}
                </Link>
                <p className="mt-1 font-bold text-foreground">
                  {formatINR(item.price)}
                </p>
                <div className="mt-auto flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      const product = {
                        id: item.productId,
                        title: item.title,
                        slug: item.slug,
                        price: item.price,
                        compare_at_price: item.compareAtPrice,
                        brand: item.brand,
                        stock_quantity: item.stock,
                        images: item.image
                          ? [{ image_url: item.image } as any]
                          : [],
                      } as Product;
                      addItem(product, 1);
                      toast.success("Added to cart");
                    }}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" /> Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      remove(item.productId);
                      toast.success("Removed from wishlist");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
