import type { Metadata } from "next";
import { ProductsBrowser } from "@/components/shop/products-browser";
import { getProducts, getCategories, getCategoryBySlug } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse inverters, batteries, CCTV systems, solar products and more.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  const initialCategory = searchParams.category
    ? (await getCategoryBySlug(searchParams.category))?.id ?? ""
    : "";

  return (
    <div className="container-px py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">All Products</h1>
        <p className="mt-2 text-muted-foreground">
          Genuine electronics, fair pricing and expert support.
        </p>
      </div>
      <ProductsBrowser
        products={products}
        categories={categories}
        initialQuery={searchParams.q ?? ""}
        initialCategory={initialCategory}
      />
    </div>
  );
}
