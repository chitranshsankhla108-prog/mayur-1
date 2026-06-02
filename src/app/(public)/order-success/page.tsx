"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Download,
  ShoppingBag,
  Headphones,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/shared/whatsapp-button";
import { WHATSAPP_MESSAGES } from "@/lib/whatsapp";
import { formatINR } from "@/lib/utils";
import type { LocalCartItem } from "@/types";

interface StoredOrder {
  order_number: string;
  items: LocalCartItem[];
  totals: { total: number; sub: number; gst: number; shipping: number };
  payment: string;
  delivery: string;
  created_at: string;
}

function SuccessInner() {
  const params = useSearchParams();
  const orderNumber = params.get("order");
  const [order, setOrder] = useState<StoredOrder | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("mayur-last-order");
    if (raw) setOrder(JSON.parse(raw));
  }, []);

  return (
    <div className="container-px py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
          <CheckCircle2 className="h-11 w-11 text-emerald-600" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-foreground">
          Thank you for your order!
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your order has been placed successfully. A confirmation has been sent
          to your email.
        </p>

        <div className="mt-6 inline-flex flex-col items-center gap-1 rounded-xl border border-border bg-card px-8 py-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Order number
          </span>
          <span className="text-lg font-bold text-crimson-600">
            {order?.order_number ?? orderNumber ?? "—"}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-crimson-600" /> Est. delivery: 4-6
            business days
          </span>
        </div>
      </div>

      {order && (
        <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-border bg-card p-6 text-left">
          <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-lg bg-ink-700">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formatINR(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="my-4 h-px bg-border" />
          <div className="flex justify-between text-base">
            <span className="font-semibold text-foreground">Total Paid</span>
            <span className="font-bold text-foreground">
              {formatINR(order.totals.total)}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Payment method: {order.payment.toUpperCase()}
          </p>
        </div>
      )}

      <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/account/orders">
            <Package className="h-4 w-4" /> Track Order
          </Link>
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="h-4 w-4" /> Download Invoice
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">
            <ShoppingBag className="h-4 w-4" /> Continue Shopping
          </Link>
        </Button>
        <WhatsAppLink message={WHATSAPP_MESSAGES.support}>
          <Headphones className="h-4 w-4" /> Contact Support
        </WhatsAppLink>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="container-px py-20" />}>
      <SuccessInner />
    </Suspense>
  );
}
