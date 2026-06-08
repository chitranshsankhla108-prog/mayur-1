import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    if (profile?.role !== "admin" && profile?.role !== "staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ORDER_STATUSES = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

    const updates: Record<string, unknown> = {};
    if (typeof body.status === "string") {
      if (!ORDER_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updates.status = body.status;
    }
    if (typeof body.payment_status === "string") {
      if (!PAYMENT_STATUSES.includes(body.payment_status)) {
        return NextResponse.json(
          { error: "Invalid payment status" },
          { status: 400 }
        );
      }
      updates.payment_status = body.payment_status;
      // Stamp the paid time when an admin marks a payment as received.
      updates.paid_at = body.payment_status === "paid" ? new Date().toISOString() : null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", params.id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
