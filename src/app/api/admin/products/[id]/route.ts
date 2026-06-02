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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { specs, images, id: _ignore, ...productData } = body;

    const { ok, supabase } = await requireAdmin();
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("products")
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq("id", params.id);
    if (error) throw error;

    // Replace specs (simplest reliable strategy).
    await supabase.from("product_specs").delete().eq("product_id", params.id);
    if (specs?.length) {
      await supabase.from("product_specs").insert(
        specs.map((s: any) => ({
          product_id: params.id,
          field_key: s.field_key,
          label: s.label,
          value: s.value,
        }))
      );
    }

    // Replace images.
    await supabase.from("product_images").delete().eq("product_id", params.id);
    if (images?.length) {
      await supabase.from("product_images").insert(
        images.map((img: any, i: number) => ({
          product_id: params.id,
          image_url: img.image_url,
          cloudinary_public_id: img.cloudinary_public_id ?? null,
          is_main: img.is_main ?? i === 0,
          sort_order: i,
        }))
      );
    }

    return NextResponse.json({ id: params.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { ok, supabase } = await requireAdmin();
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // specs/images cascade via FK on delete cascade.
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete" },
      { status: 500 }
    );
  }
}
