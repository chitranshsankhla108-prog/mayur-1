"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    business_name: "",
    gst_number: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (data) {
          setForm({
            full_name: data.full_name ?? "",
            email: data.email ?? user.email ?? "",
            mobile: data.mobile ?? "",
            business_name: data.business_name ?? "",
            gst_number: data.gst_number ?? "",
          });
        }
      } catch {
        // env not set — leave empty
      }
    }
    load();
  }, []);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          mobile: form.mobile,
          business_name: form.business_name || null,
          gst_number: form.gst_number || null,
        })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Profile</h1>

      <form
        onSubmit={save}
        className="max-w-2xl rounded-xl border border-border bg-card p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Full name</Label>
            <Input
              className="mt-1.5"
              value={form.full_name}
              onChange={(e) => update("full_name", e.target.value)}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input className="mt-1.5" value={form.email} disabled />
          </div>
          <div>
            <Label>Mobile</Label>
            <Input
              className="mt-1.5"
              value={form.mobile}
              onChange={(e) => update("mobile", e.target.value)}
            />
          </div>
          <div>
            <Label>Business name</Label>
            <Input
              className="mt-1.5"
              value={form.business_name}
              onChange={(e) => update("business_name", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>GST number</Label>
            <Input
              className="mt-1.5"
              value={form.gst_number}
              onChange={(e) => update("gst_number", e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" className="mt-6" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </form>
    </div>
  );
}
