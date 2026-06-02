// ============================================================
// Razorpay server helper. SERVER ONLY.
// ============================================================
import crypto from "crypto";

/** A value that is unset or still a placeholder (contains "xxxx"/"your-"). */
function isPlaceholder(v?: string): boolean {
  if (!v) return true;
  const s = v.toLowerCase();
  return s.includes("xxxx") || s.includes("your-") || s.trim() === "";
}

export function isRazorpayConfigured(): boolean {
  return (
    !isPlaceholder(process.env.RAZORPAY_KEY_ID) &&
    !isPlaceholder(process.env.RAZORPAY_KEY_SECRET)
  );
}

/** Lazily construct the Razorpay SDK instance. */
export function getRazorpay() {
  const Razorpay = require("razorpay");
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

/** Verify the Razorpay payment signature returned by the checkout modal. */
export function verifyRazorpaySignature(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): boolean {
  const body = `${params.razorpay_order_id}|${params.razorpay_payment_id}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expected === params.razorpay_signature;
}
