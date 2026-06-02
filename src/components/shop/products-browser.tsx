"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/types";

type SortKey = "featured" | "price-asc" | "price-desc" | "newest";

export function ProductsBrowser({
  products,
  categories,
  initialQuery = "",
  initialCategory = "",
  lockedCategory = false,
}: {
  products: Product[];
  categories: Category[];
  initialQuery?: string;
  initialCategory?: string;
  lockedCategory?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCats, setSelectedCats] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)
      );
    }

    if (selectedCats.length > 0) {
      list = list.filter((p) => p.category_id && selectedCats.includes(p.category_id));
    }

    if (inStockOnly) list = list.filter((p) => p.stock_quantity > 0);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      default:
        list.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    }

    return list;
  }, [products, query, selectedCats, inStockOnly, sort]);

  function toggleCat(id: string) {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  const FilterPanel = (
    <div className="space-y-6">
      {!lockedCategory && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Category</h3>
          <div className="space-y-2.5">
            {categories.map((c) => (
              <label
                key={c.id}
                className="flex cursor-pointer items-center gap-2.5"
              >
                <Checkbox
                  checked={selectedCats.includes(c.id)}
                  onCheckedChange={() => toggleCat(c.id)}
                />
                <span className="text-sm text-foreground/80">{c.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Availability</h3>
        <label className="flex cursor-pointer items-center gap-2.5">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(v) => setInStockOnly(Boolean(v))}
          />
          <span className="text-sm text-foreground/80">In stock only</span>
        </label>
      </div>

      {(selectedCats.length > 0 || inStockOnly || query) && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => {
            setSelectedCats(lockedCategory ? selectedCats : []);
            setInStockOnly(false);
            setQuery("");
          }}
        >
          Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Sidebar (desktop) */}
      {!lockedCategory && (
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-5">
            {FilterPanel}
          </div>
        </aside>
      )}

      <div className="flex-1">
        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="h-11 flex-1 rounded-lg border border-input bg-ink-700/60 px-4 text-sm placeholder:text-muted-foreground focus:border-crimson/50 focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
          {!lockedCategory && (
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setMobileFilters(true)}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>
          )}
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </p>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-20 text-center">
            <p className="text-muted-foreground">
              No products match your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile filters drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileFilters(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setMobileFilters(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {FilterPanel}
            <Button
              className="mt-6 w-full"
              onClick={() => setMobileFilters(false)}
            >
              Show {filtered.length} results
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
