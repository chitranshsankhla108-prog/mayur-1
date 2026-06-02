"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Eye, Cpu } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DynamicSpecFields } from "./dynamic-spec-fields";
import {
  CloudinaryUploader,
  type UploadedImage,
} from "./cloudinary-uploader";
import { slugify } from "@/lib/utils";
import type { Category, Product, ProductTemplate } from "@/types";

export function ProductForm({
  categories,
  templates,
  product,
}: {
  categories: Category[];
  templates: ProductTemplate[];
  product?: Product;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [basic, setBasic] = useState({
    title: product?.title ?? "",
    sku: product?.sku ?? "",
    brand: product?.brand ?? "",
    price: product?.price?.toString() ?? "",
    dealer_price: product?.dealer_price?.toString() ?? "",
    compare_at_price: product?.compare_at_price?.toString() ?? "",
    stock_quantity: product?.stock_quantity?.toString() ?? "",
    warranty: product?.warranty ?? "",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
  });

  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [templateId, setTemplateId] = useState(product?.template_id ?? "");
  const [specs, setSpecs] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    (product?.specs ?? []).forEach((s) => (init[s.field_key] = s.value));
    return init;
  });
  const [images, setImages] = useState<UploadedImage[]>(
    (product?.images ?? []).map((img) => ({
      image_url: img.image_url,
      cloudinary_public_id: img.cloudinary_public_id,
      is_main: img.is_main,
    }))
  );
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);

  const categoryTemplates = useMemo(
    () => templates.filter((t) => !categoryId || t.category_id === categoryId),
    [templates, categoryId]
  );

  const activeTemplate = templates.find((t) => t.id === templateId);
  const fields = activeTemplate?.fields ?? [];

  function setField(key: keyof typeof basic, value: string) {
    setBasic((b) => ({ ...b, [key]: value }));
  }

  function onCategoryChange(id: string) {
    setCategoryId(id);
    // Auto-select the category's template if there is exactly one.
    const matches = templates.filter((t) => t.category_id === id);
    if (matches.length === 1) setTemplateId(matches[0].id);
    else setTemplateId("");
    setSpecs({});
  }

  async function handleSave() {
    if (!basic.title.trim()) return toast.error("Product name is required");
    if (!categoryId) return toast.error("Please select a category");
    if (!basic.price || Number(basic.price) <= 0)
      return toast.error("Enter a valid public price");
    if (basic.dealer_price && Number(basic.dealer_price) < 0)
      return toast.error("Dealer price cannot be negative");
    if (basic.compare_at_price && Number(basic.compare_at_price) < 0)
      return toast.error("Compare at price cannot be negative");

    setSaving(true);
    const payload = {
      ...basic,
      slug: slugify(basic.title),
      price: Number(basic.price),
      dealer_price: basic.dealer_price ? Number(basic.dealer_price) : null,
      compare_at_price: basic.compare_at_price
        ? Number(basic.compare_at_price)
        : null,
      stock_quantity: Number(basic.stock_quantity || 0),
      category_id: categoryId,
      template_id: templateId || null,
      is_active: isActive,
      is_featured: isFeatured,
      specs: fields.map((f) => ({
        field_key: f.field_key,
        label: f.label,
        value: specs[f.field_key] ?? "",
      })),
      images,
    };

    try {
      const res = await fetch(
        product ? `/api/admin/products/${product.id}` : "/api/admin/products",
        {
          method: product ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      toast.success(product ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save product"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main column */}
      <div className="space-y-6 lg:col-span-2">
        {/* Basics */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Product Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Product name *</Label>
              <Input
                className="mt-1.5"
                value={basic.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="e.g. 150Ah Tubular Battery"
              />
            </div>
            <div>
              <Label>SKU</Label>
              <Input
                className="mt-1.5"
                value={basic.sku}
                onChange={(e) => setField("sku", e.target.value)}
                placeholder="ME-1001"
              />
            </div>
            <div>
              <Label>Brand</Label>
              <Input
                className="mt-1.5"
                value={basic.brand}
                onChange={(e) => setField("brand", e.target.value)}
              />
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={categoryId} onValueChange={onCategoryChange}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="admin-theme">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Template</Label>
              <Select
                value={templateId}
                onValueChange={(v) => {
                  setTemplateId(v);
                  setSpecs({});
                }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent className="admin-theme">
                  {categoryTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Public Price (₹) *</Label>
              <Input
                type="number"
                min="0"
                className="mt-1.5"
                value={basic.price}
                onChange={(e) => setField("price", e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Shown to all visitors and customers.
              </p>
            </div>
            <div>
              <Label>Dealer Price (₹)</Label>
              <Input
                type="number"
                min="0"
                className="mt-1.5"
                value={basic.dealer_price}
                onChange={(e) => setField("dealer_price", e.target.value)}
                placeholder="Optional"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Only visible to logged-in dealer accounts. Leave blank to use the
                public price.
              </p>
            </div>
            <div>
              <Label>Compare at price (₹)</Label>
              <Input
                type="number"
                min="0"
                className="mt-1.5"
                value={basic.compare_at_price}
                onChange={(e) => setField("compare_at_price", e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Optional old public price (shown struck through).
              </p>
            </div>
            <div>
              <Label>Stock quantity</Label>
              <Input
                type="number"
                className="mt-1.5"
                value={basic.stock_quantity}
                onChange={(e) => setField("stock_quantity", e.target.value)}
              />
            </div>
            <div>
              <Label>Warranty</Label>
              <Input
                className="mt-1.5"
                value={basic.warranty}
                onChange={(e) => setField("warranty", e.target.value)}
                placeholder="e.g. 2 Years"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Short description</Label>
              <Input
                className="mt-1.5"
                value={basic.short_description}
                onChange={(e) => setField("short_description", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Full description</Label>
              <Textarea
                className="mt-1.5 min-h-[120px]"
                value={basic.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Dynamic specs */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-crimson-600" />
            <h2 className="text-lg font-semibold text-foreground">
              {activeTemplate
                ? `${activeTemplate.name} Specifications`
                : "Specifications"}
            </h2>
          </div>
          <DynamicSpecFields
            fields={fields}
            values={specs}
            onChange={(key, value) =>
              setSpecs((s) => ({ ...s, [key]: value }))
            }
          />
        </section>
      </div>

      {/* Right column */}
      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Product Images
          </h2>
          <CloudinaryUploader images={images} onChange={setImages} />
        </section>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Visibility</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Active</p>
                <p className="text-xs text-muted-foreground">
                  Visible in the store
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Featured</p>
                <p className="text-xs text-muted-foreground">
                  Show on homepage
                </p>
              </div>
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <Button
              className="w-full"
              size="lg"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Product
                </>
              )}
            </Button>
            <Button variant="outline" className="w-full" disabled>
              <Eye className="h-4 w-4" /> Preview
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
