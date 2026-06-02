import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth: middleware also guards /admin, but enforce at render too.
  const profile = await requireAdmin();

  return (
    // `admin-theme` scopes the admin SaaS palette. The storefront now shares
    // the same light system, so this mainly provides an admin-only override hook.
    <div className="admin-theme flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto p-4">
          <AdminSidebar />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader profile={profile} />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
