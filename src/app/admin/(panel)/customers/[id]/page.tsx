import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User2, ShoppingBag, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/shared/order-status-badge";
import { getCustomerByIdAdmin } from "@/lib/queries";
import { formatINR, formatDate } from "@/lib/utils";
import type { UserRole } from "@/types";

function roleBadge(role: UserRole | null | undefined) {
  if (role === "dealer") return <Badge variant="default">Dealer</Badge>;
  if (role === "admin") return <Badge variant="default">Admin</Badge>;
  if (role === "staff") return <Badge variant="default">Staff</Badge>;
  return <Badge variant="muted">Customer</Badge>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-sm text-foreground">{value || "—"}</span>
    </div>
  );
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getCustomerByIdAdmin(params.id);
  if (!data) notFound();

  const { profile, orders } = data;
  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const lastOrder = orders[0]?.created_at ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="icon">
          <Link href="/admin/customers" aria-label="Back to customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {profile.full_name || profile.email}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            {roleBadge(profile.role)}
            <span className="text-sm text-muted-foreground">
              Joined {formatDate(profile.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total orders" value={String(orders.length)} />
        <Stat label="Total spent" value={formatINR(totalSpent)} />
        <Stat
          label="Last order"
          value={lastOrder ? formatDate(lastOrder) : "—"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile */}
        <section className="rounded-xl border border-border bg-card shadow-sm lg:col-span-1">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
            <User2 className="h-4 w-4 text-crimson-600" />
            <h2 className="text-sm font-semibold text-foreground">Profile</h2>
          </div>
          <div className="divide-y divide-border p-5">
            <Field label="Name" value={profile.full_name} />
            <Field label="Email" value={profile.email} />
            <Field label="Mobile" value={profile.mobile} />
            <Field label="Customer type" value={roleBadge(profile.role)} />
            <Field label="Business" value={profile.business_name} />
            <Field
              label="GST number"
              value={
                profile.gst_number ? (
                  <span className="font-mono">{profile.gst_number}</span>
                ) : null
              }
            />
            <Field label="Account created" value={formatDate(profile.created_at)} />
          </div>
        </section>

        {/* Order history */}
        <section className="rounded-xl border border-border bg-card shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
            <ShoppingBag className="h-4 w-4 text-crimson-600" />
            <h2 className="text-sm font-semibold text-foreground">
              Order History
            </h2>
          </div>
          {orders.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              This customer hasn&apos;t placed any orders yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Payment</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-accent/50">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-semibold text-foreground hover:text-crimson-600"
                        >
                          {o.order_number}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatDate(o.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="px-5 py-3">
                        <PaymentStatusBadge status={o.payment_status} />
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-foreground">
                        {formatINR(o.total_amount)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/orders/${o.id}`}>
                            <Eye className="h-4 w-4" /> View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
