import { AccountSidebar } from "@/components/account/account-sidebar";
import { requireAuth } from "@/lib/auth";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="container-px py-10">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside>
          <div className="sticky top-24 rounded-xl border border-border bg-card p-4">
            <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              My Account
            </p>
            <AccountSidebar />
          </div>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
