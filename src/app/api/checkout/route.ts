import { NextResponse } from "next/server";
import { generateOrderNumber } from "@/lib/utils";
import { isRazorpayConfigured, getRazorpay } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";

function hasEnv() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Map a place_order() exception into a friendly client response. */
function orderError(message: string): NextResponse | null {
  if (message.includes("AUTH_REQUIRED")) {
    return NextResponse.json(
      { error: "Please login to continue checkout." },
      { status: 401 }
    );
  }
  if (message.includes("OUT_OF_STOCK")) {
    const name = message.split("OUT_OF_STOCK:")[1]?.trim();
    return NextResponse.json(
      {
        error: name
          ? `"${name}" is out of stock or doesn't have enough quantity.`
          : "One of your items is out of stock.",
      },
      { status: 409 }
    );
  }
  if (message.includes("PRODUCT_UNAVAILABLE")) {
    return NextResponse.json(
      { error: "One of your items is no longer available." },
      { status: 409 }
    );
  }
  if (message.includes("EMPTY_CART")) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, shipping_address, payment_method, delivery, coupon } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // ----------------------------------------------------------------
    // No Supabase configured (local dev / preview without env): keep the
    // app usable with a non-persisted order. Prices are not authoritative
    // here, but no real money or stock exists either.
    // ----------------------------------------------------------------
    if (!hasEnv()) {
      const order = { id: null, order_number: generateOrderNumber() };
      // All payments are online → the client runs the simulation step.
      return NextResponse.json({ order, razorpay: null, simulate: true });
    }

    // ----------------------------------------------------------------
    // Authoritative path: place_order() recomputes every price, validates
    // and decrements stock, and writes the order + items in ONE transaction.
    // Client-sent unit prices and totals are deliberately ignored.
    // ----------------------------------------------------------------
    const supabase = createClient();

    // Login is REQUIRED before an order can be placed — enforced server-side so
    // a direct API call without a session can never create an order. (place_order
    // also raises AUTH_REQUIRED as a second line of defence.)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Please login to continue checkout." },
        { status: 401 }
      );
    }

    const { data: placed, error } = await supabase.rpc("place_order", {
      p_items: items.map((i: { product_id: string; quantity: number }) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      })),
      p_shipping: shipping_address ?? {},
      p_payment_method: payment_method ?? "razorpay",
      p_delivery: delivery ?? "standard",
      p_coupon: coupon ?? null,
    });

    if (error) {
      const friendly = orderError(error.message ?? "");
      if (friendly) return friendly;
      // Genuine server/DB error — never fake a successful order.
      return NextResponse.json(
        { error: "We couldn't place your order. Please try again." },
        { status: 500 }
      );
    }

    const result = placed as {
      id: string;
      order_number: string;
      total: number;
    };
    const order = { id: result.id, order_number: result.order_number };

    // Online payment with a configured gateway: create the Razorpay order
    // using the SERVER-computed total (not the client's number).
    if (isRazorpayConfigured()) {
      try {
        const razorpay = getRazorpay();
        const rzpOrder = await razorpay.orders.create({
          amount: Math.round(Number(result.total) * 100),
          currency: "INR",
          receipt: result.order_number,
        });
        return NextResponse.json({
          order,
          razorpay: {
            id: rzpOrder.id,
            amount: rzpOrder.amount,
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          },
        });
      } catch {
        // Fall through to non-gateway completion.
      }
    }

    // Gateway not configured: the client runs the dev-only simulation step.
    return NextResponse.json({ order, razorpay: null, simulate: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
