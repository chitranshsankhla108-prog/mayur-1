"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocalCartItem, Product } from "@/types";
import type { PricingRole } from "@/lib/pricing";
import { getDisplayPrice, getPriceType } from "@/lib/pricing";

interface CartState {
  items: LocalCartItem[];
  addItem: (product: Product, quantity?: number, role?: PricingRole) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

function toLocalItem(
  product: Product,
  quantity: number,
  role: PricingRole
): LocalCartItem {
  return {
    productId: product.id,
    title: product.title,
    slug: product.slug,
    // Effective unit price for THIS buyer — dealer price when applicable.
    price: getDisplayPrice(product, role),
    compareAtPrice: product.compare_at_price,
    image: product.images?.[0]?.image_url ?? "",
    brand: product.brand,
    stock: product.stock_quantity,
    quantity,
    priceType: getPriceType(product, role),
  };
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1, role = null) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === product.id
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? {
                      ...i,
                      // Re-resolve the price tier in case role/price changed.
                      price: getDisplayPrice(product, role),
                      priceType: getPriceType(product, role),
                      quantity: Math.min(
                        i.quantity + quantity,
                        Math.max(product.stock_quantity, 1)
                      ),
                    }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, toLocalItem(product, quantity, role)],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.max(1, quantity) }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      totalItems: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "mayur-cart" }
  )
);
