"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/shared/quantity-selector";
import { useCart } from "@/lib/store/cart";
import { formatINR } from "@/lib/utils";
import { GST_RATE } from "@/lib/constants";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="container-px py-20" />;

  if (items.length === 0) {
    return (
      <div className="container-px py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">Start shopping</Link>
        </Button>
      </div>
    );
  }

  const sub = subtotal();
  const gst = Math.round(sub * GST_RATE);
  const total = sub + gst;

  return (
    <div className="container-px py-10">
      <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-xl border border-border bg-card p-4"
            >
              <Link
                href={`/products/${item.slug}`}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-ink-700"
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
                <div className="flex justify-between gap-3">
                  <div>
                    {item.brand && (
                      <p className="text-xs text-muted-foreground">
                        {item.brand}
                      </p>
                    )}
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-semibold text-foreground hover:text-crimson-700"
                    >
                      {item.title}
                    </Link>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-muted-foreground transition-colors hover:text-red-400"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-end justify-between pt-3">
                  <QuantitySelector
                    value={item.quantity}
                    onChange={(q) => updateQuantity(item.productId, q)}
                    max={Math.max(item.stock, 1)}
                  />
                  <p className="font-bold text-foreground">
                    {formatINR(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <Button asChild variant="ghost">
            <Link href="/products">← Continue shopping</Link>
          </Button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium text-foreground">{formatINR(sub)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">GST (18%)</dt>
                <dd className="font-medium text-foreground">{formatINR(gst)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="font-medium text-emerald-600">Free</dd>
              </div>
              <div className="my-2 h-px bg-border" />
              <div className="flex justify-between text-base">
                <dt className="font-semibold text-foreground">Total</dt>
                <dd className="font-bold text-foreground">{formatINR(total)}</dd>
              </div>
            </dl>
            <Button asChild size="lg" className="mt-6 w-full">
              <Link href="/checkout">
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
