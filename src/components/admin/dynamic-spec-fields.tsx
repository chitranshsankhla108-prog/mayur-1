"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TemplateField } from "@/types";

export function DynamicSpecFields({
  fields,
  values,
  onChange,
}: {
  fields: TemplateField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  if (fields.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Select a template to load specification fields.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <div
          key={field.field_key}
          className={field.field_type === "textarea" ? "sm:col-span-2" : ""}
        >
          <Label htmlFor={field.field_key}>
            {field.label}
            {field.is_required && <span className="text-crimson-600"> *</span>}
          </Label>

          {field.field_type === "textarea" ? (
            <Textarea
              id={field.field_key}
              className="mt-1.5"
              placeholder={field.placeholder ?? ""}
              value={values[field.field_key] ?? ""}
              onChange={(e) => onChange(field.field_key, e.target.value)}
            />
          ) : field.field_type === "select" ? (
            <Select
              value={values[field.field_key] ?? ""}
              onValueChange={(v) => onChange(field.field_key, v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder={field.placeholder ?? "Select…"} />
              </SelectTrigger>
              <SelectContent className="admin-theme">
                {(field.options ?? []).map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.field_type === "boolean" ? (
            <div className="mt-2.5 flex items-center gap-2">
              <Switch
                id={field.field_key}
                checked={values[field.field_key] === "true"}
                onCheckedChange={(c) =>
                  onChange(field.field_key, c ? "true" : "false")
                }
              />
              <span className="text-sm text-muted-foreground">
                {values[field.field_key] === "true" ? "Yes" : "No"}
              </span>
            </div>
          ) : (
            <Input
              id={field.field_key}
              type={field.field_type === "number" ? "number" : "text"}
              className="mt-1.5"
              placeholder={field.placeholder ?? ""}
              value={values[field.field_key] ?? ""}
              onChange={(e) => onChange(field.field_key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
