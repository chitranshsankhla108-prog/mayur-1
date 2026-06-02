import { cn, formatINR, discountPercent } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  compareAt?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceDisplay({
  price,
  compareAt,
  size = "md",
  className,
}: PriceDisplayProps) {
  const off = discountPercent(price, compareAt);
  const priceClass =
    size === "lg"
      ? "text-3xl font-bold"
      : size === "sm"
        ? "text-base font-semibold"
        : "text-xl font-bold";

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn("text-foreground", priceClass)}>{formatINR(price)}</span>
      {off > 0 && compareAt ? (
        <>
          <span className="text-sm text-muted-foreground line-through">
            {formatINR(compareAt)}
          </span>
          <span className="text-xs font-semibold text-emerald-600">
            {off}% off
          </span>
        </>
      ) : null}
    </div>
  );
}
