import Link from "next/link";
import { Zap, Mail, Phone, MapPin } from "lucide-react";
import { SITE } from "@/lib/constants";

const footerLinks = {
  Shop: [
    { label: "All Products", href: "/products" },
    { label: "Inverters", href: "/category/inverters" },
    { label: "Batteries", href: "/category/batteries" },
    { label: "CCTV Cameras", href: "/category/cctv-cameras" },
    { label: "Solar Products", href: "/category/solar-products" },
  ],
  Company: [
    { label: "About Us", href: "/" },
    { label: "Warranty", href: "/" },
    { label: "Contact", href: "/" },
  ],
  Account: [
    { label: "My Account", href: "/account" },
    { label: "Orders", href: "/account/orders" },
    { label: "Wishlist", href: "/account/wishlist" },
    { label: "Login", href: "/login" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-ink-800">
      <div className="container-px py-14">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-glow-sm">
                <Zap className="h-5 w-5 text-white" />
              </span>
              <span className="text-lg font-bold">
                Mayur<span className="text-crimson-600">.</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              {SITE.description}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-crimson-600" /> {SITE.phone}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-crimson-600" /> {SITE.email}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-crimson-600" /> {SITE.address}
              </li>
            </ul>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-foreground">{title}</h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-crimson-600"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Genuine Products • Warranty Support • Fast Delivery
          </p>
        </div>
      </div>
    </footer>
  );
}
