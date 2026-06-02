import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingWhatsApp } from "@/components/shared/whatsapp-button";
import { WHATSAPP_MESSAGES } from "@/lib/whatsapp";
import { getCurrentProfile } from "@/lib/auth";
import { RoleProvider } from "@/components/providers/role-provider";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "admin" || profile?.role === "staff";

  return (
    <RoleProvider role={profile?.role ?? null}>
      <div className="flex min-h-screen flex-col">
        <Header isAuthed={!!profile} isAdmin={isAdmin} />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingWhatsApp message={WHATSAPP_MESSAGES.support} />
      </div>
    </RoleProvider>
  );
}
