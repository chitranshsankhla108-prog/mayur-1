"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-actions";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showBusiness, setShowBusiness] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    email: "",
    password: "",
    business_name: "",
    gst_number: "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signUp(form);
      toast.success("Account created! Please check your email to confirm.");
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="full_name">Full name</Label>
        <Input
          id="full_name"
          className="mt-1.5"
          value={form.full_name}
          onChange={(e) => update("full_name", e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="mobile">Mobile</Label>
          <Input
            id="mobile"
            className="mt-1.5"
            value={form.mobile}
            onChange={(e) => update("mobile", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            className="mt-1.5"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          className="mt-1.5"
          placeholder="At least 6 characters"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          required
        />
      </div>

      <button
        type="button"
        onClick={() => setShowBusiness((v) => !v)}
        className="text-xs font-medium text-crimson-600 hover:text-crimson-700"
      >
        {showBusiness ? "− Hide" : "+ Add"} business details (optional)
      </button>

      {showBusiness && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="business_name">Business name</Label>
            <Input
              id="business_name"
              className="mt-1.5"
              value={form.business_name}
              onChange={(e) => update("business_name", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="gst_number">GST number</Label>
            <Input
              id="gst_number"
              className="mt-1.5"
              value={form.gst_number}
              onChange={(e) => update("gst_number", e.target.value)}
            />
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-crimson-600">
          Sign in
        </Link>
      </p>
    </form>
  );
}
