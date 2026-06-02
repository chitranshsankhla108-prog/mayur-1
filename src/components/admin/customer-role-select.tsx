"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from "@/types";

const ROLES: UserRole[] = ["customer", "dealer", "staff", "admin"];

/** Inline admin control to change a user's role (promote to dealer, etc.). */
export function CustomerRoleSelect({
  profileId,
  role,
}: {
  profileId: string;
  role: UserRole;
}) {
  const [value, setValue] = useState<UserRole>(role);
  const [saving, setSaving] = useState(false);

  async function change(next: string) {
    const prev = value;
    setValue(next as UserRole);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/customers/${profileId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update role");
      }
      toast.success(`Role updated to ${next}`);
    } catch (err) {
      setValue(prev); // rollback
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select value={value} onValueChange={change} disabled={saving}>
      <SelectTrigger className="h-8 w-32 capitalize">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="admin-theme">
        {ROLES.map((r) => (
          <SelectItem key={r} value={r} className="capitalize">
            {r}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
