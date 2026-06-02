"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Plus,
  FolderTree,
  LayoutTemplate,
  ShoppingCart,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-actions";
import { toast } from "sonner";

const nav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Add Product", href: "/admin/products/new", icon: Plus },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Templates", href: "/admin/templates", icon: LayoutTemplate },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2 px-2 py-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm">
          <Zap className="h-5 w-5 text-white" />
        </span>
        <div>
          <p className="text-sm font-bold leading-none text-foreground">
            Mayur Admin
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Control Panel
          </p>
        </div>
      </Link>

      <nav className="mt-6 flex-1 space-y-1">
        {nav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : item.href === "/admin/products"
              ? // "Products" matches its subtree but NOT the dedicated Add page.
                pathname.startsWith("/admin/products") &&
                pathname !== "/admin/products/new"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-crimson/10 text-crimson-700"
                  : "text-foreground/70 hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  );
}
