import { AdminCategoriesManager } from "@/components/admin/admin-categories-manager";
import { getAllCategories } from "@/lib/queries";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();
  return <AdminCategoriesManager initialCategories={categories} />;
}
