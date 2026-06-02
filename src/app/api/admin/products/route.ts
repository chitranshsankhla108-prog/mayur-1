import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Ensure the caller is an admin/staff member. */
async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, supabase };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  const ok = profile?.role === "admin" || profile?.role === "staff";
  return { ok, supabase };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { specs, images, ...productData } = body;

    const { ok, supabase } = await requireAdmin();
    if (!ok) {
      return NextResponse.json(
        { error: "Unauthorized or persistence not configured" },
        { status: 401 }
      );
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert(productData)
      .select("id")
      .single();
    if (error) throw error;

    if (specs?.length) {
      await supabase.from("product_specs").insert(
        specs.map((s: any) => ({ ...s, product_id: product.id }))
      );
    }
    if (images?.length) {
      await supabase.from("product_images").insert(
        images.map((img: any, i: number) => ({
          product_id: product.id,
          image_url: img.image_url,
          cloudinary_public_id: img.cloudinary_public_id,
          is_main: img.is_main,
          sort_order: i,
        }))
      );
    }

    return NextResponse.json({ id: product.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create" },
      { status: 500 }
    );
  }
}
