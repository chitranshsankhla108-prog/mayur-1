import { WHATSAPP_NUMBER } from "./constants";

/** Build a WhatsApp click-to-chat URL with an optional pre-filled message. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_MESSAGES = {
  generalQuote:
    "Hello, I need help choosing inverter/battery/CCTV products for my home/business.",
  productInquiry: (name: string) =>
    `Hello, I want details about ${name}. Please share price, warranty, and availability.`,
  support: "Hello, I need support with my order on Mayur Electronics.",
};
