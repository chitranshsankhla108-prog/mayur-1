"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ExternalLink, Search } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import type { Profile } from "@/types";

export function AdminHeader({ profile }: { profile?: Profile | null }) {
  const [open, setOpen] = useState(false);

  const name = profile?.full_name?.trim() || profile?.email?.trim() || "Admin";
  const initial = name.charAt(0).toUpperCase();
  const role = profile?.role ?? "admin";

  return (
    <>
      <header className="glass-header sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border px-4 lg:px-8">
        <button
          className="lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden max-w-sm flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search…"
            className="h-9 w-full rounded-lg border border-input bg-field pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-crimson/50 focus:outline-none"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            View store <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <div className="flex items-center gap-2.5 border-l border-border pl-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-none text-foreground">
                {name}
              </p>
              <p className="mt-0.5 text-[11px] capitalize text-muted-foreground">
                {role}
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-crimson/10 text-sm font-semibold text-crimson-700">
              {initial}
            </span>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-card p-4 shadow-xl">
            <div className="mb-2 flex justify-end">
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <AdminSidebar />
          </div>
        </div>
      )}
    </>
  );
}
