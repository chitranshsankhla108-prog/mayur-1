"use client";

import { createContext, useContext } from "react";
import type { PricingRole } from "@/lib/pricing";

/**
 * Makes the current user's role available to client components in the
 * storefront (product cards, buy box, add-to-cart) so they can apply
 * role-aware pricing without each one re-fetching auth.
 */
const RoleContext = createContext<PricingRole>(null);

export function RoleProvider({
  role,
  children,
}: {
  role: PricingRole;
  children: React.ReactNode;
}) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

/** Current user role (null for logged-out visitors). */
export function useRole(): PricingRole {
  return useContext(RoleContext);
}

/** Convenience: is the current user a logged-in dealer? */
export function useIsDealer(): boolean {
  return useContext(RoleContext) === "dealer";
}
