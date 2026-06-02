"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2, Star, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INDIAN_STATES } from "@/lib/states";

interface LocalAddress {
  id: string;
  full_name: string;
  mobile: string;
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

const empty: Omit<LocalAddress, "id" | "is_default"> = {
  full_name: "",
  mobile: "",
  address_line: "",
  city: "",
  state: "",
  postal_code: "",
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<LocalAddress[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  function update(key: keyof typeof empty, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openNew() {
    setForm(empty);
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(a: LocalAddress) {
    setForm(a);
    setEditing(a.id);
    setShowForm(true);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name || !form.address_line || !form.city || !form.postal_code) {
      toast.error("Please fill all required fields");
      return;
    }
    if (editing) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === editing ? { ...a, ...form } : a))
      );
      toast.success("Address updated");
    } else {
      setAddresses((prev) => [
        ...prev,
        { ...form, id: crypto.randomUUID(), is_default: prev.length === 0 },
      ]);
      toast.success("Address added");
    }
    setShowForm(false);
  }

  function remove(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Address removed");
  }

  function makeDefault(id: string) {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, is_default: a.id === id }))
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Addresses</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Add Address
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={save}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="mb-4 font-semibold text-foreground">
            {editing ? "Edit address" : "New address"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Full name *</Label>
              <Input
                className="mt-1.5"
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
              />
            </div>
            <div>
              <Label>Mobile *</Label>
              <Input
                className="mt-1.5"
                value={form.mobile}
                onChange={(e) => update("mobile", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Address *</Label>
              <Input
                className="mt-1.5"
                value={form.address_line}
                onChange={(e) => update("address_line", e.target.value)}
              />
            </div>
            <div>
              <Label>City *</Label>
              <Input
                className="mt-1.5"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </div>
            <div>
              <Label>State *</Label>
              <Select value={form.state} onValueChange={(v) => update("state", v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Postal code *</Label>
              <Input
                className="mt-1.5"
                value={form.postal_code}
                onChange={(e) => update("postal_code", e.target.value)}
              />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <Button type="submit">Save address</Button>
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

      {addresses.length === 0 && !showForm ? (
        <div className="rounded-xl border border-dashed border-border p-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <MapPin className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-muted-foreground">No saved addresses.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">{a.full_name}</p>
                  <p className="text-sm text-muted-foreground">{a.mobile}</p>
                </div>
                {a.is_default && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-crimson/15 px-2 py-0.5 text-[11px] font-semibold text-crimson-600">
                    <Star className="h-3 w-3 fill-current" /> Default
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-foreground/80">
                {a.address_line}, {a.city}, {a.state} — {a.postal_code}
              </p>
              <div className="mt-4 flex gap-2">
                {!a.is_default && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => makeDefault(a.id)}
                  >
                    Set default
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => openEdit(a)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(a.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
