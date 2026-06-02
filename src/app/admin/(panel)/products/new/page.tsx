import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { getAllCategories, getTemplates } from "@/lib/queries";

export default async function NewProductPage() {
  const [categories, templates] = await Promise.all([
    getAllCategories(),
    getTemplates(),
  ]);
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">Create Product</h1>
        <p className="mt-1 text-muted-foreground">
          Add a new product to your inventory.
        </p>
      </div>

      <ProductForm categories={categories} templates={templates} />
    </div>
  );
}
