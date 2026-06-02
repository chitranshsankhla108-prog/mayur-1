import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/shared/order-status-badge";
import { getMyOrders } from "@/lib/queries";
import { formatINR, formatDate } from "@/lib/utils";

export default async function OrdersPage() {
  const orders = await getMyOrders();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">My Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-muted-foreground">No orders yet.</p>
          <Button asChild className="mt-4">
            <Link href="/products">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <p className="font-semibold text-foreground">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    Placed on {formatDate(o.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <PaymentStatusBadge status={o.payment_status} />
                  <OrderStatusBadge status={o.status} />
                </div>
              </div>

              <div className="mt-4 space-y-2">
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

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-bold text-foreground">
                  {formatINR(o.total_amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
