"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatINR } from "@/lib/utils";
import type { Category, Product } from "@/types";

export function AdminProductsTable({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const [items, setItems] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [stock, setStock] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (
        query &&
        !p.title.toLowerCase().includes(query.toLowerCase()) &&
        !(p.sku ?? "").toLowerCase().includes(query.toLowerCase())
      )
        return false;
      if (cat !== "all" && p.category_id !== cat) return false;
      if (status === "active" && !p.is_active) return false;
      if (status === "draft" && p.is_active) return false;
      if (stock === "in" && p.stock_quantity <= 0) return false;
      if (stock === "low" && (p.stock_quantity === 0 || p.stock_quantity > 15))
        return false;
      if (stock === "out" && p.stock_quantity > 0) return false;
      return true;
    });
  }, [items, query, cat, stock, status]);

  async function remove(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const prev = items;
    setItems((cur) => cur.filter((p) => p.id !== id));
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed");
      }
      toast.success("Product deleted");
    } catch (err) {
      setItems(prev); // rollback
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or SKU…"
            className="h-10 w-full rounded-lg border border-input bg-field pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-crimson/50 focus:outline-none"
          />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="h-10 w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="admin-theme">
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-10 w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="admin-theme">
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={stock} onValueChange={setStock}>
          <SelectTrigger className="h-10 w-36">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent className="admin-theme">
            <SelectItem value="all">All stock</SelectItem>
            <SelectItem value="in">In stock</SelectItem>
            <SelectItem value="low">Low stock</SelectItem>
            <SelectItem value="out">Out of stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Brand</th>
              <th className="px-4 py-3 font-medium">Public Price</th>
              <th className="px-4 py-3 font-medium">Dealer Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-accent/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                      {p.images?.[0]?.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images[0].image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          —
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="line-clamp-1 font-medium text-foreground">
                        {p.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.sku || "No SKU"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {p.category?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {p.brand || "—"}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">
                  {formatINR(p.price)}
                </td>
                <td className="px-4 py-3">
                  {p.dealer_price != null ? (
                    <span className="font-medium text-crimson-700">
                      {formatINR(p.dealer_price)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Same as public</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      p.stock_quantity <= 0
                        ? "font-medium text-red-600"
                        : p.stock_quantity <= 15
                          ? "font-medium text-amber-600"
                          : "text-foreground/80"
                    }
                  >
                    {p.stock_quantity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {p.is_active ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="muted">Draft</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.is_featured ? (
                    <Badge variant="default">Featured</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button asChild size="icon" variant="ghost" title="View public page">
                      <Link href={`/products/${p.slug}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="icon" variant="ghost" title="Edit">
                      <Link href={`/admin/products/${p.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Delete"
                      onClick={() => remove(p.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-10 text-center text-sm text-muted-foreground">
            No products found.
          </p>
        )}
      </div>
    </div>
  );
}
