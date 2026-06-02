import Link from "next/link";
import {
  Package,
  PackageCheck,
  ShoppingCart,
  Clock,
  IndianRupee,
  AlertTriangle,
  ArrowRight,
  Plus,
  FolderTree,
  LayoutTemplate,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { getAllOrders, getAllProductsAdmin } from "@/lib/queries";
import { formatINR, formatDate } from "@/lib/utils";

const quickActions = [
  { label: "Add Product", href: "/admin/products/new", icon: Plus },
  { label: "Create Category", href: "/admin/categories", icon: FolderTree },
  { label: "Create Template", href: "/admin/templates", icon: LayoutTemplate },
  { label: "View Orders", href: "/admin/orders", icon: ShoppingCart },
];

export default async function AdminDashboardPage() {
  const [orders, products] = await Promise.all([
    getAllOrders(),
    getAllProductsAdmin(),
  ]);

  const revenue = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((s, o) => s + o.total_amount, 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const active = products.filter((p) => p.is_active).length;
  const lowStock = products.filter((p) => p.stock_quantity <= 15);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Overview of your store performance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Products" value={products.length} icon={Package} />
        <StatCard label="Active Products" value={active} icon={PackageCheck} />
        <StatCard
          label="Low Stock"
          value={lowStock.length}
          icon={AlertTriangle}
        />
        <StatCard label="Total Orders" value={orders.length} icon={ShoppingCart} />
        <StatCard label="Pending Orders" value={pending} icon={Clock} />
        <StatCard
          label="Revenue"
          value={formatINR(revenue)}
          icon={IndianRupee}
          accent
        />
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-crimson/40"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-crimson/10 text-crimson-600 transition-colors group-hover:bg-crimson group-hover:text-white">
              <a.icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-foreground">
              {a.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="rounded-xl border border-border bg-card shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="font-semibold text-foreground">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-sm font-medium text-crimson-600 hover:text-crimson-700"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No orders yet. Orders will appear here once customers start buying.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.slice(0, 6).map((o) => (
                    <tr key={o.id}>
                      <td className="px-5 py-3 font-medium text-foreground">
                        {o.order_number}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatDate(o.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-foreground">
                        {formatINR(o.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5">
            <h2 className="font-semibold text-foreground">Low Stock Alert</h2>
          </div>
          {lowStock.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              All products are well stocked.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {lowStock.slice(0, 6).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between px-5 py-3"
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
      </div>
    </div>
  );
}
