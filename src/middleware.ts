import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// Only run auth middleware on protected areas. Public pages (home, products,
// category, product detail, cart) need no session round-trip, so navigation to
// them stays instant instead of paying a Supabase getUser() call per request.
// /checkout is included because placing an order requires a logged-in user.
export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/checkout"],
};
