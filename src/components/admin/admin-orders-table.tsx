"use client";

import { useState } from "react";
import { ShoppingCart, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentStatusBadge } from "@/components/shared/order-status-badge";
import { formatINR, formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function AdminOrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function updateStatus(id: string, status: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {
      /* best effort */
    }
    toast.success(`Order marked ${status}`);
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-4 text-muted-foreground">
          No orders yet. They&apos;ll appear here once customers check out.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const open = expanded === o.id;
        const addr = o.shipping_address as any;
        return (
          <div
            key={o.id}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-4 p-4">
              <button
                onClick={() => setExpanded(open ? null : o.id)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                />
                <div>
                  <p className="font-semibold text-foreground">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(o.created_at)} ·{" "}
                    {o.payment_method?.toUpperCase()}
                  </p>
                </div>
              </button>
              <PaymentStatusBadge status={o.payment_status} />
              <span className="font-semibold text-foreground">
                {formatINR(o.total_amount)}
              </span>
              <Select
                value={o.status}
                onValueChange={(v) => updateStatus(o.id, v as OrderStatus)}
              >
                <SelectTrigger className="h-9 w-36 capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="admin-theme">
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {open && (
              <div className="grid gap-6 border-t border-border p-5 sm:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Items
                  </h4>
                  <div className="space-y-1.5">
                    {(o.items ?? []).map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-foreground/80">
                          {item.product_name} × {item.quantity}
                        </span>
                        <span className="text-foreground">
                          {formatINR(item.total_price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Shipping Address
                  </h4>
                  {addr && (
                    <div className="text-sm text-foreground/80">
                      <p className="font-medium text-foreground">{addr.full_name}</p>
                      <p>{addr.mobile}</p>
                      <p>
                        {addr.address_line}, {addr.city}, {addr.state} —{" "}
                        {addr.postal_code}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
