import Link from "next/link";
import { RoleAwarePrice } from "./role-aware-price";
import { AddToCartButton } from "./add-to-cart-button";
import { WishlistButton } from "./wishlist-button";
import { MediaPlaceholder } from "./media-placeholder";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  // Prefer the explicit main image, else the lowest sort_order, else the first.
  const images = product.images ?? [];
  const image =
    images.find((i) => i.is_main)?.image_url ??
    [...images].sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url;
  const inStock = product.stock_quantity > 0;
  const topSpecs = (product.specs ?? []).slice(0, 2);

  return (
    <div className="glass-card group relative flex flex-col overflow-hidden rounded-xl transition duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lift">
      <div className="absolute right-3 top-3 z-10">
        <WishlistButton product={product} />
      </div>

      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-ink-700"
      >
        {image ? (
          <img
            src={image}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <MediaPlaceholder
            iconName={product.category?.icon}
            hint={product.category?.slug ?? product.title}
          />
        )}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-[1px]">
            <span className="rounded-full border border-border bg-black/60 px-3 py-1 text-xs font-semibold text-white/90">
              Out of stock
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {product.category.name}
          </span>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-crimson-700">
            {product.title}
          </h3>
        </Link>

        {topSpecs.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {topSpecs.map((s) => (
              <li
                key={s.field_key}
                className="rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {s.value}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <RoleAwarePrice product={product} size="sm" />
          {inStock && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              In stock
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
          <AddToCartButton
            product={product}
            size="sm"
            className="flex-1"
            label="Add"
          />
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link href={`/products/${product.slug}`}>View</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
