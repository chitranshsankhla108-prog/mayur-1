import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import {
  getAllCategories,
  getTemplates,
  getProductByIdAdmin,
} from "@/lib/queries";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, categories, templates] = await Promise.all([
    getProductByIdAdmin(params.id),
    getAllCategories(),
    getTemplates(),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">Edit Product</h1>
        <p className="mt-1 text-muted-foreground">{product.title}</p>
      </div>

      <ProductForm
        categories={categories}
        templates={templates}
        product={product}
      />
    </div>
  );
}
