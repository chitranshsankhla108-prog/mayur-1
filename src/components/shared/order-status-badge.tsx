import { Badge } from "@/components/ui/badge";
import type { OrderStatus, PaymentStatus } from "@/types";

const statusMap: Record<OrderStatus, { label: string; variant: any }> = {
  pending: { label: "Pending", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "default" },
  processing: { label: "Processing", variant: "default" },
  shipped: { label: "Shipped", variant: "default" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
};

const paymentMap: Record<PaymentStatus, { label: string; variant: any }> = {
  pending: { label: "Payment Pending", variant: "warning" },
  paid: { label: "Paid", variant: "success" },
  failed: { label: "Failed", variant: "danger" },
  refunded: { label: "Refunded", variant: "muted" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const s = statusMap[status] ?? statusMap.pending;
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const s = paymentMap[status] ?? paymentMap.pending;
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
