import Link from "next/link";
import {
  Package,
  Clock,
  Heart,
  ShoppingBag,
  ArrowRight,
  LayoutDashboard,
  BadgeCheck,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { Button } from "@/components/ui/button";
import { getCurrentProfile, getMyOrders } from "@/lib/queries";
import { formatINR, formatDate } from "@/lib/utils";

export default async function AccountDashboardPage() {
  const [profile, orders] = await Promise.all([
    getCurrentProfile(),
    getMyOrders(),
  ]);

  const pending = orders.filter((o) =>
    ["pending", "confirmed", "processing", "shipped"].includes(o.status)
  ).length;

  const isAdmin = profile?.role === "admin" || profile?.role === "staff";

  return (
    <div className="space-y-8">
      {isAdmin && (
        <div className="flex flex-col gap-3 rounded-xl border border-crimson/30 bg-crimson/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-crimson/15 text-crimson-600">
              <LayoutDashboard className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-foreground">You have admin access</p>
              <p className="text-sm text-muted-foreground">
                Manage products, orders, categories and more.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0">
            <Link href="/admin">
              Go to Admin Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
          </h1>
          {profile?.role === "dealer" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-crimson/30 bg-crimson/10 px-3 py-1 text-xs font-semibold text-crimson-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              Dealer Account
            </span>
          )}
        </div>
        <p className="mt-1 text-muted-foreground">
          {profile?.role === "dealer"
            ? "Dealer pricing is applied automatically across the store."
            : "Here's an overview of your account."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={orders.length} icon={Package} />
        <StatCard label="Pending Orders" value={pending} icon={Clock} />
        <StatCard label="Wishlist Items" value="—" icon={Heart} hint="View wishlist" />
        <StatCard
          label="Recent Purchases"
          value={formatINR(orders.reduce((s, o) => s + o.total_amount, 0))}
          icon={ShoppingBag}
          accent
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-semibold text-foreground">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1 text-sm text-crimson-600 hover:text-crimson-700"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-muted-foreground">You have no orders yet.</p>
            <Button asChild className="mt-4">
              <Link href="/products">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center justify-between p-5">
                <div>
                  <p className="font-medium text-foreground">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(o.created_at)}
                  </p>
                </div>
                <OrderStatusBadge status={o.status} />
                <p className="font-semibold text-foreground">
                  {formatINR(o.total_amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
