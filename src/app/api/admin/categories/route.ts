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
      .from("categories")
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        image_url: body.image_url || null,
        is_active: body.is_active ?? true,
        sort_order: body.sort_order ?? 0,
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ category: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create" },
      { status: 500 }
    );
  }
}
