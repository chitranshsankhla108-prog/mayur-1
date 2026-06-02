import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminProductsTable } from "@/components/admin/admin-products-table";
import { getAllProductsAdmin, getAllCategories } from "@/lib/queries";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getAllProductsAdmin(),
    getAllCategories(),
  ]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your catalog — {products.length} products.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <AdminProductsTable initialProducts={products} categories={categories} />
    </div>
  );
}
