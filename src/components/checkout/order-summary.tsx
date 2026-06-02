"use client";

import { formatINR } from "@/lib/utils";
import type { LocalCartItem } from "@/types";

export function OrderSummary({
  items,
  subtotal,
  gst,
  shipping,
  total,
  discount = 0,
}: {
  items: LocalCartItem[];
  subtotal: number;
  gst: number;
  shipping: number;
  total: number;
  discount?: number;
}) {
  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>

      <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-700">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              )}
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                {item.quantity}
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <p className="line-clamp-1 text-sm font-medium text-foreground">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatINR(item.price)} × {item.quantity}
              </p>
            </div>
            <p className="self-center text-sm font-semibold text-foreground">
              {formatINR(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="my-4 h-px bg-border" />

      <dl className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-medium text-foreground">{formatINR(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Discount</dt>
            <dd className="font-medium text-emerald-600">
              −{formatINR(discount)}
            </dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">GST (18%)</dt>
          <dd className="font-medium text-foreground">{formatINR(gst)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="font-medium text-foreground">
            {shipping === 0 ? (
              <span className="text-emerald-600">Free</span>
            ) : (
              formatINR(shipping)
            )}
          </dd>
        </div>
        <div className="my-2 h-px bg-border" />
        <div className="flex justify-between text-base">
          <dt className="font-semibold text-foreground">Grand Total</dt>
          <dd className="font-bold text-foreground">{formatINR(total)}</dd>
        </div>
      </dl>
    </div>
  );
}
