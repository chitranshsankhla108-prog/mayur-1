"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Lock,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderSummary } from "@/components/checkout/order-summary";
import { useCart } from "@/lib/store/cart";
import { GST_RATE, SHIPPING, type DeliveryOption } from "@/lib/constants";
import type { PaymentMethod } from "@/types";
import { loadRazorpayScript } from "@/lib/load-razorpay";
import { INDIAN_STATES } from "@/lib/states";

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  { id: "upi", label: "UPI", desc: "GPay, PhonePe, Paytm & more", icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", desc: "All major banks", icon: Building2 },
  { id: "razorpay", label: "Razorpay", desc: "Secure all-in-one gateway", icon: Wallet },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  // Dev-only payment simulation (shown when an online method is chosen but
  // Razorpay is not configured). Holds the placed order awaiting "payment".
  const [simOrder, setSimOrder] = useState<{ order_number: string } | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    email: "",
    address_line: "",
    city: "",
    state: "",
    postal_code: "",
  });
  const [delivery, setDelivery] = useState<DeliveryOption>("standard");
  const [payment, setPayment] = useState<PaymentMethod>("upi");
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const totals = useMemo(() => {
    const sub = subtotal();
    const discount = appliedCoupon === "MAYUR10" ? Math.round(sub * 0.1) : 0;
    const taxable = sub - discount;
    const gst = Math.round(taxable * GST_RATE);
    const shipping = SHIPPING[delivery].price;
    const total = taxable + gst + shipping;
    return { sub, discount, gst, shipping, total };
  }, [subtotal, appliedCoupon, delivery]);

  if (!mounted) return <div className="container-px py-20" />;

  if (items.length === 0) {
    return (
      <div className="container-px py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground">Your cart is empty</h1>
        <Button asChild className="mt-6">
          <Link href="/products">Shop products</Link>
        </Button>
      </div>
    );
  }

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const required: (keyof typeof form)[] = [
      "full_name",
      "mobile",
      "email",
      "address_line",
      "city",
      "state",
      "postal_code",
    ];
    for (const key of required) {
      if (!form[key].trim()) {
        toast.error("Please fill all required fields");
        return false;
      }
    }
    if (!/^\d{10}$/.test(form.mobile.replace(/\D/g, "").slice(-10))) {
      toast.error("Enter a valid 10-digit mobile number");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("Enter a valid email address");
      return false;
    }
    return true;
  }

  function applyCoupon() {
    if (coupon.trim().toUpperCase() === "MAYUR10") {
      setAppliedCoupon("MAYUR10");
      toast.success("Coupon applied — 10% off!");
    } else {
      toast.error("Invalid coupon code");
    }
  }

  function finalizeOrder(order: { order_number: string }) {
    sessionStorage.setItem(
      "mayur-last-order",
      JSON.stringify({
        order_number: order.order_number,
        items,
        totals,
        payment,
        delivery,
        shipping_address: form,
        created_at: new Date().toISOString(),
      })
    );
    clear();
    router.push(`/order-success?order=${order.order_number}`);
  }

  // Dev-only: user explicitly confirms a simulated successful payment.
  async function simulateSuccess() {
    if (!simOrder) return;
    setSimLoading(true);
    try {
      await fetch("/api/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_number: simOrder.order_number, simulate: true }),
      });
    } catch {
      // best-effort; success page reads from sessionStorage regardless
    }
    finalizeOrder(simOrder);
  }

  function cancelSimulation() {
    setSimOrder(null);
    setSimLoading(false);
    toast.error("Payment cancelled — your cart is saved. You can retry.");
  }

  async function placeOrder() {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.productId,
            product_name: i.title,
            quantity: i.quantity,
            unit_price: i.price,
            price_type: i.priceType,
          })),
          shipping_address: form,
          payment_method: payment,
          delivery,
          coupon: appliedCoupon,
          amounts: totals,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      // Online payment via the real Razorpay gateway.
      if (data.razorpay) {
        const ok = await loadRazorpayScript();
        if (!ok) throw new Error("Could not load payment gateway");

        const rzp = new window.Razorpay!({
          key: data.razorpay.key_id,
          amount: data.razorpay.amount,
          currency: "INR",
          name: "Mayur Electronics",
          description: `Order ${data.order.order_number}`,
          order_id: data.razorpay.id,
          prefill: {
            name: form.full_name,
            email: form.email,
            contact: form.mobile,
          },
          theme: { color: "#C8102E" },
          handler: async (response: Record<string, string>) => {
            // Only show success once the payment signature is verified server-side.
            try {
              const vres = await fetch("/api/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...response,
                  order_number: data.order.order_number,
                }),
              });
              const vdata = await vres.json();
              if (vdata.verified) {
                finalizeOrder(data.order);
              } else {
                toast.error("Payment could not be verified. Please try again.");
                setLoading(false);
              }
            } catch {
              toast.error("Payment verification failed. Please try again.");
              setLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              toast.error("Payment cancelled — your cart is saved. You can retry.");
              setLoading(false);
            },
          },
        });
        rzp.open();
        // Keep `loading` true while the modal is open; handler/ondismiss reset it.
        return;
      }

      // Gateway not configured → dev-only simulation step.
      if (data.simulate) {
        setSimOrder(data.order);
        setLoading(false);
        return;
      }

      // No gateway and no simulation flag — nothing to charge against.
      throw new Error("No payment method is available. Please try again later.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="container-px py-10">
      <h1 className="text-3xl font-bold text-foreground">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        {/* Left */}
        <div className="space-y-8 lg:col-span-3">
          {/* Customer info */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              1. Customer Information
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="full_name">Full name *</Label>
                <Input
                  id="full_name"
                  className="mt-1.5"
                  value={form.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile number *</Label>
                <Input
                  id="mobile"
                  className="mt-1.5"
                  value={form.mobile}
                  onChange={(e) => update("mobile", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  className="mt-1.5"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              2. Shipping Address
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="address_line">Address *</Label>
                <Input
                  id="address_line"
                  className="mt-1.5"
                  placeholder="House no, street, area"
                  value={form.address_line}
                  onChange={(e) => update("address_line", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  className="mt-1.5"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>
              <div>
                <Label>State *</Label>
                <Select
                  value={form.state}
                  onValueChange={(v) => update("state", v)}
                >
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
                <Label htmlFor="postal_code">Postal code *</Label>
                <Input
                  id="postal_code"
                  className="mt-1.5"
                  value={form.postal_code}
                  onChange={(e) => update("postal_code", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Delivery */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              3. Delivery Options
            </h2>
            <div className="mt-4 grid gap-3">
              {(Object.keys(SHIPPING) as DeliveryOption[]).map((key) => {
                const opt = SHIPPING[key];
                const active = delivery === key;
                return (
                  <button
                    key={key}
                    onClick={() => setDelivery(key)}
                    className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors ${
                      active
                        ? "border-crimson bg-crimson/10"
                        : "border-border hover:border-foreground/25"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {opt.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{opt.eta}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {opt.price === 0 ? "Free" : `₹${opt.price}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              4. Payment Method
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((m) => {
                const active = payment === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPayment(m.id)}
                    className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                      active
                        ? "border-crimson bg-crimson/10"
                        : "border-border hover:border-foreground/25"
                    }`}
                  >
                    <m.icon
                      className={`h-5 w-5 ${
                        active ? "text-crimson-600" : "text-muted-foreground"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">
            <OrderSummary
              items={items}
              subtotal={totals.sub}
              gst={totals.gst}
              shipping={totals.shipping}
              total={totals.total}
              discount={totals.discount}
            />

            {/* Coupon */}
            <div className="rounded-xl border border-border bg-card p-4">
              <Label htmlFor="coupon" className="text-xs">
                Have a coupon? (try MAYUR10)
              </Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="coupon"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Coupon code"
                />
                <Button variant="outline" onClick={applyCoupon}>
                  Apply
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={placeOrder}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Place Order
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              By placing your order you agree to our terms & policies.
            </p>
          </div>
        </div>
      </div>

      {/* Dev-only payment simulation — appears only when an online method is
          chosen and Razorpay is not configured. Prevents fake instant success. */}
      {simOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-amber-500/30 bg-card p-6 shadow-lift">
            <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
              <TriangleAlert className="h-4 w-4 shrink-0 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Development mode — payment gateway not configured
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              Simulate payment
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              No live Razorpay keys are set. Confirm the simulated payment to
              complete order{" "}
              <span className="font-medium text-foreground">
                {simOrder.order_number}
              </span>
              , or cancel to keep your cart.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={simulateSuccess}
                disabled={simLoading}
              >
                {simLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Completing…
                  </>
                ) : (
                  "Simulate Successful Payment"
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={cancelSimulation}
                disabled={simLoading}
              >
                Cancel Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
