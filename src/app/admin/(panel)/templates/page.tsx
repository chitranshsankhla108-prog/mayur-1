import { TemplateBuilder } from "@/components/admin/template-builder";
import { getTemplates, getAllCategories } from "@/lib/queries";

export default async function AdminTemplatesPage() {
  const [templates, categories] = await Promise.all([
    getTemplates(),
    getAllCategories(),
  ]);
  return (
    <TemplateBuilder initialTemplates={templates} categories={categories} />
  );
}
