import {
  MapPin,
  Phone,
  Navigation,
  ShieldCheck,
  BadgeCheck,
  Wrench,
  Headphones,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

const sells = [
  "Inverters",
  "Batteries",
  "CCTV",
  "Solar",
  "Electrical products",
];

const trust = [
  { icon: BadgeCheck, label: "Genuine products" },
  { icon: ShieldCheck, label: "Warranty support" },
  { icon: Wrench, label: "Installation help" },
  { icon: MapPin, label: "Local service" },
  { icon: Headphones, label: "Fast support" },
];

export function AboutLocation() {
  const embedUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL;
  const directionsUrl =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_DIRECTIONS_URL ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      SITE.address
    )}`;
  const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || SITE.phone;
  const phoneHref = `tel:${phone.replace(/\s+/g, "")}`;

  return (
    <section id="about" className="container-px scroll-mt-24 py-16 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* About copy */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-crimson-600">
            About us
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            About Mayur Electronics
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
            Mayur Electronics is your trusted local store for power backup,
            security and solar. We supply genuine, warranty-backed products for
            homes, shops and businesses — with honest pricing and real
            after-sales support you can count on.
          </p>

          <div className="mt-6">
            <p className="text-sm font-semibold text-foreground">What we sell</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {sells.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-foreground/80"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {trust.map((t) => (
              <li
                key={t.label}
                className="flex items-center gap-2.5 text-sm text-foreground/80"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-crimson/10 text-crimson-600">
                  <t.icon className="h-4 w-4" />
                </span>
                {t.label}
              </li>
            ))}
          </ul>

          <div
            id="contact"
            className="mt-8 flex scroll-mt-24 flex-wrap gap-3"
          >
            <Button asChild size="lg">
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="h-4 w-4" /> Get Directions
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={phoneHref}>
                <Phone className="h-4 w-4" /> Call Now
              </a>
            </Button>
          </div>
        </div>

        {/* Map */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-crimson-600" />
              <p className="truncate text-sm font-medium text-foreground">
                {SITE.address}
              </p>
            </div>
            <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
              <Clock className="h-3.5 w-3.5" /> Mon–Sat
            </span>
          </div>

          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="Mayur Electronics location"
              className="h-[320px] w-full lg:h-[380px]"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="relative flex h-[320px] w-full flex-col items-center justify-center gap-3 bg-grid-dark px-6 text-center lg:h-[380px]">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-crimson/10 text-crimson-600">
                <MapPin className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold text-foreground">
                Map preview unavailable
              </p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Add <code className="rounded bg-muted px-1 py-0.5">
                  NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL
                </code>{" "}
                in your environment/config to show the live Google Map here.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-1">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="h-4 w-4" /> Open in Google Maps
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
