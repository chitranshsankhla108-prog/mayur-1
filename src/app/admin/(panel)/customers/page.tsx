import Link from "next/link";
import { Users, Eye } from "lucide-react";
import { CustomerRoleSelect } from "@/components/admin/customer-role-select";
import { Button } from "@/components/ui/button";
import { getAllCustomersWithStats } from "@/lib/queries";
import { formatINR, formatDate } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const customers = await getAllCustomersWithStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        <p className="mt-1 text-muted-foreground">
          {customers.length} registered customer
          {customers.length !== 1 ? "s" : ""}.
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-muted-foreground">
            No customers yet. Registered users will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Business / GST</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 text-center font-medium">Orders</th>
                <th className="px-5 py-3 text-right font-medium">Total spent</th>
                <th className="px-5 py-3 font-medium">Last order</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-accent/50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{c.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatDate(c.created_at)}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    <p>{c.email}</p>
                    <p className="text-xs">{c.mobile ?? "—"}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    <p>{c.business_name ?? "—"}</p>
                    <p className="font-mono text-xs">{c.gst_number ?? "—"}</p>
                  </td>
                  <td className="px-5 py-3">
                    <CustomerRoleSelect profileId={c.id} role={c.role} />
                  </td>
                  <td className="px-5 py-3 text-center text-foreground">
                    {c.order_count}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-foreground">
                    {formatINR(c.total_spent)}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {c.last_order_at ? formatDate(c.last_order_at) : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/customers/${c.id}`}>
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
    </div>
  );
}
