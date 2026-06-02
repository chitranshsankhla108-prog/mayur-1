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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ok, supabase } = await requireAdmin();
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("product_templates")
      .insert({
        name: body.name,
        category_id: body.category_id || null,
        description: body.description || null,
        is_preset: false,
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ template: { ...data, fields: [] } });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create" },
      { status: 500 }
    );
  }
}
