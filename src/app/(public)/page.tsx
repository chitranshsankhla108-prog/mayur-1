import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  Tag,
  Headphones,
  ArrowRight,
} from "lucide-react";
import { Hero } from "@/components/home/hero";
import { FAQ } from "@/components/home/faq";
import { SectionHeading } from "@/components/home/section-heading";
import { CategoryCard } from "@/components/shared/category-card";
import { ProductCard } from "@/components/shared/product-card";
import { AllProducts } from "@/components/home/all-products";
import { AboutLocation } from "@/components/home/about-location";
import { Button } from "@/components/ui/button";
import { getCategories, getFeaturedProducts, getProductsPage } from "@/lib/queries";

const trust = [
  { icon: ShieldCheck, title: "Genuine & Warranty", desc: "100% authentic, brand-backed" },
  { icon: Tag, title: "Best Prices", desc: "Fair & transparent" },
  { icon: Truck, title: "Fast Delivery", desc: "Across the region" },
  { icon: Headphones, title: "Dedicated Support", desc: "Real humans on WhatsApp" },
];

const brands = ["Luminous", "Exide", "Hikvision", "CP Plus", "Amaron", "Microtek", "Su-Kam", "Waaree"];

const why = [
  { title: "One-stop electronics shop", desc: "Power backup, security and solar — all sourced and sold under one roof." },
  { title: "Transparent pricing", desc: "Clear prices, GST invoices and genuine warranty on every order." },
  { title: "Reliable support", desc: "From product selection to after-sales help, our team has your back." },
];

export default async function HomePage() {
  const [bestSellers, firstPage, categories] = await Promise.all([
    getFeaturedProducts(8),
    getProductsPage(0),
    getCategories(),
  ]);

  return (
    <>
      <Hero />

      {/* Trust strip */}
      <section className="border-y border-border bg-ink-800">
        <div className="container-px grid grid-cols-2 gap-px lg:grid-cols-4">
          {trust.map((t) => (
            <div key={t.title} className="flex items-center gap-3 py-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-crimson/10 text-crimson-600">
                <t.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      {bestSellers.length > 0 && (
        <section className="container-px py-16 lg:py-20">
          <SectionHeading
            eyebrow="Best sellers"
            title="Best Sellers"
            subtitle="Most trusted products for homes, shops, and businesses."
            href="/products"
          />
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Shop by category (compact) */}
      <section className="container-px border-t border-border py-16 lg:py-20">
        <SectionHeading
          eyebrow="Shop by category"
          title="Browse by category"
          subtitle="Find exactly what you need, faster."
          href="/products"
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </section>

      {/* Explore all products */}
      <section className="container-px border-t border-border py-16 lg:py-20">
        <SectionHeading
          eyebrow="Full catalog"
          title="Explore All Products"
          subtitle="Every active product in the store — load more as you browse."
          href="/products"
        />
        <AllProducts initial={firstPage.products} total={firstPage.total} />
      </section>

      {/* Brand showcase */}
      <section className="border-y border-border bg-ink-800 py-12">
        <div className="container-px">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Trusted brands we stock
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {brands.map((b) => (
              <span
                key={b}
                className="text-lg font-bold text-foreground/40 transition-colors hover:text-foreground/70"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Services / Why choose us */}
      <section className="container-px py-16 lg:py-20">
        <SectionHeading eyebrow="Why Mayur" title="Why choose us" />
        <div className="grid gap-5 lg:grid-cols-3">
          {why.map((w, i) => (
            <div
              key={w.title}
              className="rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-crimson/10 text-sm font-bold text-crimson-600">
                0{i + 1}
              </span>
              <h3 className="mt-4 font-semibold text-foreground">{w.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About + Location */}
      <div className="border-t border-border">
        <AboutLocation />
      </div>

      <FAQ />

      {/* CTA */}
      <section className="container-px pb-20">
        <div className="relative overflow-hidden rounded-2xl bg-crimson-600 p-10 text-center sm:p-14">
          <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-white/25" />
          <h2 className="relative text-3xl font-bold tracking-tight text-white">
            Ready to power up?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-white/85">
            Browse the full catalog of genuine electronics at fair prices.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-white text-crimson-700 hover:bg-white/90"
            >
              <Link href="/products">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
