import { requireAuth, getCurrentProfile } from "@/lib/auth";
import { CheckoutClient } from "./checkout-client";

/**
 * Checkout is a protected action: a logged-in user is required BEFORE an order
 * can be placed. `requireAuth` redirects guests to /login?redirect=/checkout
 * server-side (middleware also guards this route). After login the user lands
 * back here with their cart intact (cart lives in localStorage).
 */
export default async function CheckoutPage() {
  await requireAuth("/login?redirect=/checkout");
  const profile = await getCurrentProfile();

  return <CheckoutClient profile={profile} />;
}
