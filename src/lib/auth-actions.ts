"use client";

import { createClient } from "@/lib/supabase/client";

function hasSupabaseEnv(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export interface SignUpInput {
  full_name: string;
  email: string;
  mobile: string;
  password: string;
  business_name?: string;
  gst_number?: string;
}

export async function signUp(input: SignUpInput) {
  if (!hasSupabaseEnv())
    throw new Error("Authentication is not configured yet (set Supabase env).");

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.full_name,
        mobile: input.mobile,
        business_name: input.business_name ?? null,
        gst_number: input.gst_number ?? null,
      },
    },
  });
  if (error) throw error;

  // Best-effort profile upsert (a DB trigger may also handle this).
  if (data.user) {
    await supabase.from("profiles").upsert(
      {
        user_id: data.user.id,
        full_name: input.full_name,
        email: input.email,
        mobile: input.mobile,
        business_name: input.business_name ?? null,
        gst_number: input.gst_number ?? null,
        role: "customer",
      },
      { onConflict: "user_id" }
    );
  }
  return data;
}

export async function signIn(email: string, password: string) {
  if (!hasSupabaseEnv())
    throw new Error("Authentication is not configured yet (set Supabase env).");

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function getRole(userId: string): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .single();
  return data?.role ?? "customer";
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  if (!hasSupabaseEnv())
    throw new Error("Authentication is not configured yet (set Supabase env).");
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  });
  if (error) throw error;
}
