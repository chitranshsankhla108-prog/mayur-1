"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  is_active: true,
};

export function AdminCategoriesManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [items, setItems] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openNew() {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(c: Category) {
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      image_url: c.image_url ?? "",
      is_active: c.is_active,
    });
    setEditing(c.id);
    setShowForm(true);
  }

  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Category name is required");
    const slug = form.slug || slugify(form.name);
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/categories/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, slug }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Update failed");
        setItems((prev) =>
          prev.map((c) => (c.id === editing ? (data.category as Category) : c))
        );
        toast.success("Category updated");
      } else {
        const res = await fetch(`/api/admin/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, slug, sort_order: items.length + 1 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Create failed");
        setItems((prev) => [...prev, data.category as Category]);
        toast.success("Category created");
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this category? Products will be unlinked.")) return;
    const prev = items;
    setItems((cur) => cur.filter((c) => c.id !== id));
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed");
      }
      toast.success("Category deleted");
    } catch (err) {
      setItems(prev);
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="mt-1 text-muted-foreground">
            Organize your products into categories.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> New Category
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={save}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <h2 className="mb-4 font-semibold text-foreground">
            {editing ? "Edit category" : "New category"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Name *</Label>
              <Input
                className="mt-1.5"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                className="mt-1.5"
                value={form.slug}
                placeholder="auto-generated"
                onChange={(e) => update("slug", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Image URL</Label>
              <Input
                className="mt-1.5"
                value={form.image_url}
                onChange={(e) => update("image_url", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                className="mt-1.5"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => update("is_active", v)}
              />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save category"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <div
            key={c.id}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="relative aspect-[5/2] bg-muted">
              {c.image_url ? (
                <img
                  src={c.image_url}
                  alt={c.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <FolderTree className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{c.name}</h3>
                {c.is_active ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="muted">Hidden</Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">/{c.slug}</p>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => openEdit(c)}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(c.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-600" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
