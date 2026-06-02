"use client";

import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/** Floating WhatsApp action shown sitewide. */
export function FloatingWhatsApp({ message }: { message?: string }) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-semibold text-black shadow-[0_8px_30px_-6px_rgba(37,211,102,0.6)] transition-transform hover:scale-105"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden text-sm sm:inline">Chat with us</span>
    </a>
  );
}

/** Inline WhatsApp link/button for product inquiries & quotes. */
export function WhatsAppLink({
  message,
  className,
  children,
}: {
  message?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#25D366]/40 bg-[#25D366]/10 px-5 text-sm font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/20",
        className
      )}
    >
      <MessageCircle className="h-4 w-4" />
      {children}
    </a>
  );
}
