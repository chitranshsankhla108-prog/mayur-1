import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Admin Sign in" };

export default function AdminLoginPage() {
  return (
    <AuthLayout
      title="Admin Console"
      subtitle="Sign in with your admin credentials to manage the store."
    >
      <Suspense>
        <LoginForm admin />
      </Suspense>
    </AuthLayout>
  );
}
