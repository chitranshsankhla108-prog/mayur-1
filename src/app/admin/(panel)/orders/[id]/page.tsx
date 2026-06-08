import { notFound } from "next/navigation";
import { getOrderByIdAdmin } from "@/lib/queries";
import { AdminOrderDetail } from "@/components/admin/admin-order-detail";

// The (panel) layout already enforces requireAdmin(), so this route is
// admin/staff-only. RLS additionally restricts order reads to admins.
export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrderByIdAdmin(params.id);
  if (!order) notFound();

  return <AdminOrderDetail order={order} />;
}
