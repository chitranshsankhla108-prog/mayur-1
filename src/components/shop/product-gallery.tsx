"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

export function ProductGallery({
  images,
  title,
}: {
  images: ProductImage[];
  title: string;
}) {
  const fallback = images.length
    ? images
    : [
        {
          id: "ph",
          product_id: "",
          image_url: "",
          cloudinary_public_id: null,
          is_main: true,
          sort_order: 0,
        },
      ];
  const [active, setActive] = useState(0);
  const current = fallback[active];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-ink-700">
        {current.image_url ? (
          <img
            src={current.image_url}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </div>
      {fallback.length > 1 && (
        <div className="mt-3 flex gap-3">
          {fallback.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={cn(
                "h-20 w-20 overflow-hidden rounded-lg border-2 bg-ink-700 transition-colors",
                active === i ? "border-crimson" : "border-border"
              )}
            >
              <img
                src={img.image_url}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
