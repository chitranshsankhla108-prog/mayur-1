import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MediaPlaceholder } from "./media-placeholder";
import type { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-700">
        {category.image_url ? (
          <img
            src={category.image_url}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <MediaPlaceholder iconName={category.icon} hint={category.slug} />
        )}
        {/* readable bottom scrim — only when a photo is present */}
        {category.image_url && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border p-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-foreground">{category.name}</h3>
          {category.description && (
            <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-muted-foreground">
              {category.description}
            </p>
          )}
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-crimson/40 group-hover:text-crimson-700">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
