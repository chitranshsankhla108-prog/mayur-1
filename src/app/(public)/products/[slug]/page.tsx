import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductBuyBox } from "@/components/shop/product-buy-box";
import { ProductCard } from "@/components/shared/product-card";
import { RoleAwarePrice } from "@/components/shared/role-aware-price";
import { DealerPriceNote } from "@/components/shop/dealer-price-note";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/home/section-heading";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  return {
    title: product ? product.title : "Product",
    description: product?.short_description ?? undefined,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <div className="container-px py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/category/${product.category.slug}`}
              className="hover:text-foreground"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="line-clamp-1 text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images ?? []} title={product.title} />

        <div>
          {product.category && (
            <Link
              href={`/category/${product.category.slug}`}
              className="text-xs font-semibold uppercase tracking-wider text-crimson-600"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="mt-2 text-3xl font-bold text-foreground">{product.title}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {product.brand && <span>Brand: {product.brand}</span>}
            {product.sku && <span>SKU: {product.sku}</span>}
          </div>

          {product.short_description && (
            <p className="mt-4 text-foreground/80">
              {product.short_description}
            </p>
          )}

          <div className="mt-5">
            <RoleAwarePrice product={product} size="lg" />
            <p className="mt-1 text-xs text-muted-foreground">
              Inclusive of all taxes
            </p>
            <DealerPriceNote product={product} />
          </div>

          <div className="my-6 h-px bg-muted" />

          <ProductBuyBox product={product} />

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: ShieldCheck, label: product.warranty || "Warranty" },
              { icon: Truck, label: "Fast delivery" },
              { icon: RotateCcw, label: "Easy returns" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-muted p-3 text-center"
              >
                <f.icon className="h-5 w-5 text-crimson-600" />
                <span className="text-[11px] text-foreground/70">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specs + description */}
      <div className="mt-14 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-foreground">Description</h2>
          <p className="mt-3 leading-relaxed text-foreground/80">
            {product.description || product.short_description || "No description available."}
          </p>
        </div>

        {product.specs && product.specs.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground">Specifications</h2>
            <dl className="mt-3 overflow-hidden rounded-xl border border-border">
              {product.specs.map((s, i) => (
                <div
                  key={s.field_key}
                  className={`flex justify-between gap-4 px-4 py-3 text-sm ${
                    i % 2 === 0 ? "bg-muted" : ""
                  }`}
                >
                  <dt className="text-muted-foreground">{s.label}</dt>
                  <dd className="text-right font-medium text-foreground">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <SectionHeading title="Related products" />
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
