"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  LayoutTemplate,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slugify } from "@/lib/utils";
import type { Category, FieldType, ProductTemplate, TemplateField } from "@/types";

const FIELD_TYPES: FieldType[] = [
  "text",
  "number",
  "select",
  "textarea",
  "boolean",
];

export function TemplateBuilder({
  initialTemplates,
  categories,
}: {
  initialTemplates: ProductTemplate[];
  categories: Category[];
}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [activeId, setActiveId] = useState(initialTemplates[0]?.id ?? "");
  const active = templates.find((t) => t.id === activeId);

  // New field draft
  const [draft, setDraft] = useState({
    label: "",
    field_type: "text" as FieldType,
    placeholder: "",
    options: "",
    is_required: false,
  });

  // New template draft
  const [showNew, setShowNew] = useState(false);
  const [newTpl, setNewTpl] = useState({ name: "", category_id: "" });

  function addField() {
    if (!active) return;
    if (!draft.label.trim()) return toast.error("Field label is required");
    const key = slugify(draft.label).replace(/-/g, "_");
    const field: TemplateField = {
      id: crypto.randomUUID(),
      template_id: active.id,
      label: draft.label,
      field_key: key,
      field_type: draft.field_type,
      placeholder: draft.placeholder || null,
      options:
        draft.field_type === "select"
          ? draft.options.split(",").map((o) => o.trim()).filter(Boolean)
          : null,
      is_required: draft.is_required,
      sort_order: (active.fields?.length ?? 0) + 1,
    };
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === active.id ? { ...t, fields: [...(t.fields ?? []), field] } : t
      )
    );
    setDraft({
      label: "",
      field_type: "text",
      placeholder: "",
      options: "",
      is_required: false,
    });
    toast.success("Field added");
  }

  function removeField(fieldId: string) {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === activeId
          ? { ...t, fields: (t.fields ?? []).filter((f) => f.id !== fieldId) }
          : t
      )
    );
  }

  function move(fieldId: string, dir: -1 | 1) {
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id !== activeId) return t;
        const fields = [...(t.fields ?? [])];
        const idx = fields.findIndex((f) => f.id === fieldId);
        const swap = idx + dir;
        if (swap < 0 || swap >= fields.length) return t;
        [fields[idx], fields[swap]] = [fields[swap], fields[idx]];
        return { ...t, fields };
      })
    );
  }

  const [saving, setSaving] = useState(false);

  async function createTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTpl.name.trim()) return toast.error("Template name is required");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTpl),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      const tpl = data.template as ProductTemplate;
      setTemplates((prev) => [...prev, tpl]);
      setActiveId(tpl.id);
      setNewTpl({ name: "", category_id: "" });
      setShowNew(false);
      toast.success("Template created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create");
    } finally {
      setSaving(false);
    }
  }

  /** Persist the active template's fields (replace-all). */
  async function saveFields() {
    if (!active) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/templates/${active.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: active.fields ?? [] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast.success("Template saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTemplate() {
    if (!active) return;
    if (!confirm(`Delete template “${active.name}”?`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/templates/${active.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed");
      }
      setTemplates((prev) => prev.filter((t) => t.id !== active.id));
      setActiveId("");
      toast.success("Template deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Template Builder</h1>
          <p className="mt-1 text-muted-foreground">
            Build reusable specification templates for your categories.
          </p>
        </div>
        <Button onClick={() => setShowNew((v) => !v)}>
          <Plus className="h-4 w-4" /> New Template
        </Button>
      </div>

      {showNew && (
        <form
          onSubmit={createTemplate}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Template name *</Label>
              <Input
                className="mt-1.5"
                value={newTpl.name}
                onChange={(e) =>
                  setNewTpl((t) => ({ ...t, name: e.target.value }))
                }
                placeholder="e.g. Smart Lock"
              />
            </div>
            <div>
              <Label>Assign to category</Label>
              <Select
                value={newTpl.category_id}
                onValueChange={(v) =>
                  setNewTpl((t) => ({ ...t, category_id: v }))
                }
              >
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
          </div>
          <div className="mt-4 flex gap-3">
            <Button type="submit">Create template</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowNew(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Template list */}
        <div className="space-y-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                t.id === activeId
                  ? "border-crimson bg-crimson/10"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              <span className="flex items-center gap-2">
                <LayoutTemplate className="h-4 w-4 text-crimson-600" />
                <span className="text-sm font-medium text-foreground">{t.name}</span>
              </span>
              {t.is_preset && (
                <Badge variant="muted" className="text-[10px]">
                  Preset
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Field editor */}
        {active ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-foreground">
                  Fields in “{active.name}”
                </h2>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveFields} disabled={saving}>
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                  {!active.is_preset && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={deleteTemplate}
                      disabled={saving}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </div>
              {(active.fields?.length ?? 0) === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No fields yet. Add one below.
                </p>
              ) : (
                <div className="space-y-2">
                  {active.fields!.map((f, i) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-muted p-3"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {f.label}
                          {f.is_required && (
                            <span className="text-crimson-600"> *</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {f.field_key} · {f.field_type}
                          {f.options ? ` · ${f.options.join(", ")}` : ""}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => move(f.id, -1)}
                          disabled={i === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => move(f.id, 1)}
                          disabled={i === active.fields!.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeField(f.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add field */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 font-semibold text-foreground">Add field</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Field label</Label>
                  <Input
                    className="mt-1.5"
                    value={draft.label}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, label: e.target.value }))
                    }
                    placeholder="e.g. Capacity"
                  />
                </div>
                <div>
                  <Label>Field type</Label>
                  <Select
                    value={draft.field_type}
                    onValueChange={(v) =>
                      setDraft((d) => ({ ...d, field_type: v as FieldType }))
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="admin-theme">
                      {FIELD_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Placeholder</Label>
                  <Input
                    className="mt-1.5"
                    value={draft.placeholder}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, placeholder: e.target.value }))
                    }
                  />
                </div>
                {draft.field_type === "select" && (
                  <div>
                    <Label>Options (comma separated)</Label>
                    <Input
                      className="mt-1.5"
                      value={draft.options}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, options: e.target.value }))
                      }
                      placeholder="2MP, 5MP, 8MP"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={draft.is_required}
                    onCheckedChange={(v) =>
                      setDraft((d) => ({ ...d, is_required: v }))
                    }
                  />
                  <span className="text-sm text-muted-foreground">Required</span>
                </div>
              </div>
              <Button className="mt-5" onClick={addField}>
                <Plus className="h-4 w-4" /> Add field
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Select or create a template.</p>
        )}
      </div>
    </div>
  );
}
