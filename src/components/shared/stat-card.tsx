import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent,
  className,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 [.admin-theme_&]:shadow-sm",
        accent &&
          "border-crimson/30 bg-gradient-to-br from-crimson-900/30 to-card [.admin-theme_&]:from-crimson-50 [.admin-theme_&]:to-card",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-crimson/10 text-crimson-600 [.admin-theme_&]:text-crimson-600">
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
    </div>
  );
}
