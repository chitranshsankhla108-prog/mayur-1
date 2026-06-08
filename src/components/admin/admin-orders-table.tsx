"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentStatusBadge } from "@/components/shared/order-status-badge";
import { formatINR, formatDate } from "@/lib/utils";
import type { Order, OrderStatus, ShippingAddress, UserRole } from "@/types";

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function typeBadge(role: UserRole | null | undefined) {
  if (role === "dealer") return <Badge variant="default">Dealer</Badge>;
  if (role === "admin") return <Badge variant="default">Admin</Badge>;
  if (role === "staff") return <Badge variant="default">Staff</Badge>;
  if (role === "customer") return <Badge variant="muted">Customer</Badge>;
  return <Badge variant="outline">Guest</Badge>;
}

export function AdminOrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  async function updateStatus(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast.success(`Order marked ${status}`);
    } catch {
      toast.error("Could not update status");
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const addr = (o.shipping_address ?? {}) as ShippingAddress;
      const name = o.customer?.full_name || addr.full_name || "";
      const email = o.customer?.email || addr.email || "";
      const phone = o.customer?.mobile || addr.mobile || "";
      const role = o.customer?.role ?? "guest";

      if (q) {
        const haystack = [o.order_number, name, email, phone]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (paymentFilter !== "all" && o.payment_status !== paymentFilter)
        return false;
      if (typeFilter !== "all" && role !== typeFilter) return false;
      return true;
    });
  }, [orders, search, statusFilter, paymentFilter, typeFilter]);

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
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, name, email or phone"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 lg:flex">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full capitalize lg:w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="admin-theme">
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full capitalize lg:w-36">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent className="admin-theme">
              <SelectItem value="all">All payments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full capitalize lg:w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="admin-theme">
              <SelectItem value="all">All customers</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="dealer">Dealer</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="guest">Guest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {orders.length} order
        {orders.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[920px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 text-center font-medium">Items</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((o) => {
              const addr = (o.shipping_address ?? {}) as ShippingAddress;
              const name = o.customer?.full_name || addr.full_name || "—";
              const email = o.customer?.email || addr.email || "";
              const phone = o.customer?.mobile || addr.mobile || "";
              const count = (o.items ?? []).reduce((n, i) => n + i.quantity, 0);
              return (
                <tr key={o.id} className="hover:bg-accent/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-semibold text-foreground hover:text-crimson-600"
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {phone || email || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">{typeBadge(o.customer?.role)}</td>
                  <td className="px-4 py-3 text-center text-foreground">{count}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {formatINR(o.total_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase text-muted-foreground">
                        {(o.payment_method ?? "").toString().toUpperCase()}
                      </span>
                      <PaymentStatusBadge status={o.payment_status} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={o.status}
                      onValueChange={(v) => updateStatus(o.id, v as OrderStatus)}
                    >
                      <SelectTrigger className="h-9 w-32 capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="admin-theme">
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(o.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/orders/${o.id}`}>
                        <Eye className="h-4 w-4" /> View
                      </Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                  No orders match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
