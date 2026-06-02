import { NextResponse } from "next/server";
import { generateOrderNumber } from "@/lib/utils";
import { isRazorpayConfigured, getRazorpay } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, shipping_address, payment_method, amounts } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();
    const total = amounts?.total ?? 0;

    // Attempt to persist the order to Supabase (best-effort).
    let orderId: string | null = null;
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // COD = order is placed/accepted with payment collected later (cod_pending).
      // Online = order stays pending until the gateway payment is verified.
      const isCod = payment_method === "cod";
      const { data: inserted } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id ?? null,
          order_number: orderNumber,
          status: isCod ? "confirmed" : "pending",
          payment_status: "pending",
          payment_method,
          subtotal: amounts?.sub ?? 0,
          gst_amount: amounts?.gst ?? 0,
          shipping_amount: amounts?.shipping ?? 0,
          total_amount: total,
          shipping_address,
        })
        .select("id")
        .single();

      if (inserted?.id) {
        orderId = inserted.id;
        await supabase.from("order_items").insert(
          items.map((i: any) => ({
            order_id: inserted.id,
            product_id: i.product_id,
            product_name: i.product_name,
            quantity: i.quantity,
            unit_price: i.unit_price,
            total_price: i.unit_price * i.quantity,
            // Preserve which tier was charged (public/dealer) on this line.
            price_type: i.price_type ?? "public",
          }))
        );
      }
    } catch {
      // Supabase not configured / table missing — continue without persistence.
    }

    const order = { id: orderId, order_number: orderNumber };

    // Create a Razorpay order for online payments when configured.
    if (payment_method !== "cod" && isRazorpayConfigured()) {
      try {
        const razorpay = getRazorpay();
        const rzpOrder = await razorpay.orders.create({
          amount: Math.round(total * 100),
          currency: "INR",
          receipt: orderNumber,
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

    // Online method chosen but the gateway is not configured (or its order
    // creation failed): the client must run the dev-only payment simulation
    // step. COD never simulates — it completes on placement.
    const needsSimulation = payment_method !== "cod";
    return NextResponse.json({ order, razorpay: null, simulate: needsSimulation });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
