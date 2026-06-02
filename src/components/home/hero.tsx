import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Tags,
  Truck,
  BadgeCheck,
  MessageCircle,
  Zap,
  BatteryCharging,
  Cctv,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WHATSAPP_NUMBER } from "@/lib/constants";

const badges = [
  { icon: BadgeCheck, label: "Genuine Products" },
  { icon: ShieldCheck, label: "Warranty Support" },
  { icon: Tags, label: "Bulk B2B Pricing" },
  { icon: Truck, label: "Fast Delivery" },
];

// On-brand product domains — drives the hero showroom tiles (no stock photos).
const domains = [
  { icon: Zap, label: "Power Backup", active: true },
  { icon: BatteryCharging, label: "Batteries", active: false },
  { icon: Cctv, label: "CCTV Security", active: false },
  { icon: Sun, label: "Solar", active: false },
];

const quoteHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hello, I need help choosing inverter / battery / CCTV products for my home / business."
)}`;

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-ink">
      {/* subtle industrial grid + a single controlled red energy line */}
      <div className="pointer-events-none absolute inset-0 bg-grid-dark [background-size:64px_64px] opacity-30" />
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-crimson-600/60 to-transparent" />

      <div className="container-px relative grid items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
        {/* Left — copy */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground/70">
            <span className="h-1.5 w-1.5 rounded-full bg-crimson-500" />
            Energy backup, security &amp; solar — under one roof
          </span>

          <h1 className="mt-6 max-w-xl text-balance text-4xl font-semibold leading-[1.07] tracking-tight text-foreground sm:text-5xl">
            Power backup, CCTV &amp; electrical solutions you can{" "}
            <span className="text-crimson-500">rely on</span>.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
            Shop trusted inverters, batteries, CCTV systems, solar products and
            electrical accessories — genuine products with warranty and expert
            installation support.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/products">
                Shop Products <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={quoteHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> Get Quote on WhatsApp
              </a>
            </Button>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {badges.map((b) => (
              <li
                key={b.label}
                className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2.5"
              >
                <b.icon className="h-4 w-4 shrink-0 text-crimson-500" />
                <span className="text-xs font-medium text-foreground/75">
                  {b.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — branded showroom panel (no stock photo) */}
        <div className="relative hidden lg:block">
          <div className="glass relative overflow-hidden rounded-2xl">
            {/* header strip */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Mayur Showroom
              </p>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                In stock
              </span>
            </div>

            {/* domain tiles */}
            <div className="relative grid grid-cols-2 gap-px bg-border">
              <div className="pointer-events-none absolute inset-0 bg-grid-dark [background-size:28px_28px] opacity-[0.15]" />
              {domains.map((d) => (
                <div
                  key={d.label}
                  className="relative flex aspect-[5/3] flex-col justify-between bg-ink-700 p-5"
                >
                  <d.icon
                    className={
                      d.active
                        ? "h-7 w-7 text-crimson-500"
                        : "h-7 w-7 text-foreground/30"
                    }
                    strokeWidth={1.5}
                  />
                  <span className="text-xs font-medium text-foreground/70">
                    {d.label}
                  </span>
                  {d.active && (
                    <span className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-crimson-500" />
                  )}
                </div>
              ))}
            </div>

            {/* spec footer */}
            <div className="h-px w-full bg-gradient-to-r from-crimson-600/70 via-crimson-600/20 to-transparent" />
            <div className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-crimson-500">
                  Featured setup
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  Sine Wave Inverter + Tubular Battery
                </p>
              </div>
              <span className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground/70">
                2 yr warranty
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
