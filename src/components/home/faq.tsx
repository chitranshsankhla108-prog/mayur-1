"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Are the products genuine and warranty-backed?",
    a: "Every product we sell is 100% genuine with manufacturer warranty. Warranty terms are listed on each product page and honoured through our service network.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI, credit/debit cards, net banking and Razorpay online payments. Cash on Delivery is available on selected products and locations.",
  },
  {
    q: "How fast is delivery?",
    a: "Standard delivery takes 4-6 business days. Express delivery (1-2 days) and in-store pickup are available at checkout.",
  },
  {
    q: "Can I get a bulk / B2B quote?",
    a: "Absolutely. Contact our sales team on WhatsApp for business pricing, GST invoicing and bulk orders.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="container-px py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold text-foreground">Frequently asked questions</h2>
        <p className="mt-3 text-muted-foreground">
          Everything you need to know before you buy.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-medium text-foreground">{item.q}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-crimson-600 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
