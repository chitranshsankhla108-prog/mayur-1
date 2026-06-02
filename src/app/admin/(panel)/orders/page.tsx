import { AdminOrdersTable } from "@/components/admin/admin-orders-table";
import { getAllOrders } from "@/lib/queries";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="mt-1 text-muted-foreground">
          View and manage customer orders.
        </p>
      </div>
      <AdminOrdersTable initialOrders={orders} />
    </div>
  );
}
