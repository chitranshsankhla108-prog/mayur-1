"use client";

import Link from "next/link";
import { useState } from "react";
import { LayoutDashboard, Menu, User, X, Zap } from "lucide-react";
import { MAIN_NAV } from "@/lib/constants";
import { SearchBar } from "@/components/shared/search-bar";
import { CartIndicator } from "./cart-indicator";
import { Button } from "@/components/ui/button";

export function Header({
  isAuthed = false,
  isAdmin = false,
}: {
  isAuthed?: boolean;
  isAdmin?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="glass-header sticky top-0 z-30 border-b border-border">
      <div className="container-px">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-glow-sm">
              <Zap className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Mayur<span className="text-crimson-600">.</span>
            </span>
          </Link>

          {/* Search (desktop) */}
          <div className="hidden flex-1 lg:block">
            <SearchBar className="max-w-md" />
          </div>

          {/* Nav (desktop) */}
          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1 lg:ml-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden items-center gap-1.5 rounded-lg border border-crimson/30 px-3 py-2 text-sm font-semibold text-crimson-600 transition-colors hover:bg-crimson/5 sm:inline-flex"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Link>
            )}
            <Link
              href={isAuthed ? "/account" : "/login"}
              aria-label={isAuthed ? "Account" : "Sign in"}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
            >
              <User className="h-5 w-5" />
            </Link>
            <CartIndicator />
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground/80 hover:bg-accent lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {open && (
          <div className="border-t border-border py-4 lg:hidden">
            <SearchBar />
            <nav className="mt-4 grid gap-1">
              {MAIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {isAdmin && (
              <Button asChild className="mt-4 w-full">
                <Link href="/admin" onClick={() => setOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                </Link>
              </Button>
            )}
            {isAuthed ? (
              <Button asChild variant="outline" className="mt-2 w-full">
                <Link href="/account" onClick={() => setOpen(false)}>
                  My Account
                </Link>
              </Button>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button asChild variant="outline">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
