import Link from "next/link";
import {
  Zap,
  ShieldCheck,
  Tags,
  Truck,
  BatteryCharging,
  Cctv,
  Sun,
} from "lucide-react";

const domains = [
  { icon: Zap, label: "Inverters" },
  { icon: BatteryCharging, label: "Batteries" },
  { icon: Cctv, label: "CCTV" },
  { icon: Sun, label: "Solar" },
];

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden overflow-hidden border-r border-border bg-ink-800 lg:block">
        <div className="absolute inset-0 bg-grid-dark [background-size:56px_56px] opacity-60" />
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-crimson-600/50 to-transparent" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-glow-sm">
              <Zap className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-bold">
              Mayur<span className="text-crimson-600">.</span>
            </span>
          </Link>

          <div>
            <div className="mb-8 grid max-w-sm grid-cols-2 gap-3">
              {domains.map((d) => (
                <div
                  key={d.label}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-crimson-600">
                    <d.icon className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <span className="text-sm font-medium text-foreground/80">
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
            <h2 className="max-w-sm text-balance text-3xl font-bold leading-tight text-foreground">
              One trusted store for power, security &amp; solar.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Create an account to track orders, save addresses and check out
              faster with genuine, warranty-backed products.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: ShieldCheck, label: "Genuine products with warranty" },
                { icon: Tags, label: "Bulk & B2B pricing" },
                { icon: Truck, label: "Fast, reliable delivery" },
              ].map((f) => (
                <li
                  key={f.label}
                  className="flex items-center gap-3 text-sm text-foreground/80"
                >
                  <f.icon className="h-4 w-4 text-crimson-600" /> {f.label}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Mayur Electronics
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-bold">Mayur.</span>
          </Link>

          <div className="glass rounded-2xl p-7 sm:p-8">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
