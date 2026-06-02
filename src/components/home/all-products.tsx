"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { ProductCard } from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import { loadMoreProducts } from "@/lib/product-actions";
import type { Product } from "@/types";

/**
 * Homepage "Explore All Products" grid. Server-renders the first page; extra
 * pages are streamed in on demand via a server action so the homepage never
 * ships the whole catalog up front.
 */
export function AllProducts({
  initial,
  total,
}: {
  initial: Product[];
  total: number;
}) {
  const [products, setProducts] = useState<Product[]>(initial);
  const [page, setPage] = useState(0);
  const [pending, startTransition] = useTransition();

  const hasMore = products.length < total;

  function loadMore() {
    const next = page + 1;
    startTransition(async () => {
      const { products: more } = await loadMoreProducts(next);
      setProducts((prev) => [...prev, ...more]);
      setPage(next);
    });
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
        No products published yet. Check back soon.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={pending}
            className="min-w-44"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Load more products
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
