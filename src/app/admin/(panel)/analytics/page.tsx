import {
  IndianRupee,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Trophy,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { getAllOrders, getAllProductsAdmin } from "@/lib/queries";
import { formatINR, formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default async function AnalyticsPage() {
  const [orders, products] = await Promise.all([
    getAllOrders(),
    getAllProductsAdmin(),
  ]);

  const paidOrders = orders.filter((o) => o.payment_status === "paid");
  const revenue = paidOrders.reduce((s, o) => s + o.total_amount, 0);
  const avgOrder = paidOrders.length
    ? Math.round(revenue / paidOrders.length)
    : 0;

  // Orders grouped by status (with a share for the bar widths).
  const byStatus = STATUSES.map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  }));
  const maxStatus = Math.max(1, ...byStatus.map((s) => s.count));

  // Best sellers — aggregate units sold across all order items.
  const soldMap = new Map<string, { name: string; units: number; revenue: number }>();
  for (const o of orders) {
    for (const it of o.items ?? []) {
      const key = it.product_id ?? it.product_name;
      const prev = soldMap.get(key) ?? {
        name: it.product_name,
        units: 0,
        revenue: 0,
      };
      prev.units += it.quantity;
      prev.revenue += it.total_price;
      soldMap.set(key, prev);
    }
  }
  const bestSellers = Array.from(soldMap.values())
    .sort((a, b) => b.units - a.units)
    .slice(0, 6);

  const lowStock = products
    .filter((p) => p.stock_quantity <= 15)
    .sort((a, b) => a.stock_quantity - b.stock_quantity)
    .slice(0, 6);

  const recent = orders.slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          A quick read on revenue, orders and inventory health.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue (paid)" value={formatINR(revenue)} icon={IndianRupee} accent />
        <StatCard label="Paid Orders" value={paidOrders.length} icon={ShoppingCart} />
        <StatCard label="Avg. Order Value" value={formatINR(avgOrder)} icon={TrendingUp} />
        <StatCard label="Low Stock Items" value={lowStock.length} icon={AlertTriangle} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by status */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-semibold text-foreground">Orders by status</h2>
          <div className="mt-5 space-y-3">
            {byStatus.map((s) => (
              <div key={s.status} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm capitalize text-muted-foreground">
                  {s.status}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-crimson-600"
                    style={{ width: `${(s.count / maxStatus) * 100}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-sm font-semibold text-foreground">
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Best sellers */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-crimson-600" />
            <h2 className="font-semibold text-foreground">Best-selling products</h2>
          </div>
          {bestSellers.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No sales yet. Best sellers will appear once orders come in.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {bestSellers.map((b, i) => (
                <li key={b.name} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-crimson/10 text-xs font-bold text-crimson-600">
                    {i + 1}
                  </span>
                  <span className="line-clamp-1 flex-1 text-sm text-foreground/80">
                    {b.name}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-foreground">
                    {b.units} sold
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Low stock */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-semibold text-foreground">Low stock</h2>
          {lowStock.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              All products are well stocked.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {lowStock.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <span className="line-clamp-1 text-sm text-foreground/80">
                    {p.title}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-amber-600">
                    {p.stock_quantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-semibold text-foreground">Recent activity</h2>
          {recent.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No recent orders.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {recent.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {o.order_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(o.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <OrderStatusBadge status={o.status} />
                    <span className="text-sm font-semibold text-foreground">
                      {formatINR(o.total_amount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
