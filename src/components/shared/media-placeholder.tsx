import {
  Zap,
  BatteryCharging,
  Cctv,
  HardDrive,
  Sun,
  Plug,
  Router,
  Package,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Branded, consistent placeholder shown whenever a category or product has no
 * real uploaded image. Distinct per category (icon) but visually uniform —
 * a calm dark surface, faint industrial grid and a single ghosted brand icon.
 * Never an unrelated stock photo.
 */

const ICONS: Record<string, LucideIcon> = {
  Zap,
  BatteryCharging,
  Cctv,
  HardDrive,
  Sun,
  Plug,
  Router,
};

// Map common category slugs/keywords to an icon so products inherit the right
// glyph even when the category's `icon` field isn't passed through.
const SLUG_ICONS: { match: RegExp; icon: LucideIcon }[] = [
  { match: /invert/i, icon: Zap },
  { match: /batter/i, icon: BatteryCharging },
  { match: /cctv|camera/i, icon: Cctv },
  { match: /dvr|nvr|record/i, icon: HardDrive },
  { match: /solar/i, icon: Sun },
  { match: /electric|cable|accessor/i, icon: Plug },
  { match: /network|router/i, icon: Router },
];

export function resolveCategoryIcon(opts: {
  iconName?: string | null;
  hint?: string | null;
}): LucideIcon {
  if (opts.iconName && ICONS[opts.iconName]) return ICONS[opts.iconName];
  if (opts.hint) {
    const found = SLUG_ICONS.find((s) => s.match.test(opts.hint!));
    if (found) return found.icon;
  }
  return Package;
}

export function MediaPlaceholder({
  iconName,
  hint,
  label,
  className,
}: {
  iconName?: string | null;
  hint?: string | null;
  label?: string | null;
  className?: string;
}) {
  const Icon = resolveCategoryIcon({ iconName, hint });

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-ink-700",
        className
      )}
    >
      <div className="absolute inset-0 bg-grid-dark [background-size:28px_28px] opacity-[0.18]" />
      {/* very subtle top sheen, no loud glow */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.04] to-transparent" />
      <Icon
        className="relative h-1/3 max-h-20 w-auto text-foreground/25"
        strokeWidth={1.25}
      />
      {label && (
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/30">
          {label}
        </span>
      )}
    </div>
  );
}
