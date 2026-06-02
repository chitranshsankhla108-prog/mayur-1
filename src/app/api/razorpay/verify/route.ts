import { NextResponse } from "next/server";
import { verifyRazorpaySignature, isRazorpayConfigured } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";

/** Best-effort: mark a persisted order as paid + confirmed. */
async function markPaid(
  orderNumber: string,
  razorpayOrderId: string | null,
  razorpayPaymentId: string | null
) {
  try {
    const supabase = createClient();
    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
      })
      .eq("order_number", orderNumber);
  } catch {
    // ignore persistence errors (Supabase not configured / table missing)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_number,
      simulate,
    } = body;

    const configured = isRazorpayConfigured();

    // DEV-ONLY: when the real gateway is not configured, the checkout page runs
    // a manual simulation step. Only honour `simulate` while unconfigured so it
    // can never be used to fake a paid order in production.
    if (!configured) {
      if (simulate === true) {
        await markPaid(order_number, null, null);
        return NextResponse.json({ verified: true, simulated: true });
      }
      return NextResponse.json({ verified: false, reason: "not_configured" });
    }

    const verified = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (verified) {
      await markPaid(order_number, razorpay_order_id, razorpay_payment_id);
    }

    return NextResponse.json({ verified });
  } catch (err) {
    return NextResponse.json(
      { verified: false, error: err instanceof Error ? err.message : "error" },
      { status: 500 }
    );
  }
}
