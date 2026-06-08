"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  User2,
  MapPin,
  CreditCard,
  Package,
  ReceiptText,
  ExternalLink,
  Truck,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/shared/order-status-badge";
import { formatINR } from "@/lib/utils";
import type {
  Order,
  OrderStatus,
  PaymentStatus,
  ShippingAddress,
  UserRole,
} from "@/types";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

function dt(value?: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function roleBadge(role: UserRole | null | undefined) {
  switch (role) {
    case "dealer":
      return <Badge variant="default">Dealer</Badge>;
    case "admin":
      return <Badge variant="default">Admin</Badge>;
    case "staff":
      return <Badge variant="default">Staff</Badge>;
    case "customer":
      return <Badge variant="muted">Customer</Badge>;
    default:
      return <Badge variant="outline">Guest</Badge>;
  }
}

/** Card shell with an icon + title header. */
function Card({
  icon: Icon,
  title,
  action,
  children,
  className = "",
}: {
  icon: React.ElementType;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-border bg-card shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon className="h-4 w-4 text-crimson-600" />
          {title}
        </h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

/** Label / value row. */
function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className={`text-right text-sm text-foreground ${
          mono ? "font-mono" : ""
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

export function AdminOrderDetail({ order }: { order: Order }) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    order.payment_status
  );
  const [busy, setBusy] = useState(false);

  const addr = (order.shipping_address ?? {}) as ShippingAddress;
  const customer = order.customer ?? null;
  const items = order.items ?? [];
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const hasDealerLine = items.some((i) => i.price_type === "dealer");

  async function patch(payload: Record<string, string>, successMsg: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(successMsg);
    } catch {
      toast.error("Could not update the order. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(next: OrderStatus) {
    setStatus(next);
    await patch({ status: next }, `Order marked ${next}`);
  }

  async function changePayment(next: PaymentStatus) {
    setPaymentStatus(next);
    await patch({ payment_status: next }, `Payment marked ${next}`);
  }

  const paymentMethod = (order.payment_method ?? "").toString();
  const isCod = paymentMethod.toLowerCase() === "cod";
  const simulated =
    paymentStatus === "paid" && !order.razorpay_payment_id && !isCod;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href="/admin/orders" aria-label="Back to orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {order.order_number}
            </h1>
            <p className="text-sm text-muted-foreground">Placed {dt(order.created_at)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={status} />
          <PaymentStatusBadge status={paymentStatus} />
          {roleBadge(customer?.role)}
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* A. Order summary */}
        <Card icon={ReceiptText} title="Order Summary">
          <div className="divide-y divide-border">
            <Field label="Order number" value={order.order_number} mono />
            <Field label="Order status" value={<OrderStatusBadge status={status} />} />
            <Field
              label="Payment status"
              value={<PaymentStatusBadge status={paymentStatus} />}
            />
            <Field label="Payment method" value={paymentMethod.toUpperCase()} />
            <Field
              label="Total amount"
              value={
                <span className="font-semibold">{formatINR(order.total_amount)}</span>
              }
            />
            <Field label="Created" value={dt(order.created_at)} />
            <Field label="Last updated" value={dt(order.updated_at)} />
          </div>
        </Card>

        {/* B. Customer information */}
        <Card
          icon={User2}
          title="Customer Information"
          action={
            customer ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/customers/${customer.id}`}>
                  View profile <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : undefined
          }
        >
          {customer ? (
            <div className="divide-y divide-border">
              <Field label="Name" value={customer.full_name} />
              <Field label="Email" value={customer.email} />
              <Field label="Mobile" value={customer.mobile} />
              <Field label="Customer type" value={roleBadge(customer.role)} />
              <Field label="Business" value={customer.business_name} />
              <Field label="GST number" value={customer.gst_number} mono />
              <Field label="Account created" value={dt(customer.created_at)} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No linked account — guest or deleted customer. Contact details are in
              the shipping card.
            </p>
          )}
        </Card>

        {/* C. Shipping / delivery */}
        <Card icon={MapPin} title="Shipping & Delivery">
          <div className="divide-y divide-border">
            <Field label="Recipient" value={addr.full_name} />
            <Field label="Phone" value={addr.mobile} />
            {addr.email && <Field label="Email" value={addr.email} />}
            <Field label="Address" value={addr.address_line} />
            <Field label="City" value={addr.city} />
            <Field label="State" value={addr.state} />
            <Field label="Postal code" value={addr.postal_code} mono />
            <Field
              label="Delivery method"
              value={
                <span className="capitalize">{order.delivery_method ?? "standard"}</span>
              }
            />
            <Field label="Customer notes" value={order.notes ?? addr.notes} />
          </div>
        </Card>

        {/* D. Payment details */}
        <Card icon={CreditCard} title="Payment Details">
          <div className="divide-y divide-border">
            <Field label="Method" value={paymentMethod.toUpperCase()} />
            <Field
              label="Status"
              value={<PaymentStatusBadge status={paymentStatus} />}
            />
            <Field label="Razorpay order ID" value={order.razorpay_order_id} mono />
            <Field
              label="Razorpay payment ID"
              value={order.razorpay_payment_id}
              mono
            />
            <Field label="Paid at" value={dt(order.paid_at)} />
            {isCod && (
              <Field
                label="COD"
                value={
                  <Badge variant="warning">Collect on delivery</Badge>
                }
              />
            )}
            {simulated && (
              <Field
                label="Note"
                value={
                  <Badge variant="muted">Dev / simulated payment</Badge>
                }
              />
            )}
          </div>
        </Card>
      </div>

      {/* E. Ordered items */}
      <Card icon={Package} title={`Ordered Items (${itemCount})`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Brand</th>
                <th className="px-3 py-2 text-center font-medium">Qty</th>
                <th className="px-3 py-2 text-right font-medium">Unit price</th>
                <th className="px-3 py-2 text-center font-medium">Price type</th>
                <th className="py-2 pl-3 text-right font-medium">Line total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="align-middle">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                        {item.product_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.product_image_url}
                            alt={item.product_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-foreground">
                        {item.product_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                    {item.product_sku ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {item.product_category ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {item.product_brand ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-center text-foreground">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-3 text-right text-foreground">
                    {formatINR(item.unit_price)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {item.price_type === "dealer" ? (
                      <Badge variant="default">Dealer</Badge>
                    ) : (
                      <Badge variant="muted">Public</Badge>
                    )}
                  </td>
                  <td className="py-3 pl-3 text-right font-semibold text-foreground">
                    {formatINR(item.total_price)}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No items recorded for this order.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* F. Price breakdown */}
        <Card icon={ReceiptText} title="Price Breakdown">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatINR(order.subtotal)}</span>
            </div>
            {(order.discount_amount ?? 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Discount
                  {order.coupon_code ? ` (${order.coupon_code})` : ""}
                </span>
                <span className="text-emerald-600">
                  −{formatINR(order.discount_amount ?? 0)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST (18%)</span>
              <span className="text-foreground">{formatINR(order.gst_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">
                {order.shipping_amount > 0
                  ? formatINR(order.shipping_amount)
                  : "Free"}
              </span>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-3 text-base">
              <span className="font-semibold text-foreground">Grand total</span>
              <span className="font-bold text-foreground">
                {formatINR(order.total_amount)}
              </span>
            </div>
            {hasDealerLine && (
              <p className="pt-2 text-xs text-muted-foreground">
                Dealer pricing was applied to one or more lines in this order.
              </p>
            )}
          </div>
        </Card>

        {/* G. Admin actions */}
        <Card icon={Truck} title="Admin Actions" className="print:hidden">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Order status
                </label>
                <Select
                  value={status}
                  onValueChange={(v) => changeStatus(v as OrderStatus)}
                  disabled={busy}
                >
                  <SelectTrigger className="capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="admin-theme">
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Payment status
                </label>
                <Select
                  value={paymentStatus}
                  onValueChange={(v) => changePayment(v as PaymentStatus)}
                  disabled={busy}
                >
                  <SelectTrigger className="capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="admin-theme">
                    {PAYMENT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => changeStatus("processing")}
              >
                <Loader2 className="h-4 w-4" /> Mark processing
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => changeStatus("shipped")}
              >
                <Truck className="h-4 w-4" /> Mark shipped
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => changeStatus("delivered")}
              >
                <CheckCircle2 className="h-4 w-4" /> Mark completed
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => changeStatus("cancelled")}
              >
                <XCircle className="h-4 w-4" /> Cancel order
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print order
              </Button>
              <span className="text-xs text-muted-foreground">
                Invoices are sent to the customer&apos;s provided number.
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
