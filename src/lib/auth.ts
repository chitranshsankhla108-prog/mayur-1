import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";

/**
 * Centralised auth/role helpers for Server Components, Route Handlers and
 * Server Actions. Use these instead of re-querying profiles everywhere.
 *
 * Source of truth for roles: public.profiles.role (customer | staff | admin),
 * keyed by profiles.user_id === auth.users.id.
 */

function hasEnv() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * The authenticated auth.users record, or null.
 * Wrapped in React.cache so multiple callers in the same request (layout +
 * page + nested helpers) share a single getUser() round-trip.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!hasEnv()) return null;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ?? null;
  } catch {
    return null;
  }
});

/**
 * The current user's profile row (role, name, etc.), or null.
 * Also request-cached. Anonymous visitors pay only the single getUser() above
 * and skip the profiles query entirely.
 */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    return (data as Profile) ?? null;
  } catch {
    return null;
  }
});

/** True when the current user's role is admin or staff. */
export async function isStaffOrAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === "admin" || profile?.role === "staff";
}

/** True only when the current user's role is admin. */
export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === "admin";
}

/** Require a logged-in user; otherwise redirect to login. */
export async function requireAuth(redirectTo = "/login"): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  return user;
}

/**
 * Require admin OR staff. Redirects unauthenticated users to the login page
 * (preserving the intended destination) and non-privileged customers to their
 * account dashboard. Returns the profile when allowed.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?redirect=/admin");
  if (profile.role !== "admin" && profile.role !== "staff") redirect("/account");
  return profile;
}
