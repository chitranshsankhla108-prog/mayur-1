"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, getRole } from "@/lib/auth-actions";

export function LoginForm({ admin = false }: { admin?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await signIn(email, password);
      const role = user ? await getRole(user.id) : "customer";
      const isStaff = role === "admin" || role === "staff";

      // From the dedicated admin login, a non-admin account is rejected outright.
      if (admin && !isStaff) {
        toast.error("This account is not an admin.");
        setLoading(false);
        return;
      }

      // Role-based home: admins/staff → /admin, customers → /account.
      const home = isStaff ? "/admin" : "/account";

      // Honour ?redirect= only when the user's role is allowed to view it —
      // a customer can never be sent into /admin, even with a redirect param.
      const redirectAllowed =
        redirect &&
        (isStaff || !redirect.startsWith("/admin"));
      const dest = redirectAllowed ? (redirect as string) : home;

      toast.success("Signed in successfully");
      router.push(dest);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          className="mt-1.5"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          {!admin && (
            <Link
              href="/forgot-password"
              className="text-xs text-crimson-600 hover:text-crimson-700"
            >
              Forgot password?
            </Link>
          )}
        </div>
        <Input
          id="password"
          type="password"
          className="mt-1.5"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      {!admin && (
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-crimson-600">
            Create one
          </Link>
        </p>
      )}
    </form>
  );
}
