import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

/** Update template meta and replace its fields with the provided list. */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { ok, supabase } = await requireAdmin();
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (body.name || body.category_id !== undefined) {
      const { error } = await supabase
        .from("product_templates")
        .update({
          ...(body.name ? { name: body.name } : {}),
          ...(body.category_id !== undefined
            ? { category_id: body.category_id || null }
            : {}),
        })
        .eq("id", params.id);
      if (error) throw error;
    }

    if (Array.isArray(body.fields)) {
      await supabase
        .from("template_fields")
        .delete()
        .eq("template_id", params.id);
      if (body.fields.length) {
        const { error } = await supabase.from("template_fields").insert(
          body.fields.map((f: any, i: number) => ({
            template_id: params.id,
            label: f.label,
            field_key: f.field_key,
            field_type: f.field_type,
            placeholder: f.placeholder || null,
            options: f.options ?? null,
            is_required: f.is_required ?? false,
            sort_order: i + 1,
          }))
        );
        if (error) throw error;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save" },
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
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { error } = await supabase
      .from("product_templates")
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
