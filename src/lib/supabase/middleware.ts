import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request and enforces
 * route protection for /account and /admin.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const hasEnv =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without env configured, don't block navigation during local setup.
  if (!hasEnv) return supabaseResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAccount = path.startsWith("/account");
  const isAdmin = path.startsWith("/admin") && path !== "/admin/login";

  // Dev-only diagnostics: set SUPABASE_DEBUG_AUTH=true in .env.local.
  const debug = process.env.SUPABASE_DEBUG_AUTH === "true";
  const log = (msg: string) => debug && console.log(`[auth] ${path} — ${msg}`);

  if ((isAccount || isAdmin) && !user) {
    log("no session → redirecting to login");
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  if (isAdmin && user) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (error) log(`profile read failed (${error.message}) — likely RLS or missing row`);
    log(`user=${user.email} role=${profile?.role ?? "none"}`);

    if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
      log(
        !profile
          ? "blocked: no profile row for this user_id"
          : `blocked: role '${profile.role}' is not admin/staff`
      );
      const url = request.nextUrl.clone();
      url.pathname = "/account";
      url.search = "";
      return NextResponse.redirect(url);
    }
    log("allowed: admin/staff");
  } else if (isAccount && user) {
    log(`account access allowed for ${user.email}`);
  }

  return supabaseResponse;
}
