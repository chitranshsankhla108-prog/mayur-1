import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/15 text-crimson-600 [.admin-theme_&]:bg-crimson-50 [.admin-theme_&]:text-crimson-700",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        success:
          "border-transparent bg-emerald-500/15 text-emerald-600 [.admin-theme_&]:bg-emerald-50 [.admin-theme_&]:text-emerald-700",
        warning:
          "border-transparent bg-amber-500/15 text-amber-600 [.admin-theme_&]:bg-amber-50 [.admin-theme_&]:text-amber-700",
        danger:
          "border-transparent bg-red-500/15 text-red-600 [.admin-theme_&]:bg-red-50 [.admin-theme_&]:text-red-700",
        muted: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
