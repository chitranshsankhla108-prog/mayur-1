"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocalCartItem, Product } from "@/types";

interface WishlistState {
  items: LocalCartItem[];
  toggle: (product: Product) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === product.id);
          if (exists) {
            return {
              items: state.items.filter((i) => i.productId !== product.id),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                title: product.title,
                slug: product.slug,
                price: product.price,
                compareAtPrice: product.compare_at_price,
                image: product.images?.[0]?.image_url ?? "",
                brand: product.brand,
                stock: product.stock_quantity,
                quantity: 1,
                priceType: "public",
              },
            ],
          };
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      has: (productId) => get().items.some((i) => i.productId === productId),
      clear: () => set({ items: [] }),
    }),
    { name: "mayur-wishlist" }
  )
);
