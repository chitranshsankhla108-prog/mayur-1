"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SITE, WHATSAPP_NUMBER } from "@/lib/constants";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    store_name: SITE.name,
    email: SITE.email,
    phone: SITE.phone,
    whatsapp: WHATSAPP_NUMBER,
    address: SITE.address,
    gst_rate: "18",
    free_shipping: true,
    cod_enabled: true,
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your store configuration.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-foreground">Store Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Store name</Label>
            <Input
              className="mt-1.5"
              value={form.store_name}
              onChange={(e) => update("store_name", e.target.value)}
            />
          </div>
          <div>
            <Label>Support email</Label>
            <Input
              className="mt-1.5"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              className="mt-1.5"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
          <div>
            <Label>WhatsApp number</Label>
            <Input
              className="mt-1.5"
              value={form.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Textarea
              className="mt-1.5"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-foreground">Commerce</h2>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>GST rate (%)</Label>
              <Input
                type="number"
                className="mt-1.5"
                value={form.gst_rate}
                onChange={(e) => update("gst_rate", e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Free shipping</p>
              <p className="text-xs text-muted-foreground">
                Offer free standard delivery
              </p>
            </div>
            <Switch
              checked={form.free_shipping}
              onCheckedChange={(v) => update("free_shipping", v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Cash on Delivery
              </p>
              <p className="text-xs text-muted-foreground">
                Allow COD at checkout
              </p>
            </div>
            <Switch
              checked={form.cod_enabled}
              onCheckedChange={(v) => update("cod_enabled", v)}
            />
          </div>
        </div>
      </section>

      <Button onClick={() => toast.success("Settings saved")}>
        <Save className="h-4 w-4" /> Save Settings
      </Button>
    </div>
  );
}
