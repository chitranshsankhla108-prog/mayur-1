import { Users } from "lucide-react";
import { CustomerRoleSelect } from "@/components/admin/customer-role-select";
import { getAllCustomers } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const customers = await getAllCustomers();

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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Mobile</th>
                <th className="px-5 py-3 font-medium">Business</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-accent/50">
                  <td className="px-5 py-3 font-medium text-foreground">
                    {c.full_name}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {c.mobile ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {c.business_name ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <CustomerRoleSelect profileId={c.id} role={c.role} />
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {formatDate(c.created_at)}
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
